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
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  const [responseAudioUrl, setResponseAudioUrl] = useState('');
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(userData?.language || 'urdu');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('🎤 Recording started...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please grant permission.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  // Process audio (STT → LLM → TTS)
  const processAudio = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setTranscription('');
    setResponse('');
    setResponseAudioUrl('');

    try {
      // Step 1: Speech-to-Text (Client-side, no Cloud Functions!)
      toast.loading('🎧 آواز سن رہے ہیں...');
      
      const sttResult = await speechToText(audioBlob, selectedLanguage);
      
      const transcribedText = sttResult.text;
      const detectedLanguage = sttResult.language;
      
      setTranscription(transcribedText);
      toast.dismiss();
      toast.success('✅ سمجھ آ گیا!');

      // Step 2: Ask AI Assistant (Client-side!)
      toast.loading('🤔 جواب سوچ رہے ہیں...');
      
      const llmResult = await askAssistant(transcribedText, detectedLanguage);
      
      const answerText = llmResult.answer;
      setResponse(answerText);
      toast.dismiss();
      toast.success('💡 جواب تیار ہے!');

      // Step 3: Save to Firestore (only data storage, no functions)
      await addDoc(collection(db, 'queries', currentUser.uid, 'history'), {
        question: transcribedText,
        answer: answerText,
        language: detectedLanguage,
        timestamp: new Date().toISOString(),
      });

      setIsProcessing(false);
      
      // Note: Text-to-Speech removed for now (would require ElevenLabs API)
      // You can add it later if needed
      
    } catch (error) {
      console.error('❌ Processing error:', error);
      toast.dismiss();
      toast.error(`خرابی: ${error.message || 'دوبارہ کوشش کریں'}`);
      setIsProcessing(false);
    }
  };

  // Play/Pause response audio
  const togglePlayResponse = () => {
    if (!audioPlayerRef.current) return;

    if (isPlayingResponse) {
      audioPlayerRef.current.pause();
      setIsPlayingResponse(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingResponse(true);
    }
  };

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.onended = () => setIsPlayingResponse(false);
    }
  }, [responseAudioUrl]);

  const getLanguageClass = (lang) => {
    const classes = {
      urdu: 'urdu-text',
      punjabi: 'punjabi-text',
      sindhi: 'sindhi-text',
    };
    return classes[lang] || 'urdu-text';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Language Selector */}
      <div className="mb-6 flex justify-center gap-4">
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

        <p className="mt-4 text-lg font-semibold text-farm-green-800">
          {isRecording ? '🔴 Recording...' : '🎤 Tap to speak'}
        </p>

        {audioBlob && !isRecording && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={processAudio}
            disabled={isProcessing}
            className="mt-4 px-8 py-3 bg-farm-green-600 text-white rounded-full font-semibold hover:bg-farm-green-700 transition-all disabled:opacity-50"
          >
            {isProcessing ? '⏳ Processing...' : '✨ Get Answer'}
          </motion.button>
        )}
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

                {/* Audio Player */}
                {responseAudioUrl && (
                  <div className="mt-6 flex items-center gap-4">
                    <button
                      onClick={togglePlayResponse}
                      className="w-14 h-14 rounded-full bg-farm-green-600 hover:bg-farm-green-700 text-white flex items-center justify-center transition-all shadow-lg"
                    >
                      {isPlayingResponse ? (
                        <FaPause className="text-xl" />
                      ) : (
                        <FaPlay className="text-xl ml-1" />
                      )}
                    </button>
                    <span className="text-farm-green-700 font-medium">
                      {isPlayingResponse ? 'Playing...' : 'Listen to answer'}
                    </span>
                    <audio
                      ref={audioPlayerRef}
                      src={responseAudioUrl}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceRecorder;
