# Awaz-e-Kisan (آوازِ کسان)

> **Voice of the Farmer** - A multilingual AI-powered voice assistant for Pakistani farmers

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌾 About

**Awaz-e-Kisan** is a voice-first farming assistant designed specifically for Pakistani farmers. It addresses the critical challenges of:
- 📖 **70% illiteracy rate** among farmers
- 🌍 **Language barriers** (Urdu, Punjabi, Sindhi)
- 📱 **Limited smartphone access**
- 💡 **Lack of timely agricultural information**

### What It Does

🎤 **Speak Your Question** → 🤖 **Get AI-Powered Answer** → 🔊 **Hear It In Your Language**

---

## ✨ Features

### Core Features
- 🎙️ **Voice Recording** - Record questions in local languages
- 🗣️ **Speech-to-Text** - Powered by OpenAI Whisper
- 🤖 **AI Assistant** - GPT-4 provides expert farming advice
- 🔊 **Text-to-Speech** - Natural voice responses in Urdu/Punjabi/Sindhi
- 📜 **Query History** - Track all your conversations
- 🔐 **Firebase Auth** - Secure email/phone authentication

### Smart Features
- 🌦️ Weather forecasts for your location
- 💰 Real-time market prices
- 🌱 Crop-specific guidance
- 🌿 Sustainability tips
- 📱 Mobile-responsive design
- 🌍 RTL text support

---

## 🎯 User Flow

```
┌─────────────┐
│  Farmer     │
│  Records    │
│  Question   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Speech to  │
│  Text (STT) │
│  Whisper    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   GPT-4     │
│  Generates  │
│   Answer    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Text to    │
│  Speech     │
│  ElevenLabs │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Farmer    │
│   Listens   │
│  to Answer  │
└─────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **React Hot Toast** - Beautiful notifications

### Backend
- **Firebase Cloud Functions** - Serverless APIs
- **Firebase Firestore** - NoSQL database
- **Firebase Storage** - Audio file storage
- **Firebase Authentication** - User management
- **Firebase Hosting** - Static site hosting

### AI/ML Services
- **OpenAI Whisper** - Speech recognition
- **GPT-4 Turbo** - Language model
- **ElevenLabs** - High-quality TTS
- **Google TTS** - Fallback TTS

---

## 📦 Project Structure

```
awaz-e-kisan/
├── functions/              # Cloud Functions
│   ├── index.js           # Main functions file
│   └── package.json       # Functions dependencies
├── src/
│   ├── components/        # React components
│   │   ├── VoiceRecorder.jsx
│   │   ├── AuthForm.jsx
│   │   └── QueryHistory.jsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/             # Page components
│   │   └── Dashboard.jsx
│   ├── firebase.js        # Firebase config
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── public/                # Static assets
├── firebase.json          # Firebase config
├── firestore.rules        # Database security rules
├── storage.rules          # Storage security rules
├── .env.example           # Environment variables template
└── README.md              # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/awaz-e-kisan.git
cd awaz-e-kisan

# Install dependencies
npm install
cd functions && npm install && cd ..

# Copy environment variables
copy .env.example .env.local

# Edit .env.local with your Firebase config
```

### Development

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start React dev server
npm run dev
```

Visit `http://localhost:3000`

### Deployment

```bash
# Build frontend
npm run build

# Deploy to Firebase
firebase deploy
```

📖 **For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 🎨 Screenshots

### Login Screen
![Login](https://via.placeholder.com/800x500?text=Login+Screen)

### Voice Recording
![Voice Recording](https://via.placeholder.com/800x500?text=Voice+Recording)

### AI Response
![AI Response](https://via.placeholder.com/800x500?text=AI+Response)

### Query History
![History](https://via.placeholder.com/800x500?text=Query+History)

---

## 🔐 Security

- ✅ Firebase Authentication (email/password/phone)
- ✅ Firestore security rules (user-scoped data)
- ✅ Storage rules (private audio files)
- ✅ API keys in Functions config (never exposed)
- ✅ HTTPS-only communication
- ✅ CORS protection

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/speechToText` | POST | Convert audio to text |
| `/askAssistant` | POST | Get AI farming advice |
| `/textToSpeech` | POST | Generate voice response |
| `/getWeather` | GET | Fetch weather forecast |
| `/getMarketPrices` | GET | Get commodity prices |

---

## 🌍 Supported Languages

| Language | Script | Code |
|----------|--------|------|
| Urdu | اردو | `ur` |
| Punjabi | ਪੰਜਾਬੀ | `pa` |
| Sindhi | سنڌي | `sd` |

---

## 💡 Innovation Features

- 📻 **Daily AI Bulletin** - Morning farming news
- 📴 **Offline Mode** - Works with limited connectivity
- 💬 **Community Sharing** - Farmer-to-farmer tips
- 🎭 **Personality Modes** - Choose your advisor style
- 📱 **SMS Fallback** - Works on feature phones
- 📸 **Crop Disease Detection** - AI-powered diagnosis
- 🏆 **Gamification** - Rewards for engagement
- 💚 **WhatsApp Integration** - Chat via WhatsApp

📖 **For detailed innovation ideas, see [INNOVATIONS.md](./INNOVATIONS.md)**

---

## 🎯 Impact

### Target Audience
- 42 million farmers in Pakistan
- 70% are functionally illiterate
- 97% have limited internet access
- Speak Urdu, Punjabi, or Sindhi

### Problem Solved
- ❌ Language barrier in agricultural apps
- ❌ Text-based interfaces (illiteracy)
- ❌ Lack of timely farming advice
- ❌ Poor weather/market information access

### Solution Benefits
- ✅ Voice-first, no reading required
- ✅ Multilingual support
- ✅ Real-time AI-powered advice
- ✅ Works offline
- ✅ Community-driven knowledge

---

## 🗺️ Roadmap

### Phase 1 (Current) ✅
- [x] Voice recording & playback
- [x] Speech-to-text (Whisper)
- [x] AI responses (GPT-4)
- [x] Text-to-speech (ElevenLabs/gTTS)
- [x] User authentication
- [x] Query history

### Phase 2 (Next 3 months)
- [ ] Daily AI bulletin
- [ ] Offline mode with PWA
- [ ] Community tips sharing
- [ ] SMS integration (Twilio)
- [ ] WhatsApp bot
- [ ] Crop disease detection

### Phase 3 (6 months)
- [ ] IoT sensor integration
- [ ] Predictive analytics
- [ ] Marketplace integration
- [ ] Government schemes database
- [ ] Multi-tenant support
- [ ] Mobile apps (iOS/Android)

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Your Name** - Full Stack Developer
- **Contributors** - [List contributors here]

---

## 🙏 Acknowledgments

- OpenAI for Whisper & GPT-4 APIs
- ElevenLabs for natural TTS
- Firebase for backend infrastructure
- Pakistani farmers for inspiration

---

## 📞 Contact

- **Email**: your.email@example.com
- **Twitter**: [@yourusername](https://twitter.com/yourusername)
- **LinkedIn**: [Your LinkedIn](https://linkedin.com/in/yourprofile)

---

## 🌟 Star Us!

If you find this project helpful, please give it a ⭐️ on GitHub!

---

<div align="center">

**Built with ❤️ for Pakistani Farmers**

**آوازِ کسان - کسانوں کی آواز، کھیتوں کی ترقی**

[Demo](https://awaz-e-kisan.web.app) • [Documentation](./README.md) • [Deployment Guide](./DEPLOYMENT.md) • [Innovations](./INNOVATIONS.md)

</div>
