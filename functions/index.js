const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Configure CORS to allow GitHub Codespaces and your deployed app
const cors = require("cors")({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow GitHub Codespaces domains
    if (origin.includes("github.dev") || 
        origin.includes("githubpreview.dev") ||
        origin.includes("app.github.dev")) {
      return callback(null, true);
    }
    
    // Allow your deployed Firebase app
    if (origin.includes("awaz-e-kisan.web.app") || 
        origin.includes("awaz-e-kisan.firebaseapp.com")) {
      return callback(null, true);
    }
    
    // Allow localhost for local development
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});
const axios = require("axios");
const FormData = require("form-data");
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");

// Initialize Firebase Admin
admin.initializeApp();

// OpenRouter API Configuration
const OPENROUTER_API_KEY = functions.config().openrouter?.key || process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// System prompt for the LLM
const SYSTEM_PROMPT = `You are **Awaz-e-Kisan (آوازِ کسان)**, a friendly multilingual farming assistant for Pakistani farmers.

Language Detection & Response:
- Automatically detect if the farmer is speaking in Urdu (اردو), Punjabi (ਪੰਜਾਬੀ), or Sindhi (سنڌي)
- Respond in the SAME language the farmer used
- Use simple, clear, and practical language - avoid technical jargon

Topics You Help With:
- 🌦️ Weather forecasts and farming calendars
- 🌱 Crop selection, planting times, and growing tips
- 💧 Irrigation and water management
- 🌿 Fertilizers and pest control (organic preferred)
- 💰 Market prices and selling strategies
- 🌍 Sustainable farming and environmental tips
- 🐄 Livestock care basics

Tone & Style:
- Friendly, respectful, and supportive (like a helpful neighbor)
- Use local idioms and cultural context when appropriate
- Keep responses SHORT (2-4 sentences max)
- Give actionable advice
- If you don't know exact data, provide reasonable estimates or suggest checking local sources

Example Responses:
Urdu: "بہت اچھا سوال! گندم کے لیے نومبر کا آخر بہترین وقت ہے۔ بیج بونے سے پہلے زمین کو اچھی طرح تیار کریں۔"
Punjabi: "ਬਹੁਤ ਵਧੀਆ! ਕਣਕ ਲਈ ਨਵੰਬਰ ਦਾ ਆਖਰੀ ਸਮਾਂ ਸਭ ਤੋਂ ਵਧੀਆ ਹੈ।"
Sindhi: "واهه سوال! ڪڻڪ لاءِ نومبر جو آخر بهترين وقت آهي۔"`;

// ========================================
// 1. SPEECH-TO-TEXT FUNCTION (Whisper API)
// ========================================
exports.speechToText = functions
    .runWith({timeoutSeconds: 540, memory: "1GB"})
    .https.onCall(async (data, context) => {
      try {
        console.log("Speech-to-text called with data:", data ? "audio present" : "no data");
        
        const {audio, language} = data;
        
        if (!audio) {
          throw new functions.https.HttpsError(
              "invalid-argument",
              "No audio data provided",
          );
        }

        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audio.split(",")[1], "base64");
        
        // Save to temp file
        const tmpdir = os.tmpdir();
        const filepath = path.join(tmpdir, `audio-${Date.now()}.webm`);
        fs.writeFileSync(filepath, audioBuffer);

        // Call OpenRouter Whisper API
        const formData = new FormData();
        formData.append("file", fs.createReadStream(filepath));
        formData.append("model", "openai/whisper-1");
        formData.append("language", language || "ur");

        console.log("Calling Whisper API...");
        
        const transcription = await axios.post(
            `${OPENROUTER_BASE_URL}/audio/transcriptions`,
            formData,
            {
              headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://awaz-e-kisan.web.app",
                "X-Title": "Awaz-e-Kisan",
                ...formData.getHeaders(),
              },
              timeout: 30000,
            },
        );

        // Clean up temp file
        fs.unlinkSync(filepath);

        // Detect language (basic detection)
        const text = transcription.data.text;
        const detectedLanguage = detectLanguage(text);

        console.log("Transcription successful:", text.substring(0, 50));

        return {
          success: true,
          text: text,
          language: detectedLanguage,
        };
      } catch (error) {
        console.error("STT Error:", error);
        throw new functions.https.HttpsError(
            "internal",
            `Speech-to-text failed: ${error.message}`,
        );
      }
    });

// ========================================
// 2. LLM PROCESSING FUNCTION (GPT-4)
// ========================================
exports.askAssistant = functions
    .runWith({timeoutSeconds: 300})
    .https.onCall(async (data, context) => {
      try {
        const {question, language, userId, userContext} = data;

        if (!question) {
          throw new functions.https.HttpsError(
              "invalid-argument",
              "Question is required",
          );
        }

        const uid = context.auth?.uid || userId;

        // Build context-aware prompt
        let userPrompt = question;
        if (userContext) {
          userPrompt = `Previous context: ${userContext}\n\nNew question: ${question}`;
        }

        // Call OpenRouter API with GPT-4
        const completion = await axios.post(
            `${OPENROUTER_BASE_URL}/chat/completions`,
            {
              model: "openai/gpt-4-turbo",
              messages: [
                {role: "system", content: SYSTEM_PROMPT},
                {role: "user", content: userPrompt},
              ],
              temperature: 0.7,
              max_tokens: 300,
            },
            {
              headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://awaz-e-kisan.web.app",
                "X-Title": "Awaz-e-Kisan",
                "Content-Type": "application/json",
              },
              timeout: 30000,
            },
        );

        const answer = completion.data.choices[0].message.content;
        const detectedLanguage = language || detectLanguage(answer);

        // Save to Firestore
        if (uid) {
          await admin.firestore()
              .collection("queries")
              .doc(uid)
              .collection("history")
              .add({
                question,
                answer,
                language: detectedLanguage,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                model: "openai/gpt-4-turbo",
                provider: "openrouter",
              });
        }

        return {
          success: true,
          answer,
          language: detectedLanguage,
        };
      } catch (error) {
        console.error("LLM Error:", error);
        throw new functions.https.HttpsError(
            "internal",
            `Failed to process question: ${error.message}`,
        );
      }
    });

// ========================================
// 3. TEXT-TO-SPEECH FUNCTION (ElevenLabs + gTTS fallback)
// ========================================
exports.textToSpeech = functions
    .runWith({timeoutSeconds: 300, memory: "512MB"})
    .https.onRequest((req, res) => {
      cors(req, res, async () => {
        if (req.method !== "POST") {
          return res.status(405).json({error: "Method not allowed"});
        }

        try {
          const {text, language, userId, voiceId} = req.body;

          if (!text) {
            return res.status(400).json({error: "Text is required"});
          }

          let audioUrl = null;
          const elevenlabsKey = functions.config().elevenlabs?.key;

          // Try ElevenLabs first for high quality
          if (elevenlabsKey) {
            try {
              audioUrl = await generateElevenLabsSpeech(
                  text,
                  elevenlabsKey,
                  voiceId,
              );
            } catch (error) {
              console.log("ElevenLabs failed, falling back to gTTS");
            }
          }

          // Fallback to gTTS (free, supports multiple languages)
          if (!audioUrl) {
            audioUrl = await generateGoogleTTS(text, language);
          }

          // Upload to Firebase Storage
          if (userId && audioUrl) {
            const bucket = admin.storage().bucket();
            const fileName = `voice-output/${userId}/${Date.now()}.mp3`;

            // Download audio and upload to Firebase Storage
            const response = await axios.get(audioUrl, {
              responseType: "arraybuffer",
            });

            const file = bucket.file(fileName);
            await file.save(Buffer.from(response.data), {
              contentType: "audio/mpeg",
              metadata: {
                metadata: {
                  userId,
                  language,
                  timestamp: new Date().toISOString(),
                },
              },
            });

            // Get public URL
            await file.makePublic();
            audioUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          }

          res.json({
            success: true,
            audioUrl,
            language,
          });
        } catch (error) {
          console.error("TTS Error:", error);
          res.status(500).json({
            error: "Text-to-speech failed",
            details: error.message,
          });
        }
      });
    });

// ========================================
// 4. WEATHER FUNCTION (Open-Meteo API - FREE, NO API KEY!)
// ========================================

// City coordinates for major Pakistani cities
const CITY_COORDINATES = {
  lahore: {lat: 31.5497, lon: 74.3436},
  karachi: {lat: 24.8607, lon: 67.0011},
  islamabad: {lat: 33.6844, lon: 73.0479},
  faisalabad: {lat: 31.4504, lon: 73.1350},
  multan: {lat: 30.1575, lon: 71.5249},
  peshawar: {lat: 34.0151, lon: 71.5249},
  quetta: {lat: 30.1830, lon: 66.9987},
  sialkot: {lat: 32.4972, lon: 74.5361},
  gujranwala: {lat: 32.1877, lon: 74.1945},
  rawalpindi: {lat: 33.5651, lon: 73.0169},
  hyderabad: {lat: 25.3960, lon: 68.3578},
  bahawalpur: {lat: 29.3956, lon: 71.6836},
  sargodha: {lat: 32.0836, lon: 72.6711},
  sukkur: {lat: 27.7058, lon: 68.8574},
  larkana: {lat: 27.5590, lon: 68.2120},
};

exports.getWeather = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {location, language} = req.query;
      
      // Parse location (city name)
      const cityName = (location || "lahore").toLowerCase().trim();
      
      // Get coordinates for the city
      const coords = CITY_COORDINATES[cityName] || CITY_COORDINATES.lahore;

      // Call Open-Meteo API (completely free, no API key needed!)
      const response = await axios.get(
          "https://api.open-meteo.com/v1/forecast",
          {
            params: {
              latitude: coords.lat,
              longitude: coords.lon,
              current: "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
              timezone: "Asia/Karachi",
              temperature_unit: "celsius",
            },
            timeout: 10000,
          },
      );

      const weatherData = formatOpenMeteoResponse(response.data, location, language);

      res.json({
        success: true,
        weather: weatherData,
        isMockData: false,
        provider: "Open-Meteo",
      });
    } catch (error) {
      console.error("Weather Error:", error.response?.data || error.message);
      
      // Fallback to mock data on error
      res.json({
        success: true,
        weather: generateMockWeather(req.query.location, req.query.language),
        isMockData: true,
        error: "Using mock data due to API error",
      });
    }
  });
});

// ========================================
// 5. MARKET PRICES FUNCTION
// ========================================
exports.getMarketPrices = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {crop, language} = req.query;

      // Mock market data (replace with real API)
      const prices = {
        wheat: {ur: "گندم: 3500 روپے فی من", en: "Wheat: Rs. 3500/maund"},
        rice: {ur: "چاول: 7500 روپے فی من", en: "Rice: Rs. 7500/maund"},
        cotton: {ur: "کپاس: 8000 روپے فی من", en: "Cotton: Rs. 8000/maund"},
        sugarcane: {ur: "گنا: 350 روپے فی من", en: "Sugarcane: Rs. 350/maund"},
      };

      const lang = language || "ur";
      const cropData = prices[crop?.toLowerCase()] || prices.wheat;

      res.json({
        success: true,
        price: cropData[lang] || cropData.en,
        crop,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({error: error.message});
    }
  });
});

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Detect language from text (basic heuristic)
 */
function detectLanguage(text) {
  if (/[\u0600-\u06FF]/.test(text)) {
    // Arabic/Urdu/Sindhi script
    if (text.includes("ڪ") || text.includes("ٻ")) {
      return "sindhi";
    }
    return "urdu";
  } else if (/[\u0A00-\u0A7F]/.test(text)) {
    // Gurmukhi script (Punjabi)
    return "punjabi";
  }
  return "urdu"; // Default
}

/**
 * Generate speech using ElevenLabs API
 */
async function generateElevenLabsSpeech(text, apiKey, voiceId = null) {
  const defaultVoice = "21m00Tcm4TlvDq8ikWAM"; // Default voice

  const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || defaultVoice}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      },
  );

  return Buffer.from(response.data);
}

/**
 * Generate speech using Google TTS (fallback)
 */
async function generateGoogleTTS(text, language) {
  const langCode = mapLanguageCode(language);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${
    encodeURIComponent(text)
  }&tl=${langCode}&client=tw-ob`;

  return url;
}

/**
 * Map language to API codes
 */
function mapLanguageCode(language) {
  const mapping = {
    urdu: "ur",
    punjabi: "pa",
    sindhi: "sd",
  };
  return mapping[language?.toLowerCase()] || "ur";
}

/**
 * Generate mock weather data
 */
function generateMockWeather(location, language) {
  const templates = {
    urdu: `${location || "لاہور"} میں آج کا موسم صاف ہے، درجہ حرارت 28 ڈگری ہے۔ کل بارش کا امکان ہے۔`,
    punjabi: `${location || "ਲਾਹੌਰ"} ਵਿੱਚ ਅੱਜ ਮੌਸਮ ਸਾਫ਼ ਹੈ, ਤਾਪਮਾਨ 28 ਡਿਗਰੀ ਹੈ।`,
    sindhi: `${location || "لاهور"} ۾ اڄ جو موسم صاف آهي، گرمي 28 ڊگري آهي۔`,
  };

  return templates[language] || templates.urdu;
}

/**
 * Format Open-Meteo API response
 */
function formatOpenMeteoResponse(data, location, language) {
  const temp = Math.round(data.current.temperature_2m);
  const humidity = data.current.relative_humidity_2m;
  const windSpeed = Math.round(data.current.wind_speed_10m);
  const precipitation = data.current.precipitation;
  const weatherCode = data.current.weather_code;

  // Interpret weather code
  const weatherDesc = interpretWeatherCode(weatherCode);
  const willRain = precipitation > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode);
  
  const cityName = location || "لاہور";
  
  const templates = {
    urdu: `${cityName} میں آج ${weatherDesc.urdu}، درجہ حرارت ${temp}°C، نمی ${humidity}%، ہوا ${windSpeed} کلومیٹر فی گھنٹہ${willRain ? '۔ بارش کا امکان ہے' : ''}۔`,
    punjabi: `${cityName} ਵਿੱਚ ਅੱਜ ${weatherDesc.punjabi}, ਤਾਪਮਾਨ ${temp}°C, ਨਮੀ ${humidity}%${willRain ? '۔ ਬਾਰਿਸ਼ ਹੋ ਸਕਦੀ ਹੈ' : ''}۔`,
    sindhi: `${cityName} ۾ اڄ ${weatherDesc.sindhi}، گرمي ${temp}°C، نمي ${humidity}%${willRain ? '۔ مينهن جو امڪان آهي' : ''}۔`,
  };

  return {
    text: templates[language] || templates.urdu,
    temp,
    feelsLike: temp, // Open-Meteo doesn't provide feels_like, use temp
    humidity,
    windSpeed,
    description: weatherDesc.english,
    willRain,
    location: cityName,
    precipitation,
  };
}

/**
 * Interpret WMO weather codes used by Open-Meteo
 * https://open-meteo.com/en/docs
 */
function interpretWeatherCode(code) {
  const weatherCodes = {
    0: {english: "Clear sky", urdu: "صاف", punjabi: "ਸਾਫ਼", sindhi: "صاف"},
    1: {english: "Mainly clear", urdu: "زیادہ تر صاف", punjabi: "ਸਾਫ਼", sindhi: "صاف"},
    2: {english: "Partly cloudy", urdu: "جزوی ابر آلود", punjabi: "ਬੱਦਲਵਾਈ", sindhi: "ڪجهه ڪڪر"},
    3: {english: "Overcast", urdu: "ابر آلود", punjabi: "ਬੱਦਲਵਾਈ", sindhi: "ڪڪر"},
    45: {english: "Foggy", urdu: "دھند", punjabi: "ਧੁੰਦ", sindhi: "دھند"},
    48: {english: "Foggy", urdu: "دھند", punjabi: "ਧੁੰਦ", sindhi: "دھند"},
    51: {english: "Light drizzle", urdu: "ہلکی بارش", punjabi: "ਹਲਕੀ ਬਾਰਿਸ਼", sindhi: "ٿوري برسات"},
    53: {english: "Moderate drizzle", urdu: "بارش", punjabi: "ਬਾਰਿਸ਼", sindhi: "برسات"},
    55: {english: "Heavy drizzle", urdu: "تیز بارش", punjabi: "ਤੇਜ਼ ਬਾਰਿਸ਼", sindhi: "تيز برسات"},
    61: {english: "Light rain", urdu: "ہلکی بارش", punjabi: "ਹਲਕੀ ਬਾਰਿਸ਼", sindhi: "ٿوري برسات"},
    63: {english: "Moderate rain", urdu: "بارش", punjabi: "ਬਾਰਿਸ਼", sindhi: "برسات"},
    65: {english: "Heavy rain", urdu: "تیز بارش", punjabi: "ਤੇਜ਼ ਬਾਰਿਸ਼", sindhi: "تيز برسات"},
    71: {english: "Light snow", urdu: "ہلکی برف باری", punjabi: "ਹਲਕੀ ਬਰਫ਼ਬਾਰੀ", sindhi: "ٿوري برفباري"},
    73: {english: "Moderate snow", urdu: "برف باری", punjabi: "ਬਰਫ਼ਬਾਰੀ", sindhi: "برفباري"},
    75: {english: "Heavy snow", urdu: "تیز برف باری", punjabi: "ਤੇਜ਼ ਬਰਫ਼ਬਾਰੀ", sindhi: "تيز برفباري"},
    80: {english: "Light showers", urdu: "ہلکی بارش", punjabi: "ਹਲਕੀ ਬਾਰਿਸ਼", sindhi: "ٿوري برسات"},
    81: {english: "Moderate showers", urdu: "بارش", punjabi: "ਬਾਰਿਸ਼", sindhi: "برسات"},
    82: {english: "Heavy showers", urdu: "تیز بارش", punjabi: "ਤੇਜ਼ ਬਾਰਿਸ਼", sindhi: "تيز برسات"},
    85: {english: "Light snow showers", urdu: "ہلکی برف باری", punjabi: "ਹਲਕੀ ਬਰਫ਼ਬਾਰੀ", sindhi: "ٿوري برفباري"},
    86: {english: "Heavy snow showers", urdu: "تیز برف باری", punjabi: "ਤੇਜ਼ ਬਰਫ਼ਬਾਰੀ", sindhi: "تيز برفباري"},
    95: {english: "Thunderstorm", urdu: "آندھی", punjabi: "ਤੂਫ਼ਾਨ", sindhi: "طوفان"},
    96: {english: "Thunderstorm with hail", urdu: "آندھی اور اولے", punjabi: "ਤੂਫ਼ਾਨ ਅਤੇ ਗੜੇ", sindhi: "طوفان ۽ ٿڌ"},
    99: {english: "Thunderstorm with heavy hail", urdu: "تیز آندھی اور اولے", punjabi: "ਤੇਜ਼ ਤੂਫ਼ਾਨ", sindhi: "تيز طوفان"},
  };

  return weatherCodes[code] || weatherCodes[0];
}

// ========================================
// 6. GENERATE CROP CALENDAR FUNCTION
// ========================================

/**
 * Crop knowledge database with activities
 */
const CROP_DATA = {
  wheat: {
    name: {urdu: "گندم", english: "Wheat"},
    duration: 150, // days
    optimal_temp: "15-25°C",
    activities: [
      {day: 0, type: "land_prep", title: "زمین کی تیاری", desc: "ہل چلائیں اور زمین کو برابر کریں"},
      {day: 3, type: "soil_test", title: "مٹی کا ٹیسٹ", desc: "مٹی کی صحت جانچیں"},
      {day: 7, type: "seed_sowing", title: "بیج کاشت", desc: "اعلی معیار کے بیج استعمال کریں - 50kg/acre"},
      {day: 15, type: "irrigation", title: "پہلا پانی", desc: "ہلکا پانی دیں"},
      {day: 25, type: "fertilizer", title: "پہلی کھاد", desc: "Urea - 2 بوری فی ایکڑ"},
      {day: 30, type: "weeding", title: "گھاس صاف کریں", desc: "ہاتھ سے یا Weedicide استعمال کریں"},
      {day: 40, type: "irrigation", title: "دوسرا پانی", desc: "زمین میں نمی برقرار رکھیں"},
      {day: 50, type: "pest_check", title: "کیڑوں کی جانچ", desc: "Aphids اور Termites دیکھیں"},
      {day: 60, type: "fertilizer", title: "دوسری کھاد", desc: "DAP - 1 بوری فی ایکڑ"},
      {day: 70, type: "irrigation", title: "تیسرا پانی", desc: "دانے بھرنے کے لیے اہم"},
      {day: 85, type: "pest_spray", title: "کیڑے مار سپرے", desc: "Rust یا Smut ہو تو فوری سپرے"},
      {day: 100, type: "irrigation", title: "چوتھا پانی", desc: "آخری پانی"},
      {day: 120, type: "monitoring", title: "فصل کی نگرانی", desc: "پکنے کا انتظار"},
      {day: 140, type: "harvest_prep", title: "کٹائی کی تیاری", desc: "مشینری کا انتظام"},
      {day: 150, type: "harvest", title: "کٹائی", desc: "پکی فصل کاٹیں - تقریباً 25 من فی ایکڑ"},
    ],
    estimatedYield: {min: 20, max: 30, unit: "maund/acre"},
    commonPests: ["Aphids", "Termites", "Rust"],
    waterNeeds: "4-5 irrigations",
  },
  rice: {
    name: {urdu: "چاول", english: "Rice"},
    duration: 120,
    optimal_temp: "25-35°C",
    activities: [
      {day: 0, type: "land_prep", title: "زمین کی تیاری", desc: "گیلی زمین تیار کریں"},
      {day: 5, type: "nursery", title: "پنیری لگائیں", desc: "بیج 25kg/acre"},
      {day: 25, type: "transplant", title: "روپائی", desc: "پنیری سے کھیت میں لگائیں"},
      {day: 30, type: "irrigation", title: "پانی کی سطح", desc: "2-3 انچ پانی رکھیں"},
      {day: 40, type: "fertilizer", title: "پہلی کھاد", desc: "Urea - 2 بوری"},
      {day: 50, type: "weeding", title: "گھاس نکالیں", desc: "ہاتھ سے یا Weedicide"},
      {day: 60, type: "pest_check", title: "کیڑوں کی چیک", desc: "Stem Borer دیکھیں"},
      {day: 70, type: "fertilizer", title: "دوسری کھاد", desc: "DAP - 1.5 بوری"},
      {day: 85, type: "pest_spray", title: "سپرے", desc: "Blast یا Blight سے بچاؤ"},
      {day: 100, type: "water_control", title: "پانی کم کریں", desc: "پکنے کے لیے پانی روکیں"},
      {day: 115, type: "harvest_prep", title: "کٹائی کی تیاری", desc: "تھریشر کا بندوبست"},
      {day: 120, type: "harvest", title: "کٹائی", desc: "40-50 من فی ایکڑ"},
    ],
    estimatedYield: {min: 35, max: 50, unit: "maund/acre"},
    commonPests: ["Stem Borer", "Leaf Blast", "Brown Plant Hopper"],
    waterNeeds: "Continuous flooding",
  },
  cotton: {
    name: {urdu: "کپاس", english: "Cotton"},
    duration: 180,
    optimal_temp: "25-35°C",
    activities: [
      {day: 0, type: "land_prep", title: "زمین کی تیاری", desc: "گہری ہل چلائیں"},
      {day: 7, type: "seed_sowing", title: "بیج کاشت", desc: "12-15 kg/acre"},
      {day: 15, type: "irrigation", title: "پہلا پانی", desc: "اگانے کے لیے"},
      {day: 25, type: "thinning", title: "پودے چھانٹیں", desc: "مناسب فاصلہ رکھیں"},
      {day: 35, type: "fertilizer", title: "پہلی کھاد", desc: "Urea + DAP - 3 بوری"},
      {day: 40, type: "irrigation", title: "دوسرا پانی", desc: "ترقی کے لیے"},
      {day: 50, type: "pest_check", title: "کیڑوں کی جانچ", desc: "White Fly اور Pink Bollworm"},
      {day: 60, type: "pest_spray", title: "پہلا سپرے", desc: "کیڑے مار دوا"},
      {day: 70, type: "fertilizer", title: "دوسری کھاد", desc: "Urea - 2 بوری"},
      {day: 75, type: "irrigation", title: "تیسرا پانی", desc: "پھول آنے کا وقت"},
      {day: 85, type: "pest_spray", title: "دوسرا سپرے", desc: "Bollworm سے بچاؤ"},
      {day: 100, type: "irrigation", title: "چوتھا پانی", desc: "پھلی بننے کا وقت"},
      {day: 115, type: "pest_spray", title: "تیسرا سپرے", desc: "مسلسل حفاظت"},
      {day: 130, type: "irrigation", title: "آخری پانی", desc: "کھلنے سے پہلے"},
      {day: 150, type: "picking_prep", title: "توڑنے کی تیاری", desc: "مزدوروں کا انتظام"},
      {day: 160, type: "first_picking", title: "پہلی توڑائی", desc: "40% کپاس پک گئی"},
      {day: 175, type: "second_picking", title: "دوسری توڑائی", desc: "مکمل کپاس"},
      {day: 180, type: "harvest", title: "مکمل کٹائی", desc: "25-35 من فی ایکڑ"},
    ],
    estimatedYield: {min: 25, max: 35, unit: "maund/acre"},
    commonPests: ["White Fly", "Pink Bollworm", "Army Worm"],
    waterNeeds: "5-7 irrigations",
  },
  sugarcane: {
    name: {urdu: "گنا", english: "Sugarcane"},
    duration: 365, // 12 months
    optimal_temp: "20-35°C",
    activities: [
      {day: 0, type: "land_prep", title: "زمین کی تیاری", desc: "گہری ہل چلائیں"},
      {day: 7, type: "planting", title: "گنے کی بوائی", desc: "سیٹ لگائیں - 40,000 فی ایکڑ"},
      {day: 15, type: "irrigation", title: "پہلا پانی", desc: "اگانے کے لیے"},
      {day: 30, type: "fertilizer", title: "پہلی کھاد", desc: "Urea + DAP - 4 بوری"},
      {day: 45, type: "irrigation", title: "دوسرا پانی", desc: "نمو تیز کرنے کے لیے"},
      {day: 60, type: "weeding", title: "گھاس صاف کریں", desc: "پہلی بار"},
      {day: 75, type: "irrigation", title: "تیسرا پانی", desc: "مسلسل نمو"},
      {day: 90, type: "fertilizer", title: "دوسری کھاد", desc: "Urea - 3 بوری"},
      {day: 120, type: "pest_check", title: "کیڑوں کی جانچ", desc: "Borers دیکھیں"},
      {day: 150, type: "irrigation", title: "باقاعدہ پانی", desc: "ہر 15-20 دن"},
      {day: 180, type: "fertilizer", title: "تیسری کھاد", desc: "Urea - 2 بوری"},
      {day: 240, type: "pest_spray", title: "سپرے", desc: "ضرورت کے مطابق"},
      {day: 300, type: "water_stop", title: "پانی بند کریں", desc: "پکنے دیں"},
      {day: 350, type: "harvest_prep", title: "کٹائی کی تیاری", desc: "ملی کا معاہدہ"},
      {day: 365, type: "harvest", title: "کٹائی", desc: "400-600 من فی ایکڑ"},
    ],
    estimatedYield: {min: 400, max: 600, unit: "maund/acre"},
    commonPests: ["Borers", "White Grubs", "Termites"],
    waterNeeds: "15-20 irrigations",
  },
};

// ========================================
// HELPER: Get Weather Forecast for Calendar
// ========================================

async function getWeatherForecastForCalendar(location, startDate, duration) {
  const cityName = (location || "lahore").toLowerCase().trim();
  const coords = CITY_COORDINATES[cityName] || CITY_COORDINATES.lahore;

  const forecastDays = Math.min(duration, 16); // Open-Meteo free tier: max 16 days

  const response = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: coords.lat,
          longitude: coords.lon,
          daily: [
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "weather_code",
          ].join(","),
          current: "temperature_2m,weather_code",
          forecast_days: forecastDays,
          timezone: "Asia/Karachi",
        },
        timeout: 10000,
      },
  );

  return response.data;
}

// ========================================
// HELPER: AI Calendar Generation
// ========================================

async function generateAICalendar(crop, location, startDate, acres, weatherData, cropData) {
  // Build weather summary for AI
  const weatherSummary = weatherData.daily ? {
    avgMaxTemp: Math.round(
        weatherData.daily.temperature_2m_max.slice(0, 7).reduce((a, b) => a + b, 0) / 7,
    ),
    avgMinTemp: Math.round(
        weatherData.daily.temperature_2m_min.slice(0, 7).reduce((a, b) => a + b, 0) / 7,
    ),
    rainyDays: weatherData.daily.precipitation_probability_max.filter((p) => p > 70).length,
    forecastPeriod: `${weatherData.daily.time[0]} to ${weatherData.daily.time[weatherData.daily.time.length - 1]}`,
  } : "No forecast available";

  const prompt = `You are an expert Pakistani agricultural advisor specializing in ${crop} farming.

Generate a complete farming calendar for:
- Crop: ${crop} (${cropData.name.urdu})
- Location: ${location}, Pakistan
- Farm size: ${acres} acres
- Start date: ${startDate.toISOString().split("T")[0]}
- Expected duration: ${cropData.duration} days

Current weather conditions:
- Temperature: ${weatherData.current?.temperature_2m || "N/A"}°C
- Next 7 days average: ${weatherSummary.avgMaxTemp || "N/A"}°C max, ${weatherSummary.avgMinTemp || "N/A"}°C min
- Rainy days expected: ${weatherSummary.rainyDays || 0} days in next 2 weeks

Based on this crop's typical schedule and current weather, generate activities list.
Use these as baseline but adjust for weather:
${JSON.stringify(cropData.activities.slice(0, 5))}

Return ONLY valid JSON (no markdown, no extra text) in this exact format:
{
  "activities": [
    {
      "day": 0,
      "type": "land_prep",
      "title": "زمین کی تیاری",
      "desc": "ہل چلائیں اور زمین کو برابر کریں",
      "scheduledDate": "${startDate.toISOString()}",
      "weatherNote": "Optimal temperature for plowing"
    }
  ]
}

Generate ${cropData.activities.length} activities covering the full ${cropData.duration} day cycle.
Keep Urdu titles and descriptions. Adjust timing slightly if weather conditions require it.`;

  console.log("Calling OpenRouter for AI calendar...");

  const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: "openai/gpt-4o-mini", // Cheaper and faster
        messages: [
          {
            role: "system",
            content: "You are an expert Pakistani agricultural advisor. Always return valid JSON only.",
          },
          {role: "user", content: prompt},
        ],
        temperature: 0.3,
        max_tokens: 2000,
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://awaz-e-kisan.web.app",
          "X-Title": "Awaz-e-Kisan",
        },
        timeout: 30000,
      },
  );

  const content = response.data.choices[0].message.content;
  console.log("AI Response received:", content.substring(0, 200));

  // Parse AI response (handle markdown code blocks)
  let parsed;
  try {
    // Remove markdown code blocks if present
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    throw new Error("AI returned invalid JSON");
  }

  // Convert scheduledDate strings to Date objects
  parsed.activities = parsed.activities.map((activity, index) => {
    const activityDate = new Date(startDate);
    activityDate.setDate(activityDate.getDate() + activity.day);
    return {
      ...activity,
      scheduledDate: activityDate,
    };
  });

  return parsed;
}

// ========================================
// HELPER: Weather-Adjusted Static Calendar
// ========================================

async function applyWeatherAdjustments(staticActivities, startDate, weatherData) {
  return staticActivities.map((activity, index) => {
    const activityDate = new Date(startDate);
    activityDate.setDate(activityDate.getDate() + activity.day);

    let adjusted = {
      id: `activity_${index}`,
      ...activity,
      scheduledDate: activityDate,
      completed: false,
      rescheduled: false,
      reminderSent: false,
    };

    // Check weather for this day (if within forecast range)
    if (weatherData?.daily && activity.day < weatherData.daily.time.length) {
      const dayIndex = activity.day;
      const precipProb = weatherData.daily.precipitation_probability_max[dayIndex];
      const precipSum = weatherData.daily.precipitation_sum[dayIndex];

      // If rain expected and activity is sensitive to rain
      const rainSensitive = ["irrigation", "pest_spray", "fertilizer", "harvest", "seed_sowing"];
      if ((precipProb > 70 || precipSum > 5) && rainSensitive.includes(activity.type)) {
        // Postpone by 2 days
        const newDate = new Date(activityDate);
        newDate.setDate(newDate.getDate() + 2);
        adjusted.scheduledDate = newDate;
        adjusted.rescheduled = true;
        adjusted.rescheduledReason = `بارش کی وجہ سے (${precipProb}% امکان)`;
        adjusted.weatherNote = `Rain expected - rescheduled from day ${activity.day} to day ${activity.day + 2}`;
      }
    }

    return adjusted;
  });
}

exports.generateCropCalendar = functions
    .runWith({timeoutSeconds: 540}) // Increased for AI processing
    .https.onRequest((req, res) => {
      cors(req, res, async () => {
        if (req.method !== "POST") {
          return res.status(405).json({error: "Method not allowed"});
        }

        try {
          const {userId, crop, acres, location, startDate} = req.body;

          if (!userId || !crop) {
            return res.status(400).json({error: "Missing required fields"});
          }

          console.log(`Generating calendar for: ${crop}, ${location}, ${acres} acres`);

          // Get crop data (fallback if AI fails)
          const cropKey = crop.toLowerCase().replace(/\s+/g, "");
          const cropData = CROP_DATA[cropKey] || CROP_DATA.wheat;
          const start = startDate ? new Date(startDate) : new Date();

          // Step 1: Get weather forecast for intelligent scheduling
          let weatherData = null;
          let activities = [];

          try {
            weatherData = await getWeatherForecastForCalendar(location, start, cropData.duration);
            console.log("Weather data fetched successfully");

            // Step 2: Try AI-powered calendar generation
            try {
              console.log("Attempting AI calendar generation...");
              const aiCalendar = await generateAICalendar(
                  crop,
                  location,
                  start,
                  acres,
                  weatherData,
                  cropData,
              );

              activities = aiCalendar.activities.map((activity, index) => ({
                id: `activity_${index}`,
                ...activity,
                completed: false,
                rescheduled: false,
                reminderSent: false,
                aiGenerated: true,
              }));

              console.log(`AI generated ${activities.length} activities`);
            } catch (aiError) {
              console.log("AI generation failed, using static + weather adjustment:", aiError.message);
              // Fallback: Use static data with weather adjustments
              activities = await applyWeatherAdjustments(cropData.activities, start, weatherData);
            }
          } catch (weatherError) {
            console.log("Weather fetch failed, using pure static data:", weatherError.message);
            // Ultimate fallback: Pure static data
            activities = cropData.activities.map((activity, index) => {
              const activityDate = new Date(start);
              activityDate.setDate(activityDate.getDate() + activity.day);

              return {
                id: `activity_${index}`,
                ...activity,
                scheduledDate: activityDate,
                completed: false,
                rescheduled: false,
                reminderSent: false,
              };
            });
          }

          // Calculate estimated yield based on acres
          const totalYield = {
            min: cropData.estimatedYield.min * (acres || 1),
            max: cropData.estimatedYield.max * (acres || 1),
            unit: cropData.estimatedYield.unit,
          };

          // Save to Firestore
          const calendarRef = admin.firestore()
              .collection("cropCalendars")
              .doc(userId);

          await calendarRef.set({
            crop: cropData.name,
            cropKey: cropKey,
            acres: acres || 0,
            location: location || "Pakistan",
            startDate: start,
            duration: cropData.duration,
            status: "active",
            progress: 0,
            completedActivities: 0,
            totalActivities: activities.length,
            estimatedYield: totalYield,
            actualYield: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Save activities as subcollection
          const batch = admin.firestore().batch();
          activities.forEach((activity) => {
            const activityRef = calendarRef.collection("activities").doc(activity.id);
            batch.set(activityRef, activity);
          });
          await batch.commit();

          // Schedule first 3 reminders
          await scheduleReminders(userId, activities.slice(0, 3));

          res.json({
            success: true,
            message: "کیلنڈر بن گیا ہے!",
            calendar: {
              totalActivities: activities.length,
              duration: cropData.duration,
              estimatedYield: totalYield,
            },
          });
        } catch (error) {
          console.error("Calendar generation error:", error);
          res.status(500).json({
            error: "Calendar generation failed",
            details: error.message,
          });
        }
      });
    });

// ========================================
// 7. SCHEDULE REMINDERS FUNCTION
// ========================================

async function scheduleReminders(userId, activities) {
  const batch = admin.firestore().batch();

  activities.forEach((activity) => {
    // Calculate reminder time (3 days before activity)
    const reminderDate = new Date(activity.scheduledDate);
    reminderDate.setDate(reminderDate.getDate() - 3);

    // Only schedule if reminder is in the future
    if (reminderDate > new Date()) {
      const reminderRef = admin.firestore()
          .collection("reminders")
          .doc(userId)
          .collection("scheduled")
          .doc(activity.id);

      batch.set(reminderRef, {
        activityId: activity.id,
        activityTitle: activity.title,
        activityDesc: activity.desc,
        scheduledDate: activity.scheduledDate,
        reminderDate: reminderDate,
        sent: false,
        type: activity.type,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

  await batch.commit();
}

// ========================================
// 8. SEND REMINDERS (Scheduled Function)
// ========================================

exports.sendDailyReminders = functions.pubsub
    .schedule("every day 08:00")
    .timeZone("Asia/Karachi")
    .onRun(async (context) => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 4); // Send 3 days in advance

        // Get all pending reminders
        const remindersSnapshot = await admin.firestore()
            .collectionGroup("scheduled")
            .where("sent", "==", false)
            .where("reminderDate", ">=", today)
            .where("reminderDate", "<=", tomorrow)
            .get();

        console.log(`Found ${remindersSnapshot.size} reminders to send`);

        const promises = [];
        remindersSnapshot.forEach((doc) => {
          const reminder = doc.data();
          const userId = doc.ref.parent.parent.id;

          // Generate voice message in Urdu
          const message = generateReminderMessage(reminder);

          // Send notification (implement your notification logic)
          promises.push(
              sendVoiceReminder(userId, message, reminder)
                  .then(() => {
                    // Mark as sent
                    return doc.ref.update({sent: true, sentAt: admin.firestore.FieldValue.serverTimestamp()});
                  }),
          );
        });

        await Promise.all(promises);
        console.log(`Sent ${promises.length} reminders successfully`);

        return null;
      } catch (error) {
        console.error("Reminder sending error:", error);
        throw error;
      }
    });

function generateReminderMessage(reminder) {
  const daysUntil = Math.ceil((reminder.scheduledDate.toDate() - new Date()) / (1000 * 60 * 60 * 24));

  return `السلام علیکم! ${reminder.activityTitle} کا وقت آ گیا ہے۔ ` +
         `${daysUntil} دن میں آپ کو ${reminder.activityDesc}۔ ` +
         `وقت پر کام کریں تاکہ پیداوار اچھی ہو۔ شکریہ!`;
}

async function sendVoiceReminder(userId, message, reminder) {
  // Get user data for language preference
  const userDoc = await admin.firestore().collection("users").doc(userId).get();
  const userData = userDoc.data();

  // Convert to voice (using existing TTS function)
  // In production, integrate with WhatsApp API or SMS service
  console.log(`Sending reminder to user ${userId}: ${message}`);

  // Save notification in user's collection
  await admin.firestore()
      .collection("users")
      .doc(userId)
      .collection("notifications")
      .add({
        message,
        type: "reminder",
        activityId: reminder.activityId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });

  return Promise.resolve();
}

// ========================================
// 9. WEATHER-ADAPTIVE RESCHEDULING
// ========================================

exports.checkWeatherAndReschedule = functions.pubsub
    .schedule("every day 06:00")
    .timeZone("Asia/Karachi")
    .onRun(async (context) => {
      try {
        // Get all active calendars
        const calendarsSnapshot = await admin.firestore()
            .collection("cropCalendars")
            .where("status", "==", "active")
            .get();

        console.log(`Checking weather for ${calendarsSnapshot.size} active calendars`);

        const promises = [];
        calendarsSnapshot.forEach((doc) => {
          const calendar = doc.data();
          promises.push(checkAndRescheduleActivities(doc.id, calendar));
        });

        await Promise.all(promises);
        console.log("Weather-based rescheduling complete");

        return null;
      } catch (error) {
        console.error("Weather rescheduling error:", error);
        throw error;
      }
    });

async function checkAndRescheduleActivities(userId, calendar) {
  try {
    // Get location coordinates
    const cityName = (calendar.location || "Lahore").toLowerCase().trim();
    const coords = CITY_COORDINATES[cityName] || CITY_COORDINATES.lahore;
    
    // Get 7-day weather forecast from Open-Meteo (FREE, no API key!)
    const weatherResponse = await axios.get(
        "https://api.open-meteo.com/v1/forecast",
        {
          params: {
            latitude: coords.lat,
            longitude: coords.lon,
            daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code",
            timezone: "Asia/Karachi",
            forecast_days: 7,
          },
          timeout: 10000,
        },
    );

    const forecast = weatherResponse.data.daily;

    // Get upcoming activities (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const activitiesSnapshot = await admin.firestore()
        .collection("cropCalendars")
        .doc(userId)
        .collection("activities")
        .where("completed", "==", false)
        .where("scheduledDate", "<=", nextWeek)
        .get();

    const updates = [];

    activitiesSnapshot.forEach((doc) => {
      const activity = doc.data();
      const activityDate = activity.scheduledDate.toDate();

      // Check if weather affects this activity
      // Find matching day in forecast
      let dayIndex = -1;
      for (let i = 0; i < forecast.time.length; i++) {
        const forecastDate = new Date(forecast.time[i]);
        if (forecastDate.toDateString() === activityDate.toDateString()) {
          dayIndex = i;
          break;
        }
      }

      if (dayIndex >= 0) {
        let needsReschedule = false;
        let reason = "";

        const precipitation = forecast.precipitation_sum[dayIndex];
        const precipProb = forecast.precipitation_probability_max[dayIndex];
        const maxTemp = forecast.temperature_2m_max[dayIndex];
        const minTemp = forecast.temperature_2m_min[dayIndex];
        const weatherCode = forecast.weather_code[dayIndex];

        // Rain affects irrigation, spraying, harvesting, fertilizer
        const hasRain = precipitation > 2 || precipProb > 70 || 
                       [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode);
        
        if (hasRain && ["irrigation", "pest_spray", "harvest", "fertilizer"].includes(activity.type)) {
          needsReschedule = true;
          reason = "بارش کی وجہ سے";
        }

        // Extreme heat affects planting
        if (maxTemp > 40 && ["seed_sowing", "transplant", "planting"].includes(activity.type)) {
          needsReschedule = true;
          reason = "شدید گرمی کی وجہ سے";
        }

        // Cold affects spraying
        if (minTemp < 10 && activity.type === "pest_spray") {
          needsReschedule = true;
          reason = "سردی کی وجہ سے";
        }

        if (needsReschedule) {
          // Reschedule by 2-3 days
          const newDate = new Date(activityDate);
          newDate.setDate(newDate.getDate() + 3);

          updates.push(
              doc.ref.update({
                scheduledDate: newDate,
                rescheduled: true,
                rescheduledReason: reason,
                originalDate: activityDate,
              }),
          );

          // Send notification to user
          updates.push(
              admin.firestore()
                  .collection("users")
                  .doc(userId)
                  .collection("notifications")
                  .add({
                    message: `${activity.title} ${reason} تبدیل کر دی گئی ہے۔ نئی تاریخ: ${newDate.toLocaleDateString("ur-PK")}`,
                    type: "reschedule",
                    activityId: activity.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    read: false,
                  }),
              );
        }
      }
    });

    await Promise.all(updates);
  } catch (error) {
    console.error(`Rescheduling error for user ${userId}:`, error);
  }
}

// ========================================
// 10. MARK ACTIVITY COMPLETE
// ========================================

exports.completeActivity = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({error: "Method not allowed"});
    }

    try {
      const {userId, activityId, notes} = req.body;

      if (!userId || !activityId) {
        return res.status(400).json({error: "Missing required fields"});
      }

      // Update activity
      const activityRef = admin.firestore()
          .collection("cropCalendars")
          .doc(userId)
          .collection("activities")
          .doc(activityId);

      await activityRef.update({
        completed: true,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        notes: notes || "",
      });

      // Update calendar progress
      const calendarRef = admin.firestore()
          .collection("cropCalendars")
          .doc(userId);

      const calendar = await calendarRef.get();
      const calendarData = calendar.data();
      const completedCount = (calendarData.completedActivities || 0) + 1;
      const progress = (completedCount / calendarData.totalActivities) * 100;

      await calendarRef.update({
        completedActivities: completedCount,
        progress: progress,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update community insights
      await updateCommunityInsights(userId, calendarData, activityId);

      // Recalculate yield prediction
      const yieldPrediction = calculateYieldPrediction(calendarData, progress);

      res.json({
        success: true,
        message: "سرگرمی مکمل ہو گئی!",
        progress: Math.round(progress),
        yieldPrediction,
      });
    } catch (error) {
      console.error("Activity completion error:", error);
      res.status(500).json({
        error: "Failed to complete activity",
        details: error.message,
      });
    }
  });
});

// ========================================
// 11. COMMUNITY INSIGHTS
// ========================================

async function updateCommunityInsights(userId, calendarData, activityId) {
  try {
    const region = calendarData.location || "Pakistan";

    // Get activity details
    const activityDoc = await admin.firestore()
        .collection("cropCalendars")
        .doc(userId)
        .collection("activities")
        .doc(activityId)
        .get();

    const activity = activityDoc.data();

    // Add to community completions (anonymous)
    await admin.firestore()
        .collection("activityCompletions")
        .doc(region)
        .collection("completions")
        .add({
          crop: calendarData.cropKey,
          activityType: activity.type,
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          date: new Date().toDateString(),
        });

    // Update aggregated insights
    const insightsRef = admin.firestore()
        .collection("communityInsights")
        .doc(region);

    const insights = await insightsRef.get();
    const insightsData = insights.data() || {activeFarmers: 0, activities: {}};

    const activityKey = `${calendarData.cropKey}_${activity.type}`;
    const activityCount = insightsData.activities[activityKey] || 0;

    await insightsRef.set({
      activeFarmers: insightsData.activeFarmers + 1,
      activities: {
        ...insightsData.activities,
        [activityKey]: activityCount + 1,
      },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});
  } catch (error) {
    console.error("Community insights update error:", error);
  }
}

exports.getCommunityInsights = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {userId} = req.query;

      // Get user's location
      const userDoc = await admin.firestore()
          .collection("cropCalendars")
          .doc(userId)
          .get();

      const location = userDoc.data()?.location || "Pakistan";

      // Get insights
      const insightsDoc = await admin.firestore()
          .collection("communityInsights")
          .doc(location)
          .get();

      const insights = insightsDoc.data() || {};

      // Get recent activities (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recentActivities = await admin.firestore()
          .collection("activityCompletions")
          .doc(location)
          .collection("completions")
          .where("completedAt", ">=", yesterday)
          .get();

      res.json({
        success: true,
        location,
        activeFarmers: insights.activeFarmers || 0,
        recentActivitiesCount: recentActivities.size,
        message: `آپ کے علاقے میں ${recentActivities.size} کسانوں نے آج کام کیا`,
      });
    } catch (error) {
      console.error("Community insights error:", error);
      res.status(500).json({error: error.message});
    }
  });
});

// ========================================
// 12. YIELD PREDICTION
// ========================================

function calculateYieldPrediction(calendar, progress) {
  const baseYield = calendar.estimatedYield;

  // Adjust based on progress
  let factor = 1.0;

  if (progress < 30) {
    factor = 0.5; // Too early to predict
  } else if (progress < 60) {
    factor = 0.75;
  } else if (progress < 90) {
    factor = 0.9;
  } else {
    factor = 1.0; // Full prediction accuracy
  }

  return {
    min: Math.round(baseYield.min * factor),
    max: Math.round(baseYield.max * factor),
    unit: baseYield.unit,
    confidence: Math.round(progress),
  };
}

// ========================================
// 13. MARKET PRICE TRACKING
// ========================================

exports.trackMarketPrices = functions.pubsub
    .schedule("every 6 hours")
    .timeZone("Asia/Karachi")
    .onRun(async (context) => {
      try {
        // Mock market prices (replace with real API)
        const prices = [
          {crop: "wheat", price: 3500, change: -20, unit: "rupees/maund"},
          {crop: "rice", price: 7500, change: 50, unit: "rupees/maund"},
          {crop: "cotton", price: 8000, change: 0, unit: "rupees/maund"},
          {crop: "sugarcane", price: 350, change: 10, unit: "rupees/maund"},
        ];

        const batch = admin.firestore().batch();

        prices.forEach((priceData) => {
          const priceRef = admin.firestore()
              .collection("marketPrices")
              .doc(priceData.crop);

          batch.set(priceRef, {
            ...priceData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // If price dropped significantly, notify farmers
          if (priceData.change < -50) {
            notifyFarmersAboutPrice(priceData);
          }
        });

        await batch.commit();
        console.log("Market prices updated");

        return null;
      } catch (error) {
        console.error("Market price tracking error:", error);
        throw error;
      }
    });

async function notifyFarmersAboutPrice(priceData) {
  // Get all farmers growing this crop
  const calendarsSnapshot = await admin.firestore()
      .collection("cropCalendars")
      .where("cropKey", "==", priceData.crop)
      .where("status", "==", "active")
      .get();

  const promises = [];

  calendarsSnapshot.forEach((doc) => {
    const userId = doc.id;
    const message = `${priceData.crop} کی قیمت Rs. ${Math.abs(priceData.change)} کم ہو گئی! ` +
                   `نئی قیمت: Rs. ${priceData.price}/${priceData.unit}`;

    promises.push(
        admin.firestore()
            .collection("users")
            .doc(userId)
            .collection("notifications")
            .add({
              message,
              type: "price_alert",
              crop: priceData.crop,
              price: priceData.price,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              read: false,
            }),
    );
  });

  await Promise.all(promises);
  console.log(`Notified ${promises.length} farmers about price change`);
}
