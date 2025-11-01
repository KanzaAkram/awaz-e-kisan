#!/bin/bash

# 🌾 Awaz-e-Kisan - Smart Timeline Demo & Test Script
# This script helps you test the new Smart Farming Timeline feature

echo "🌾 =================================="
echo "   AWAZ-E-KISAN SMART TIMELINE DEMO"
echo "   =================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Firebase is installed
if ! command -v firebase &> /dev/null
then
    echo -e "${RED}❌ Firebase CLI not found!${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI found${NC}"
echo ""

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${BLUE}🧪 Testing: ${test_name}${NC}"
    eval $test_command
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    echo ""
}

# Menu
echo "Select an option:"
echo "1. 🚀 Deploy all (rules + functions)"
echo "2. 📋 Deploy Firestore rules only"
echo "3. ☁️  Deploy Functions only"
echo "4. 📊 View function logs"
echo "5. 🔍 Check Firestore data"
echo "6. 🧪 Run all tests"
echo "7. 📈 Monitor real-time logs"
echo "8. 🌐 Open Firebase Console"
echo "9. 📱 Start dev server"
echo "0. ❌ Exit"
echo ""
read -p "Enter choice [0-9]: " choice

case $choice in
    1)
        echo -e "${YELLOW}📦 Deploying Firestore rules...${NC}"
        firebase deploy --only firestore:rules
        echo ""
        
        echo -e "${YELLOW}📦 Deploying Cloud Functions...${NC}"
        firebase deploy --only functions
        echo ""
        
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        ;;
        
    2)
        echo -e "${YELLOW}📦 Deploying Firestore rules...${NC}"
        firebase deploy --only firestore:rules
        echo -e "${GREEN}✅ Rules deployed!${NC}"
        ;;
        
    3)
        echo -e "${YELLOW}📦 Deploying Cloud Functions...${NC}"
        firebase deploy --only functions
        echo -e "${GREEN}✅ Functions deployed!${NC}"
        ;;
        
    4)
        echo -e "${BLUE}📊 Last 50 function logs:${NC}"
        echo ""
        firebase functions:log --limit 50
        ;;
        
    5)
        echo -e "${BLUE}🔍 Opening Firebase Console in browser...${NC}"
        PROJECT_ID=$(firebase use | grep 'Now using project' | cut -d "'" -f 2)
        if [ -z "$PROJECT_ID" ]; then
            PROJECT_ID=$(cat .firebaserc | grep "default" | cut -d '"' -f 4)
        fi
        
        echo "Project ID: $PROJECT_ID"
        echo ""
        echo "Opening these URLs:"
        echo "1. Firestore: https://console.firebase.google.com/project/$PROJECT_ID/firestore/data"
        echo "2. Functions: https://console.firebase.google.com/project/$PROJECT_ID/functions/list"
        echo "3. Auth: https://console.firebase.google.com/project/$PROJECT_ID/authentication/users"
        ;;
        
    6)
        echo -e "${YELLOW}🧪 Running comprehensive tests...${NC}"
        echo ""
        
        # Test 1: Check if rules file exists
        run_test "Firestore rules file exists" "test -f firestore.rules"
        
        # Test 2: Check if functions index exists
        run_test "Functions index.js exists" "test -f functions/index.js"
        
        # Test 3: Check if components exist
        run_test "VoiceOnboarding component exists" "test -f src/components/VoiceOnboarding.jsx"
        run_test "CropCalendar component exists" "test -f src/components/CropCalendar.jsx"
        
        # Test 4: Check if Firebase is logged in
        run_test "Firebase login status" "firebase login:list"
        
        # Test 5: Check if project is set
        run_test "Firebase project is set" "firebase use"
        
        echo -e "${GREEN}✅ All static tests complete!${NC}"
        echo ""
        echo -e "${YELLOW}💡 Next steps:${NC}"
        echo "1. Deploy: Choose option 1"
        echo "2. Start dev server: Choose option 9"
        echo "3. Test in browser: http://localhost:5173"
        ;;
        
    7)
        echo -e "${BLUE}📈 Monitoring real-time function logs...${NC}"
        echo "Press Ctrl+C to stop"
        echo ""
        firebase functions:log --follow
        ;;
        
    8)
        PROJECT_ID=$(firebase use | grep 'Now using project' | cut -d "'" -f 2)
        if [ -z "$PROJECT_ID" ]; then
            PROJECT_ID=$(cat .firebaserc | grep "default" | cut -d '"' -f 4)
        fi
        
        echo -e "${BLUE}🌐 Opening Firebase Console...${NC}"
        
        # Try to open in browser
        if command -v xdg-open &> /dev/null; then
            xdg-open "https://console.firebase.google.com/project/$PROJECT_ID/overview"
        elif command -v open &> /dev/null; then
            open "https://console.firebase.google.com/project/$PROJECT_ID/overview"
        else
            echo "Open this URL manually:"
            echo "https://console.firebase.google.com/project/$PROJECT_ID/overview"
        fi
        ;;
        
    9)
        echo -e "${BLUE}📱 Starting development server...${NC}"
        echo "Opening at: http://localhost:5173"
        echo ""
        npm run dev
        ;;
        
    0)
        echo -e "${GREEN}👋 Goodbye!${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  - SMART_FARMING_TIMELINE.md     (Full feature docs)"
echo "  - SMART_TIMELINE_SETUP.md       (Setup guide)"
echo "  - COMPLETE_FIREBASE_SETUP.md    (Firebase setup)"
echo ""
echo -e "${GREEN}🎉 Thank you for using Awaz-e-Kisan!${NC}"
