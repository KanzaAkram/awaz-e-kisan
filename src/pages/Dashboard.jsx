import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import VoiceRecorder from '../components/VoiceRecorder';
import QueryHistory from '../components/QueryHistory';
import CropCalendar from '../components/CropCalendar';
import VoiceOnboarding from '../components/VoiceOnboarding';
import FarmerTraining from '../components/FarmerTraining';
import { FaSignOutAlt, FaUser, FaHistory, FaMicrophone, FaCalendarAlt, FaSeedling, FaBookReader } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Dashboard = () => {
  const { currentUser, userData, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('training'); // Start with training tab!
  const [hasCalendar, setHasCalendar] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkForCalendar();
  }, [currentUser]);

  const checkForCalendar = async () => {
    try {
      const calendarDoc = await getDoc(doc(db, 'cropCalendars', currentUser.uid));
      setHasCalendar(calendarDoc.exists());
      
      // Don't auto-show onboarding - let user choose when to create calendar
      // if (!calendarDoc.exists()) {
      //   setShowOnboarding(true);
      // }
    } catch (error) {
      console.error('Error checking calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setHasCalendar(true);
    setActiveTab('calendar');
  };

  // Only show onboarding as modal/overlay, not full screen
  // if (showOnboarding) {
  //   return <VoiceOnboarding onComplete={handleOnboardingComplete} />;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-green-50 via-white to-farm-green-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-farm-green-700">
              آوازِ کسان
            </h1>
            <p className="text-sm text-gray-600">Voice of the Farmer</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-farm-green-700">
                {userData?.name || currentUser?.email}
              </p>
              <p className="text-xs text-gray-500">
                {userData?.language || 'Urdu'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-all"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('training')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 whitespace-nowrap ${
                activeTab === 'training'
                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <FaBookReader className="text-xl" />
              <span className="font-bold">🎓 تربیت و تعلیم</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'border-farm-green-600 text-farm-green-700'
                  : 'border-transparent text-gray-500 hover:text-farm-green-600'
              }`}
            >
              <FaCalendarAlt />
              فصل کیلنڈر
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 whitespace-nowrap ${
                activeTab === 'voice'
                  ? 'border-farm-green-600 text-farm-green-700'
                  : 'border-transparent text-gray-500 hover:text-farm-green-600'
              }`}
            >
              <FaMicrophone />
              سوال پوچھیں
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-farm-green-600 text-farm-green-700'
                  : 'border-transparent text-gray-500 hover:text-farm-green-600'
              }`}
            >
              <FaHistory />
              تاریخ
            </button>
            {!hasCalendar && (
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 whitespace-nowrap bg-green-50 border-green-500 text-green-700 animate-pulse"
              >
                <FaSeedling />
                کیلنڈر بنائیں
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'calendar' && (
            hasCalendar ? (
              <CropCalendar />
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <FaSeedling className="text-6xl text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2" dir="rtl">
                  اپنا فصل کیلنڈر بنائیں
                </h3>
                <p className="text-gray-600 mb-6" dir="rtl">
                  صرف 30 سیکنڈ میں اپنی پوری فصل کا پلان حاصل کریں
                </p>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="px-8 py-4 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-all shadow-lg"
                >
                  🌾 شروع کریں
                </button>
                <div className="mt-8 max-w-md mx-auto text-right">
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✅ 40+ سرگرمیوں کی تفصیل</li>
                    <li>✅ وقت پر آواز میں یاد دہانیاں</li>
                    <li>✅ موسم کی بنیاد پر خودکار تبدیلیاں</li>
                    <li>✅ مارکیٹ کی قیمتوں کی اطلاعات</li>
                    <li>✅ پیداوار کی پیش گوئی</li>
                  </ul>
                </div>
              </div>
            )
          )}
          {activeTab === 'voice' && <VoiceRecorder />}
          {activeTab === 'training' && <FarmerTraining />}
          {activeTab === 'history' && <QueryHistory />}
        </motion.div>
      </main>

      {/* Onboarding Modal Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800" dir="rtl">
                فصل کیلنڈر بنائیں
              </h2>
              <button
                onClick={() => setShowOnboarding(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <VoiceOnboarding onComplete={handleOnboardingComplete} />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="font-semibold text-farm-green-700 mb-2">
                🌦️ Weather Updates
              </h4>
              <p className="text-sm text-gray-600">
                Get real-time weather forecasts
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-farm-green-700 mb-2">
                🌱 Crop Guidance
              </h4>
              <p className="text-sm text-gray-600">
                Expert advice on planting & care
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-farm-green-700 mb-2">
                💰 Market Prices
              </h4>
              <p className="text-sm text-gray-600">
                Latest commodity prices
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">
            © 2025 Awaz-e-Kisan • Built with ❤️ for Pakistani Farmers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
