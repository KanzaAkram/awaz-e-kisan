import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaTimes, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaSeedling, FaRecycle, FaCloudSun } from 'react-icons/fa';
import { GiWheat, GiFertilizerBag, GiWaterDrop } from 'react-icons/gi';

// Icon mapping for topics
const topicIcons = {
  'organic-farming': <FaSeedling className="text-6xl" />,
  'crop-rotation': <FaRecycle className="text-6xl" />,
  'climate-smart': <FaCloudSun className="text-6xl" />,
  'fertilizer': <GiFertilizerBag className="text-6xl" />,
  'water-management': <GiWaterDrop className="text-6xl" />,
  'wheat-farming': <GiWheat className="text-6xl" />,
  'custom': <FaSeedling className="text-6xl" />,
};

const PodcastPlayer = ({ podcast, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    // Check if using Web Speech API (audio URL starts with 'speech-synthesis:')
    if (podcast.audioUrl && podcast.audioUrl.startsWith('speech-synthesis:')) {
      // For speech synthesis, we'll use the browser's speech API
      const text = podcast.audioUrl.replace('speech-synthesis:', '');
      // Estimate duration: ~150 words per minute in Urdu, ~3 chars per word
      const estimatedDuration = (text.length / 3) / 150 * 60;
      setDuration(estimatedDuration);
      console.log('🎤 Speech synthesis ready, estimated duration:', estimatedDuration);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [podcast.audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up speech synthesis...');
      window.speechSynthesis.cancel();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const togglePlayPause = () => {
    // Check if using Web Speech API
    if (podcast.audioUrl && podcast.audioUrl.startsWith('speech-synthesis:')) {
      if (isPlaying) {
        // Stop speech
        console.log('⏸️ Stopping speech...');
        window.speechSynthesis.cancel();
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setIsPlaying(false);
      } else {
        // Start speech
        console.log('▶️ Starting speech...');
        const text = podcast.audioUrl.replace('speech-synthesis:', '');
        
        // Cancel any existing speech
        window.speechSynthesis.cancel();
        
        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        console.log('🎤 Available voices:', voices.length);
        
        // Try to find Urdu voice, fallback to first available
        const urduVoice = voices.find(v => v.lang.startsWith('ur')) || 
                         voices.find(v => v.lang.startsWith('hi')) || // Hindi as backup
                         voices[0];
        
        if (urduVoice) {
          console.log('✅ Using voice:', urduVoice.name, urduVoice.lang);
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        if (urduVoice) {
          utterance.voice = urduVoice;
        }
        utterance.lang = 'ur-PK';
        utterance.rate = 0.85; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = volume;
        
        utterance.onstart = () => {
          console.log('✅ Speech started!');
          setIsPlaying(true);
          
          // Simulate progress
          const estimatedDuration = duration;
          let elapsed = 0;
          progressIntervalRef.current = setInterval(() => {
            elapsed += 0.1;
            setCurrentTime(elapsed);
            if (elapsed >= estimatedDuration) {
              clearInterval(progressIntervalRef.current);
            }
          }, 100);
        };
        
        utterance.onend = () => {
          console.log('✅ Speech ended');
          setIsPlaying(false);
          setCurrentTime(0);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        };
        
        utterance.onerror = (event) => {
          console.error('❌ Speech error:', event);
          setIsPlaying(false);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        };
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
      return;
    }

    // Regular audio file
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    // Speech synthesis doesn't support seeking
    if (podcast.audioUrl && podcast.audioUrl.startsWith('speech-synthesis:')) {
      console.log('⚠️ Seeking not supported for speech synthesis');
      return;
    }
    
    const audio = audioRef.current;
    const seekTime = (e.target.value / 100) * duration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    // Update audio element volume if exists
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    
    // Update speech synthesis volume if active
    if (utteranceRef.current && window.speechSynthesis.speaking) {
      // Note: Can't change volume of active speech, will apply to next playback
      console.log('🔊 Volume will update on next play:', newVolume);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(volume || 0.5);
      if (audioRef.current) {
        audioRef.current.volume = volume || 0.5;
      }
    } else {
      setIsMuted(true);
      setVolume(0);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
      // Stop speech if speaking
      if (podcast.audioUrl && podcast.audioUrl.startsWith('speech-synthesis:') && isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {podcast.audioUrl && !podcast.audioUrl.startsWith('speech-synthesis:') && (
        <audio ref={audioRef} src={podcast.audioUrl} />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`bg-white rounded-xl shadow-2xl overflow-hidden ${
          isExpanded ? 'fixed inset-4 z-50' : 'relative'
        }`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-br ${podcast.color} p-6 text-white relative`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24" />
          </div>

          {/* Controls */}
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                  title={isExpanded ? 'Minimize' : 'Expand'}
                >
                  {isExpanded ? <FaCompress /> : <FaExpand />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                  title="Close"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="text-white">
                {topicIcons[podcast.topicId] || topicIcons['custom']}
              </div>
            </div>

            <h3 className="text-3xl font-bold mb-2" dir="rtl">
              {podcast.title}
            </h3>
            <p className="text-sm opacity-90">
              {podcast.duration}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #22c55e ${progress}%, #e5e7eb ${progress}%)`,
              }}
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Play/Pause and Volume */}
          <div className="flex items-center gap-6">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
            </button>

            {/* Volume Control */}
            <div className="flex-1 flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                {isMuted ? <FaVolumeMute className="text-xl" /> : <FaVolumeUp className="text-xl" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22c55e ${isMuted ? 0 : volume * 100}%, #e5e7eb ${isMuted ? 0 : volume * 100}%)`,
                }}
              />
            </div>

            {/* Transcript Toggle */}
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
            >
              {showTranscript ? '📝 Hide Text' : '📝 Show Text'}
            </button>
          </div>

          {/* Transcript */}
          {showTranscript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto"
            >
              <h4 className="font-bold text-gray-800 mb-3" dir="rtl">
                📄 متن
              </h4>
              <div className="space-y-4">
                {/* Urdu Content */}
                <div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line" dir="rtl">
                    {podcast.content}
                  </p>
                </div>

                {/* English Translation (if available) */}
                {podcast.contentEn && (
                  <div className="pt-4 border-t border-gray-200">
                    <h5 className="font-semibold text-gray-600 mb-2">
                      English Translation:
                    </h5>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {podcast.contentEn}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800" dir="rtl">
              💡 یہ پوڈکاسٹ مصنوعی ذہانت (AI) کے ذریعے خاص طور پر آپ کے لیے تیار کیا گیا ہے
            </p>
          </div>
        </div>
      </motion.div>

      {/* Backdrop for expanded view */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}
    </>
  );
};

export default PodcastPlayer;
