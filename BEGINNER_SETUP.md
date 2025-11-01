# 🎉 Complete Beginner Setup Guide

## ✅ What I Just Did For You

I've already completed these steps:
1. ✅ Checked Node.js is installed (v22.17.0)
2. ✅ Installed all frontend dependencies
3. ✅ Installed all backend dependencies

## 🚀 What This App Does

**Awaz-e-Kisan** (Voice of Farmers) is a voice assistant for Pakistani farmers that:
- 🎤 Listens to questions in Urdu, Punjabi, or Sindhi
- 🤖 Uses AI to answer farming questions
- 🔊 Speaks back the answers in the farmer's language
- 📱 Works on phones and computers

## 📋 What You Need

### Already Installed in Codespaces:
- ✅ Node.js (JavaScript runtime)
- ✅ npm (Package manager)
- ✅ All project dependencies

### What You Still Need:
1. **Firebase Account** (Free) - For backend services
2. **OpenRouter API Key** (Paid, ~$5-10) - For AI features

---

## 🎯 Step-by-Step Setup

### Step 1: Start the Development Server (RIGHT NOW!)

You can start the app right now to see the frontend:

```bash
npm run dev
```

**What this does:**
- Starts a local web server
- Opens your app at http://localhost:5173
- You can see the landing page and UI
- **Note:** Voice features won't work yet (need Firebase)

### Step 2: Set Up Firebase (For Full Features)

#### 2.1 Create Firebase Project

1. Go to: https://console.firebase.google.com
2. Click "Add Project"
3. Name it: `awaz-e-kisan`
4. Disable Google Analytics (optional)
5. Click "Create Project"

#### 2.2 Enable Firebase Services

In your Firebase project:

**Authentication:**
1. Click "Authentication" → "Get Started"
2. Enable "Email/Password" sign-in method

**Firestore Database:**
1. Click "Firestore Database" → "Create Database"
2. Choose "Production mode"
3. Select location: `asia-south1` (India - closest to Pakistan)

**Storage:**
1. Click "Storage" → "Get Started"
2. Use default security rules
3. Select same location

#### 2.3 Get Firebase Config

1. Click Settings (⚙️) → "Project Settings"
2. Scroll to "Your apps" → Click Web icon `</>`
3. Register app: `awaz-e-kisan-web`
4. Copy the `firebaseConfig` object

#### 2.4 Update Your Firebase Config File

Open: `src/firebase.js`

Replace the config with yours:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 3: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Login to Firebase:

```bash
firebase login
```

**Note:** In Codespaces, use:
```bash
firebase login --no-localhost
```

Initialize Firebase in your project:

```bash
firebase init
```

Select:
- ☑️ Functions
- ☑️ Firestore
- ☑️ Hosting
- ☑️ Storage

Use these settings:
- Use existing project: `awaz-e-kisan`
- Functions language: JavaScript
- Install dependencies: Yes
- Firestore rules: Use existing `firestore.rules`
- Public directory: `dist`
- Single-page app: Yes
- GitHub actions: No

### Step 4: Get OpenRouter API Key (For AI Features)

OpenRouter provides access to AI models like GPT-4:

1. Go to: https://openrouter.ai
2. Sign up (free)
3. Go to: https://openrouter.ai/keys
4. Click "Create Key"
5. Copy your key (starts with `sk-or-v1-`)
6. Add $5-10 credits at: https://openrouter.ai/credits

### Step 5: Configure API Keys

Set your OpenRouter key in Firebase:

```bash
firebase functions:config:set openrouter.key="sk-or-v1-YOUR_KEY_HERE"
```

Verify it's set:

```bash
firebase functions:config:get
```

### Step 6: Deploy to Firebase

Deploy everything:

```bash
# Build the frontend
npm run build

# Deploy everything
firebase deploy
```

Or deploy parts separately:

```bash
# Deploy only functions
firebase deploy --only functions

# Deploy only website
firebase deploy --only hosting
```

---

## 🖥️ Running the App

### Local Development (Frontend Only)

```bash
npm run dev
```

Then open: http://localhost:5173

**What works:**
- ✅ Landing page
- ✅ UI and design
- ✅ Navigation

**What doesn't work yet:**
- ❌ Voice recording (needs Firebase)
- ❌ AI responses (needs OpenRouter)
- ❌ User authentication (needs Firebase)

### Local Development (Full Features)

To test everything locally with Firebase emulators:

```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start

# Terminal 2: Start React app
npm run dev
```

**What works:**
- ✅ Everything!
- ✅ Voice recording
- ✅ AI responses (if OpenRouter key is set)
- ✅ User authentication
- ✅ Database storage

### Production (After Deployment)

Your live app will be at:
```
https://your-project-id.web.app
```

---

## 📁 Understanding the Project Structure

```
awaz-e-kisan/
│
├── src/                          # Frontend React code
│   ├── App.jsx                   # Main app component
│   ├── firebase.js               # Firebase configuration ⚠️ EDIT THIS
│   ├── main.jsx                  # App entry point
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx       # Home page
│   │   └── Dashboard.jsx         # Main app page
│   │
│   └── components/
│       ├── VoiceRecorder.jsx     # Voice recording & AI
│       ├── AuthForm.jsx          # Login/Signup
│       └── QueryHistory.jsx      # Past conversations
│
├── functions/                    # Backend Firebase Functions
│   ├── index.js                  # API endpoints (STT, TTS, AI)
│   └── package.json              # Backend dependencies
│
├── public/                       # Static files
├── dist/                         # Built files (created after 'npm run build')
│
├── package.json                  # Frontend dependencies
├── firebase.json                 # Firebase configuration
├── firestore.rules              # Database security rules
└── storage.rules                # File storage security rules
```

### Key Files to Know:

| File | What It Does | Do You Need to Edit? |
|------|--------------|----------------------|
| `src/firebase.js` | Connects to your Firebase project | ⚠️ YES - Add your Firebase config |
| `functions/index.js` | Backend API code | 🔒 NO - Leave as is |
| `src/pages/Dashboard.jsx` | Main app interface | 🎨 Maybe - Customize design |
| `src/components/VoiceRecorder.jsx` | Voice recording logic | 🔒 NO - Leave as is |
| `package.json` | List of dependencies | 🔒 NO - Leave as is |

---

## 🛠️ Common Commands

### Development
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
```

### Firebase
```bash
firebase login                    # Login to Firebase
firebase projects:list            # List your projects
firebase use PROJECT_ID           # Switch project
firebase deploy                   # Deploy everything
firebase deploy --only hosting    # Deploy website only
firebase deploy --only functions  # Deploy backend only
firebase emulators:start          # Test locally
firebase functions:log            # View backend logs
```

### Helpful Commands
```bash
npm install           # Install/update dependencies
npm audit fix         # Fix security issues
node --version        # Check Node.js version
npm --version         # Check npm version
```

---

## 🐛 Troubleshooting

### Issue: "Command not found: npm"

**Solution:** Node.js is not installed. In Codespaces, it should be pre-installed.

Check:
```bash
node --version
npm --version
```

### Issue: "Firebase: Error (auth/api-key-not-valid)"

**Solution:** Your Firebase config in `src/firebase.js` is incorrect.

1. Go to Firebase Console
2. Project Settings → Your apps
3. Copy the correct config
4. Update `src/firebase.js`

### Issue: "Cannot start emulator, port 5000 is already in use"

**Solution:** Port is busy.

```bash
# Kill the process using port 5000
npx kill-port 5000

# Or change the port in firebase.json
```

### Issue: "OpenRouter API Error: Insufficient balance"

**Solution:** Add credits to your OpenRouter account.

1. Go to: https://openrouter.ai/credits
2. Add $5-10
3. Wait a few minutes
4. Try again

### Issue: "Module not found" errors

**Solution:** Dependencies not installed.

```bash
# Reinstall frontend dependencies
rm -rf node_modules package-lock.json
npm install

# Reinstall backend dependencies
cd functions
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Issue: App shows blank white screen

**Solution:** Check browser console for errors.

Press `F12` → Console tab

Common fixes:
- Update `src/firebase.js` with your config
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild: `npm run build`

---

## 📚 Learning Resources

### For Complete Beginners:

1. **HTML/CSS/JavaScript Basics:**
   - https://www.freecodecamp.org
   - https://www.w3schools.com

2. **React Tutorial:**
   - https://react.dev/learn
   - https://www.youtube.com/watch?v=SqcY0GlETPk

3. **Firebase Tutorial:**
   - https://firebase.google.com/docs/web/setup
   - https://www.youtube.com/watch?v=fgdpvwEWJ9M

### For This Project:

- **Main README:** `README.md` - Full technical docs
- **Quick Setup:** `QUICK_SETUP.md` - Fast deployment guide
- **Deployment:** `DEPLOYMENT.md` - Production deployment
- **OpenRouter:** `MIGRATION_TO_OPENROUTER.md` - AI API docs

---

## 🎯 What to Do Next

### Immediate (Right Now):

1. ✅ **Start the dev server:**
   ```bash
   npm run dev
   ```

2. ✅ **Open your browser:**
   - Click the link shown in terminal
   - Or go to: http://localhost:5173

3. ✅ **See the landing page:**
   - You should see a beautiful homepage
   - Try clicking around
   - Note: Voice features won't work yet

### Today:

1. 🔥 **Set up Firebase:**
   - Create free account
   - Create project
   - Enable services (Auth, Firestore, Storage)

2. 🔧 **Update Firebase config:**
   - Edit `src/firebase.js`
   - Add your Firebase credentials

3. 🧪 **Test locally:**
   - Run `firebase emulators:start`
   - Test authentication
   - Try voice recording

### This Week:

1. 💳 **Get OpenRouter API:**
   - Sign up at openrouter.ai
   - Add $5-10 credits
   - Set up API key

2. 🚀 **Deploy to production:**
   ```bash
   npm run build
   firebase deploy
   ```

3. 📱 **Test on phone:**
   - Share your live URL with friends
   - Test voice recording on mobile
   - Get feedback

---

## ❓ Need Help?

### Check Logs:

**Frontend errors:**
- Browser Console (F12)
- Terminal where `npm run dev` is running

**Backend errors:**
```bash
firebase functions:log --limit 50
```

### Documentation:

- **This guide:** You're reading it! 📖
- **Technical docs:** `README.md`
- **Deployment guide:** `DEPLOYMENT.md`

### Community:

- **Firebase Discord:** https://discord.gg/firebase
- **React Community:** https://react.dev/community
- **OpenRouter Discord:** https://discord.gg/openrouter

---

## ✅ Success Checklist

### Setup Complete When:

- ✅ `npm run dev` works
- ✅ Landing page shows in browser
- ✅ Firebase project created
- ✅ `src/firebase.js` updated with your config
- ✅ Firebase CLI installed and logged in
- ✅ OpenRouter account created (optional for now)
- ✅ Deployed to Firebase Hosting

### App Fully Working When:

- ✅ Can sign up / log in
- ✅ Can record voice
- ✅ Voice converts to text (Urdu/Punjabi/Sindhi)
- ✅ AI responds with farming advice
- ✅ Text converts back to voice
- ✅ Query history saves
- ✅ Works on mobile phones

---

## 🎉 You're Ready!

Your development environment is set up! 

**Next command to run:**

```bash
npm run dev
```

This will start your app at http://localhost:5173

**Remember:** Voice features need Firebase setup to work fully.

---

**Happy Coding! 👨‍💻🌾**

Questions? Check `README.md` or the documentation files.
