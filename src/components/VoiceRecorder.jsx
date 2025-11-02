import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaPlay, FaPause } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { speechToText, askAssistant } from '../services/aiService';

const VoiceRecorder = () => {
  const { currentUser, userData } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(userData?.language || 'urdu');
  const [conversationHistory, setConversationHistory] = useState([]);

  // Use browser's Web Speech API for speech recognition
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set language based on user preference
      const langMap = {
        'urdu': 'ur-PK',
        'punjabi': 'pa-IN',
        'sindhi': 'sd-PK',
        'english': 'en-US'
      };
      recognitionRef.current.lang = langMap[selectedLanguage] || 'ur-PK';

      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Recognized:', transcript);
        setTranscription(transcript);
        setIsRecording(false);
        toast.dismiss();
        toast.success('✅ سمجھ آ گیا!');

        // Automatically process the question
        await processQuestion(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast.dismiss();
        
        if (event.error === 'no-speech') {
          toast.error('کوئی آواز نہیں سنائی دی۔ دوبارہ کوشش کریں یا لکھ کر پوچھیں', {
            duration: 4000
          });
        } else if (event.error === 'not-allowed') {
          toast.error('مائیکروفون کی اجازت دیں۔ براؤزر سیٹنگز چیک کریں', {
            duration: 5000
          });
        } else if (event.error === 'network') {
          toast('⚠️ انٹرنیٹ کنکشن چیک کریں یا نیچے لکھ کر پوچھیں', {
            icon: '🌐',
            duration: 5000
          });
        } else {
          toast.error('آواز کی پہچان میں خرابی۔ نیچے لکھ کر پوچھیں', {
            duration: 4000
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedLanguage]);

  // Start recording with Web Speech API
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('آپ کا براؤزر آواز کی پہچان کو سپورٹ نہیں کرتا۔ Chrome یا Edge استعمال کریں', {
        duration: 5000
      });
      return;
    }

    if (!recognitionRef.current) {
      toast.error('آواز کی پہچان دستیاب نہیں۔ نیچے لکھ کر پوچھیں');
      return;
    }

    try {
      setTranscription('');
      setResponse('');
      recognitionRef.current.start();
      setIsRecording(true);
      toast.loading('🎤 بولیں... / Speak now...');
    } catch (error) {
      console.error('Error starting recognition:', error);
      
      if (error.message.includes('already started')) {
        toast.error('پہلے سے ریکارڈنگ جاری ہے');
      } else {
        toast.error('مائیکروفون شروع نہیں ہو سکا۔ نیچے لکھ کر پوچھیں', {
          duration: 4000
        });
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.dismiss();
    }
  };

  // Process question and get AI response with conversation context
  const processQuestion = async (questionText) => {
    if (!questionText) return;

    setIsProcessing(true);
    setResponse('');

    try {
      // Ask AI Assistant with conversation history for context
      toast.loading('🤔 جواب سوچ رہے ہیں...');
      
      // Build context from conversation history
      let contextualQuestion = questionText;
      if (conversationHistory.length > 0) {
        // Add recent conversation context (last 3 exchanges)
        const recentHistory = conversationHistory.slice(-3);
        const contextParts = recentHistory.map(h => 
          `Previous Q: ${h.question}\nPrevious A: ${h.answer}`
        ).join('\n\n');
        
        contextualQuestion = `[Conversation Context]\n${contextParts}\n\n[Current Question]\n${questionText}\n\nNote: If this is a follow-up question, use the previous context to provide a coherent answer. If it's a new topic, answer directly.`;
      }
      
      const llmResult = await askAssistant(contextualQuestion, selectedLanguage);
      
      const answerText = llmResult.answer;
      setResponse(answerText);
      
      // Update conversation history
      const newEntry = {
        question: questionText,
        answer: answerText,
        timestamp: new Date().toISOString(),
      };
      setConversationHistory([...conversationHistory, newEntry]);
      
      toast.dismiss();
      toast.success('💡 جواب تیار ہے!');

      // Save to Firestore
      await addDoc(collection(db, 'queries', currentUser.uid, 'history'), {
        question: questionText,
        answer: answerText,
        language: selectedLanguage,
        timestamp: new Date().toISOString(),
        conversationIndex: conversationHistory.length,
      });

      // Use Web Speech API for text-to-speech
      speakResponse(answerText);

      setIsProcessing(false);
      
    } catch (error) {
      console.error('❌ Processing error:', error);
      toast.dismiss();
      toast.error(`خرابی: ${error.message || 'دوبارہ کوشش کریں'}`);
      setIsProcessing(false);
    }
  };

  // Speak response using Web Speech API
  const speakResponse = (text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      console.log('🔊 Available voices:', voices.length);
      
      // Try to find Urdu or Hindi voice
      let selectedVoice = voices.find(v => 
        v.lang === 'ur-PK' || 
        v.lang === 'ur-IN' || 
        v.lang.startsWith('ur')
      );
      
      // Fallback to Hindi
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang === 'hi-IN' || 
          v.lang.startsWith('hi')
        );
      }

      // Fallback to any Asian language
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang.startsWith('ar') || // Arabic (similar script)
          v.lang.startsWith('fa') || // Persian
          v.lang.startsWith('pa')    // Punjabi
        );
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('✅ Using voice:', selectedVoice.name, selectedVoice.lang);
      } else {
        console.warn('⚠️ No Urdu/Hindi voice found, using default');
      }
      
      utterance.lang = 'ur-PK';
      utterance.rate = 0.85;  // Slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => {
        console.log('🎙️ Speech started');
        setIsPlayingResponse(true);
      };
      
      utterance.onend = () => {
        console.log('✅ Speech ended');
        setIsPlayingResponse(false);
      };

      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event.error);
        setIsPlayingResponse(false);
        
        if (event.error === 'not-allowed') {
          toast.error('براؤزر میں آواز کی اجازت نہیں ہے');
        } else if (event.error === 'network') {
          toast.error('نیٹ ورک کا مسئلہ - آواز نہیں چل سکی');
        }
      };
      
      window.speechSynthesis.speak(utterance);
    };

    // Wait for voices to load if needed
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.log('⏳ Waiting for voices to load...');
      window.speechSynthesis.onvoiceschanged = () => {
        console.log('✅ Voices loaded');
        speak();
      };
    } else {
      speak();
    }
  };

  // Toggle speech synthesis
  const togglePlayResponse = () => {
    if (isPlayingResponse) {
      window.speechSynthesis.cancel();
      setIsPlayingResponse(false);
    } else if (response) {
      speakResponse(response);
    }
  };

  const getLanguageClass = (lang) => {
    const classes = {
      urdu: 'urdu-text',
      punjabi: 'punjabi-text',
      sindhi: 'sindhi-text',
    };
    return classes[lang] || 'urdu-text';
  };

  // Clear conversation history
  const clearConversation = () => {
    setConversationHistory([]);
    setTranscription('');
    setResponse('');
    toast.success('✅ نئی گفتگو شروع کی / New conversation started');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Language Selector and Clear Button */}
      <div className="mb-6 flex justify-between items-center gap-4">
        <div className="flex gap-4">
          {['urdu', 'punjabi', 'sindhi'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedLanguage === lang
                  ? 'bg-farm-green-600 text-white shadow-lg'
                  : 'bg-white text-farm-green-700 hover:bg-farm-green-50'
              }`}
            >
              {lang === 'urdu' && 'اردو'}
              {lang === 'punjabi' && 'ਪੰਜਾਬੀ'}
              {lang === 'sindhi' && 'سنڌي'}
            </button>
          ))}
        </div>
        
        {/* New Conversation Button */}
        {conversationHistory.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearConversation}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold shadow-lg transition-all flex items-center gap-2"
          >
            <span>🔄</span>
            <span dir="rtl">نئی گفتگو / New Chat</span>
          </motion.button>
        )}
      </div>
      
      {/* Conversation History Indicator */}
      {conversationHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-center"
        >
          <p className="text-sm text-blue-700 font-semibold" dir="rtl">
            💬 گفتگو جاری ہے - {conversationHistory.length} سوالات / Conversation active - {conversationHistory.length} questions asked
          </p>
          <p className="text-xs text-blue-600 mt-1" dir="rtl">
            آپ پچھلے سوالات سے متعلق سوال پوچھ سکتے ہیں / You can ask follow-up questions
          </p>
        </motion.div>
      )}

      {/* Recording Button */}
      <div className="flex flex-col items-center mb-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl transition-all ${
            isRecording
              ? 'bg-red-500 recording-pulse'
              : 'bg-farm-green-600 hover:bg-farm-green-700'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? (
            <FaStop className="text-4xl" />
          ) : (
            <FaMicrophone className="text-4xl" />
          )}
        </motion.button>

        <p className="mt-4 text-lg font-semibold text-farm-green-800" dir="rtl">
          {isRecording ? '🔴 رک جائیں / Recording...' : '🎤 بولیں / Tap to speak'}
        </p>
        <p className="mt-2 text-sm text-gray-600" dir="rtl">
          {isRecording ? 'بولنا ختم ہو تو بٹن دبائیں' : 'سوال پوچھنے کے لیے مائیکروفون پر کلک کریں'}
        </p>
      </div>

      {/* Text Input Option (if voice fails) */}
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-farm-green-800 mb-4 text-center" dir="rtl">
          📝 یا لکھ کر پوچھیں / Or Type Your Question
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && transcription.trim()) {
                processQuestion(transcription);
              }
            }}
            placeholder="اپنا سوال یہاں لکھیں... / Type your question here..."
            className="flex-1 px-4 py-3 border-2 border-farm-green-300 rounded-xl focus:outline-none focus:border-farm-green-600 text-lg"
            dir="rtl"
            disabled={isProcessing}
          />
          <button
            onClick={() => {
              if (transcription.trim()) {
                processQuestion(transcription);
              }
            }}
            disabled={isProcessing || !transcription.trim()}
            className="px-6 py-3 bg-farm-green-600 hover:bg-farm-green-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isProcessing ? '⏳' : '➤'}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 text-center" dir="rtl">
          آواز کام نہیں کر رہی؟ لکھ کر پوچھیں!
        </p>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {(transcription || response) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="space-y-6"
          >
            {/* Transcription */}
            {transcription && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-farm-green-200">
                <h3 className="text-sm font-semibold text-farm-green-700 mb-3 uppercase tracking-wide">
                  📝 Your Question
                </h3>
                <p className={`text-xl ${getLanguageClass(selectedLanguage)}`}>
                  {transcription}
                </p>
              </div>
            )}

            {/* Response */}
            {response && (
              <div className="bg-gradient-to-br from-farm-green-50 to-white rounded-2xl p-6 shadow-lg border-2 border-farm-green-300">
                <h3 className="text-sm font-semibold text-farm-green-700 mb-3 uppercase tracking-wide">
                  💡 Awaz-e-Kisan Says
                </h3>
                <p className={`text-xl leading-relaxed ${getLanguageClass(selectedLanguage)}`}>
                  {response}
                </p>

                {/* Audio Player - Web Speech API */}
                <div className="mt-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayResponse}
                      className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      {isPlayingResponse ? (
                        <FaPause className="text-2xl" />
                      ) : (
                        <FaPlay className="text-2xl ml-1" />
                      )}
                    </button>
                    <div>
                      <p className="text-blue-700 font-bold text-lg" dir="rtl">
                        {isPlayingResponse ? '🔊 سن رہے ہیں...' : '🎧 جواب سنیں'}
                      </p>
                      <p className="text-xs text-gray-500" dir="rtl">
                        اردو میں آواز میں سنیں
                      </p>
                    </div>
                  </div>
                  {!('speechSynthesis' in window) && (
                    <p className="mt-3 text-sm text-red-600" dir="rtl">
                      ⚠️ آپ کا براؤزر آواز کو سپورٹ نہیں کرتا
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation History */}
      {conversationHistory.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-farm-green-800 mb-4" dir="rtl">
              📜 پچھلی گفتگو / Previous Conversation
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversationHistory.slice(0, -1).reverse().map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-l-4 border-farm-green-300 pl-4 py-2 bg-gray-50 rounded-r-lg"
                >
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Q: {new Date(entry.timestamp).toLocaleTimeString('ur-PK', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-gray-800 font-semibold" dir="rtl">
                      {entry.question}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-farm-green-600 mb-1">A:</p>
                    <p className="text-gray-600 text-sm" dir="rtl">
                      {entry.answer}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceRecorder;
