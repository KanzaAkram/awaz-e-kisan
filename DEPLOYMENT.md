# 🚀 Awaz-e-Kisan Deployment Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Firebase CLI**
3. **API Keys**:
   - Firebase Project
   - OpenRouter API Key (replaces OpenAI)
   - ElevenLabs API Key (optional)
   - Weather API Key (optional)

---

## 📋 Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

```bash
# Go to Firebase Console: https://console.firebase.google.com
# Click "Add Project"
# Enter project name: "awaz-e-kisan"
# Enable Google Analytics (optional)
```

### 1.2 Enable Firebase Services

In Firebase Console:

1. **Authentication**
   - Enable Email/Password authentication
   - Enable Phone authentication (for SMS support)

2. **Firestore Database**
   - Create database in production mode
   - Location: `asia-south1` (India - closest to Pakistan)

3. **Storage**
   - Enable Firebase Storage
   - Start in production mode

4. **Functions**
   - Upgrade to Blaze (Pay as you go) plan
   - Required for Cloud Functions

---

## 📦 Step 2: Install Firebase CLI

```powershell
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

---

## 🔧 Step 3: Project Setup

### 3.1 Navigate to Project Directory

```powershell
cd c:\Users\kanza\OneDrive\Desktop\FarmLink\awaz-e-kisan
```

### 3.2 Initialize Firebase

```powershell
# Initialize Firebase (select your project)
firebase init

# Select the following:
# ☑ Firestore
# ☑ Functions
# ☑ Hosting
# ☑ Storage

# Follow prompts:
# - Use existing project: awaz-e-kisan
# - Functions language: JavaScript
# - Install dependencies: Yes
# - Public directory: build
# - Single-page app: Yes
```

### 3.3 Install Frontend Dependencies

```powershell
# Install React dependencies
npm install

# Install function dependencies
cd functions
npm install
cd ..
```

---

## 🔐 Step 4: Configure Environment Variables

### 4.1 Frontend Environment (.env.local)

Create `.env.local` in the root directory:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=awaz-e-kisan.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=awaz-e-kisan
VITE_FIREBASE_STORAGE_BUCKET=awaz-e-kisan.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**Get these values from:**
Firebase Console → Project Settings → Your apps → Web app config

### 4.2 Cloud Functions Environment Variables

```powershell
# Set OpenRouter API Key (replaces OpenAI)
firebase functions:config:set openrouter.key="sk-or-v1-XXXXXXXXXXXXXXXXXXXXXXXX"

# Set ElevenLabs API Key (optional, for high-quality TTS)
firebase functions:config:set elevenlabs.key="your_elevenlabs_api_key"

# Set Weather API Key (optional)
firebase functions:config:set weather.key="your_openweathermap_api_key"

# View all configs
firebase functions:config:get
```

---

## 🏗️ Step 5: Build & Deploy

### 5.1 Deploy Firestore Rules & Indexes

```powershell
firebase deploy --only firestore
```

### 5.2 Deploy Storage Rules

```powershell
firebase deploy --only storage
```

### 5.3 Deploy Cloud Functions

```powershell
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:speechToText,functions:askAssistant,functions:textToSpeech
```

### 5.4 Build & Deploy Frontend

```powershell
# Build React app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### 5.5 Deploy Everything at Once

```powershell
# Build frontend first
npm run build

# Deploy everything
firebase deploy
```

---

## 🧪 Step 6: Testing

### 6.1 Local Development

```powershell
# Terminal 1: Start Firebase Emulators
firebase emulators:start

# Terminal 2: Start React dev server
npm run dev
```

Access the app at: `http://localhost:3000`

### 6.2 Production Testing

After deployment, access your app at:
```
https://awaz-e-kisan.web.app
```

Or your custom domain if configured.

---

## 🔍 Step 7: Verify Deployment

### Check Cloud Functions

```powershell
# List deployed functions
firebase functions:list

# Check function logs
firebase functions:log
```

Expected functions:
- ✅ `speechToText`
- ✅ `askAssistant`
- ✅ `textToSpeech`
- ✅ `getWeather`
- ✅ `getMarketPrices`

### Check Firestore

1. Go to Firebase Console → Firestore Database
2. Verify collections are created when users sign up
3. Check security rules are applied

### Check Storage

1. Go to Firebase Console → Storage
2. Verify `voice-input/` and `voice-output/` folders are created
3. Check security rules

---

## 🎯 Step 8: Get API Keys

### 8.1 OpenRouter API Key (Required)

1. Go to: https://openrouter.ai/keys
2. Sign up for a free account
3. Create new API key
4. Copy and save securely (starts with `sk-or-v1-`)
5. Add credits to your account (pay-as-you-go pricing)
6. Add to Firebase functions config

**Why OpenRouter?**
- Access to multiple AI models (GPT-4, Claude, Gemini, etc.)
- Competitive pricing
- Automatic fallback between models
- No need for separate OpenAI account

### 8.2 ElevenLabs API Key (Optional - High Quality TTS)

1. Sign up at: https://elevenlabs.io
2. Go to Profile → API Keys
3. Copy API key
4. Add to Firebase functions config

### 8.3 OpenWeatherMap API Key (Optional)

1. Sign up at: https://openweathermap.org/api
2. Get free API key (1000 calls/day)
3. Add to Firebase functions config

---

## 🐛 Troubleshooting

### Issue: Functions not deploying

```powershell
# Check Node version (must be 18)
node --version

# Reinstall dependencies
cd functions
rm -rf node_modules package-lock.json
npm install
cd ..

# Deploy again
firebase deploy --only functions
```

### Issue: CORS errors

Functions already have CORS enabled. If you still face issues:

```javascript
// In functions/index.js, ensure cors is configured:
const cors = require("cors")({origin: true});
```

### Issue: Audio recording not working

1. Ensure HTTPS is enabled (required for microphone access)
2. Check browser permissions
3. Test on Chrome/Edge (best support)

### Issue: Firestore permission denied

1. Check if user is authenticated
2. Verify security rules in `firestore.rules`
3. Re-deploy rules: `firebase deploy --only firestore`

---

## 📊 Monitoring & Analytics

### View Logs

```powershell
# Real-time logs
firebase functions:log --follow

# Logs for specific function
firebase functions:log --only speechToText
```

### Firebase Console Monitoring

1. **Authentication**: Track user signups
2. **Firestore**: Monitor query counts
3. **Storage**: Check file uploads
4. **Functions**: View invocations and errors

---

## 💰 Cost Estimation (Free Tier)

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| Firebase Auth | Unlimited | **Free** |
| Firestore | 50K reads/day | **Free** (for small usage) |
| Storage | 5GB | **Free** |
| Cloud Functions | 2M invocations/month | **Free** (light usage) |
| Hosting | 10GB/month | **Free** |
| OpenRouter Whisper | $0.006/minute | ~$6/month (1000 queries) |
| OpenRouter GPT-4 | $0.015-0.03/1K tokens | ~$5-10/month |
| ElevenLabs | 10K chars/month free | **Free** (then $5/month) |

**Total estimated cost for 1000 monthly users: $15-25/month**

**OpenRouter Benefits:**
- Lower costs than direct OpenAI
- Access to multiple models
- Better rate limits

---

## 🚀 Next Steps

1. ✅ Test with real farmers
2. ✅ Collect feedback on voice quality
3. ✅ Add more local crops/markets data
4. ✅ Implement SMS fallback (for feature phones)
5. ✅ Add daily weather bulletin
6. ✅ Create community sharing feature

---

## 📞 Support

For issues or questions:
- Check Firebase Console logs
- Review function logs: `firebase functions:log`
- Test in Firebase Emulator first
- Verify all API keys are correct

---

**🎉 Congratulations! Your voice assistant is now live!**

Test URL: `https://awaz-e-kisan.web.app`
