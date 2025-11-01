#!/bin/bash

# Awaz-e-Kisan - Hackathon Mode Startup Script
# No Cloud Functions required!

echo "🌾 Awaz-e-Kisan - Voice-First Farming Assistant"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "Please create .env file manually"
    echo ""
fi

# Check if VITE_OPENROUTER_API_KEY is set
if grep -q "your_openrouter_key_here" .env; then
    echo "⚠️  OpenRouter API key not configured!"
    echo ""
    echo "Please add your OpenRouter API key to .env file:"
    echo "1. Get free API key from: https://openrouter.ai/"
    echo "2. Open .env file"
    echo "3. Replace 'your_openrouter_key_here' with your key"
    echo ""
    read -p "Press Enter after adding the API key..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ All set! Starting development server..."
echo ""
echo "🎤 Features available (NO Cloud Functions!):"
echo "   • Voice Onboarding (30-second setup)"
echo "   • AI Calendar Generation (GPT-4 powered)"
echo "   • Voice Assistant (Ask questions in Urdu)"
echo "   • All running client-side!"
echo ""
echo "💰 Cost: ~$0.01 per user interaction"
echo "🔥 Firebase: FREE tier (Auth + Database only)"
echo ""
echo "================================================"
echo ""

# Start dev server
npm run dev
