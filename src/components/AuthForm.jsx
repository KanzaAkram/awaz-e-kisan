import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('urdu');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name, language);
      }
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

        {/* Toggle Login/Signup */}
        <div className="flex gap-2 mb-6 bg-farm-green-100 rounded-full p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-full font-semibold transition-all ${
              isLogin
                ? 'bg-farm-green-600 text-white shadow-lg'
                : 'text-farm-green-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-full font-semibold transition-all ${
              !isLogin
                ? 'bg-farm-green-600 text-white shadow-lg'
                : 'text-farm-green-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name / نام
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-farm-green-500 focus:ring-2 focus:ring-farm-green-200 outline-none transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language / زبان
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-farm-green-500 focus:ring-2 focus:ring-farm-green-200 outline-none transition-all"
                >
                  <option value="urdu">اردو (Urdu)</option>
                  <option value="punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                  <option value="sindhi">سنڌي (Sindhi)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email / ای میل
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-farm-green-500 focus:ring-2 focus:ring-farm-green-200 outline-none transition-all"
              placeholder="farmer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password / پاس ورڈ
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-farm-green-500 focus:ring-2 focus:ring-farm-green-200 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-farm-green-600 hover:bg-farm-green-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Please wait...' : isLogin ? '🚜 Login' : '🌱 Create Account'}
          </motion.button>
        </form>

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
