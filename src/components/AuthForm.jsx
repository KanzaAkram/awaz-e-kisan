import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const AuthForm = () => {
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌾</div>
          <h1 className="text-4xl font-bold text-farm-green-700 mb-2">
            آوازِ کسان
          </h1>
          <p className="text-lg text-farm-green-600 urdu-text">
            کسانوں کی آواز، کھیتوں کی ترقی
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Voice of the Farmer
          </p>
        </div>

        {/* Simple Description */}
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-2">
            🎤 Ask farming questions in your voice
          </p>
          <p className="text-gray-600 mb-2">
            🤖 Get AI-powered answers instantly
          </p>
          <p className="text-gray-600">
            🔊 Listen to responses in your language
          </p>
        </div>

        {/* Google Sign-In Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 px-6 bg-white border-2 border-gray-300 hover:border-farm-green-500 hover:shadow-lg text-gray-700 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-farm-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="group-hover:text-farm-green-700">Continue with Google</span>
            </>
          )}
        </motion.button>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          We use Google Sign-In for secure authentication. Your farming data stays private.
        </p>

        {/* Features */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">
            Get instant answers about:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['🌦️ Weather', '🌱 Crops', '💰 Prices', '🌿 Sustainability'].map((feature) => (
              <span
                key={feature}
                className="px-3 py-1 bg-farm-green-50 text-farm-green-700 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;
