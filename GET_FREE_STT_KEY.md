# 🎤 Get FREE Speech-to-Text API Key (2 minutes)

## Problem
Speech recognition isn't working because we need an API key for Hugging Face Whisper.

## Solution: Get FREE Hugging Face API Key

### Step 1: Create Free Account
1. Go to: https://huggingface.co/join
2. Sign up with email or GitHub (FREE forever!)
3. Verify your email

### Step 2: Generate API Token
1. Go to: https://huggingface.co/settings/tokens
2. Click **"New token"**
3. Name it: `awaz-e-kisan-stt`
4. Type: **Read** (that's enough!)
5. Click **"Generate token"**
6. **Copy the token** (starts with `hf_...`)

### Step 3: Add to Your Project
1. Open `/workspaces/awaz-e-kisan/.env`
2. Find this line:
   ```
   VITE_HUGGINGFACE_API_KEY=YOUR_HF_TOKEN_HERE
   ```
3. Replace with your token:
   ```
   VITE_HUGGINGFACE_API_KEY=hf_your_actual_token_here
   ```
4. Save the file
5. Restart dev server:
   ```bash
   npm run dev
   ```

### That's it! 🎉

Now your speech recognition will work with FREE unlimited access to Whisper AI!

## Why Hugging Face?
- ✅ **100% FREE** forever
- ✅ Supports **Urdu, Punjabi, Sindhi**
- ✅ No credit card required
- ✅ Unlimited usage (with rate limits)
- ✅ Best accuracy for Pakistani languages

## Troubleshooting

**Still not working?**
1. Make sure token starts with `hf_`
2. No quotes around the token in .env
3. Restart dev server after adding token
4. Check browser console for errors

**Rate limited?**
- Free tier: ~1000 requests/day
- For more: Upgrade to Pro ($9/month) or use OpenRouter fallback
