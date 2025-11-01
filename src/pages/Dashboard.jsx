import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import VoiceRecorder from '../components/VoiceRecorder';
import QueryHistory from '../components/QueryHistory';
import { FaSignOutAlt, FaUser, FaHistory, FaMicrophone } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { currentUser, userData, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('voice');

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
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 ${
                activeTab === 'voice'
                  ? 'border-farm-green-600 text-farm-green-700'
                  : 'border-transparent text-gray-500 hover:text-farm-green-600'
              }`}
            >
              <FaMicrophone />
              Ask Question
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 ${
                activeTab === 'history'
                  ? 'border-farm-green-600 text-farm-green-700'
                  : 'border-transparent text-gray-500 hover:text-farm-green-600'
              }`}
            >
              <FaHistory />
              History
            </button>
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
          {activeTab === 'voice' && <VoiceRecorder />}
          {activeTab === 'history' && <QueryHistory />}
        </motion.div>
      </main>

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
