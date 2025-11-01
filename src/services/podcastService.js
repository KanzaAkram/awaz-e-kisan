/**
 * Podcast Service for AI Training & Education
 * 
 * Uses Google Gemini AI to:
 * 1. Generate educational content about farming techniques
 * 2. Convert text to Urdu speech for low-literacy farmers
 * 
 * Topics covered:
 * - Organic farming
 * - Crop rotation
 * - Climate-smart agriculture
 * - Pest management
 * - Water conservation
 * - Modern farming techniques
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Predefined topics for farmer education
export const TRAINING_TOPICS = [
  {
    id: 'organic-farming',
    title: 'نامیاتی کھیتی',
    titleEnglish: 'Organic Farming',
    icon: '🌿',
    description: 'کیمیائی کھادوں کے بغیر صحت مند فصلیں اگانا سیکھیں',
    descriptionEnglish: 'Learn to grow healthy crops without chemical fertilizers',
    keywords: ['organic', 'pesticides', 'natural', 'healthy'],
  },
  {
    id: 'crop-rotation',
    title: 'فصل کی گردش',
    titleEnglish: 'Crop Rotation',
    icon: '🔄',
    description: 'زمین کی صحت کے لیے فصلوں کو بدلتے رہیں',
    descriptionEnglish: 'Rotate crops to maintain soil health',
    keywords: ['rotation', 'soil health', 'planning'],
  },
  {
    id: 'climate-smart',
    title: 'موسمیاتی زرعی',
    titleEnglish: 'Climate-Smart Agriculture',
    icon: '🌎',
    description: 'موسمیاتی تبدیلیوں سے نمٹنے کے طریقے',
    descriptionEnglish: 'Adapt to climate change challenges',
    keywords: ['climate', 'weather', 'adaptation'],
  },
  {
    id: 'water-conservation',
    title: 'پانی کی بچت',
    titleEnglish: 'Water Conservation',
    icon: '💧',
    description: 'کم پانی میں زیادہ پیداوار',
    descriptionEnglish: 'Grow more with less water',
    keywords: ['irrigation', 'drip', 'water saving'],
  },
  {
    id: 'pest-management',
    title: 'کیڑوں کا کنٹرول',
    titleEnglish: 'Pest Management',
    icon: '🐛',
    description: 'قدرتی طریقوں سے کیڑوں سے بچاؤ',
    descriptionEnglish: 'Natural pest control methods',
    keywords: ['pests', 'insects', 'natural control'],
  },
  {
    id: 'soil-health',
    title: 'زمین کی صحت',
    titleEnglish: 'Soil Health',
    icon: '🌱',
    description: 'زرخیز زمین کی دیکھ بھال',
    descriptionEnglish: 'Maintain fertile soil',
    keywords: ['soil', 'fertility', 'nutrients'],
  },
  {
    id: 'modern-tech',
    title: 'جدید ٹیکنالوجی',
    titleEnglish: 'Modern Technology',
    icon: '📱',
    description: 'موبائل اور ٹیکنالوجی سے کھیتی میں بہتری',
    descriptionEnglish: 'Use mobile tech for better farming',
    keywords: ['technology', 'mobile', 'apps', 'sensors'],
  },
  {
    id: 'market-access',
    title: 'مارکیٹ تک رسائی',
    titleEnglish: 'Market Access',
    icon: '💰',
    description: 'اپنی فصل بہترین قیمت پر بیچیں',
    descriptionEnglish: 'Sell your crops at the best price',
    keywords: ['market', 'selling', 'prices'],
  },
];

// ========================================
// Generate Educational Content
// ========================================

export async function generatePodcastContent(topic, language = 'urdu', userQuestion = null) {
  try {
    console.log('🎓 Generating educational content for:', topic.titleEnglish);

    const prompt = buildEducationalPrompt(topic, language, userQuestion);
    
    const response = await fetch(
      `${GEMINI_BASE_URL}/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Content generation failed');
    }

    const result = await response.json();
    const content = result.candidates[0].content.parts[0].text;

    console.log('✅ Content generated successfully');

    return {
      success: true,
      content: content,
      topic: topic,
      language: language,
    };
  } catch (error) {
    console.error('❌ Content generation error:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

// ========================================
// Generate Custom Podcast from Question
// ========================================

export async function generateCustomPodcast(question, language = 'urdu') {
  try {
    console.log('🎙️ Generating custom podcast for question:', question);

    // Determine the most relevant topic
    const relevantTopic = findRelevantTopic(question);
    
    // Generate content based on the question
    return await generatePodcastContent(relevantTopic, language, question);
  } catch (error) {
    console.error('❌ Custom podcast error:', error);
    throw new Error(`Failed to generate podcast: ${error.message}`);
  }
}

// ========================================
// Text-to-Speech (Using Web Speech API)
// ========================================

export async function textToSpeech(text, language = 'ur-PK') {
  return new Promise((resolve, reject) => {
    try {
      // Check if browser supports speech synthesis
      if (!('speechSynthesis' in window)) {
        throw new Error('Your browser does not support text-to-speech');
      }

      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language (Urdu)
      utterance.lang = language;
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find an Urdu voice
      const voices = window.speechSynthesis.getVoices();
      const urduVoice = voices.find(voice => 
        voice.lang.startsWith('ur') || 
        voice.lang.startsWith('hi') // Hindi as fallback
      );
      
      if (urduVoice) {
        utterance.voice = urduVoice;
        console.log('🔊 Using voice:', urduVoice.name);
      }

      // Event handlers
      utterance.onend = () => {
        console.log('✅ Speech completed');
        resolve({ success: true });
      };

      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event);
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('❌ Text-to-speech error:', error);
      reject(error);
    }
  });
}

// ========================================
// Stop Speech
// ========================================

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    console.log('⏹️ Speech stopped');
  }
}

// ========================================
// Helper Functions
// ========================================

function buildEducationalPrompt(topic, language, userQuestion) {
  const languageName = language === 'urdu' ? 'اردو (Urdu)' : language;
  
  let basePrompt = `You are an expert agricultural educator creating a podcast episode for Pakistani farmers.

Topic: ${topic.titleEnglish} (${topic.title})
Language: ${languageName}
Audience: Small-scale farmers in Pakistan, including those with low literacy

${userQuestion ? `Farmer's Question: ${userQuestion}\n` : ''}

Create a SHORT educational podcast script (2-3 minutes when read aloud) that:

1. Starts with a warm greeting in ${languageName}
2. Explains the topic in SIMPLE, practical terms
3. Provides 3-4 actionable tips that farmers can implement immediately
4. Uses real examples from Pakistani farming context
5. Ends with encouragement and a summary

Style Guidelines:
- Use conversational, friendly tone (like talking to a friend)
- Avoid technical jargon - use simple words
- Include local context (Pakistan's climate, common crops, etc.)
- Be encouraging and positive
- Keep it SHORT and focused

Format:
Write as a complete script in ${languageName} that can be read aloud as a podcast.`;

  return basePrompt;
}

function findRelevantTopic(question) {
  const lowerQuestion = question.toLowerCase();
  
  // Try to match keywords
  for (const topic of TRAINING_TOPICS) {
    for (const keyword of topic.keywords) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        return topic;
      }
    }
  }
  
  // Default to organic farming if no match
  return TRAINING_TOPICS[0];
}

// ========================================
// Get Available Voices
// ========================================

export function getAvailableVoices() {
  if (!('speechSynthesis' in window)) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

// Load voices when they become available
if ('speechSynthesis' in window) {
  // Voices might not be loaded yet
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      console.log('🔊 Voices loaded:', window.speechSynthesis.getVoices().length);
    };
  }
}
