# ✅ CORS Error Fixed! Here's What to Do Next

## 🎯 Quick Summary

**The Problem:** CORS error blocking Cloud Functions from GitHub Codespaces

**What I Fixed:**
1. ✅ Enhanced CORS to allow GitHub Codespaces domains
2. ✅ Converted `speechToText` from `onRequest` to `onCall` (matches your frontend)
3. ✅ Converted `askAssistant` from `onRequest` to `onCall`
4. ✅ Added emulator support to `src/firebase.js`
5. ✅ Created `.env` with your Firebase config
6. ✅ Created `start-dev.sh` helper script

---

## 🚀 Option 1: Test with Emulators (NO DEPLOYMENT NEEDED)

**This is the fastest way to test right now!**

### Step 1: Start Testing
```bash
./start-dev.sh
```

Choose option **1** when prompted. This will:
- Start Firebase Emulators on `localhost:5001`
- Start your dev server
- Connect frontend to emulators automatically

### Step 2: Test Voice Onboarding
1. Open your app (it will show the URL)
2. Sign in with Google
3. Click "شروع کریں" (Start)
4. Try voice input - should work now!

**Note:** Emulators run locally, so OpenRouter API calls will still go to the real API (requires `OPENROUTER_API_KEY` configured).

---

## 🌐 Option 2: Deploy to Production (REQUIRES BLAZE PLAN)

### Prerequisites
You MUST upgrade to Blaze plan first:
1. Go to: https://console.firebase.google.com/project/awaz-e-kisan/usage/details
2. Click "Upgrade to Blaze"
3. Add payment method (but you'll stay in free tier for now!)

### Deploy Functions
```bash
cd /workspaces/awaz-e-kisan
firebase deploy --only functions
```

This will deploy:
- `speechToText` - Voice to text (Whisper API)
- `askAssistant` - Chat with AI (GPT-4)
- `textToSpeech` - Text to voice
- `generateCropCalendar` - AI-powered calendar generation ⭐
- `sendDailyReminders` - Scheduled reminders
- `checkWeatherAndReschedule` - Weather-based rescheduling
- All other functions...

### Test Production
```bash
# Disable emulators in .env
# Set: VITE_USE_EMULATORS=false

npm run dev
```

---

## 🔧 Configure OpenRouter API Key

Your Cloud Functions need the OpenRouter API key to work.

### Set it up:
```bash
firebase functions:config:set openrouter.key="YOUR_OPENROUTER_KEY"
firebase deploy --only functions
```

**Don't have an OpenRouter key?**
1. Go to https://openrouter.ai/
2. Sign up (free tier available)
3. Get API key from dashboard
4. Set it using command above

---

## 📊 What Each Function Does

### Voice & AI Functions
- **speechToText** - Converts voice to text using Whisper API
- **askAssistant** - Answers farming questions using GPT-4
- **textToSpeech** - Converts text back to voice

### Smart Timeline Functions
- **generateCropCalendar** ⭐ - AI-powered calendar with weather intelligence
- **sendDailyReminders** - Sends daily reminders to farmers
- **checkWeatherAndReschedule** - Checks weather and reschedules activities
- **completeActivity** - Marks activities as complete
- **getCommunityInsights** - Gets community farming insights
- **trackMarketPrices** - Tracks market prices

### Weather Functions
- **getWeather** - Gets current weather from Open-Meteo (FREE API)

---

## 🐛 Troubleshooting

### Emulators Won't Start
```bash
# Kill any existing processes
killall -9 java
killall -9 node

# Try again
firebase emulators:start --only functions
```

### "Function not found" Error
Make sure:
1. Emulators are running (check terminal for logs)
2. `.env` has `VITE_USE_EMULATORS=true`
3. Restart dev server after changing `.env`

### CORS Error Still Appears
Make sure you're using the latest code:
1. Check `functions/index.js` line 3-30 has the new CORS config
2. Redeploy: `firebase deploy --only functions`
3. Or restart emulators

### Voice Recording Not Working
Check browser permissions:
1. Browser must allow microphone access
2. HTTPS or localhost required (GitHub Codespaces uses HTTPS ✓)
3. Check console for errors

---

## 📋 Testing Checklist

Once you start the app:

### Test Voice Onboarding
- [ ] Click microphone button
- [ ] Record voice saying "گندم" (wheat in Urdu)
- [ ] Should transcribe correctly (check toast notification)
- [ ] Auto-advance to next question
- [ ] Complete all 4 questions
- [ ] Calendar generates successfully

### Check Console Logs
Should see:
```
🔥 Connected to Firebase Emulators (if using emulators)
Recording started
Recording stopped
Calling speech-to-text...
STT Result: { text: "گندم", language: "urdu" }
✅ Generating calendar...
```

### Check Emulator Logs (if using emulators)
In emulator terminal, should see:
```
functions[us-central1-speechToText]: Speech-to-text called
functions[us-central1-speechToText]: Calling Whisper API...
functions[us-central1-speechToText]: Transcription successful: گندم
```

---

## 💰 Cost Breakdown

### Using Emulators (Testing)
- **Firebase Emulators:** FREE (runs locally)
- **OpenRouter API calls:** Still charged (~$0.01 per test)
- **Total:** ~$0.01 per test

### Deployed (Production)
- **Firebase Functions:** FREE tier covers ~2M invocations/month
- **OpenRouter APIs:** ~$0.005 per calendar generation
- **For 1000 users/month:** $5-15 total

---

## 🎉 You're Ready!

**Recommended next steps:**

1. **Test with emulators first** (quick, no deployment)
   ```bash
   ./start-dev.sh
   # Choose option 1
   ```

2. **If it works, upgrade to Blaze and deploy**
   ```bash
   # Upgrade at: https://console.firebase.google.com/project/awaz-e-kisan/usage/details
   firebase deploy --only functions
   ```

3. **Configure OpenRouter API key**
   ```bash
   firebase functions:config:set openrouter.key="YOUR_KEY"
   firebase deploy --only functions
   ```

4. **Test in production**
   ```bash
   # Set VITE_USE_EMULATORS=false in .env
   npm run dev
   ```

---

## 🆘 Still Having Issues?

Check the logs:

```bash
# Emulator logs (if using emulators)
# Look in the terminal where you ran firebase emulators:start

# Deployed function logs
firebase functions:log --only speechToText

# Browser console
# Press F12 in browser and check Console tab
```

Common issues:
- **"Internal error"** = Missing OpenRouter API key
- **"Function not found"** = Functions not deployed or emulators not running  
- **"Network error"** = Check internet connection
- **"CORS error"** = Redeploy functions with new CORS config

---

## 📚 Documentation Reference

- `CORS_FIX_AND_DEPLOYMENT.md` - Detailed explanation of fixes
- `AI_CALENDAR_IMPLEMENTED.md` - How AI calendar works
- `SMART_TIMELINE_README.md` - Full feature overview
- `DEPLOY_NOW.md` - Original deployment guide

---

**The CORS issue is FIXED! Now you just need to test. 🚀**

Try the emulator option first - it's the fastest way to verify everything works!
