const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
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
    .https.onRequest((req, res) => {
      cors(req, res, async () => {
        if (req.method !== "POST") {
          return res.status(405).json({error: "Method not allowed"});
        }

        try {
          const busboy = Busboy({headers: req.headers});
          const tmpdir = os.tmpdir();
          const uploads = {};
          const fields = {};

          // Handle file upload
          busboy.on("file", (fieldname, file, info) => {
            const {filename} = info;
            const filepath = path.join(tmpdir, filename);
            uploads[fieldname] = filepath;
            file.pipe(fs.createWriteStream(filepath));
          });

          // Handle form fields
          busboy.on("field", (fieldname, val) => {
            fields[fieldname] = val;
          });

          // Process after upload completes
          busboy.on("finish", async () => {
            try {
              const audioPath = uploads.audio;
              if (!audioPath) {
                return res.status(400).json({error: "No audio file provided"});
              }

              // Call OpenRouter Whisper API
              const formData = new FormData();
              formData.append("file", fs.createReadStream(audioPath));
              formData.append("model", "openai/whisper-1");
              formData.append("language", fields.language || "ur");

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
                  },
              );

              // Clean up temp file
              fs.unlinkSync(audioPath);

              // Detect language (basic detection)
              const text = transcription.data.text;
              const detectedLanguage = detectLanguage(text);

              res.json({
                success: true,
                text: text,
                language: detectedLanguage,
              });
            } catch (error) {
              console.error("STT Error:", error);
              res.status(500).json({
                error: "Speech-to-text failed",
                details: error.message,
              });
            }
          });

          req.pipe(busboy);
        } catch (error) {
          console.error("Upload Error:", error);
          res.status(500).json({error: error.message});
        }
      });
    });

// ========================================
// 2. LLM PROCESSING FUNCTION (GPT-4)
// ========================================
exports.askAssistant = functions
    .runWith({timeoutSeconds: 300})
    .https.onRequest((req, res) => {
      cors(req, res, async () => {
        if (req.method !== "POST") {
          return res.status(405).json({error: "Method not allowed"});
        }

        try {
          const {question, language, userId, context} = req.body;

          if (!question) {
            return res.status(400).json({error: "Question is required"});
          }

          // Build context-aware prompt
          let userPrompt = question;
          if (context) {
            userPrompt = `Previous context: ${context}\n\nNew question: ${question}`;
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
              },
          );

          const answer = completion.data.choices[0].message.content;
          const detectedLanguage = language || detectLanguage(answer);

          // Save to Firestore
          if (userId) {
            await admin.firestore()
                .collection("queries")
                .doc(userId)
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

          res.json({
            success: true,
            answer,
            language: detectedLanguage,
          });
        } catch (error) {
          console.error("LLM Error:", error);
          res.status(500).json({
            error: "Failed to process question",
            details: error.message,
          });
        }
      });
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
// 4. WEATHER FUNCTION
// ========================================
exports.getWeather = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {location, language} = req.query;
      const weatherKey = functions.config().weather?.key;

      if (!weatherKey) {
        // Return mock data if no API key
        return res.json({
          success: true,
          weather: generateMockWeather(location, language),
        });
      }

      // Call real weather API
      const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather`,
          {
            params: {
              q: location || "Lahore,PK",
              appid: weatherKey,
              units: "metric",
              lang: mapLanguageCode(language),
            },
          },
      );

      res.json({
        success: true,
        weather: formatWeatherResponse(response.data, language),
      });
    } catch (error) {
      console.error("Weather Error:", error);
      res.status(500).json({error: error.message});
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
 * Format weather API response
 */
function formatWeatherResponse(data, language) {
  const temp = Math.round(data.main.temp);
  const desc = data.weather[0].description;
  const location = data.name;

  const templates = {
    urdu: `${location} میں ${desc}، درجہ حرارت ${temp}°C ہے۔`,
    punjabi: `${location} ਵਿੱਚ ${desc}, ਤਾਪਮਾਨ ${temp}°C ਹੈ।`,
    sindhi: `${location} ۾ ${desc}، گرمي ${temp}°C آهي۔`,
  };

  return templates[language] || templates.urdu;
}
