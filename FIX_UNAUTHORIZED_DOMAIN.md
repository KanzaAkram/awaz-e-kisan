# 🔧 Fix: Firebase Auth Unauthorized Domain Error

## ❌ Error You're Seeing:

```
Login failed: Firebase: Error (auth/unauthorized-domain)
```

## 🎯 What This Means:

Firebase doesn't recognize your current domain (your Codespace URL) as authorized for authentication.

**By default, Firebase only allows:**
- localhost
- Your production domain (awaz-e-kisan.web.app)

**But you're running on:**
- GitHub Codespaces (something like: `yourname-awaz-e-kisan-xxxxx.app.github.dev`)

---

## ✅ Quick Fix (2 minutes)

### Step 1: Get Your Codespace Domain

Your Codespace URL is something like:
```
https://[codespace-name]-3000.app.github.dev
```

Or check your browser address bar right now - copy the domain part.

### Step 2: Add Domain to Firebase

**Go to this link:** https://console.firebase.google.com/project/awaz-e-kisan/authentication/settings

**Or manually:**
1. Open Firebase Console
2. Go to **Authentication**
3. Click **Settings** tab (at the top)
4. Scroll down to **Authorized domains**

### Step 3: Add Your Domain

**What you'll see:**
```
Authorized domains
├── localhost (already there)
├── awaz-e-kisan.web.app (already there)
└── awaz-e-kisan.firebaseapp.com (already there)
```

**What to do:**
1. Click **"Add domain"** button
2. **Paste ONLY the domain part** (without https:// and without port)
   
   For example, if your URL is:
   ```
   https://redesigned-space-acorn-p6vrqx4pvxjcpw5q-3000.app.github.dev
   ```
   
   Add:
   ```
   redesigned-space-acorn-p6vrqx4pvxjcpw5q-3000.app.github.dev
   ```

3. Click **"Add"**

**Done!** ✅

---

## 🎯 Quick Method - Add Wildcard Domain

**Instead of adding your specific Codespace, add this wildcard:**

```
*.app.github.dev
```

**This allows ALL GitHub Codespaces to work!**

**To add it:**
1. Go to: https://console.firebase.google.com/project/awaz-e-kisan/authentication/settings
2. Click "Add domain"
3. Type: `*.app.github.dev`
4. Click "Add"

**This is the easiest solution!** It will work for any Codespace you create.

---

## 📸 Step-by-Step Visual Guide

```
Firebase Console → Authentication → Settings

┌────────────────────────────────────────────┐
│ Authorized domains                         │
│                                            │
│ These domains are authorized for OAuth     │
│ redirects.                                 │
│                                            │
│ ✓ localhost                                │
│ ✓ awaz-e-kisan.web.app                    │
│ ✓ awaz-e-kisan.firebaseapp.com            │
│                                            │
│ [+ Add domain]  ← Click here               │
└────────────────────────────────────────────┘

After clicking "Add domain":
┌────────────────────────────────────────────┐
│ Add domain                                 │
│                                            │
│ Domain: [*.app.github.dev        ]        │ ← Type this
│                                            │
│         [Cancel]  [Add]  ← Click Add       │
└────────────────────────────────────────────┘

After adding:
✓ localhost
✓ awaz-e-kisan.web.app
✓ awaz-e-kisan.firebaseapp.com
✓ *.app.github.dev                    ← New!
```

---

## ✅ Verification

After adding the domain:

1. Go back to your app
2. Refresh the page (F5)
3. Try signing in with Google again
4. **It should work!** ✅

---

## 🐛 Troubleshooting

### Still getting the error?

**Solution 1: Hard refresh**
- Press Ctrl+Shift+R (Windows/Linux)
- Or Cmd+Shift+R (Mac)
- This clears cache

**Solution 2: Check the domain format**
- Should NOT include `https://`
- Should NOT include port (`:3000`)
- Just the domain: `*.app.github.dev`

**Solution 3: Wait 1 minute**
- Firebase takes a few seconds to update
- Wait 30-60 seconds
- Try again

### Error: "Invalid domain format"

**Problem:** You included `https://` or port  
**Solution:** Remove everything except the domain
- ❌ Wrong: `https://abc-3000.app.github.dev:3000`
- ✅ Right: `*.app.github.dev`

---

## 💡 Understanding Authorized Domains

**What are authorized domains?**
- Domains that can use Firebase Authentication
- Security feature to prevent unauthorized use
- You must explicitly allow each domain

**Common authorized domains:**
- `localhost` - For local development
- `*.app.github.dev` - For GitHub Codespaces
- `your-project.web.app` - Your Firebase hosting
- `your-custom-domain.com` - Your custom domain (if any)

---

## 📋 Quick Checklist

For Google Sign-In to work on Codespaces:

- [ ] Go to Firebase Console → Authentication → Settings
- [ ] Click "Add domain"
- [ ] Add: `*.app.github.dev`
- [ ] Click "Add"
- [ ] Refresh your app
- [ ] Try Google Sign-In again

---

## 🚀 After Fixing

Once the domain is added:

1. **Refresh your app**
2. **Click "Continue with Google"**
3. **Google popup will open**
4. **Select your account**
5. **Success!** You're signed in ✅

---

## 📝 Summary

**Problem:** Codespace domain not authorized  
**Solution:** Add `*.app.github.dev` to authorized domains  
**Where:** Firebase Console → Authentication → Settings → Authorized domains  
**Time:** 1 minute  

**Link:** https://console.firebase.google.com/project/awaz-e-kisan/authentication/settings

---

## 🎁 Bonus Tip

**For production deployment:**

When you deploy to `awaz-e-kisan.web.app`, it's already authorized!

But if you use a custom domain later, remember to add it to authorized domains too.

---

**Go add the domain now, then try signing in again! 🚀**

Direct link: https://console.firebase.google.com/project/awaz-e-kisan/authentication/settings
