# 🔧 CORS Fix Applied + Deployment Options

## ✅ What Was Fixed

### Problem
```
Access to fetch at 'https://us-central1-awaz-e-kisan.cloudfunctions.net/speechToText' 
from origin 'https://symmetrical-barnacle-497x5wj5wxgf5gv5-3000.app.github.dev' 
has been blocked by CORS policy
```

### Root Causes
1. **CORS Configuration** - Needed to allow GitHub Codespaces domains
2. **Function Type Mismatch** - Functions were `onRequest` but frontend called them as `onCall`

### Solutions Applied

#### 1. Enhanced CORS Configuration
Updated `functions/index.js` to allow:
- ✅ GitHub Codespaces (`*.github.dev`, `*.githubpreview.dev`, `*.app.github.dev`)
- ✅ Firebase Hosting (`awaz-e-kisan.web.app`, `awaz-e-kisan.firebaseapp.com`)
- ✅ Localhost (`localhost`, `127.0.0.1`)

#### 2. Converted Functions to `onCall`
Changed from HTTP `onRequest` to Callable `onCall`:
- ✅ `speechToText` - Now uses `onCall` (works with `httpsCallable`)
- ✅ `askAssistant` - Now uses `onCall`

This matches how your frontend calls them:
```javascript
const sttFunction = httpsCallable(functions, 'speechToText');
```

---

## 🚀 Deployment Options

### Option 1: Upgrade to Blaze Plan (Recommended)
**Why you need it:**
- Cloud Functions require Blaze (pay-as-you-go) plan
- Still has generous FREE tier!

**Free tier includes:**
- 2M function invocations/month
- 400,000 GB-seconds compute
- 200,000 CPU-seconds compute

**Estimated costs (1000 users):**
- Firebase: $0-5/month (likely $0 within free tier)
- OpenRouter APIs: $5-10/month
- **Total: $5-15/month**

**How to upgrade:**
```bash
# Visit this URL:
https://console.firebase.google.com/project/awaz-e-kisan/usage/details

# Or run:
firebase open usage
```

Then deploy:
```bash
cd /workspaces/awaz-e-kisan
firebase deploy --only functions
```

---

### Option 2: Use Firebase Emulators (For Testing)
Run functions locally without deploying:

```bash
cd /workspaces/awaz-e-kisan

# Start emulators
firebase emulators:start
```

Then update your frontend to use emulators:

**In `src/firebase.js`:**
```javascript
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const functions = getFunctions(app);

// Use emulator in development
if (window.location.hostname === 'localhost' || 
    window.location.hostname.includes('github.dev')) {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { functions };
```

**Pros:**
- ✅ No Blaze plan needed for testing
- ✅ Instant deployment (no upload time)
- ✅ Free (runs on your machine)

**Cons:**
- ❌ Won't work for production users
- ❌ Requires keeping terminal running
- ❌ Limited to your development environment

---

### Option 3: Quick Mock for UI Testing
If you just want to test the UI without real AI:

**Create `src/utils/mockFunctions.js`:**
```javascript
export const mockSpeechToText = (audio) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true,
          text: "گندم", // Mock transcription
          language: "urdu"
        }
      });
    }, 1000);
  });
};

export const mockGenerateCalendar = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true,
          message: "کیلنڈر بن گیا ہے!",
          calendar: {
            totalActivities: 15,
            duration: 150,
            estimatedYield: { min: 15, max: 20, unit: "mounds/acre" }
          }
        }
      });
    }, 2000);
  });
};
```

**Update `VoiceOnboarding.jsx`:**
```javascript
// At top
import { mockSpeechToText, mockGenerateCalendar } from '../utils/mockFunctions';

// In processVoiceInput, replace:
const sttFunction = httpsCallable(functions, 'speechToText');
const sttResult = await sttFunction({ audio: base64Audio, language: 'urdu' });

// With:
const USE_MOCK = !OPENROUTER_API_KEY; // Or set manually
const sttResult = USE_MOCK 
  ? await mockSpeechToText(base64Audio)
  : await httpsCallable(functions, 'speechToText')({ audio: base64Audio, language: 'urdu' });
```

---

## 🎯 Recommended Path

### For Development (Right Now)
**Use Option 2: Firebase Emulators**

1. Add emulator config to `src/firebase.js`:
```javascript
// Add after getFunctions(app)
if (process.env.NODE_ENV === 'development' || 
    window.location.hostname.includes('github.dev')) {
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('🔥 Using Firebase Emulators');
}
```

2. Start emulators in one terminal:
```bash
firebase emulators:start --only functions
```

3. Start dev server in another terminal:
```bash
npm run dev
```

### For Production (Before Launch)
**Use Option 1: Upgrade to Blaze**

The Blaze plan is necessary for:
- Real users accessing your app
- Scheduled functions (daily reminders)
- Production-grade reliability

---

## 🐛 Troubleshooting

### "Function not found" Error
Make sure functions are deployed/running:
```bash
# If using emulators:
firebase emulators:start --only functions

# If deployed:
firebase functions:list
```

### "CORS Error" Still Appearing
Check that functions are using `onCall` not `onRequest`:
```javascript
// ✅ Correct (Callable)
exports.speechToText = functions.https.onCall(async (data, context) => {
  // ...
});

// ❌ Wrong (HTTP Request)
exports.speechToText = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // ...
  });
});
```

### Audio Upload Failing
The `onCall` function now expects base64 audio:
```javascript
// Frontend should send:
const base64Audio = await new Promise((resolve) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.readAsDataURL(audioBlob);
});

await sttFunction({ audio: base64Audio, language: 'urdu' });
```

---

## 📋 Next Steps Checklist

- [ ] **Choose deployment option** (Blaze upgrade recommended)
- [ ] **Update `src/firebase.js`** if using emulators
- [ ] **Start emulators** (if testing locally)
- [ ] **Deploy functions** (if upgraded to Blaze)
- [ ] **Test voice onboarding** (should work now!)
- [ ] **Monitor Firebase console** for function invocations
- [ ] **Check costs** after 24 hours

---

## 💰 Cost Monitoring

### Set Budget Alerts
In Firebase Console:
1. Go to Usage & Billing
2. Set budget alert at $10/month
3. Get email notification at 50%, 90%, 100%

### Track Usage
```bash
# Check function invocations
firebase functions:log --only speechToText

# Check costs in console
firebase open usage
```

---

## ✅ Summary

**What we fixed:**
- ✅ CORS configuration now allows GitHub Codespaces
- ✅ Functions converted from `onRequest` to `onCall`
- ✅ Audio processing updated for base64 input

**What you need to do:**
1. Choose deployment option (Emulators for testing, Blaze for production)
2. Deploy or start emulators
3. Test voice onboarding - should work now!

**Expected result:**
Voice onboarding completes successfully with AI-powered calendar generation! 🎉

---

Need help? Check the logs:
```bash
# Emulator logs
firebase emulators:start --only functions

# Deployed function logs
firebase functions:log
```
