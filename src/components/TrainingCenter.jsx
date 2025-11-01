import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlay, 
  FaPause, 
  FaStop, 
  FaMicrophone, 
  FaBook, 
  FaSpinner,
  FaVolumeUp,
  FaComments,
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { 
  TRAINING_TOPICS, 
  generatePodcastContent, 
  generateCustomPodcast,
  textToSpeech, 
  stopSpeech,
  getAvailableVoices 
} from '../services/podcastService';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { speechToText } from '../services/aiService';

const TrainingCenter = () => {
  const { currentUser } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [podcastContent, setPodcastContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [recentPodcasts, setRecentPodcasts] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    loadRecentPodcasts();
    // Load voices
    getAvailableVoices();
  }, []);

  const loadRecentPodcasts = async () => {
    try {
      const podcastsRef = collection(db, 'podcasts');
      const q = query(
        podcastsRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const podcasts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentPodcasts(podcasts);
    } catch (error) {
      console.error('Error loading recent podcasts:', error);
    }
  };

  const handleTopicSelect = async (topic) => {
    setSelectedTopic(topic);
    setIsGenerating(true);
    
    try {
      toast.loading('آپ کا پوڈکاسٹ تیار ہو رہا ہے...', { id: 'podcast-gen' });
      
      const result = await generatePodcastContent(topic, 'urdu');
      setPodcastContent(result);
      
      // Save to Firestore
      await addDoc(collection(db, 'podcasts'), {
        userId: currentUser.uid,
        topicId: topic.id,
        topicTitle: topic.title,
        topicTitleEnglish: topic.titleEnglish,
        content: result.content,
        language: 'urdu',
        createdAt: new Date().toISOString(),
      });
      
      await loadRecentPodcasts();
      
      toast.success('پوڈکاسٹ تیار ہے! سننے کے لیے پلے دبائیں', { id: 'podcast-gen' });
    } catch (error) {
      console.error('Error generating podcast:', error);
      toast.error('پوڈکاسٹ بنانے میں مسئلہ ہوا', { id: 'podcast-gen' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      if (podcastContent) {
        try {
          setIsPlaying(true);
          await textToSpeech(podcastContent.content, 'ur-PK');
          setIsPlaying(false);
        } catch (error) {
          console.error('Speech error:', error);
          toast.error('آواز سنانے میں مسئلہ ہوا');
          setIsPlaying(false);
        }
      }
    }
  };

  const handleStop = () => {
    stopSpeech();
    setIsPlaying(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceQuestion(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('🎤 بولیں... سن رہے ہیں');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('مائیکروفون استعمال نہیں ہو سکا');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceQuestion = async (audioBlob) => {
    try {
      toast.loading('آپ کے سوال کو سمجھ رہے ہیں...', { id: 'voice-process' });
      
      const transcription = await speechToText(audioBlob, 'ur');
      setUserQuestion(transcription.text);
      
      toast.success('سوال سمجھ آ گیا!', { id: 'voice-process' });
      
      // Generate custom podcast
      await generateCustomPodcastFromQuestion(transcription.text);
    } catch (error) {
      console.error('Voice processing error:', error);
      toast.error('آواز سمجھنے میں مسئلہ ہوا', { id: 'voice-process' });
    }
  };

  const generateCustomPodcastFromQuestion = async (question) => {
    setIsGenerating(true);
    setShowAskModal(false);
    
    try {
      toast.loading('آپ کے سوال پر پوڈکاسٹ تیار ہو رہا ہے...', { id: 'custom-podcast' });
      
      const result = await generateCustomPodcast(question, 'urdu');
      setPodcastContent(result);
      setSelectedTopic(result.topic);
      
      // Save to Firestore
      await addDoc(collection(db, 'podcasts'), {
        userId: currentUser.uid,
        topicId: result.topic.id,
        topicTitle: result.topic.title,
        topicTitleEnglish: result.topic.titleEnglish,
        content: result.content,
        language: 'urdu',
        userQuestion: question,
        createdAt: new Date().toISOString(),
      });
      
      await loadRecentPodcasts();
      
      toast.success('آپ کا خصوصی پوڈکاسٹ تیار ہے!', { id: 'custom-podcast' });
    } catch (error) {
      console.error('Error generating custom podcast:', error);
      toast.error('پوڈکاسٹ بنانے میں مسئلہ ہوا', { id: 'custom-podcast' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextQuestionSubmit = (e) => {
    e.preventDefault();
    if (userQuestion.trim()) {
      generateCustomPodcastFromQuestion(userQuestion);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <FaBook className="text-5xl" />
          <div>
            <h2 className="text-3xl font-bold">AI تربیت اور تعلیم</h2>
            <p className="text-green-100">AI Training & Education Center</p>
          </div>
        </div>
        <p className="text-lg text-green-50" dir="rtl">
          جدید کھیتی کے طریقے سیکھیں - اردو میں آواز کے ذریعے
        </p>
        <p className="text-sm text-green-100 mt-2">
          Learn modern farming techniques through voice in Urdu
        </p>
      </div>

      {/* Ask Custom Question Button */}
      <motion.button
        onClick={() => setShowAskModal(true)}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FaComments className="text-2xl" />
        <span dir="rtl">اپنا سوال پوچھیں - خصوصی پوڈکاسٹ حاصل کریں</span>
      </motion.button>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRAINING_TOPICS.map((topic) => (
          <motion.button
            key={topic.id}
            onClick={() => handleTopicSelect(topic)}
            disabled={isGenerating}
            className={`bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-left ${
              selectedTopic?.id === topic.id ? 'ring-4 ring-green-500' : ''
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-5xl mb-3">{topic.icon}</div>
            <h3 className="font-bold text-lg text-gray-800 mb-2" dir="rtl">
              {topic.title}
            </h3>
            <p className="text-sm text-gray-600">{topic.titleEnglish}</p>
            <p className="text-xs text-gray-500 mt-2 line-clamp-2" dir="rtl">
              {topic.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Podcast Player */}
      {podcastContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{selectedTopic?.icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800" dir="rtl">
                  {selectedTopic?.title}
                </h3>
                <p className="text-gray-600">{selectedTopic?.titleEnglish}</p>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex gap-3">
              <motion.button
                onClick={handlePlayPause}
                className={`p-4 rounded-full text-white text-2xl shadow-lg ${
                  isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </motion.button>
              
              {isPlaying && (
                <motion.button
                  onClick={handleStop}
                  className="p-4 rounded-full bg-red-500 text-white text-2xl shadow-lg hover:bg-red-600"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <FaStop />
                </motion.button>
              )}
            </div>
          </div>

          {/* Content Display */}
          <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4 text-green-600">
              <FaVolumeUp className="text-xl" />
              <span className="font-semibold">پوڈکاسٹ کا متن:</span>
            </div>
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap" 
              dir="rtl"
              style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}
            >
              {podcastContent.content}
            </div>
          </div>

          {isPlaying && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
              <FaVolumeUp className="animate-pulse text-2xl" />
              <span className="font-semibold animate-pulse">سن رہے ہیں...</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl p-12 shadow-xl text-center"
        >
          <FaSpinner className="text-6xl text-green-500 animate-spin mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2" dir="rtl">
            آپ کا پوڈکاسٹ تیار ہو رہا ہے...
          </h3>
          <p className="text-gray-600">Generating your educational podcast...</p>
        </motion.div>
      )}

      {/* Recent Podcasts */}
      {recentPodcasts.length > 0 && !isGenerating && !podcastContent && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4" dir="rtl">
            حالیہ پوڈکاسٹس
          </h3>
          <div className="space-y-3">
            {recentPodcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                onClick={() => {
                  const topic = TRAINING_TOPICS.find(t => t.id === podcast.topicId);
                  setSelectedTopic(topic);
                  setPodcastContent({
                    content: podcast.content,
                    topic: topic,
                    language: podcast.language,
                  });
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {TRAINING_TOPICS.find(t => t.id === podcast.topicId)?.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800" dir="rtl">
                      {podcast.topicTitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(podcast.createdAt).toLocaleDateString('ur-PK')}
                    </p>
                  </div>
                </div>
                <FaPlay className="text-green-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ask Question Modal */}
      <AnimatePresence>
        {showAskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800" dir="rtl">
                  اپنا سوال پوچھیں
                </h3>
                <button
                  onClick={() => setShowAskModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Voice Recording */}
                <div className="text-center">
                  <p className="text-gray-600 mb-4" dir="rtl">
                    آواز میں پوچھیں یا لکھیں
                  </p>
                  <motion.button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-8 rounded-full text-white text-4xl shadow-xl ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaMicrophone />
                  </motion.button>
                  <p className="text-sm text-gray-500 mt-3">
                    {isRecording ? '🎤 سن رہے ہیں... رکنے کے لیے دبائیں' : 'مائیک دبائیں اور بولیں'}
                  </p>
                </div>

                {/* OR Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="text-gray-400 font-semibold">یا</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Text Input */}
                <form onSubmit={handleTextQuestionSubmit}>
                  <textarea
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="اپنا سوال یہاں لکھیں..."
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none resize-none"
                    rows={4}
                    dir="rtl"
                  />
                  <button
                    type="submit"
                    disabled={!userQuestion.trim()}
                    className="w-full mt-4 bg-green-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    پوڈکاسٹ بنائیں
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainingCenter;
