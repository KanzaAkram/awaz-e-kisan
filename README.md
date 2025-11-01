# 📖 Awaz-e-Kisan - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Firestore Schema](#firestore-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Integration Flow](#integration-flow)
7. [Security](#security)

---

## 1️⃣ Project Overview

**Awaz-e-Kisan (آوازِ کسان)** is a multilingual voice-based farming assistant designed for Pakistani farmers. It supports:
- 🎤 Voice input in Urdu, Punjabi, and Sindhi
- 🔊 Voice output in natural local languages
- 🤖 AI-powered farming advice using GPT-4
- 📱 Mobile-responsive web interface
- 🔐 Secure Firebase authentication

---

## 2️⃣ Architecture

### System Flow

```
User speaks → MediaRecorder API → Firebase Storage → Cloud Function (STT)
                                                             ↓
User hears ← Firebase Storage ← Cloud Function (TTS) ← Cloud Function (LLM)
                                                             ↓
                                                      Firestore (Save)
```

### Tech Stack

**Frontend:**
- React 18 + Vite
- TailwindCSS for styling
- Firebase SDK v10
- MediaRecorder API for audio
- Framer Motion for animations

**Backend:**
- Firebase Cloud Functions (Node.js 18)
- OpenAI Whisper API (Speech-to-Text)
- OpenAI GPT-4 (Language Model)
- ElevenLabs/gTTS (Text-to-Speech)

**Database:**
- Cloud Firestore (NoSQL)
- Firebase Storage (Audio files)
- Firebase Authentication

---

## 3️⃣ Firestore Schema

### Collection: `users/{userId}`

```javascript
{
  uid: "user123",
  name: "Muhammad Ali",
  email: "farmer@example.com",
  phone: "+923001234567",
  language: "urdu", // urdu | punjabi | sindhi
  createdAt: "2025-01-15T10:30:00Z",
  lastLogin: "2025-01-20T08:15:00Z",
  queriesCount: 45,
  preferences: {
    voiceSpeed: "normal",
    autoPlay: true
  }
}
```

### Collection: `queries/{userId}/history/{queryId}`

```javascript
{
  queryId: "query123",
  question: "گندم کی کاشت کا بہترین وقت کیا ہے؟",
  answer: "گندم کے لیے نومبر کا آخر بہترین وقت ہے۔",
  language: "urdu",
  audioInputUrl: "gs://bucket/voice-input/user123/1234567890.webm",
  audioOutputUrl: "gs://bucket/voice-output/user123/1234567891.mp3",
  timestamp: Timestamp,
  model: "gpt-4-turbo-preview",
  duration: 3.5, // seconds
  confidence: 0.95
}
```

### Collection: `community/{queryId}` (Optional)

```javascript
{
  userId: "user123",
  userName: "Muhammad Ali",
  question: "Cotton pest control tips",
  answer: "Use neem oil spray...",
  language: "urdu",
  audioUrl: "...",
  likes: 15,
  shares: 3,
  timestamp: Timestamp,
  tags: ["cotton", "pest-control", "organic"]
}
```

---

## 4️⃣ API Endpoints (Cloud Functions)

### 1. Speech-to-Text

**Endpoint:** `POST /speechToText`

**Request:**
```javascript
{
  audio: "base64_audio_data",
  language: "ur" // ur | pa | sd
}
```

**Response:**
```javascript
{
  success: true,
  text: "گندم کی کاشت کا بہترین وقت کیا ہے؟",
  language: "urdu"
}
```

**Implementation:**
- Uses OpenAI Whisper API
- Supports audio formats: webm, mp3, wav
- Auto-detects language
- Max file size: 10MB

---

### 2. Ask Assistant (LLM)

**Endpoint:** `POST /askAssistant`

**Request:**
```javascript
{
  question: "گندم کی کاشت کا بہترین وقت کیا ہے؟",
  language: "urdu",
  userId: "user123",
  context: "previous conversation..." // optional
}
```

**Response:**
```javascript
{
  success: true,
  answer: "گندم کے لیے نومبر کا آخر بہترین وقت ہے۔ بیج بونے سے پہلے زمین کو اچھی طرح تیار کریں۔",
  language: "urdu"
}
```

**Features:**
- GPT-4 Turbo model
- Context-aware responses
- Multilingual support
- Short, practical answers (2-4 sentences)

---

### 3. Text-to-Speech

**Endpoint:** `POST /textToSpeech`

**Request:**
```javascript
{
  text: "گندم کے لیے نومبر کا آخر بہترین وقت ہے۔",
  language: "urdu",
  userId: "user123",
  voiceId: "21m00Tcm4TlvDq8ikWAM" // optional
}
```

**Response:**
```javascript
{
  success: true,
  audioUrl: "https://storage.googleapis.com/bucket/voice-output/user123/1234567890.mp3",
  language: "urdu"
}
```

**Implementation:**
- Primary: ElevenLabs API (high quality)
- Fallback: Google TTS (free)
- Auto-uploads to Firebase Storage

---

### 4. Get Weather

**Endpoint:** `GET /getWeather?location=Lahore&language=urdu`

**Response:**
```javascript
{
  success: true,
  weather: "لاہور میں آج کا موسم صاف ہے، درجہ حرارت 28°C ہے۔ کل بارش کا امکان ہے۔"
}
```

---

### 5. Get Market Prices

**Endpoint:** `GET /getMarketPrices?crop=wheat&language=urdu`

**Response:**
```javascript
{
  success: true,
  price: "گندم: 3500 روپے فی من",
  crop: "wheat",
  lastUpdated: "2025-01-20T10:00:00Z"
}
```

---

## 5️⃣ Frontend Components

### Component Tree

```
App.jsx
├── AuthProvider (Context)
├── Router
│   ├── /login → AuthForm
│   └── /dashboard → Dashboard
│       ├── Header
│       ├── Tabs (Voice | History)
│       ├── VoiceRecorder
│       │   ├── Language Selector
│       │   ├── Recording Button
│       │   ├── Transcription Display
│       │   ├── Response Display
│       │   └── Audio Player
│       └── QueryHistory
│           └── History Cards
└── Toaster (Notifications)
```

### Key Components

#### 1. **VoiceRecorder.jsx**
- Handles microphone access
- Records audio using MediaRecorder API
- Calls Cloud Functions for STT, LLM, TTS
- Displays results with proper RTL text
- Audio playback controls

#### 2. **AuthForm.jsx**
- Email/Password authentication
- Language selection
- Responsive design
- Error handling with toasts

#### 3. **QueryHistory.jsx**
- Fetches user's query history from Firestore
- Displays Q&A pairs
- Replay audio feature
- Date/time formatting

#### 4. **Dashboard.jsx**
- Main app layout
- Tab navigation
- User profile display
- Logout functionality

---

## 6️⃣ Integration Flow

### Complete User Journey

```
1. USER AUTHENTICATION
   ↓
   User signs up/logs in → Firebase Auth
   ↓
   Create user document in Firestore

2. VOICE RECORDING
   ↓
   User clicks mic → Request permissions
   ↓
   Start recording → MediaRecorder API
   ↓
   Stop recording → Create audio blob

3. SPEECH PROCESSING
   ↓
   Upload to Storage → voice-input/{userId}/{timestamp}.webm
   ↓
   Call speechToText → OpenAI Whisper
   ↓
   Display transcription

4. GET AI RESPONSE
   ↓
   Call askAssistant → GPT-4 with system prompt
   ↓
   Display answer text
   ↓
   Save to Firestore

5. GENERATE VOICE
   ↓
   Call textToSpeech → ElevenLabs/gTTS
   ↓
   Upload to Storage → voice-output/{userId}/{timestamp}.mp3
   ↓
   Play audio

6. SAVE HISTORY
   ↓
   Save complete interaction to queries/{userId}/history
```

---

## 7️⃣ Security

### Firestore Security Rules

```javascript
// Users can only read/write their own data
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Query history is private
match /queries/{userId}/history/{queryId} {
  allow read, write: if request.auth.uid == userId;
}
```

### Storage Security Rules

```javascript
// Voice input - users can upload their own recordings
match /voice-input/{userId}/{fileName} {
  allow read, write: if request.auth.uid == userId
                     && request.resource.size < 10 * 1024 * 1024;
}

// Voice output - users can read their generated audio
match /voice-output/{userId}/{fileName} {
  allow read: if request.auth.uid == userId;
  allow write: if false; // Only Cloud Functions can write
}
```

### API Key Security

**✅ DO:**
- Store API keys in Firebase Functions config
- Use environment variables
- Never commit `.env` files to Git

**❌ DON'T:**
- Expose API keys in frontend code
- Share API keys publicly
- Hardcode keys in source code

### Rate Limiting (Recommended)

```javascript
// In Cloud Functions
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20 // limit each user to 20 requests per windowMs
});
```

---

## 📊 Performance Optimization

### 1. Audio Compression
- Use WebM format for recording (efficient)
- Convert to MP3 for storage (universal compatibility)
- Implement audio quality settings

### 2. Caching
- Cache user preferences in localStorage
- Cache frequently asked questions
- Implement service workers for offline support

### 3. Lazy Loading
- Split code by routes
- Lazy load heavy components
- Optimize image assets

### 4. Database Optimization
- Use composite indexes for complex queries
- Implement pagination for history
- Clean up old audio files periodically

---

## 🔧 Maintenance

### Regular Tasks

1. **Monitor Usage**
   - Check Firebase Console daily
   - Review function invocations
   - Monitor API costs

2. **Update Dependencies**
   ```powershell
   npm update
   cd functions && npm update
   ```

3. **Backup Data**
   ```powershell
   firebase firestore:export gs://your-bucket/backups
   ```

4. **Review Logs**
   ```powershell
   firebase functions:log --limit 100
   ```

---

## 🎓 Best Practices

1. **Error Handling**: Always wrap async operations in try-catch
2. **User Feedback**: Show loading states and toasts
3. **Accessibility**: Support keyboard navigation
4. **RTL Support**: Proper text direction for Urdu/Sindhi
5. **Mobile First**: Design for small screens first
6. **Testing**: Test on actual devices with limited connectivity

---

**📚 For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**
**💡 For innovation features, see [INNOVATIONS.md](./INNOVATIONS.md)**
