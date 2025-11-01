#!/bin/bash

# 🔥 Firebase Login and Setup Script
# This will authenticate you and configure your OpenRouter API key

echo "🔥 Awaz-e-Kisan - Firebase Authentication & Setup"
echo "=================================================="
echo ""

# Store the OpenRouter API key
OPENROUTER_KEY="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"

echo "Step 1: Login to Firebase"
echo "=========================="
echo ""
echo "⚠️  IMPORTANT: You need to authenticate with Firebase"
echo ""
echo "Run this command:"
echo ""
echo "  firebase login --no-localhost"
echo ""
echo "What will happen:"
echo "1. You'll see a URL"
echo "2. Open it in your browser"
echo "3. Login with your Google account"
echo "4. Copy the authorization code"
echo "5. Paste it back in the terminal"
echo ""
echo "After you login, run this script again!"
echo ""

# Check if already logged in
if firebase projects:list &> /dev/null; then
    echo "✓ You are already logged in to Firebase!"
    echo ""
    
    # Select the project
    echo "Step 2: Select Firebase Project"
    echo "================================"
    firebase use awaz-e-kisan
    echo ""
    
    # Set the OpenRouter API key
    echo "Step 3: Configure OpenRouter API Key"
    echo "====================================="
    echo "Setting OpenRouter API key..."
    firebase functions:config:set openrouter.key="$OPENROUTER_KEY"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ OpenRouter API key configured successfully!"
        echo ""
        
        # Verify the configuration
        echo "Verifying configuration..."
        firebase functions:config:get
        echo ""
        
        echo "=================================================="
        echo "✅ SETUP COMPLETE!"
        echo "=================================================="
        echo ""
        echo "Next steps:"
        echo ""
        echo "1. Build your frontend:"
        echo "   npm run build"
        echo ""
        echo "2. Deploy everything:"
        echo "   firebase deploy"
        echo ""
        echo "3. Test your app:"
        echo "   npm run dev"
        echo ""
    else
        echo ""
        echo "❌ Failed to set OpenRouter API key"
        echo "Please check your Firebase authentication"
    fi
else
    echo "❌ You are NOT logged in to Firebase"
    echo ""
    echo "Please run:"
    echo "  firebase login --no-localhost"
    echo ""
    echo "Then run this script again:"
    echo "  ./firebase-setup.sh"
fi

echo ""
