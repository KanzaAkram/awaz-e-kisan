# 🧪 Testing Guide: Smart Farming Timeline Feature

## 🎯 What to Test

This guide will help you test all aspects of the Smart Farming Timeline feature to ensure it works correctly.

---

## ✅ Pre-Testing Checklist

Before testing, make sure you have:

- ✅ Firebase project setup complete
- ✅ OpenRouter API key configured
- ✅ OpenWeather API key configured (optional but recommended)
- ✅ Firebase Functions deployed
- ✅ App running locally or deployed

**Check configuration:**

```bash
# Check if API keys are set
firebase functions:config:get

# Should show:
# {
#   "openrouter": { "key": "sk-or-v1-..." },
#   "openweather": { "key": "..." }
# }
```

---

## 🎤 Test 1: Voice Onboarding (30 seconds)

### Objective
Test if voice input properly creates a personalized farming calendar.

### Steps

1. **Start Fresh:**
   - Create a new user account OR delete existing calendar:
   ```javascript
   // In Firebase Console → Firestore → Delete document:
   // cropCalendars/{userId}
   ```

2. **Login and Start Onboarding:**
   - App should automatically show Voice Onboarding screen
   - You should see: "آپ کونسی فصل لگا رہے ہیں؟"

3. **Test Voice Input (Question 1 - Crop):**
   - Click the microphone button 🎤
   - Browser asks for permission → **Allow**
   - Speak clearly in Urdu: **"گندم"** (Wheat)
   - Or English: **"Wheat"**
   - Click stop button
   - **Expected:** Transcribed text appears in input field
   - **Expected:** Auto-advances to next question

4. **Test Text Input (Question 2 - Acres):**
   - Type in the text box: **"10"** or **"10 ایکڑ"**
   - Click **"اگلا سوال"** (Next)
   - **Expected:** Moves to question 3

5. **Test Voice Input (Question 3 - Location):**
   - Click microphone
   - Speak: **"لاہور"** (Lahore) or **"Lahore"**
   - Stop recording
   - **Expected:** Location captured correctly

6. **Test Voice Input (Question 4 - Start Date):**
   - Click microphone
   - Speak: **"اگلے ہفتے"** (Next week) or **"15 November"**
   - Stop recording
   - **Expected:** Date captured

7. **Generate Calendar:**
   - Click **"کیلنڈر بنائیں"** (Generate Calendar)
   - **Expected:** Loading indicator shows "کیلنڈر بنا رہے ہیں..."
   - **Expected:** Success message: "🎉 کیلنڈر تیار ہے!"
   - **Expected:** Redirects to Dashboard with Calendar tab active

### ✅ Success Criteria

- ✅ Microphone access works
- ✅ Voice converts to text in Urdu/English
- ✅ Text appears in input field
- ✅ Can use either voice OR typing
- ✅ Progress bar updates (25% → 50% → 75% → 100%)
- ✅ Calendar generated successfully
- ✅ Redirects to dashboard

### ❌ Common Issues

| Problem | Solution |
|---------|----------|
| Microphone not working | Check browser permissions, try different browser |
| Voice not transcribed | Check OpenRouter API key is set, check functions logs |
| Calendar not generating | Check Firebase Functions logs: `firebase functions:log` |
| Stuck on processing | Check network tab for API errors |

---

## 📅 Test 2: Calendar Display

### Objective
Verify the calendar shows all activities correctly.

### Steps

1. **Open Calendar Tab:**
   - Should see calendar with all activities listed
   - **Expected:** 15-18 activities for wheat (varies by crop)

2. **Check Activity Details:**
   - Each activity should have:
     - ✅ Title in Urdu (e.g., "زمین کی تیاری")
     - ✅ Description (e.g., "ہل چلائیں اور زمین کو برابر کریں")
     - ✅ Scheduled date
     - ✅ Icon/emoji (🌱, 💧, 🌾)
     - ✅ Status: Upcoming / Completed

3. **Check Timeline View:**
   - Activities sorted by date (earliest first)
   - Progress bar showing % complete
   - Estimated yield displayed

4. **Mark Activity Complete:**
   - Click checkbox or "Complete" button on first activity
   - **Expected:** Activity marked as complete ✓
   - **Expected:** Progress bar updates
   - **Expected:** Success message shown

5. **Check Yield Prediction:**
   - Should show: "تخمینہ پیداوار: 200-300 من"
   - Should update as more activities completed

### ✅ Success Criteria

- ✅ All activities visible
- ✅ Dates calculated correctly from start date
- ✅ Activities in Urdu
- ✅ Can mark activities complete
- ✅ Progress updates in real-time
- ✅ Yield prediction shown

---

## 🔔 Test 3: Reminder System

### Objective
Test that reminders are scheduled and sent correctly.

### Steps

1. **Check Firestore:**
   - Go to Firebase Console → Firestore
   - Navigate to: `reminders/{userId}/scheduled/`
   - **Expected:** See 3+ reminder documents
   - Each should have:
     - `activityTitle`
     - `reminderDate` (3 days before activity)
     - `sent: false`

2. **Wait for Scheduled Time:**
   - Reminders run daily at 8:00 AM Pakistan time
   - To test immediately, you can manually trigger (see below)

3. **Check Notifications:**
   - Go to Firestore: `users/{userId}/notifications/`
   - **Expected:** New notification documents appear
   - Check message is in Urdu
   - Check notification has `read: false`

4. **View in Dashboard:**
   - Dashboard should show notification badge
   - Click notifications icon
   - **Expected:** See reminder messages

### 🧪 Manual Testing (Optional)

To test reminders immediately without waiting:

```bash
# Deploy function
firebase deploy --only functions:sendDailyReminders

# Manually invoke (requires Firebase CLI)
firebase functions:call sendDailyReminders
```

Or modify the schedule temporarily in `functions/index.js`:

```javascript
// Change from:
.schedule("every day 08:00")

// To (runs every 5 minutes):
.schedule("every 5 minutes")
```

Then deploy and wait 5 minutes.

### ✅ Success Criteria

- ✅ Reminders scheduled in Firestore
- ✅ Reminder date = activity date - 3 days
- ✅ Notifications sent at correct time
- ✅ Message in Urdu
- ✅ Notification appears in user's dashboard

---

## 🌤️ Test 4: Weather-Adaptive Rescheduling

### Objective
Test if activities are automatically rescheduled based on weather.

### Prerequisites

- OpenWeather API key must be configured
- Calendar must have upcoming activities within next 7 days

### Steps

1. **Check Weather Function:**
   ```bash
   # Test weather API directly
   curl "https://YOUR-PROJECT.cloudfunctions.net/getWeather?location=Lahore&language=urdu"
   ```
   
   **Expected Response:**
   ```json
   {
     "success": true,
     "weather": {
       "text": "لاہور میں آج صاف...",
       "temp": 28,
       "willRain": false
     },
     "isMockData": false
   }
   ```

2. **Check Scheduled Function:**
   - Function runs daily at 6:00 AM
   - Check logs: `firebase functions:log --only checkWeatherAndReschedule`

3. **Simulate Rain Scenario:**
   
   **Option A: Wait for real rain** (requires patience 😄)
   
   **Option B: Modify function temporarily:**
   
   In `functions/index.js`, find `checkAndRescheduleActivities` and force rain:
   
   ```javascript
   // Add this at the start of the function
   const forecast = [
     {
       dt: Math.floor(Date.now() / 1000),
       rain: { "3h": 5 }, // Simulate 5mm rain
       main: { temp: 25 }
     }
   ];
   ```

4. **Deploy and Run:**
   ```bash
   firebase deploy --only functions:checkWeatherAndReschedule
   firebase functions:call checkWeatherAndReschedule
   ```

5. **Check Results:**
   - Go to Firestore: `cropCalendars/{userId}/activities/`
   - Look for activities with `rescheduled: true`
   - Check new `scheduledDate`
   - Check `rescheduledReason` = "بارش کی وجہ سے"

6. **Check Notifications:**
   - User should get notification explaining reschedule
   - Message should be in Urdu

### ✅ Success Criteria

- ✅ Weather API returns real data
- ✅ Activities rescheduled when rain predicted
- ✅ Irrigation activities postponed
- ✅ Spray activities postponed
- ✅ Notification sent to farmer
- ✅ New dates calculated correctly (+3 days)

---

## 👥 Test 5: Community Insights

### Objective
Test that community activity tracking works.

### Prerequisites

- Multiple users using the app in same location
- Activities being completed

### Steps

1. **Complete an Activity:**
   - Mark any activity as complete in calendar
   - **Expected:** Activity marked ✓

2. **Check Firestore:**
   - Navigate to: `activityCompletions/{location}/completions/`
   - **Expected:** New document added with:
     - `crop`
     - `activityType`
     - `completedAt`
     - `date`

3. **Check Aggregated Insights:**
   - Navigate to: `communityInsights/{location}/`
   - **Expected:** Document with:
     - `activeFarmers` count
     - `activities` object with counts

4. **Test API Endpoint:**
   ```bash
   curl "https://YOUR-PROJECT.cloudfunctions.net/getCommunityInsights?userId=USER_ID"
   ```
   
   **Expected Response:**
   ```json
   {
     "success": true,
     "location": "Lahore",
     "activeFarmers": 5,
     "recentActivitiesCount": 12,
     "message": "آپ کے علاقے میں 12 کسانوں نے آج کام کیا"
   }
   ```

5. **View in Dashboard:**
   - Dashboard should show community stats
   - **Expected:** "آپ کے علاقے میں X کسانوں نے آج کام کیا"

### ✅ Success Criteria

- ✅ Activity completion tracked anonymously
- ✅ Community count updates
- ✅ Stats shown on dashboard
- ✅ Message in Urdu
- ✅ Only same location farmers counted

---

## 💰 Test 6: Market Price Tracking

### Objective
Test market price alerts.

### Steps

1. **Check Current Prices:**
   ```bash
   curl "https://YOUR-PROJECT.cloudfunctions.net/getMarketPrices?crop=wheat&language=urdu"
   ```
   
   **Expected Response:**
   ```json
   {
     "success": true,
     "price": "گندم: 3500 روپے فی من",
     "crop": "wheat",
     "lastUpdated": "2025-11-01T..."
   }
   ```

2. **Check Scheduled Updates:**
   - Function runs every 6 hours
   - Check Firestore: `marketPrices/wheat/`
   - Should see: `price`, `change`, `updatedAt`

3. **Simulate Price Drop:**
   - Manually update Firestore: Set `change: -60`
   - Run function: `firebase functions:call trackMarketPrices`
   - **Expected:** Farmers get notified

4. **Check Notifications:**
   - Navigate to: `users/{userId}/notifications/`
   - **Expected:** Price alert notification
   - Message: "گندم کی قیمت Rs. 60 کم ہو گئی!"

### ✅ Success Criteria

- ✅ Prices update every 6 hours
- ✅ Price changes tracked
- ✅ Notifications sent for significant drops (>Rs. 50)
- ✅ Message in Urdu
- ✅ Only relevant crop farmers notified

---

## 📊 Test 7: Yield Prediction

### Objective
Test that yield prediction updates as activities complete.

### Steps

1. **Initial State (0% complete):**
   - Yield prediction: Low confidence
   - Example: "تخمینہ: 100-150 من (اعتماد: 50%)"

2. **Complete 30% Activities:**
   - Mark first 5-6 activities complete
   - **Expected:** Yield prediction updates
   - Confidence increases to ~75%

3. **Complete 60% Activities:**
   - Mark more activities complete
   - **Expected:** Yield prediction more accurate
   - Confidence increases to ~90%

4. **Complete 90% Activities:**
   - Almost done with season
   - **Expected:** Yield prediction highest
   - Confidence at 100%
   - Should match estimated range

5. **Check Calculation:**
   - Formula: `estimatedYield × acres × progress_factor`
   - Progress factor increases with completion %

### ✅ Success Criteria

- ✅ Yield shown initially
- ✅ Updates as activities complete
- ✅ Confidence % increases
- ✅ Range narrows over time
- ✅ Final prediction accurate

---

## 🐛 Debugging Tools

### Check Firebase Functions Logs

```bash
# All logs
firebase functions:log --limit 100

# Specific function
firebase functions:log --only generateCropCalendar

# Follow in real-time
firebase functions:log --follow
```

### Check Firestore Data

```bash
# Using Firebase CLI
firebase firestore:data get cropCalendars/{userId}
```

Or use Firebase Console web interface.

### Test Cloud Functions Locally

```bash
# Start emulators
firebase emulators:start --only functions,firestore

# Test function locally
curl http://localhost:5001/YOUR-PROJECT/us-central1/generateCropCalendar \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","crop":"wheat","acres":10,"location":"Lahore"}'
```

### Check Network Requests

- Open browser DevTools → Network tab
- Look for calls to:
  - `generateCropCalendar`
  - `speechToText`
  - `getWeather`
- Check request/response payload
- Look for error status codes (400, 500)

---

## 📝 Test Checklist

Use this checklist to track your testing progress:

### Voice Onboarding
- [ ] Microphone permission works
- [ ] Voice input converts to text
- [ ] Text input works
- [ ] All 4 questions complete
- [ ] Calendar generates successfully
- [ ] Redirects to dashboard

### Calendar Display
- [ ] Activities shown correctly
- [ ] Dates calculated properly
- [ ] Can mark activities complete
- [ ] Progress bar updates
- [ ] Yield prediction shown

### Reminders
- [ ] Reminders scheduled in Firestore
- [ ] Notifications sent at correct time
- [ ] Message in correct language
- [ ] Notification appears in UI

### Weather Integration
- [ ] Weather API returns data
- [ ] Activities rescheduled for rain
- [ ] Notifications sent for rescheduling
- [ ] Extreme weather handled

### Community Features
- [ ] Activity completion tracked
- [ ] Community count updates
- [ ] Stats shown on dashboard

### Market Prices
- [ ] Prices update regularly
- [ ] Price drops trigger alerts
- [ ] Only relevant farmers notified

### Yield Prediction
- [ ] Initial prediction shown
- [ ] Updates with progress
- [ ] Confidence increases
- [ ] Accurate calculation

---

## 🎯 Performance Benchmarks

### Expected Response Times

- Voice transcription: 2-5 seconds
- Calendar generation: 1-3 seconds
- Activity completion: <1 second
- Weather check: 1-2 seconds
- Community insights: <1 second

### Expected API Costs (per 100 users)

- OpenRouter (STT + LLM): ~$5/month
- OpenWeather: Free (within limits)
- Firebase Functions: Free tier
- Firebase Firestore: Free tier

---

## ✅ Test Complete!

If all tests pass, your Smart Farming Timeline feature is working perfectly! 🎉

**Next Steps:**
1. Deploy to production
2. Monitor logs for first few days
3. Get feedback from real farmers
4. Iterate based on usage patterns

**Happy Testing! 🧪🌾**
