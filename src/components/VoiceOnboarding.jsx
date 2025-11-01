import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaStop, FaCheckCircle, FaSeedling } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { speechToText, generateAICalendar } from '../services/aiService';

const VoiceOnboarding = ({ onComplete }) => {
  const { currentUser, userData } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [answers, setAnswers] = useState({
    crop: '',
    acres: '',
    location: '',
    startDate: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const questions = [
    {
      id: 'crop',
      urdu: 'آپ کونسی فصل لگا رہے ہیں؟',
      english: 'Which crop are you planting?',
      icon: '🌾',
      examples: 'گندم، چاول، کپاس، گنا',
    },
    {
      id: 'acres',
      urdu: 'کتنے ایکڑ؟',
      english: 'How many acres?',
      icon: '📏',
      examples: '5، 10، 20 ایکڑ',
    },
    {
      id: 'location',
      urdu: 'آپ کس علاقے میں ہیں؟',
      english: 'Which area are you in?',
      icon: '📍',
      examples: 'لاہور، فیصل آباد، ملتان',
    },
    {
      id: 'startDate',
      urdu: 'کاشت کب شروع کریں گے؟',
      english: 'When will you start planting?',
      icon: '📅',
      examples: 'اگلے ہفتے، اس ماہ، 15 نومبر',
    },
  ];

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach(track => track.stop());
          
          // Process the audio
          await processVoiceInput(audioBlob);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        toast.success('🎤 بولیں...');
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast.error('مائیکروفون تک رسائی نہیں ہو سکی');
      }
    }
  };

  const processVoiceInput = async (audioBlob) => {
    setIsProcessing(true);
    const loadingToast = toast.loading('سمجھ رہا ہوں...');

    try {
      console.log('🎤 Processing voice input...');
      
      // Call client-side speech-to-text (no Cloud Functions!)
      const sttResult = await speechToText(audioBlob, userData?.language || 'ur');

      console.log('✅ STT Result:', sttResult);

      const transcribedText = sttResult.text || '';
      
      toast.dismiss(loadingToast);
      
      if (!transcribedText) {
        toast.error('کچھ سنائی نہیں دیا، دوبارہ کوشش کریں');
        setIsProcessing(false);
        return;
      }
      
      toast.success(`سمجھ آ گیا: "${transcribedText}" ✓`);
      
      // Update answer for current question
      const currentQuestion = questions[currentStep];
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: transcribedText,
      }));

      setIsProcessing(false);

      // Auto-advance to next question after a short delay
      setTimeout(() => {
        if (currentStep < questions.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Voice processing error:', error);
      toast.dismiss(loadingToast);
      toast.error(`خرابی: ${error.message || 'دوبارہ کوشش کریں'}`);
      setIsProcessing(false);
    }
  };

  const handleTextInput = (value) => {
    const currentQuestion = questions[currentStep];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await generateCalendar();
    }
  };

  const generateCalendar = async () => {
    setIsProcessing(true);
    toast.loading('🌱 کیلنڈر بنا رہے ہیں... AI استعمال کر رہے ہیں');

    try {
      console.log('🌾 Generating AI calendar...');
      
      const startDate = answers.startDate || new Date().toISOString();
      
      // Call client-side AI calendar generation (no Cloud Functions!)
      const result = await generateAICalendar(
        answers.crop,
        answers.location,
        startDate,
        parseFloat(answers.acres) || 1
      );

      console.log('✅ Calendar generated:', result);

      // Save to Firestore (only data storage, no functions)
      const calendarRef = doc(db, 'cropCalendars', currentUser.uid);
      await setDoc(calendarRef, {
        crop: answers.crop,
        acres: parseFloat(answers.acres) || 0,
        location: answers.location,
        startDate: startDate,
        duration: result.duration,
        status: 'active',
        progress: 0,
        completedActivities: 0,
        totalActivities: result.activities.length,
        estimatedYield: result.estimatedYield,
        actualYield: null,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });

      // Save activities as subcollection
      const activitiesRef = collection(db, 'cropCalendars', currentUser.uid, 'activities');
      for (const activity of result.activities) {
        await setDoc(doc(activitiesRef, activity.id), activity);
      }

      toast.dismiss();
      toast.success('🎉 کیلنڈر تیار ہے!');
      
      // Small delay before navigating
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error('❌ Calendar generation error:', error);
      toast.dismiss();
      toast.error(`خرابی: ${error.message || 'دوبارہ کوشش کریں'}`);
      setIsProcessing(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              سوال {currentStep + 1} از {questions.length}
            </span>
            <span className="text-sm font-semibold text-green-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-green-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{currentQuestion.icon}</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2 text-right">
                {currentQuestion.urdu}
              </h2>
              <p className="text-lg text-gray-600">{currentQuestion.english}</p>
              <p className="text-sm text-gray-500 mt-2">
                مثال: {currentQuestion.examples}
              </p>
            </div>

            {/* Voice Input Button */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <motion.button
                onClick={handleVoiceInput}
                disabled={isProcessing}
                className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl shadow-lg transition-all ${
                  isRecording
                    ? 'bg-red-500 animate-pulse'
                    : isProcessing
                    ? 'bg-gray-400'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
                ) : isRecording ? (
                  <FaStop />
                ) : (
                  <FaMicrophone />
                )}
              </motion.button>

              <p className="text-sm text-gray-600">
                {isRecording
                  ? 'بول رہے ہیں... رکنے کے لیے دبائیں'
                  : isProcessing
                  ? 'پروسیسنگ...'
                  : 'جواب دینے کے لیے دبائیں'}
              </p>
            </div>

            {/* Text Input Alternative */}
            <div className="mb-6">
              <input
                type="text"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleTextInput(e.target.value)}
                placeholder="یا یہاں لکھیں..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-right text-lg"
                dir="rtl"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                >
                  پیچھے
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id] || isProcessing}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  answers[currentQuestion.id] && !isProcessing
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentStep === questions.length - 1
                  ? '🎉 کیلنڈر بنائیں'
                  : 'اگلا سوال ←'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Benefits Display */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2 text-right">
            آپ کو ملے گا:
          </h3>
          <ul className="text-sm text-green-700 space-y-1 text-right">
            <li>✅ مکمل فصل کیلنڈر (40+ سرگرمیاں)</li>
            <li>✅ وقت پر آواز میں یاد دہانیاں</li>
            <li>✅ موسم کی بنیاد پر خودکار تبدیلیاں</li>
            <li>✅ مارکیٹ کی قیمتوں کی اطلاعات</li>
            <li>✅ پیداوار کی پیش گوئی</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceOnboarding;
