#!/bin/bash

# Quick Start Script for Testing with Firebase Emulators
# This allows you to test Cloud Functions locally without deploying

set -e

echo "🚀 Starting Awaz-e-Kisan with Firebase Emulators"
echo "================================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if functions dependencies are installed
if [ ! -d "functions/node_modules" ]; then
    echo "📦 Installing Cloud Functions dependencies..."
    cd functions
    npm install
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo ""
echo "✅ All dependencies installed"
echo ""

# Offer emulator choice
echo "How do you want to test?"
echo "1) Use Firebase Emulators (test locally, no deployment needed)"
echo "2) Use deployed functions (requires Blaze plan)"
echo ""
read -p "Choose option (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "🔥 Starting Firebase Emulators..."
    echo ""
    
    # Update .env to use emulators
    if grep -q "VITE_USE_EMULATORS=false" .env; then
        sed -i 's/VITE_USE_EMULATORS=false/VITE_USE_EMULATORS=true/' .env
        echo "✅ Enabled emulator mode in .env"
    fi
    
    # Start emulators in background
    firebase emulators:start --only functions &
    EMULATOR_PID=$!
    
    echo "⏳ Waiting for emulators to start (10 seconds)..."
    sleep 10
    
    echo ""
    echo "✅ Emulators running at http://localhost:5001"
    echo ""
    
    # Start dev server
    echo "🚀 Starting Vite dev server..."
    npm run dev
    
    # Cleanup on exit
    trap "echo ''; echo '🛑 Stopping emulators...'; kill $EMULATOR_PID 2>/dev/null; exit" INT TERM EXIT
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "🌐 Using deployed Cloud Functions..."
    echo ""
    
    # Update .env to use deployed functions
    if grep -q "VITE_USE_EMULATORS=true" .env; then
        sed -i 's/VITE_USE_EMULATORS=true/VITE_USE_EMULATORS=false/' .env
        echo "✅ Disabled emulator mode in .env"
    fi
    
    echo "⚠️  Make sure you have:"
    echo "   1. Upgraded to Firebase Blaze plan"
    echo "   2. Deployed functions: firebase deploy --only functions"
    echo ""
    read -p "Press Enter to continue..."
    
    # Start dev server
    echo ""
    echo "🚀 Starting Vite dev server..."
    npm run dev
    
else
    echo "❌ Invalid choice. Please run the script again."
    exit 1
fi
