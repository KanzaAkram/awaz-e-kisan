import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaBookReader, FaSeedling, FaRecycle, FaCloudSun, FaMicrophone, FaSpinner } from 'react-icons/fa';
import { GiWheat, GiFertilizerBag, GiWaterDrop } from 'react-icons/gi';
import { generateTrainingContent, textToSpeech } from '../services/aiService';
import toast from 'react-hot-toast';
import PodcastPlayer from './PodcastPlayer';

const FarmerTraining = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [customQuery, setCustomQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPodcast, setCurrentPodcast] = useState(null);
  const [podcastHistory, setPodcastHistory] = useState([]);

  // Pre-defined training topics
  const trainingTopics = [
    {
      id: 'organic-farming',
      title: 'نامیاتی کاشتکاری',
      titleEn: 'Organic Farming',
      icon: <FaSeedling className="text-4xl" />,
      color: 'from-green-400 to-green-600',
      description: 'قدرتی طریقوں سے فصلیں اگائیں',
      descriptionEn: 'Learn natural farming methods without chemicals',
      duration: '5 min',
      topics: ['Composting', 'Natural pesticides', 'Soil health'],
    },
    {
      id: 'crop-rotation',
      title: 'فصلوں کی تبدیلی',
      titleEn: 'Crop Rotation',
      icon: <FaRecycle className="text-4xl" />,
      color: 'from-blue-400 to-blue-600',
      description: 'زمین کی زرخیزی بڑھائیں',
      descriptionEn: 'Improve soil fertility by rotating crops',
      duration: '4 min',
      topics: ['Season planning', 'Soil nutrients', 'Pest control'],
    },
    {
      id: 'climate-smart',
      title: 'موسمی تبدیلی سے نمٹنا',
      titleEn: 'Climate-Smart Agriculture',
      icon: <FaCloudSun className="text-4xl" />,
      color: 'from-orange-400 to-orange-600',
      description: 'موسمی چیلنجز کا حل',
      descriptionEn: 'Adapt to changing weather patterns',
      duration: '6 min',
      topics: ['Water conservation', 'Heat-resistant crops', 'Weather forecasting'],
    },
    {
      id: 'fertilizer',
      title: 'کھاد کا صحیح استعمال',
      titleEn: 'Proper Fertilizer Use',
      icon: <GiFertilizerBag className="text-4xl" />,
      color: 'from-purple-400 to-purple-600',
      description: 'کھاد سے زیادہ پیداوار',
      descriptionEn: 'Maximize yield with proper fertilization',
      duration: '5 min',
      topics: ['NPK ratios', 'Application timing', 'Cost efficiency'],
    },
    {
      id: 'water-management',
      title: 'پانی کا بہتر استعمال',
      titleEn: 'Water Management',
      icon: <GiWaterDrop className="text-4xl" />,
      color: 'from-cyan-400 to-cyan-600',
      description: 'پانی کی بچت اور استعمال',
      descriptionEn: 'Save water and improve irrigation',
      duration: '5 min',
      topics: ['Drip irrigation', 'Rainwater harvesting', 'Soil moisture'],
    },
    {
      id: 'wheat-farming',
      title: 'گندم کی کاشت',
      titleEn: 'Wheat Farming Excellence',
      icon: <GiWheat className="text-4xl" />,
      color: 'from-yellow-400 to-yellow-600',
      description: 'گندم کی بہترین کاشت',
      descriptionEn: 'Master wheat farming techniques',
      duration: '7 min',
      topics: ['Seed selection', 'Disease prevention', 'Harvesting'],
    },
  ];

  // Load podcast history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('podcastHistory');
    if (saved) {
      setPodcastHistory(JSON.parse(saved));
    }
  }, []);

  // Save podcast to history
  const savePodcast = (podcast) => {
    // Create a clean copy with only the properties we need
    const cleanPodcast = {
      id: podcast.id,
      title: podcast.title,
      titleEn: podcast.titleEn,
      content: podcast.content,
      contentEn: podcast.contentEn,
      audioUrl: podcast.audioUrl,
      duration: podcast.duration,
      topicId: podcast.topicId, // Store topic ID instead of icon
      color: podcast.color,
      timestamp: podcast.timestamp,
      isCustom: podcast.isCustom,
    };
    
    const updated = [cleanPodcast, ...podcastHistory.slice(0, 9)]; // Keep last 10
    setPodcastHistory(updated);
    
    try {
      localStorage.setItem('podcastHistory', JSON.stringify(updated));
      console.log('💾 Podcast saved to history');
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      // Still set state even if localStorage fails
    }
  };

  // Generate podcast for pre-defined topic
  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    setIsGenerating(true);

    try {
      console.log('🎯 Starting podcast generation for:', topic.id);
      
      // Generate content using Gemini (or fallback)
      const content = await generateTrainingContent(topic.id, topic.titleEn);
      console.log('✅ Content generated:', content);
      
      if (!content || !content.urdu) {
        throw new Error('Content generation failed - no content returned');
      }
      
      // Convert to speech (Urdu)
      const audioUrl = await textToSpeech(content.urdu);
      console.log('✅ Audio URL:', audioUrl);

      if (!audioUrl) {
        console.warn('⚠️ No audio URL, but content is available');
      }

      const podcast = {
        id: Date.now(),
        title: topic.title,
        titleEn: topic.titleEn,
        content: content.urdu,
        contentEn: content.english,
        audioUrl: audioUrl || 'speech-synthesis:' + content.urdu,
        duration: topic.duration,
        topicId: topic.id, // Store topic ID instead of icon component
        color: topic.color,
        timestamp: new Date().toISOString(),
      };

      console.log('📦 Podcast object:', podcast);
      setCurrentPodcast(podcast);
      savePodcast(podcast);
      console.log('✅ Podcast created successfully!');
      toast.success('پوڈکاسٹ تیار ہے! 🎧');
    } catch (error) {
      console.error('❌ Error generating podcast:', error);
      console.error('❌ Error details:', error.message, error.stack);
      toast.error(`مسئلہ: ${error.message || 'پوڈکاسٹ بنانے میں مسئلہ آیا'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate custom podcast based on user query
  const handleCustomPodcast = async () => {
    if (!customQuery.trim()) {
      toast.error('براہ کرم کوئی سوال لکھیں');
      return;
    }

    setIsGenerating(true);

    try {
      console.log('🎯 Starting custom podcast for:', customQuery);
      
      // Generate content
      const content = await generateTrainingContent('custom', customQuery);
      console.log('✅ Custom content generated:', content);
      
      if (!content || !content.urdu) {
        throw new Error('Content generation failed - no content returned');
      }
      
      // Convert to speech
      const audioUrl = await textToSpeech(content.urdu);
      console.log('✅ Audio URL:', audioUrl);

      const podcast = {
        id: Date.now(),
        title: customQuery.substring(0, 50) + (customQuery.length > 50 ? '...' : ''),
        titleEn: customQuery.substring(0, 50) + (customQuery.length > 50 ? '...' : ''),
        content: content.urdu,
        contentEn: content.english,
        audioUrl: audioUrl || 'speech-synthesis:' + content.urdu,
        duration: '~5 min',
        topicId: 'custom', // Store topic ID instead of icon component
        color: 'from-pink-400 to-pink-600',
        timestamp: new Date().toISOString(),
        isCustom: true,
      };

      console.log('📦 Custom podcast object:', podcast);
      setCurrentPodcast(podcast);
      savePodcast(podcast);
      setCustomQuery('');
      toast.success('آپ کا پوڈکاسٹ تیار ہے! 🎧');
    } catch (error) {
      console.error('Error generating custom podcast:', error);
      toast.error('پوڈکاسٹ بنانے میں مسئلہ آیا');
    } finally {
      setIsGenerating(false);
    }
  };

  // Play from history
  const handlePlayHistory = (podcast) => {
    setCurrentPodcast(podcast);
    setSelectedTopic(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block mb-4"
        >
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-full">
            <FaBookReader className="text-5xl text-white" />
          </div>
        </motion.div>
        <h2 className="text-4xl font-bold text-gray-800 mb-2" dir="rtl">
          کسانوں کا تربیتی مرکز
        </h2>
        <p className="text-gray-600 text-lg" dir="rtl">
          جدید زراعت کے طریقے سیکھیں - اردو آواز میں
        </p>
      </div>

      {/* Custom Podcast Generator */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border-2 border-purple-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaMicrophone className="text-3xl text-purple-600" />
          <div>
            <h3 className="text-2xl font-bold text-gray-800" dir="rtl">
              اپنا سوال پوچھیں
            </h3>
            <p className="text-sm text-gray-600" dir="rtl">
              کسی بھی موضوع پر پوڈکاسٹ سنیں
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomPodcast()}
            placeholder="مثال: 'ٹماٹر کی بیماریوں سے کیسے بچایا جائے؟'"
            className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 text-right"
            dir="rtl"
            disabled={isGenerating}
          />
          <button
            onClick={handleCustomPodcast}
            disabled={isGenerating || !customQuery.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <FaSpinner className="animate-spin text-xl" />
            ) : (
              '🎙️ بنائیں'
            )}
          </button>
        </div>
      </motion.div>

      {/* Pre-defined Topics Grid */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4" dir="rtl">
          📚 تربیتی موضوعات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => handleTopicClick(topic)}
              className={`bg-gradient-to-br ${topic.color} rounded-xl shadow-lg p-6 cursor-pointer text-white relative overflow-hidden group`}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm font-semibold">
                    {topic.duration}
                  </span>
                  <div className="text-white">
                    {topic.icon}
                  </div>
                </div>

                <h4 className="text-2xl font-bold mb-2" dir="rtl">
                  {topic.title}
                </h4>
                <p className="text-sm opacity-90 mb-4" dir="rtl">
                  {topic.description}
                </p>

                {/* Topics covered */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {topic.topics.map((t, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Play button */}
                <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
                  <FaPlay />
                  <span>سنیں</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current Podcast Player */}
      <AnimatePresence>
        {currentPodcast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <PodcastPlayer
              podcast={currentPodcast}
              onClose={() => setCurrentPodcast(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl p-8 text-center">
              <FaSpinner className="animate-spin text-6xl text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2" dir="rtl">
                پوڈکاسٹ تیار ہو رہا ہے...
              </h3>
              <p className="text-gray-600" dir="rtl">
                براہ کرم انتظار کریں
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Podcast History */}
      {podcastHistory.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4" dir="rtl">
            🎧 سنے ہوئے پوڈکاسٹ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {podcastHistory.map((podcast) => {
              // Get icon based on topicId
              const topic = trainingTopics.find(t => t.id === podcast.topicId);
              const icon = podcast.isCustom ? <FaMicrophone className="text-4xl" /> : topic?.icon || <FaBookReader className="text-4xl" />;
              
              return (
                <motion.div
                  key={podcast.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handlePlayHistory(podcast)}
                  className="bg-white rounded-lg shadow p-4 cursor-pointer border-2 border-gray-200 hover:border-green-500 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`bg-gradient-to-br ${podcast.color} p-3 rounded-lg text-white`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800" dir="rtl">
                        {podcast.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(podcast.timestamp).toLocaleDateString('ur-PK')}
                      </p>
                    </div>
                    <FaPlay className="text-green-500" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerTraining;
