import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera, FaUpload, FaSpinner, FaLeaf, FaTimes, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { analyzeCropDisease } from '../services/aiService';

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef(null);
  const utteranceRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('تصویر 5MB سے چھوٹی ہونی چاہیے');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('براہ کرم پہلے تصویر منتخب کریں');
      return;
    }

    setAnalyzing(true);
    toast.loading('تصویر کا تجزیہ ہو رہا ہے...');

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];
        
        const analysis = await analyzeCropDisease(base64Image);
        
        toast.dismiss();
        if (analysis.success) {
          setResult(analysis);
          toast.success('✅ تجزیہ مکمل ہوا!');
        } else {
          toast.error('تجزیہ ناکام: ' + analysis.error);
        }
      };
      reader.readAsDataURL(selectedImage);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.dismiss();
      toast.error('مسئلہ: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSpeak = () => {
    if (!result || !result.urduExplanation) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(result.urduExplanation);
    utterance.lang = 'ur-PK';
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error('آواز چلانے میں مسئلہ');
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'شدید':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
      case 'درمیانہ':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
      case 'کم':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-block p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-4">
          <FaLeaf className="text-5xl text-white" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-farm-green-800 mb-2" dir="rtl">
          فصل کی بیماری کی تشخیص
        </h2>
        <p className="text-gray-600 text-lg">Crop Disease Detection</p>
        <p className="text-gray-500 mt-2" dir="rtl">
          اپنی فصل کی تصویر اپ لوڈ کریں اور فوری طور پر بیماری کی تشخیص حاصل کریں
        </p>
      </motion.div>

      {/* Image Upload Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 border-2 border-farm-green-100"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />

        {!imagePreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-farm-green-300 rounded-xl p-12 text-center cursor-pointer hover:border-farm-green-500 hover:bg-farm-green-50 transition-all"
          >
            <FaCamera className="text-6xl text-farm-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2" dir="rtl">
              تصویر منتخب کریں
            </h3>
            <p className="text-gray-600 mb-4">
              Click or tap to upload crop image
            </p>
            <div className="flex gap-4 justify-center">
              <button className="btn-primary flex items-center gap-2">
                <FaUpload />
                <span>Upload Photo</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              JPG, PNG up to 5MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={imagePreview}
                alt="Crop"
                className="w-full h-96 object-contain rounded-xl bg-gray-100"
              />
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all"
              >
                <FaTimes />
              </button>
            </div>

            {/* Analyze Button */}
            {!result && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3"
              >
                {analyzing ? (
                  <>
                    <FaSpinner className="animate-spin text-2xl" />
                    <span>تجزیہ جاری ہے...</span>
                  </>
                ) : (
                  <>
                    <FaLeaf className="text-2xl" />
                    <span>بیماری کی تشخیص کریں</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-farm-green-200"
          >
            {/* Disease Name */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-farm-green-800 mb-2" dir="rtl">
                  {result.diseaseNameUrdu || 'بیماری کی تشخیص'}
                </h3>
                <p className="text-gray-600 font-medium">
                  {result.diseaseNameEnglish || 'Disease Diagnosis'}
                </p>
              </div>
              {result.severity && (
                <div className={`px-4 py-2 rounded-full font-bold border-2 ${getSeverityColor(result.severity)}`}>
                  {result.severity}
                </div>
              )}
            </div>

            {/* Audio Controls */}
            <div className="mb-6 flex gap-3">
              <button
                onClick={handleSpeak}
                className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                  isSpeaking
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-xl'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <FaVolumeMute className="text-2xl" />
                    <span>بند کریں</span>
                  </>
                ) : (
                  <>
                    <FaVolumeUp className="text-2xl" />
                    <span>اردو میں سنیں</span>
                  </>
                )}
              </button>
            </div>

            {/* Urdu Explanation */}
            <div className="bg-gradient-to-br from-farm-green-50 to-green-50 rounded-xl p-6 mb-6">
              <h4 className="text-xl font-bold text-farm-green-800 mb-4" dir="rtl">
                📋 تفصیلی وضاحت
              </h4>
              <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-line" dir="rtl">
                {result.urduExplanation}
              </p>
            </div>

            {/* Treatment Recommendations */}
            {result.treatment && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                <h4 className="text-xl font-bold text-blue-800 mb-4" dir="rtl">
                  💊 علاج کی تجاویز
                </h4>
                <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-line" dir="rtl">
                  {result.treatment}
                </p>
              </div>
            )}

            {/* Prevention Tips */}
            {result.prevention && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
                <h4 className="text-xl font-bold text-yellow-800 mb-4" dir="rtl">
                  🛡️ احتیاطی تدابیر
                </h4>
                <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-line" dir="rtl">
                  {result.prevention}
                </p>
              </div>
            )}

            {/* New Analysis Button */}
            <button
              onClick={handleReset}
              className="w-full mt-6 btn-secondary py-4 text-lg"
            >
              نیا تجزیہ کریں
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiseaseDetection;
