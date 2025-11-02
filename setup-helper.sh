#!/bin/bash

# 🔥 Awaz-e-Kisan Setup Helper Script
# This script will guide you through setting up Firebase

echo "🌾 Welcome to Awaz-e-Kisan Setup Helper!"
echo "========================================"
echo ""

# Check if Firebase CLI is installed
echo "✓ Checking Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
else
    echo "✓ Firebase CLI is installed: $(firebase --version)"
fi
echo ""

# Check if .env.local exists
echo "📋 Checking .env.local file..."
if [ -f ".env.local" ]; then
    echo "✓ .env.local file exists"
    echo ""
    echo "Current configuration:"
    cat .env.local
else
    echo "⚠️  .env.local file NOT found"
    echo ""
    echo "I'll create a template for you..."
    cat > .env.local << 'EOF'
# Firebase Configuration
# Replace these values with your own from Firebase Console
# Get them from: https://console.firebase.google.com
# Settings → Project Settings → Your apps → Web app config

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
EOF
    echo "✓ Created .env.local template"
    echo ""
    echo "⚠️  YOU MUST EDIT THIS FILE WITH YOUR FIREBASE VALUES!"
    echo "   See: COMPLETE_FIREBASE_SETUP.md → Step 3"
fi
echo ""
echo "========================================"

# Check if logged into Firebase
echo "🔐 Checking Firebase authentication..."
if firebase projects:list &> /dev/null; then
    echo "✓ You are logged into Firebase"
    echo ""
    echo "Your projects:"
    firebase projects:list
else
    echo "❌ Not logged into Firebase"
    echo ""
    echo "To login, run:"
    echo "  firebase login --no-localhost"
    echo ""
fi
echo ""
echo "========================================"

# Check Firebase configuration
echo "🔧 Checking OpenRouter API key..."
firebase functions:config:get openrouter.key 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ OpenRouter key is configured"
else
    echo "⚠️  OpenRouter key NOT configured"
    echo ""
    echo "To set it, run:"
    echo "  firebase functions:config:set openrouter.key=\"sk-or-v1-YOUR_KEY\""
    echo ""
    echo "Get your key from: https://openrouter.ai/keys"
fi
echo ""
echo "========================================"

# Summary
echo "📊 Setup Status Summary"
echo ""
echo "Firebase CLI:        $(if command -v firebase &> /dev/null; then echo '✓ Installed'; else echo '❌ Missing'; fi)"
echo ".env.local file:     $(if [ -f '.env.local' ]; then echo '✓ Exists'; else echo '❌ Missing'; fi)"
echo "Firebase login:      $(if firebase projects:list &> /dev/null 2>&1; then echo '✓ Logged in'; else echo '❌ Not logged in'; fi)"
echo "OpenRouter key:      $(if firebase functions:config:get openrouter.key &> /dev/null 2>&1; then echo '✓ Configured'; else echo '⚠️  Not set'; fi)"
echo ""
echo "========================================"
echo ""

# Next steps
echo "📋 Next Steps:"
echo ""
echo "1. If .env.local has 'your_api_key_here', edit it:"
echo "   → Open .env.local"
echo "   → Get values from Firebase Console"
echo "   → See: COMPLETE_FIREBASE_SETUP.md → Step 3-4"
echo ""
echo "2. If not logged into Firebase, run:"
echo "   → firebase login --no-localhost"
echo ""
echo "3. If OpenRouter key not set, run:"
echo "   → firebase functions:config:set openrouter.key=\"sk-or-v1-YOUR_KEY\""
echo "   → Get key from: https://openrouter.ai/keys"
echo ""
echo "4. Deploy everything:"
echo "   → npm run build"
echo "   → firebase deploy"
echo ""
echo "5. Test your app:"
echo "   → npm run dev"
echo "   → Open: http://localhost:3000"
echo ""
echo "========================================"
echo ""
echo "📚 For detailed instructions, see:"
echo "   COMPLETE_FIREBASE_SETUP.md"
echo ""
echo "🆘 Need help? Check the troubleshooting section!"
echo ""
