# 🔥 Complete Firebase Setup Guide - Step by Step

## 🎯 Goal
Make ALL features work:
- ✅ Voice recording
- ✅ AI responses
- ✅ User login/signup
- ✅ Saving queries

---

## 📋 What We'll Do (30 minutes)

1. **Create Firebase Project** (5 min)
2. **Enable Firebase Services** (5 min)
3. **Get Firebase Configuration** (2 min)
4. **Create .env File** (3 min)
5. **Login to Firebase CLI** (2 min)
6. **Get OpenRouter API Key** (5 min)
7. **Deploy Functions** (5 min)
8. **Test Everything** (3 min)

---

## 🚀 Step 1: Create Firebase Project (DO THIS FIRST!)

### 1.1 Go to Firebase Console

Open in browser: **https://console.firebase.google.com**

### 1.2 Create New Project

1. Click **"Add project"** or **"Create a project"**
2. **Project name:** `awaz-e-kisan` (or any name you like)
3. Click **"Continue"**
4. **Google Analytics:** Turn OFF (we don't need it) ⬅️ OPTIONAL
5. Click **"Create project"**
6. Wait 30 seconds... ⏳
7. Click **"Continue"** when ready

✅ **YOUR PROJECT IS CREATED!**

---

## 🔧 Step 2: Enable Firebase Services

You need to enable 3 services: **Authentication**, **Firestore**, and **Storage**

### 2.1 Enable Authentication

1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Click **"Email/Password"** under "Sign-in providers"
4. Toggle **Enable** to ON (blue)
5. Click **"Save"**

✅ **Authentication is ready!**

### 2.2 Enable Firestore Database

1. Click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Choose location: **`asia-south1` (Mumbai)** ⬅️ Closest to Pakistan
4. Start in **"Production mode"** (we have security rules)
5. Click **"Enable"**
6. Wait 30 seconds... ⏳

✅ **Firestore is ready!**

### 2.3 Enable Storage

1. Click **"Storage"** in left sidebar
2. Click **"Get started"**
3. Click **"Next"** (use default rules)
4. Choose same location: **`asia-south1`**
5. Click **"Done"**
6. Wait 30 seconds... ⏳

✅ **Storage is ready!**

### 2.4 Set Security Rules (IMPORTANT!)

#### Firestore Rules:
1. Go to **Firestore Database** → **Rules** tab
2. Your `firestore.rules` file is already correct, but verify in console
3. Should look like this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Query history is private
    match /queries/{userId}/history/{queryId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

4. Click **"Publish"**

#### Storage Rules:
1. Go to **Storage** → **Rules** tab
2. Your `storage.rules` file is already correct
3. Click **"Publish"** if needed

✅ **Security rules are set!**

---

## 🔑 Step 3: Get Your Firebase Configuration

### 3.1 Find Your Config

1. In Firebase Console, click the **⚙️ Settings** icon (top left)
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** `</>` (if you don't see an app)
5. **App nickname:** `awaz-e-kisan-web`
6. Check ✅ **"Also set up Firebase Hosting"** 
7. Click **"Register app"**
8. You'll see a `firebaseConfig` object - **COPY IT!**

It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "awaz-e-kisan.firebaseapp.com",
  projectId: "awaz-e-kisan",
  storageBucket: "awaz-e-kisan.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

📋 **KEEP THIS WINDOW OPEN - YOU'LL NEED THESE VALUES!**

---

## 📝 Step 4: Create Your .env.local File

### 4.1 Create the File

In VS Code, create a new file called `.env.local` in the root of your project.

**Important:** The file MUST be named exactly `.env.local` (with the dot at the start!)

### 4.2 Copy This Template

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=awaz-e-kisan.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=awaz-e-kisan
VITE_FIREBASE_STORAGE_BUCKET=awaz-e-kisan.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### 4.3 Replace with YOUR Values

Take the values from Firebase Console (Step 3) and replace:
- `AIzaSyXXX...` with your `apiKey`
- `awaz-e-kisan.firebaseapp.com` with your `authDomain`
- `awaz-e-kisan` with your `projectId`
- `awaz-e-kisan.appspot.com` with your `storageBucket`
- `123456789012` with your `messagingSenderId`
- `1:123456789012:web:abcdef1234567890` with your `appId`

### 4.4 Save the File

Press **Ctrl+S** (Windows/Linux) or **Cmd+S** (Mac)

✅ **Your .env.local file is ready!**

---

## 🔐 Step 5: Login to Firebase CLI

### 5.1 Run the Login Command

In VS Code Terminal (bash), run:

```bash
firebase login --no-localhost
```

**Why `--no-localhost`?** Because you're in a Codespace (cloud environment).

### 5.2 Follow the Instructions

1. You'll see a URL and a code
2. Copy the URL and open it in your browser
3. Login with your Google account (same one you used for Firebase)
4. Paste the authorization code when prompted
5. You'll see: ✔ Success! Logged in as your-email@gmail.com

✅ **You're logged into Firebase CLI!**

### 5.3 Verify Your Project

```bash
firebase projects:list
```

You should see your `awaz-e-kisan` project listed.

Set it as default (if not already):

```bash
firebase use awaz-e-kisan
```

---

## 💳 Step 6: Get OpenRouter API Key (FOR AI)

OpenRouter gives you access to GPT-4 and other AI models at lower cost.

### 6.1 Sign Up for OpenRouter

1. Go to: **https://openrouter.ai**
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with Google or Email
4. Verify your email

### 6.2 Add Credits

1. Go to: **https://openrouter.ai/credits**
2. Click **"Add Credits"**
3. Add **$5 to $10** (this will last months!)
4. Use credit card or crypto

💡 **Costs:** ~$0.01 per query = $10 gives you 1000 queries!

### 6.3 Create API Key

1. Go to: **https://openrouter.ai/keys**
2. Click **"Create Key"**
3. Name it: `awaz-e-kisan`
4. Click **"Create"**
5. **COPY THE KEY** - starts with `sk-or-v1-...`

📋 **SAVE THIS KEY SOMEWHERE SAFE!**

### 6.4 Set the API Key in Firebase

In terminal, run:

```bash
firebase functions:config:set openrouter.key="sk-or-v1-YOUR_KEY_HERE"
```

**Replace** `YOUR_KEY_HERE` with your actual key!

Verify it's set:

```bash
firebase functions:config:get
```

You should see:

```json
{
  "openrouter": {
    "key": "sk-or-v1-..."
  }
}
```

✅ **OpenRouter API key is configured!**

---

## 🚀 Step 7: Deploy Firebase Functions

Now let's deploy your backend so the AI features work!

### 7.1 Build Your Frontend

```bash
npm run build
```

Wait for it to complete... should take 10-20 seconds.

### 7.2 Deploy Everything

```bash
firebase deploy
```

This will deploy:
- ☁️ Cloud Functions (backend APIs)
- 🌐 Hosting (your website)
- 🗄️ Firestore rules
- 📦 Storage rules

Wait 2-3 minutes... ⏳

You'll see output like:

```
✔  Deploy complete!

Hosting URL: https://awaz-e-kisan.web.app
```

✅ **YOUR APP IS DEPLOYED!**

### 7.3 Restart Your Dev Server

Stop the current dev server (Ctrl+C) and restart:

```bash
npm run dev
```

Now open: **http://localhost:3000**

---

## 🧪 Step 8: Test Everything!

### 8.1 Test User Signup

1. Go to your app: http://localhost:3000
2. Click **"Get Started"** or **"Login"**
3. Click **"Sign Up"** tab
4. Enter:
   - Name: `Test Farmer`
   - Email: `test@farmer.com`
   - Password: `password123`
   - Language: `Urdu`
5. Click **"Sign Up"**

✅ **If you're redirected to Dashboard → SUCCESS!**

### 8.2 Test Voice Recording

1. On Dashboard, click the **Microphone button** 🎤
2. Allow microphone access when browser asks
3. Speak a question in Urdu, Punjabi, or English:
   - "What is the best time to plant wheat?"
   - "گندم کی کاشت کا بہترین وقت کیا ہے؟"
4. Click the button again to stop recording

✅ **You should see:**
- Transcribed text appears
- AI response appears
- Audio response plays automatically

### 8.3 Test Query History

1. Click the **"History"** tab
2. You should see your previous question

✅ **If you see your query saved → SUCCESS!**

### 8.4 Test on Production

Open your deployed URL:
```
https://your-project-id.web.app
```

Try the same tests!

---

## ✅ Success Checklist

### Firebase Setup Complete When:

- ✅ Firebase project created
- ✅ Authentication enabled
- ✅ Firestore enabled
- ✅ Storage enabled
- ✅ Security rules published
- ✅ `.env.local` file created with your config
- ✅ Firebase CLI logged in
- ✅ OpenRouter API key set
- ✅ Functions deployed

### App Fully Working When:

- ✅ Can sign up / log in
- ✅ Can record voice
- ✅ Voice converts to text
- ✅ AI responds
- ✅ Response plays as audio
- ✅ Query history saves
- ✅ Works on production URL

---

## 🐛 Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"

**Problem:** `.env.local` file not created or wrong values

**Solution:**
1. Make sure `.env.local` exists in root folder
2. Check that all 6 environment variables are set
3. Restart dev server: `npm run dev`

### Error: "OpenRouter API Error: Invalid API key"

**Problem:** API key not set correctly

**Solution:**
```bash
firebase functions:config:set openrouter.key="sk-or-v1-YOUR_KEY"
firebase deploy --only functions
```

### Error: "Microphone access denied"

**Problem:** Browser blocked microphone

**Solution:**
1. Click the 🔒 lock icon in browser address bar
2. Allow microphone access
3. Refresh page

### Error: "Functions not deployed"

**Problem:** Functions didn't deploy

**Solution:**
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Voice recording works but no AI response

**Problem:** OpenRouter key not set or no credits

**Solution:**
1. Check you have credits: https://openrouter.ai/credits
2. Verify key is set: `firebase functions:config:get`
3. Check function logs: `firebase functions:log --limit 20`

### Can't see query history

**Problem:** Firestore rules not deployed

**Solution:**
```bash
firebase deploy --only firestore
```

---

## 📊 Monitor Your App

### View Logs

```bash
# See all function logs
firebase functions:log --limit 50

# Follow logs in real-time
firebase functions:log --follow
```

### Check Usage

1. Go to Firebase Console
2. Click **"Functions"** → See invocations
3. Click **"Authentication"** → See users
4. Click **"Firestore"** → See saved queries

### Check OpenRouter Usage

1. Go to: https://openrouter.ai/activity
2. See how many queries you've used
3. See remaining credits

---

## 💰 Cost Estimate

### Firebase (Free Tier)

- ✅ **Authentication:** Free for first 50,000 users
- ✅ **Firestore:** Free for first 50,000 reads/day
- ✅ **Storage:** Free for first 5GB
- ✅ **Functions:** Free for first 2M invocations
- ✅ **Hosting:** Free for first 10GB bandwidth

**Expected cost for personal project:** $0/month

### OpenRouter

- 🤖 **GPT-4:** ~$0.015 per 1000 tokens
- 🎤 **Whisper:** ~$0.006 per minute of audio
- 🔊 **TTS:** ~$0.015 per 1000 characters

**Expected cost for 100 queries:** ~$0.50
**$10 credit lasts for:** ~2000 queries (several months!)

---

## 🎉 YOU'RE DONE!

Your complete Awaz-e-Kisan app is now:

✅ **Deployed to production**
✅ **Voice recording works**
✅ **AI responses work**
✅ **User authentication works**
✅ **Query history saves**
✅ **Works on mobile phones**

### Your URLs:

**Local:** http://localhost:3000
**Production:** https://your-project-id.web.app

### Share Your App!

Send your production URL to friends and family to test!

---

## 🔄 Making Updates

### Update Frontend

```bash
npm run build
firebase deploy --only hosting
```

### Update Functions

```bash
firebase deploy --only functions
```

### Update Everything

```bash
npm run build
firebase deploy
```

---

## 📚 Next Steps

### Add More Features:

- 🌤️ Real weather data (add weather API)
- 📈 Live market prices (add market API)
- 👥 Community features
- 📱 Mobile app (React Native)

### Improve Performance:

- Add caching
- Optimize audio compression
- Add service workers

### Marketing:

- Share on social media
- Get farmer testimonials
- Create tutorial videos
- Write blog posts

---

## 🆘 Need Help?

### Check Docs:
- **Firebase Docs:** https://firebase.google.com/docs
- **OpenRouter Docs:** https://openrouter.ai/docs
- **This project README:** `README.md`

### Check Logs:
```bash
firebase functions:log --follow
```

### Community:
- **Firebase Discord:** https://discord.gg/firebase
- **OpenRouter Discord:** https://discord.gg/openrouter

---

**Congratulations! 🎊 You've successfully set up a complete AI-powered voice assistant!**

**Happy Farming! 🌾🚜**
