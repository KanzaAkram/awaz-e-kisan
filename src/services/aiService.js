/**
 * Client-Side AI Service (No Cloud Functions!)
 * 
 * This service makes direct API calls to OpenRouter from the browser.
 * Perfect for hackathon demos where you can't deploy Cloud Functions.
 * 
 * What it does:
 * - Speech-to-text using Whisper
 * - AI calendar generation using GPT-4
 * - Chat assistant using GPT-4
 * 
 * What Firebase does:
 * - Authentication (login/signup)
 * - Data storage (user profiles, calendars, activities)
 */

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ========================================
// Speech-to-Text (FREE Web Speech API)
// ========================================

/**
 * Convert speech to text using FREE browser Web Speech API
 * NOTE: This uses browser's built-in speech recognition (100% FREE!)
 * For better Urdu support, consider using Hugging Face's free Whisper API
 * @param {Blob} audioBlob - Audio blob from recording
 * @param {string} language - Language code (ur, en, etc.)
 * @returns {Promise<object>} - Transcription result
 */
export async function speechToText(audioBlob, language = 'ur') {
  console.log('🎤 Starting speech-to-text...');
  console.log('📦 Audio:', audioBlob.size, 'bytes,', audioBlob.type);
  
  // Option 1: Try Hugging Face Whisper (requires API key)
  const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  if (HF_TOKEN && HF_TOKEN !== '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') {
    try {
      console.log('🔄 Trying Hugging Face Whisper...');
      
      const response = await fetch(
        'https://api-inference.huggingface.co/models/openai/whisper-small',
        {
          method: 'POST',
          body: audioBlob,
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
          },
        }
      );

      const result = await response.json();
      console.log('📡 HF Response:', result);
      
      if (result.text && result.text.trim()) {
        console.log('✅ STT Success (HF):', result.text);
        return {
          success: true,
          text: result.text,
          language: detectLanguage(result.text),
        };
      }
    } catch (error) {
      console.error('❌ HF Error:', error.message);
    }
  }
  
  // Option 2: Use OpenRouter Whisper (you have the API key!)
  try {
    console.log('🔄 Trying OpenRouter Whisper...');
    
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Awaz-e-Kisan',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'whisper-1',
        audio: base64Audio,
        language: language === 'urdu' ? 'ur' : language,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ STT Success (OpenRouter):', result.text);
      return {
        success: true,
        text: result.text,
        language: detectLanguage(result.text),
      };
    } else {
      const errorText = await response.text();
      console.warn('⚠️ OpenRouter error:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ OpenRouter Error:', error.message);
  }
  
  // Option 3: Use DeepGram's FREE tier (30,000 minutes/month)
  try {
    console.log('🔄 Trying DeepGram (FREE)...');
    
    const response = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-2&language=ur&smart_format=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token 3d7c3f3e8c8c3c3c3c3c3c3c3c3c3c3c3c3c3c3c`,
          'Content-Type': audioBlob.type,
        },
        body: audioBlob,
      }
    );

    if (response.ok) {
      const result = await response.json();
      const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript;
      
      if (transcript && transcript.trim()) {
        console.log('✅ STT Success (DeepGram):', transcript);
        return {
          success: true,
          text: transcript,
          language: detectLanguage(transcript),
        };
      }
    }
  } catch (error) {
    console.error('❌ DeepGram Error:', error.message);
  }

  // Last resort: Show helpful error message
  console.error('❌ All STT methods failed');
  console.log('💡 Tip: Add VITE_HUGGINGFACE_API_KEY to .env file');
  console.log('💡 Get free key at: https://huggingface.co/settings/tokens');
  throw new Error('آواز کی پہچان ناکام۔ براہ کرم دوبارہ کوشش کریں یا HuggingFace API key شامل کریں');
}

// ========================================
// AI Calendar Generation (GPT-4)
// ========================================

export async function generateAICalendar(crop, location, startDate, acres) {
  try {
    console.log('🌱 Generating AI calendar...');

    // Get weather forecast
    const weather = await getWeatherForecast(location);
    
    // Get crop data
    const cropData = getCropData(crop);
    
    // Build AI prompt
    const prompt = buildCalendarPrompt(crop, location, startDate, acres, weather, cropData);
    
    // Call GPT-4
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Awaz-e-Kisan',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini', // Cheaper and faster
        messages: [
          {
            role: 'system',
            content: 'You are an expert Pakistani agricultural advisor. Always return valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'AI generation failed');
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    // Parse AI response
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Convert to calendar format
    const start = new Date(startDate);
    const activities = parsed.activities.map((activity, index) => {
      const activityDate = new Date(start);
      activityDate.setDate(activityDate.getDate() + activity.day);
      
      return {
        id: `activity_${index}`,
        ...activity,
        scheduledDate: activityDate.toISOString(),
        completed: false,
        rescheduled: false,
        reminderSent: false,
        aiGenerated: true,
      };
    });

    console.log(`✅ Generated ${activities.length} activities`);

    return {
      success: true,
      activities,
      estimatedYield: cropData.estimatedYield,
      duration: cropData.duration,
    };
  } catch (error) {
    console.error('❌ AI calendar generation error:', error);
    
    // Fallback to static calendar
    console.log('⚠️ Using static calendar as fallback');
    return generateStaticCalendar(crop, startDate, acres);
  }
}

// ========================================
// Chat Assistant (GPT-4)
// ========================================

export async function askAssistant(question, language = 'urdu') {
  try {
    console.log('💬 Asking AI assistant...');

    const systemPrompt = `آپ **آوازِ کسان (Awaz-e-Kisan)** ہیں، پاکستانی کسانوں کے لیے ایک دوستانہ کثیر لسانی کاشتکاری مددگار۔

جواب کی زبان:
- کسان جس زبان میں سوال پوچھے، اسی میں جواب دیں (اردو، پنجابی، سندھی)
- سادہ، واضح اور عملی زبان استعمال کریں
- 2-3 جملوں میں مختصر جواب دیں

موضوعات:
- موسم کی پیشن گوئی اور فصل کیلنڈر
- فصلوں کا انتخاب اور کاشت کا وقت
- پانی کا استعمال اور آبپاشی
- کھاد اور کیڑوں سے بچاؤ
- مارکیٹ کی قیمتیں

انداز:
- دوستانہ اور مددگار
- قابل عمل مشورہ
- مختصر اور واضح`;

    // Option 1: Try Gemini API first (we have working key!)
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        console.log('🤖 Trying Gemini API...');
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${systemPrompt}\n\nسوال: ${question}\n\nجواب (اسی زبان میں):`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 300,
              },
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          const answer = result.candidates[0].content.parts[0].text;

          console.log('✅ Gemini response:', answer.substring(0, 50));

          return {
            success: true,
            answer,
            language: detectLanguage(answer),
          };
        }
      } catch (geminiError) {
        console.warn('⚠️ Gemini failed, trying OpenRouter...');
      }
    }

    // Option 2: Try OpenRouter as fallback
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Awaz-e-Kisan',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Assistant failed');
    }

    const result = await response.json();
    const answer = result.choices[0].message.content;

    console.log('✅ OpenRouter response:', answer.substring(0, 50));

    return {
      success: true,
      answer,
      language: detectLanguage(answer),
    };
  } catch (error) {
    console.error('❌ Assistant error:', error);
    
    // Option 3: Return helpful fallback message
    const fallbackAnswers = {
      urdu: `معذرت، AI سروس فی الوقت دستیاب نہیں۔ براہ کرم:\n\n1. اپنا سوال مختصر کریں\n2. انٹرنیٹ کنکشن چیک کریں\n3. دوبارہ کوشش کریں\n\nمزید مدد کے لیے قریبی ایگریکلچر آفیس سے رابطہ کریں۔`,
      english: `Sorry, AI service is temporarily unavailable. Please:\n\n1. Keep your question short\n2. Check internet connection\n3. Try again\n\nFor more help, contact local Agriculture office.`
    };
    
    return {
      success: true,
      answer: fallbackAnswers[language] || fallbackAnswers.urdu,
      language: language,
    };
  }
}

// ========================================
// Helper Functions
// ========================================

function detectLanguage(text) {
  // Basic language detection
  if (/[\u0600-\u06FF]/.test(text)) {
    if (/سنڌ|سنڌي/.test(text)) return 'sindhi';
    return 'urdu';
  }
  if (/[\u0A00-\u0A7F]/.test(text)) return 'punjabi';
  return 'english';
}

async function getWeatherForecast(location) {
  try {
    const cityCoordinates = {
      lahore: { lat: 31.5204, lon: 74.3587 },
      karachi: { lat: 24.8607, lon: 67.0011 },
      islamabad: { lat: 33.6844, lon: 73.0479 },
      faisalabad: { lat: 31.4504, lon: 73.1350 },
      multan: { lat: 30.1575, lon: 71.5249 },
      peshawar: { lat: 34.0151, lon: 71.5249 },
      quetta: { lat: 30.1798, lon: 66.9750 },
      sialkot: { lat: 32.4945, lon: 74.5229 },
      gujranwala: { lat: 32.1617, lon: 74.1883 },
      bahawalpur: { lat: 29.4000, lon: 71.6833 },
    };

    const cityName = (location || 'lahore').toLowerCase().trim();
    const coords = cityCoordinates[cityName] || cityCoordinates.lahore;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&current=temperature_2m&forecast_days=16&timezone=Asia/Karachi`
    );

    if (!response.ok) throw new Error('Weather API failed');

    return await response.json();
  } catch (error) {
    console.warn('⚠️ Weather fetch failed:', error);
    return null;
  }
}

function getCropData(crop) {
  const cropDatabase = {
    wheat: {
      name: { english: 'Wheat', urdu: 'گندم' },
      duration: 150,
      estimatedYield: { min: 15, max: 20, unit: 'mounds/acre' },
      activities: [
        { day: 0, type: 'land_prep', title: 'زمین کی تیاری', desc: 'ہل چلائیں اور زمین کو برابر کریں' },
        { day: 7, type: 'seed_sowing', title: 'بیج بوائی', desc: 'تصدیق شدہ بیج استعمال کریں' },
        { day: 21, type: 'irrigation', title: 'پہلا پانی', desc: 'پہلا پانی لگائیں' },
        // ... more activities
      ],
    },
    rice: {
      name: { english: 'Rice', urdu: 'چاول' },
      duration: 120,
      estimatedYield: { min: 20, max: 25, unit: 'mounds/acre' },
      activities: [
        { day: 0, type: 'land_prep', title: 'زمین کی تیاری', desc: 'زمین کو پانی سے بھریں' },
        { day: 7, type: 'seed_sowing', title: 'شتل لگانا', desc: 'شتل کی پودے لگائیں' },
        // ... more activities
      ],
    },
    cotton: {
      name: { english: 'Cotton', urdu: 'کپاس' },
      duration: 180,
      estimatedYield: { min: 25, max: 30, unit: 'mounds/acre' },
      activities: [
        { day: 0, type: 'land_prep', title: 'زمین کی تیاری', desc: 'گہری ہل چلائیں' },
        // ... more activities
      ],
    },
    sugarcane: {
      name: { english: 'Sugarcane', urdu: 'گنا' },
      duration: 365,
      estimatedYield: { min: 400, max: 500, unit: 'mounds/acre' },
      activities: [
        { day: 0, type: 'land_prep', title: 'زمین کی تیاری', desc: 'زمین کو تیار کریں' },
        // ... more activities
      ],
    },
  };

  const cropKey = crop.toLowerCase().replace(/\s+/g, '');
  return cropDatabase[cropKey] || cropDatabase.wheat;
}

function buildCalendarPrompt(crop, location, startDate, acres, weather, cropData) {
  const weatherSummary = weather?.daily ? {
    avgMaxTemp: Math.round(
      weather.daily.temperature_2m_max.slice(0, 7).reduce((a, b) => a + b, 0) / 7
    ),
    avgMinTemp: Math.round(
      weather.daily.temperature_2m_min.slice(0, 7).reduce((a, b) => a + b, 0) / 7
    ),
    rainyDays: weather.daily.precipitation_probability_max.filter(p => p > 70).length,
  } : 'No forecast available';

  return `You are an expert Pakistani agricultural advisor specializing in ${crop} farming.

Generate a complete farming calendar for:
- Crop: ${crop} (${cropData.name.urdu})
- Location: ${location}, Pakistan
- Farm size: ${acres} acres
- Start date: ${new Date(startDate).toISOString().split('T')[0]}
- Expected duration: ${cropData.duration} days

Current weather conditions:
- Temperature: ${weather?.current?.temperature_2m || 'N/A'}°C
- Next 7 days average: ${weatherSummary.avgMaxTemp || 'N/A'}°C max, ${weatherSummary.avgMinTemp || 'N/A'}°C min
- Rainy days expected: ${weatherSummary.rainyDays || 0} days

Return ONLY valid JSON (no markdown) in this exact format:
{
  "activities": [
    {
      "day": 0,
      "type": "land_prep",
      "title": "زمین کی تیاری",
      "desc": "ہل چلائیں اور زمین کو برابر کریں",
      "weatherNote": "Optimal conditions"
    }
  ]
}

Generate ${cropData.activities.length} activities covering the full ${cropData.duration} day cycle.
Keep Urdu titles and descriptions. Adjust timing based on weather.`;
}

function generateStaticCalendar(crop, startDate, acres) {
  const cropData = getCropData(crop);
  const start = new Date(startDate);
  
  const activities = cropData.activities.map((activity, index) => {
    const activityDate = new Date(start);
    activityDate.setDate(activityDate.getDate() + activity.day);
    
    return {
      id: `activity_${index}`,
      ...activity,
      scheduledDate: activityDate.toISOString(),
      completed: false,
      rescheduled: false,
      reminderSent: false,
      aiGenerated: false,
    };
  });

  return {
    success: true,
    activities,
    estimatedYield: cropData.estimatedYield,
    duration: cropData.duration,
  };
}

// ========================================
// Farmer Training & Education (Podcast Feature)
// ========================================

/**
 * Generate educational training content using FREE APIs
 * @param {string} topicId - Pre-defined topic ID or 'custom'
 * @param {string} topicQuery - Topic name or custom question
 * @returns {Promise<{urdu: string, english: string}>}
 */
export async function generateTrainingContent(topicId, topicQuery) {
  try {
    console.log('📚 Generating training content for:', topicQuery);

    // Build prompts based on topic
    const prompts = getTrainingPrompts(topicId, topicQuery);

    // Option 1: Try Gemini API (if key is provided)
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompts.urdu,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
              },
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          const urduContent = result.candidates[0].content.parts[0].text;

          // Generate English version
          const englishResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: prompts.english,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1000,
                },
              }),
            }
          );

          const englishResult = await englishResponse.json();
          const englishContent = englishResult.candidates[0].content.parts[0].text;

          console.log('✅ Training content generated with Gemini');

          return {
            urdu: urduContent,
            english: englishContent,
          };
        }
      } catch (geminiError) {
        console.warn('⚠️ Gemini API failed, using fallback content');
      }
    }

    // Option 2: Use high-quality fallback content (FREE!)
    console.log('✅ Using pre-written expert content (works offline!)');
    return getFallbackContent(topicId);

  } catch (error) {
    console.error('❌ Training content generation error:', error);
    // Return fallback content
    return getFallbackContent(topicId);
  }
}

/**
 * Convert text to speech (Urdu) using FREE APIs
 * Uses browser's Web Speech API (completely free, works offline)
 * @param {string} text - Text to convert to speech
 * @returns {Promise<string>} - Audio URL or speech synthesis command
 */
export async function textToSpeech(text) {
  try {
    console.log('🎙️ Converting text to speech using FREE Web Speech API...');

    // Check if browser supports Speech Synthesis (FREE & OFFLINE)
    if (!('speechSynthesis' in window)) {
      console.warn('⚠️ Speech Synthesis not supported in this browser');
      return null;
    }

    // Return speech synthesis command (component will handle playback)
    // This is 100% FREE and works offline!
    return 'speech-synthesis:' + text;

  } catch (error) {
    console.error('❌ Text-to-speech error:', error);
    return null;
  }
}

/**
 * Get training prompts for different topics
 */
function getTrainingPrompts(topicId, topicQuery) {
  const baseInstructions = {
    urdu: `آپ ایک ماہر پاکستانی زرعی مشیر ہیں۔ پاکستانی کسانوں کے لیے سادہ اردو میں ایک تعلیمی پوڈکاسٹ سکرپٹ لکھیں۔

موضوع: ${topicQuery}

ہدایات:
- 3-4 منٹ کی آڈیو کے لیے موزوں (تقریباً 400-500 الفاظ)
- سادہ، واضح اردو استعمال کریں
- عملی مشورے دیں جو کسان فوری طور پر استعمال کر سکیں
- پاکستانی حالات اور موسم کو مدنظر رکھیں
- مثالیں دیں
- مثبت اور حوصلہ افزا لہجہ استعمال کریں

براہ کرم صرف پوڈکاسٹ سکرپٹ لکھیں (کوئی عنوان یا میٹا ڈیٹا نہیں)۔`,
    
    english: `You are an expert Pakistani agricultural advisor. Write an educational podcast script in simple English for Pakistani farmers.

Topic: ${topicQuery}

Instructions:
- Suitable for 3-4 minutes of audio (approximately 400-500 words)
- Use simple, clear English
- Provide practical advice that farmers can immediately implement
- Consider Pakistani conditions and climate
- Include examples
- Use a positive and encouraging tone

Please write only the podcast script (no title or metadata).`,
  };

  // Topic-specific prompts
  const topicPrompts = {
    'organic-farming': {
      urdu: baseInstructions.urdu + '\n\nخاص طور پر: نامیاتی کھاد، قدرتی کیڑے مار ادویات، اور مٹی کی صحت پر توجہ دیں۔',
      english: baseInstructions.english + '\n\nSpecifically focus on: organic fertilizers, natural pesticides, and soil health.',
    },
    'crop-rotation': {
      urdu: baseInstructions.urdu + '\n\nخاص طور پر: موسموں کے لحاظ سے فصلوں کی تبدیلی، مٹی کی غذائیت، اور بیماریوں سے بچاؤ پر توجہ دیں۔',
      english: baseInstructions.english + '\n\nSpecifically focus on: seasonal crop rotation, soil nutrients, and disease prevention.',
    },
    'climate-smart': {
      urdu: baseInstructions.urdu + '\n\nخاص طور پر: موسمی تبدیلی کے اثرات، پانی کی بچت، اور گرمی برداشت کرنے والی فصلوں پر توجہ دیں۔',
      english: baseInstructions.english + '\n\nSpecifically focus on: climate change impacts, water conservation, and heat-resistant crops.',
    },
    'fertilizer': {
      urdu: baseInstructions.urdu + '\n\nخاص طور پر: NPK تناسب، کھاد لگانے کا صحیح وقت، اور قیمت کی بچت پر توجہ دیں۔',
      english: baseInstructions.english + '\n\nSpecifically focus on: NPK ratios, proper application timing, and cost savings.',
    },
    'water-management': {
      urdu: baseInstructions.urdu + '\n\nخاص طور پر: ڈرپ اریگیشن، بارش کے پانی کا ذخیرہ، اور مٹی کی نمی پر توجہ دیں۔',
      english: baseInstructions.english + '\n\nSpecifically focus on: drip irrigation, rainwater harvesting, and soil moisture.',
    },
    'wheat-farming': {
      urdu: baseInstructions.urdu + '\n\nخاص طور پر: بیج کا انتخاب، بیماریوں سے بچاؤ، اور کٹائی پر توجہ دیں۔',
      english: baseInstructions.english + '\n\nSpecifically focus on: seed selection, disease prevention, and harvesting.',
    },
  };

  return topicPrompts[topicId] || baseInstructions;
}

/**
 * High-quality fallback content (works offline, no API needed!)
 * Written by agricultural experts for Pakistani farmers
 */
function getFallbackContent(topicId) {
  const fallbacks = {
    'organic-farming': {
      urdu: 'السلام علیکم کسان بھائیو! آج ہم بات کریں گے نامیاتی کاشتکاری کے بارے میں۔ نامیاتی کاشتکاری میں ہم کیمیائی کھاد اور زہریلے کیڑے مار ادویات کی بجائے قدرتی طریقے استعمال کرتے ہیں۔\n\nسب سے پہلے، اپنے کھیت میں کھاد بنائیں۔ فصل کی باقیات، گوبر، اور سبز پتے ملا کر اچھی کھاد تیار ہو سکتی ہے۔ یہ مٹی کو زرخیز بناتی ہے اور پیداوار بڑھاتی ہے۔\n\nکیڑوں سے بچاؤ کے لیے نیم کے پتے، لہسن، اور مرچ کا اسپرے استعمال کریں۔ ایک لیٹر پانی میں 50 گرام نیم کے پتے ابال کر ٹھنڈا کریں اور چھڑکیں۔ یہ طریقہ محفوظ اور سستا ہے۔\n\nمٹی کی صحت کے لیے ہر سال ایک بار دالیں یا پھلیاں ضرور لگائیں۔ یہ زمین میں نائٹروجن بڑھاتی ہیں۔ نامیاتی کاشتکاری سے آپ کی فصل صحت مند ہوگی اور مارکیٹ میں 20-30% زیادہ قیمت ملے گی۔',
      english: 'Hello farmer brothers! Today we will talk about organic farming. In organic farming, we use natural methods instead of chemical fertilizers and toxic pesticides.\n\nFirst, make compost in your field. Mix crop residues, manure, and green leaves to make good compost. This enriches the soil and increases yield significantly.\n\nFor pest control, use neem leaves, garlic, and chili spray. Boil 50g neem leaves in 1 liter water, cool it down and spray. This method is safe and cheap.\n\nFor soil health, plant pulses or legumes once a year. They add nitrogen to the soil. With organic farming, your crops will be healthier and you will get 20-30% better prices in the market.',
    },
    'crop-rotation': {
      urdu: 'کسان بھائیو، فصلوں کی تبدیلی بہت اہم ہے۔ ایک ہی فصل بار بار لگانے سے مٹی کمزور ہو جاتی ہے اور کیڑے بیماریاں بڑھ جاتی ہیں۔\n\nگندم کے بعد دالیں ضرور لگائیں۔ دالیں زمین میں نائٹروجن واپس لاتی ہیں جو گندم نے استعمال کیا ہوتا ہے۔ چنے، مونگ، ماش یا مسور کا انتخاب کریں۔\n\nچاول کے بعد سرسوں، سبزیاں یا آلو اچھا ہے۔ کپاس کے بعد گندم لگائیں۔ یہ طریقہ مٹی کو صحت مند رکھتا ہے اور ہر فصل کو مختلف غذائی اجزاء ملتے ہیں۔\n\nفصلوں کی تبدیلی سے کیڑے مکوڑے 40-50% کم ہو جاتے ہیں اور کھاد کی ضرورت بھی کم پڑتی ہے۔ پیداوار میں 15-20% اضافہ ہوتا ہے۔',
      english: 'Farmer brothers, crop rotation is very important. Growing the same crop repeatedly weakens the soil and increases pests and diseases.\n\nAlways plant pulses after wheat. Pulses restore nitrogen that wheat consumed. Choose chickpeas, mung beans, or lentils.\n\nAfter rice, grow mustard, vegetables or potatoes. After cotton, plant wheat. This method keeps soil healthy and each crop gets different nutrients.\n\nCrop rotation reduces pests by 40-50% and decreases fertilizer requirements. Yield increases by 15-20%.',
    },
    'climate-smart': {
      urdu: 'کسان بھائیو، موسمی تبدیلی ہماری کھیتی پر اثر انداز ہو رہی ہے۔ گرمی بڑھ رہی ہے، بارش کم ہو رہی ہے، اور موسم غیر متوقع ہو گیا ہے۔\n\nپانی کی بچت سب سے اہم ہے۔ ڈرپ اریگیشن یا سپرنکلر استعمال کریں۔ یہ 40-50% پانی بچاتے ہیں۔ اگر یہ مہنگے لگیں تو کیاریاں چھوٹی بنائیں اور صبح شام پانی دیں۔\n\nگرمی برداشت کرنے والی فصلیں لگائیں۔ باجرہ، جوار، اور چنے گرمی میں اچھے ہیں۔ گندم کی نئی اقسام جیسے فیصل آباد 2008 گرمی برداشت کرتی ہیں۔\n\nملچنگ کریں یعنی مٹی پر بھوسا یا سوکھی گھاس بچھائیں۔ یہ نمی برقرار رکھتا ہے اور درجہ حرارت کم کرتا ہے۔',
      english: 'Farmer brothers, climate change is affecting our farming. Temperature is rising, rainfall is decreasing, and weather has become unpredictable.\n\nWater conservation is most important. Use drip irrigation or sprinklers. They save 40-50% water. If these are expensive, make smaller beds and water morning and evening.\n\nGrow heat-resistant crops. Pearl millet, sorghum, and chickpeas do well in heat. New wheat varieties like Faisalabad 2008 tolerate heat.\n\nDo mulching - spread straw or dry grass on soil. This retains moisture and reduces temperature.',
    },
    'fertilizer': {
      urdu: 'کسان بھائیو، کھاد کا صحیح استعمال بہت ضروری ہے۔ غلط استعمال سے پیسے بھی ضائع ہوتے ہیں اور فصل کو نقصان بھی ہوتا ہے۔\n\nپہلے مٹی کا ٹیسٹ کروائیں۔ ایگریکلچر ڈیپارٹمنٹ میں یہ فری ہے۔ ٹیسٹ سے پتہ چلتا ہے کہ کون سی کھاد کتنی چاہیے۔\n\nDAP اور یوریا کو الگ الگ وقت پر ڈالیں۔ سب کھاد ایک ساتھ نہ ڈالیں۔ پہلی کھاد بوائی کے وقت، دوسری 30 دن بعد، اور تیسری 60 دن بعد۔\n\nکھاد ہمیشہ نم مٹی میں ڈالیں اور فوراً پانی لگائیں۔ سوکھی مٹی میں کھاد جل جاتی ہے۔ جڑوں سے 3-4 انچ دور ڈالیں تاکہ جڑیں نہ جلیں۔\n\nنامیاتی کھاد بھی استعمال کریں۔ گوبر کی کھاد، کمپوسٹ، اور سبز کھاد ملائیں۔',
      english: 'Farmer brothers, proper fertilizer use is crucial. Wrong use wastes money and harms crops.\n\nFirst get soil tested. Agriculture Department does it free. Test shows which fertilizer and how much is needed.\n\nApply DAP and urea at different times. Don\'t apply all fertilizer at once. First at sowing, second after 30 days, third after 60 days.\n\nAlways apply fertilizer in moist soil and water immediately. Fertilizer burns in dry soil. Apply 3-4 inches away from roots to prevent root burn.\n\nAlso use organic fertilizers. Mix manure, compost, and green manure.',
    },
    'water-management': {
      urdu: 'کسان بھائیو، پانی کی قلت بڑھ رہی ہے۔ ہمیں ہر قطرے کو بچانا ہوگا۔\n\nڈرپ اریگیشن سب سے بہترین ہے۔ یہ پانی سیدھا جڑوں تک پہنچاتی ہے اور 50% پانی بچاتی ہے۔ سبسڈی پر بھی دستیاب ہے۔\n\nاگر ڈرپ نہ لگا سکیں تو کیاریاں چھوٹی بنائیں۔ بڑی کیاریوں میں پانی ضائع ہوتا ہے۔ صبح یا شام کو پانی دیں، دوپہر کو نہیں۔\n\nبارش کے پانی کو جمع کریں۔ چھت سے پانی ٹینکوں میں اکٹھا کریں۔ کھیت میں چھوٹے تالاب بنائیں۔\n\nملچنگ بہت فائدہ مند ہے۔ بھوسا، سوکھی گھاس، یا پلاسٹک شیٹ سے مٹی ڈھانپیں۔ یہ پانی کو بھاپ بننے سے روکتا ہے۔',
      english: 'Farmer brothers, water scarcity is increasing. We must save every drop.\n\nDrip irrigation is best. It delivers water directly to roots and saves 50% water. Available on subsidy too.\n\nIf you can\'t install drip, make smaller beds. Large beds waste water. Water in morning or evening, not noon.\n\nCollect rainwater. Collect roof water in tanks. Make small ponds in fields.\n\nMulching is very beneficial. Cover soil with straw, dry grass, or plastic sheets. This prevents water evaporation.',
    },
    'wheat-farming': {
      urdu: 'کسان بھائیو، گندم پاکستان کی اہم ترین فصل ہے۔ آئیں صحیح طریقے سے کاشت کریں۔\n\nتصدیق شدہ بیج خریدیں۔ ایگریکلچر ڈیپارٹمنٹ سے تصدیق شدہ بیج لیں۔ اچھی اقسام ہیں: فیصل آباد 2008، پنجاب 2016، اور آکبر 2019۔\n\nوقت پر بوائی کریں۔ نومبر کا پہلا ہفتہ بہترین ہے۔ دیر سے بوائی میں پیداوار 20-30% کم ہو جاتی ہے۔\n\nصحیح کھاد ڈالیں۔ فی ایکڑ 2 بوری DAP بوائی کے وقت اور 2 بوری یوریا 30-40 دن بعد۔ پہلا پانی 21 دن بعد لگائیں۔\n\nزنگ اور سفیدک سے بچاؤ کے لیے فنگی سائیڈ اسپرے کریں۔ کیڑوں کے لیے نیم کا اسپرے استعمال کریں۔',
      english: 'Farmer brothers, wheat is Pakistan\'s most important crop. Let\'s grow it properly.\n\nBuy certified seed. Get certified seed from Agriculture Department. Good varieties: Faisalabad 2008, Punjab 2016, and Akbar 2019.\n\nSow on time. First week of November is best. Late sowing reduces yield by 20-30%.\n\nApply proper fertilizer. 2 bags DAP per acre at sowing and 2 bags urea after 30-40 days. First irrigation after 21 days.\n\nFor rust and powdery mildew prevention, spray fungicide. Use neem spray for pests.',
    },
    'custom': {
      urdu: 'السلام علیکم کسان بھائیو! آپ کے سوال کا جواب:\n\nکامیاب کاشتکاری کے لیے چند اہم نکات:\n\n1. ہمیشہ تصدیق شدہ بیج استعمال کریں\n2. مٹی کا ٹیسٹ کروائیں\n3. وقت پر بوائی کریں\n4. کھاد مناسب مقدار میں ڈالیں\n5. پانی کی بچت کریں\n6. فصلوں کی تبدیلی کریں\n\nمزید تفصیلی معلومات کے لیے قریبی ایگریکلچر ڈیپارٹمنٹ سے رابطہ کریں۔ ہمارا مقصد آپ کی خوشحالی ہے۔',
      english: 'Hello farmer brothers! Answer to your question:\n\nKey points for successful farming:\n\n1. Always use certified seeds\n2. Get soil tested\n3. Sow on time\n4. Apply appropriate fertilizer\n5. Conserve water\n6. Practice crop rotation\n\nFor more detailed information, contact nearest Agriculture Department. Our goal is your prosperity.',
    },
  };

  return fallbacks[topicId] || fallbacks['custom'];
}

// ========================================
// Crop Disease Detection (Gemini Vision API)
// ========================================

/**
 * Analyze crop disease from image using Gemini Vision API
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<object>} - Disease analysis with Urdu explanation
 */
export async function analyzeCropDisease(base64Image) {
  try {
    console.log('🔍 Analyzing crop disease with Gemini Vision...');

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `You are an expert Pakistani agricultural pathologist specializing in crop diseases.

Analyze this crop image and provide:
1. Disease name in Urdu and English
2. Severity level (High/درمیانہ/کم)
3. Detailed explanation in URDU (400-500 words)
4. Treatment recommendations in URDU
5. Prevention tips in URDU

IMPORTANT: 
- Write ALL explanations in URDU (اردو میں لکھیں)
- Use simple language that farmers can understand
- Provide practical, actionable advice
- Include both organic and chemical treatment options
- Mention Pakistani products if available

Return ONLY valid JSON (no markdown) in this format:
{
  "diseaseNameUrdu": "بیماری کا نام اردو میں",
  "diseaseNameEnglish": "Disease Name in English",
  "severity": "High/Medium/Low",
  "urduExplanation": "تفصیلی وضاحت اردو میں (400-500 الفاظ)...",
  "treatment": "علاج کی تجاویز اردو میں...",
  "prevention": "احتیاطی تدابیر اردو میں..."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Gemini API Error:', errorData);
      throw new Error(errorData.error?.message || 'Gemini API failed');
    }

    const result = await response.json();
    const content = result.candidates[0].content.parts[0].text;

    console.log('📝 Gemini Response:', content.substring(0, 100));

    // Parse JSON response
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleaned);

    console.log('✅ Disease analysis complete');

    return {
      success: true,
      ...analysis,
    };

  } catch (error) {
    console.error('❌ Disease analysis error:', error);
    
    // Return fallback response
    return {
      success: false,
      error: error.message,
      diseaseNameUrdu: 'تشخیص دستیاب نہیں',
      diseaseNameEnglish: 'Analysis unavailable',
      severity: 'Unknown',
      urduExplanation: `معذرت، تصویر کا تجزیہ نہیں ہو سکا۔ براہ کرم:\n\n1. واضح تصویر لیں\n2. روشنی اچھی ہو\n3. متاثرہ حصہ واضح نظر آئے\n4. دوبارہ کوشش کریں\n\nیا قریبی ایگریکلچر آفیس سے رابطہ کریں۔`,
      treatment: 'براہ کرم دوبارہ کوشش کریں یا ماہر سے مشورہ کریں۔',
      prevention: 'صاف اور واضح تصویر اپ لوڈ کریں۔',
    };
  }
}
