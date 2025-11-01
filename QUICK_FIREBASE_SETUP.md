# 🎯 Quick Firebase Setup - Copy & Paste Commands

## Status: What You Need to Do

I've created a `.env.local` file for you, but you need to:

1. ✅ **Already done:** Firebase CLI installed
2. ⚠️  **TODO:** Create Firebase project
3. ⚠️  **TODO:** Fill in `.env.local` with your Firebase values
4. ⚠️  **TODO:** Login to Firebase CLI
5. ⚠️  **TODO:** Get OpenRouter API key
6. ⚠️  **TODO:** Deploy functions

---

## 📋 Step-by-Step Commands (Just Copy & Paste!)

### Step 1: Create Firebase Project (Use Browser)

**Go to:** https://console.firebase.google.com

1. Click "Add project"
2. Name: `awaz-e-kisan`
3. Disable Analytics (optional)
4. Click "Create project"

**Enable these services:**
- ☑️ Authentication → Email/Password
- ☑️ Firestore Database → Production mode → Location: asia-south1
- ☑️ Storage → Location: asia-south1

---

### Step 2: Get Firebase Config (Use Browser)

**In Firebase Console:**
1. Click ⚙️ Settings → Project Settings
2. Scroll to "Your apps"
3. Click Web icon `</>`
4. Register app: `awaz-e-kisan-web`
5. Copy the config values

**You'll see something like:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "awaz-e-kisan.firebaseapp.com",
  projectId: "awaz-e-kisan",
  storageBucket: "awaz-e-kisan.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

---

### Step 3: Edit .env.local File

**Open file:** `.env.local` (I already created it for you!)

**Replace the values with your Firebase config:**

```bash
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=awaz-e-kisan.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=awaz-e-kisan
VITE_FIREBASE_STORAGE_BUCKET=awaz-e-kisan.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**Save the file** (Ctrl+S)

---

### Step 4: Login to Firebase CLI

**Copy & paste this command:**

```bash
firebase login --no-localhost
```

**What will happen:**
1. You'll see a URL and code
2. Open the URL in your browser
3. Login with your Google account
4. Paste the code back in terminal
5. Done! ✅

**Verify you're logged in:**

```bash
firebase projects:list
```

**Set your project as default:**

```bash
firebase use awaz-e-kisan
```

---

### Step 5: Get OpenRouter API Key (For AI)

**Go to:** https://openrouter.ai

1. Sign up (free)
2. Add $5-10 credits: https://openrouter.ai/credits
3. Create key: https://openrouter.ai/keys
4. Copy the key (starts with `sk-or-v1-...`)

**Set the key in Firebase (replace YOUR_KEY):**

```bash
firebase functions:config:set openrouter.key="sk-or-v1-YOUR_KEY_HERE"
```

**Verify it's set:**

```bash
firebase functions:config:get
```

---

### Step 6: Deploy Everything

**Build your frontend:**

```bash
npm run build
```

**Deploy to Firebase:**

```bash
firebase deploy
```

**This will take 2-3 minutes.** ⏳

You'll see:
```
✔  Deploy complete!
Hosting URL: https://awaz-e-kisan.web.app
```

---

### Step 7: Test Your App

**Start development server:**

```bash
npm run dev
```

**Open in browser:** http://localhost:3000

**Try these:**
1. Sign up with test account
2. Click microphone button 🎤
3. Record a voice question
4. Get AI response
5. Check query history

---

## 🔍 Quick Status Check

**Run this anytime to check your setup:**

```bash
./setup-helper.sh
```

---

## 🐛 Quick Fixes

### If .env.local is wrong:

```bash
# Open and edit the file
code .env.local
```

### If not logged into Firebase:

```bash
firebase login --no-localhost
```

### If OpenRouter key not set:

```bash
firebase functions:config:set openrouter.key="sk-or-v1-YOUR_KEY"
```

### If functions fail to deploy:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### If app shows blank screen:

```bash
# Make sure .env.local is filled correctly
# Restart dev server
npm run dev
```

---

## 📊 All Commands in Order

**Copy this entire block and run one by one:**

```bash
# 1. Login to Firebase
firebase login --no-localhost

# 2. Select your project
firebase use awaz-e-kisan

# 3. Set OpenRouter API key (get from openrouter.ai/keys)
firebase functions:config:set openrouter.key="sk-or-v1-YOUR_KEY_HERE"

# 4. Build frontend
npm run build

# 5. Deploy everything
firebase deploy

# 6. Start dev server
npm run dev
```

---

## ✅ Success Checklist

- [ ] Firebase project created (in browser)
- [ ] Authentication enabled
- [ ] Firestore enabled
- [ ] Storage enabled
- [ ] `.env.local` file filled with YOUR values
- [ ] Firebase CLI logged in
- [ ] OpenRouter key set
- [ ] App deployed
- [ ] Voice recording works
- [ ] AI responds

---

## 🆘 Need Detailed Help?

**Read the complete guide:**
```
COMPLETE_FIREBASE_SETUP.md
```

**Or run the helper script:**
```bash
./setup-helper.sh
```

---

## 🎉 That's It!

Once you complete these steps, ALL features will work:

✅ Voice recording
✅ AI responses  
✅ User authentication
✅ Query history
✅ Works on mobile

**Your app will be live at:**
```
https://your-project-id.web.app
```

---

**Questions? Check COMPLETE_FIREBASE_SETUP.md for detailed instructions!**
