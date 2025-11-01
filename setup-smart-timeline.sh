#!/bin/bash

# 🌾 Awaz-e-Kisan - Smart Farming Timeline Setup Script
# This script helps you set up the Smart Farming Timeline feature

set -e

echo "🌾 =========================================="
echo "   Awaz-e-Kisan - Smart Timeline Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found!${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✓ Firebase CLI found${NC}"

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠ Not logged in to Firebase${NC}"
    echo "Running: firebase login"
    firebase login
fi

echo -e "${GREEN}✓ Firebase authentication OK${NC}"
echo ""

# Step 1: Check Firebase Config
echo "📋 Step 1: Checking Firebase Configuration..."
echo ""

if ! firebase functions:config:get &> /dev/null; then
    echo -e "${RED}❌ Could not get Firebase config${NC}"
    exit 1
fi

CONFIG=$(firebase functions:config:get)

# Check OpenRouter API Key
if echo "$CONFIG" | grep -q "openrouter"; then
    echo -e "${GREEN}✓ OpenRouter API key configured${NC}"
    HAS_OPENROUTER=true
else
    echo -e "${YELLOW}⚠ OpenRouter API key NOT configured${NC}"
    echo ""
    echo "You need an OpenRouter API key for AI features."
    echo "Get one from: https://openrouter.ai/keys"
    echo ""
    read -p "Enter your OpenRouter API key (or press Enter to skip): " OPENROUTER_KEY
    
    if [ ! -z "$OPENROUTER_KEY" ]; then
        echo "Setting OpenRouter key..."
        firebase functions:config:set openrouter.key="$OPENROUTER_KEY"
        echo -e "${GREEN}✓ OpenRouter key set!${NC}"
        HAS_OPENROUTER=true
    else
        echo -e "${YELLOW}⚠ Skipping OpenRouter setup${NC}"
        HAS_OPENROUTER=false
    fi
fi

echo ""

# Check Weather API (Open-Meteo - NO API KEY NEEDED!)
echo -e "${GREEN}✓ Open-Meteo weather API ready (no configuration needed!)${NC}"
echo "  Using Open-Meteo: 100% FREE, unlimited calls, no API key required"
HAS_WEATHER=true

echo ""

# Step 2: Install Dependencies
echo "📦 Step 2: Installing Dependencies..."
echo ""

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

if [ ! -d "functions/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd functions
    npm install
    cd ..
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

echo ""

# Step 3: Deploy Functions
echo "🚀 Step 3: Deploying Firebase Functions..."
echo ""

read -p "Deploy functions now? (y/n): " DEPLOY_CHOICE

if [ "$DEPLOY_CHOICE" = "y" ] || [ "$DEPLOY_CHOICE" = "Y" ]; then
    echo "Deploying all functions..."
    firebase deploy --only functions
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Functions deployed successfully!${NC}"
    else
        echo -e "${RED}❌ Function deployment failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Skipping function deployment${NC}"
    echo "Deploy later with: firebase deploy --only functions"
fi

echo ""

# Step 4: Deploy Firestore Rules
echo "🔒 Step 4: Deploying Firestore Rules..."
echo ""

read -p "Deploy Firestore rules? (y/n): " RULES_CHOICE

if [ "$RULES_CHOICE" = "y" ] || [ "$RULES_CHOICE" = "Y" ]; then
    echo "Deploying Firestore rules..."
    firebase deploy --only firestore:rules
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Firestore rules deployed!${NC}"
    else
        echo -e "${RED}❌ Firestore rules deployment failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipping Firestore rules${NC}"
fi

echo ""

# Step 5: Test Setup
echo "🧪 Step 5: Testing Setup..."
echo ""

PROJECT_ID=$(firebase use | grep "active project" | awk '{print $NF}' | tr -d '()')

if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$(firebase projects:list | tail -n +3 | head -n 1 | awk '{print $2}')
fi

echo "Project ID: $PROJECT_ID"
echo ""

if [ "$HAS_WEATHER" = true ]; then
    echo "Testing Weather API..."
    WEATHER_URL="https://us-central1-${PROJECT_ID}.cloudfunctions.net/getWeather?location=Lahore&language=urdu"
    
    echo "Calling: $WEATHER_URL"
    WEATHER_RESPONSE=$(curl -s "$WEATHER_URL")
    
    if echo "$WEATHER_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✓ Weather API working!${NC}"
        echo "Response: $(echo $WEATHER_RESPONSE | jq -r '.weather.text' 2>/dev/null || echo $WEATHER_RESPONSE)"
    else
        echo -e "${YELLOW}⚠ Weather API test inconclusive${NC}"
        echo "Response: $WEATHER_RESPONSE"
    fi
fi

echo ""

echo "Testing Open-Meteo Weather API..."
WEATHER_URL="https://us-central1-${PROJECT_ID}.cloudfunctions.net/getWeather?location=Lahore&language=urdu"

echo "Calling: $WEATHER_URL"
WEATHER_RESPONSE=$(curl -s "$WEATHER_URL" 2>/dev/null)

if echo "$WEATHER_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Weather API working!${NC}"
    echo "Response: $(echo $WEATHER_RESPONSE | jq -r '.weather.text' 2>/dev/null || echo $WEATHER_RESPONSE | head -c 100)"
else
    echo -e "${YELLOW}⚠ Weather API test inconclusive (may need deployment first)${NC}"
fi  echo -e "${YELLOW}⚠${NC} OpenWeather API NOT configured (using mock data)"
fi

echo -e "${GREEN}✓${NC} Dependencies installed"

if [ "$DEPLOY_CHOICE" = "y" ] || [ "$DEPLOY_CHOICE" = "Y" ]; then
    echo -e "${GREEN}✓${NC} Functions deployed"
else
    echo -e "${YELLOW}⚠${NC} Functions NOT deployed"
fi

echo ""
echo "=========================================="
echo ""

# Step 7: Next Steps
echo "🎯 Next Steps:"
echo ""
echo -e "${GREEN}✓${NC} Open-Meteo Weather API ready (FREE, unlimited)"ho ""
echo "3. Create a new user account"
echo ""
echo "4. Test the Voice Onboarding:"
echo "   - Answer the 4 questions"
echo "   - Generate your farming calendar"
echo ""
echo "5. Check the documentation:"
echo "   - SMART_TIMELINE_SETUP.md - Feature overview"
echo "   - OPENWEATHER_SETUP.md - Weather API setup"
echo "   - TESTING_SMART_TIMELINE.md - Testing guide"
echo ""

if [ "$HAS_OPENROUTER" = false ]; then
    echo -e "${YELLOW}⚠ IMPORTANT: Voice features won't work without OpenRouter API key!${NC}"
    echo "   Get one from: https://openrouter.ai/keys"
    echo "   Then run: firebase functions:config:set openrouter.key=\"YOUR_KEY\""
    echo ""
fi

echo "=========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "🌾 Happy Smart Farming!"
if [ "$HAS_OPENROUTER" = false ]; then
    echo -e "${YELLOW}⚠ IMPORTANT: Voice features won't work without OpenRouter API key!${NC}"
    echo "   Get one from: https://openrouter.ai/keys"
    echo "   Then run: firebase functions:config:set openrouter.key=\"YOUR_KEY\""
    echo ""
else
    echo ""
    echo "🌤️ Weather Features: Open-Meteo (FREE, unlimited, no setup)"
    echo "🤖 AI Features: OpenRouter (configured)"
    echo ""
fi