import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaMicrophone, 
  FaCloudSun, 
  FaChartLine, 
  FaSeedling, 
  FaComments,
  FaShieldAlt,
  FaArrowRight,
  FaLeaf,
  FaUsers,
  FaCheckCircle,
  FaTractor,
  FaLightbulb,
  FaGlobeAsia,
  FaMobileAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <FaMicrophone className="text-5xl" />,
      title: 'Voice Queries',
      titleUrdu: 'آواز سے سوال',
      description: 'Ask farming questions in your native language using voice',
      descUrdu: 'اپنی زبان میں آواز سے کاشتکاری کے سوالات پوچھیں',
      color: 'from-green-400 to-green-600',
      link: '/dashboard'
    },
    {
      icon: <FaCloudSun className="text-5xl" />,
      title: 'Weather Updates',
      titleUrdu: 'موسم کی معلومات',
      description: 'Real-time weather forecasts and farming calendars',
      descUrdu: 'حقیقی وقت میں موسم کی پیشن گوئی اور کاشتکاری کیلنڈر',
      color: 'from-blue-400 to-blue-600',
      link: '/dashboard'
    },
    {
      icon: <FaChartLine className="text-5xl" />,
      title: 'Market Prices',
      titleUrdu: 'مارکیٹ کی قیمتیں',
      description: 'Latest commodity prices and market trends',
      descUrdu: 'تازہ ترین اجناس کی قیمتیں اور مارکیٹ کے رجحانات',
      color: 'from-yellow-400 to-orange-600',
      link: '/dashboard'
    },
    {
      icon: <FaSeedling className="text-5xl" />,
      title: 'Crop Guidance',
      titleUrdu: 'فصل کی رہنمائی',
      description: 'Expert advice on planting, growing, and harvesting',
      descUrdu: 'بیج بونے، اگانے اور کاٹنے کے بارے میں ماہرانہ مشورہ',
      color: 'from-emerald-400 to-teal-600',
      link: '/dashboard'
    },
    {
      icon: <FaComments className="text-5xl" />,
      title: 'Multilingual Support',
      titleUrdu: 'کثیر لسانی معاونت',
      description: 'Speak in Urdu, Punjabi, or Sindhi - we understand all',
      descUrdu: 'اردو، پنجابی، یا سندھی میں بات کریں - ہم سب سمجھتے ہیں',
      color: 'from-purple-400 to-pink-600',
      link: '/dashboard'
    },
    {
      icon: <FaShieldAlt className="text-5xl" />,
      title: 'Secure & Private',
      titleUrdu: 'محفوظ اور نجی',
      description: 'Your data is encrypted and stored securely',
      descUrdu: 'آپ کا ڈیٹا خفیہ اور محفوظ طریقے سے محفوظ ہے',
      color: 'from-indigo-400 to-blue-600',
      link: '/dashboard'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <FaLeaf className="text-3xl text-farm-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-farm-green-800">آوازِ کسان</h1>
                <p className="text-xs text-gray-600">Awaz-e-Kisan</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-700 hover:text-farm-green-600 font-medium transition">Features</a>
              <a href="#training" className="text-blue-700 hover:text-blue-800 font-bold transition flex items-center gap-1">
                🎓 Training
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-farm-green-600 font-medium transition">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-farm-green-600 font-medium transition">Testimonials</a>
              <Link to="/login" className="px-6 py-2 bg-farm-green-600 text-white rounded-full font-semibold hover:bg-farm-green-700 transition">
                Login
              </Link>
              <Link to="/dashboard" className="px-6 py-2 border-2 border-farm-green-600 text-farm-green-600 rounded-full font-semibold hover:bg-farm-green-50 transition">
                Try Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-2xl text-farm-green-600"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-4 pb-4 space-y-3"
            >
              <a href="#features" className="block text-gray-700 hover:text-farm-green-600 font-medium">Features</a>
              <a href="#training" className="block text-blue-700 hover:text-blue-800 font-bold">🎓 Training & Education</a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-farm-green-600 font-medium">How It Works</a>
              <a href="#testimonials" className="block text-gray-700 hover:text-farm-green-600 font-medium">Testimonials</a>
              <Link to="/login" className="block w-full text-center px-6 py-2 bg-farm-green-600 text-white rounded-full font-semibold">
                Login
              </Link>
              <Link to="/dashboard" className="block w-full text-center px-6 py-2 border-2 border-farm-green-600 text-farm-green-600 rounded-full font-semibold">
                Try Now
              </Link>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-r from-farm-green-600 to-farm-green-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Animated Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-20 left-10 text-6xl opacity-20"
          >
            🌾
          </motion.div>
          <motion.div
            animate={{ y: [0, -30, 0], x: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-40 right-20 text-5xl opacity-20"
          >
            🌱
          </motion.div>
          <motion.div
            animate={{ y: [0, -25, 0], x: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
            className="absolute bottom-20 left-1/4 text-7xl opacity-20"
          >
            🚜
          </motion.div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <FaLeaf className="text-7xl mx-auto mb-4" />
            <h1 className="text-6xl font-bold mb-4">
              آوازِ کسان
            </h1>
            <p className="text-3xl font-semibold mb-2">
              Awaz-e-Kisan
            </p>
            <p className="text-xl text-green-100">
              Voice of the Farmer • کسان کی آواز
            </p>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Your intelligent farming assistant powered by AI.
            <br />
            <span className="text-green-100">
              کسانوں کے لیے AI سے چلنے والا ذہین مددگار
            </span>
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-farm-green-700 rounded-full font-bold text-lg hover:bg-green-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
              <FaArrowRight />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-farm-green-700 text-white rounded-full font-bold text-lg hover:bg-farm-green-800 transition-all shadow-lg border-2 border-white hover:shadow-xl transform hover:scale-105"
            >
              <FaMicrophone />
              Try Now
            </Link>
          </motion.div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249, 250, 251)"/>
          </svg>
        </div>
      </header>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 -mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: <FaUsers />, number: '10K+', label: 'Active Farmers', labelUrdu: 'فعال کسان' },
            { icon: <FaComments />, number: '50K+', label: 'Queries Answered', labelUrdu: 'سوالات کے جوابات' },
            { icon: <FaGlobeAsia />, number: '3', label: 'Languages', labelUrdu: 'زبانیں' },
            { icon: <FaCheckCircle />, number: '98%', label: 'Satisfaction', labelUrdu: 'اطمینان' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center"
            >
              <div className="text-4xl text-farm-green-600 mb-2 flex justify-center">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-farm-green-800 mb-1">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
              <div className="text-sm text-gray-500 urdu-text">
                {stat.labelUrdu}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-farm-green-800 mb-4">
            Features • خصوصیات
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to make informed farming decisions
            <br />
            <span className="urdu-text">وہ سب کچھ جو آپ کو باخبر کاشتکاری کے فیصلے کرنے کی ضرورت ہے</span>
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Link to={feature.link}>
                <div className={`relative overflow-hidden bg-gradient-to-br ${feature.color} rounded-3xl shadow-xl p-8 h-full text-white transition-all duration-300 hover:shadow-2xl`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                  </div>

                  <div className="relative">
                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xl urdu-text font-semibold mb-3 opacity-90">
                      {feature.titleUrdu}
                    </p>
                    
                    <p className="text-white/90 mb-2">
                      {feature.description}
                    </p>
                    <p className="text-sm text-white/80 urdu-text leading-relaxed">
                      {feature.descUrdu}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn More <FaArrowRight className="transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gradient-to-r from-farm-green-100 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-farm-green-800 mb-4">
              How It Works • یہ کیسے کام کرتا ہے
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Speak',
                titleUrdu: 'بولیں',
                desc: 'Ask your question in Urdu, Punjabi, or Sindhi',
                descUrdu: 'اردو، پنجابی، یا سندھی میں اپنا سوال پوچھیں'
              },
              {
                step: '2',
                title: 'AI Processes',
                titleUrdu: 'AI پروسیس کرتا ہے',
                desc: 'Our AI understands and finds the best answer',
                descUrdu: 'ہماری AI سمجھتی ہے اور بہترین جواب تلاش کرتی ہے'
              },
              {
                step: '3',
                title: 'Listen',
                titleUrdu: 'سنیں',
                desc: 'Get voice response in your language',
                descUrdu: 'اپنی زبان میں آواز کا جواب حاصل کریں'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-farm-green-500 to-farm-green-700 text-white text-3xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-farm-green-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-xl urdu-text font-semibold text-farm-green-600 mb-3">
                  {item.titleUrdu}
                </p>
                <p className="text-gray-600 mb-2">
                  {item.desc}
                </p>
                <p className="text-sm urdu-text text-gray-500">
                  {item.descUrdu}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Training & Education Section */}
      <section id="training" className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Floating Icons */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-10 right-10 text-7xl opacity-20"
        >
          🎓
        </motion.div>
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-10 left-10 text-6xl opacity-20"
        >
          📚
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-4">
              <span className="text-white font-semibold">🎙️ NEW FEATURE</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              🎓 AI Training & Education Center
            </h2>
            <p className="text-2xl urdu-text font-bold text-blue-100 mb-4">
              کسانوں کا تربیتی مرکز
            </p>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Learn modern farming techniques through AI-generated podcasts in Urdu
              <br />
              <span className="urdu-text">اردو میں AI سے بنے پوڈکاسٹ کے ذریعے جدید کاشتکاری سیکھیں</span>
            </p>
          </motion.div>

          {/* Training Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: '🌿',
                title: 'Organic Farming',
                titleUrdu: 'نامیاتی کاشتکاری',
                desc: 'Natural farming methods',
                color: 'from-green-400 to-green-600'
              },
              {
                icon: '🔄',
                title: 'Crop Rotation',
                titleUrdu: 'فصلوں کی تبدیلی',
                desc: 'Improve soil fertility',
                color: 'from-blue-400 to-blue-600'
              },
              {
                icon: '🌦️',
                title: 'Climate-Smart',
                titleUrdu: 'موسمی تبدیلی',
                desc: 'Adapt to weather changes',
                color: 'from-orange-400 to-orange-600'
              },
              {
                icon: '💚',
                title: 'Fertilizer Use',
                titleUrdu: 'کھاد کا استعمال',
                desc: 'Maximize crop yield',
                color: 'from-purple-400 to-purple-600'
              },
              {
                icon: '💧',
                title: 'Water Management',
                titleUrdu: 'پانی کا استعمال',
                desc: 'Save water efficiently',
                color: 'from-cyan-400 to-cyan-600'
              },
              {
                icon: '🌾',
                title: 'Wheat Farming',
                titleUrdu: 'گندم کی کاشت',
                desc: 'Expert wheat techniques',
                color: 'from-yellow-400 to-yellow-600'
              }
            ].map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`bg-gradient-to-br ${topic.color} rounded-xl shadow-lg p-6 text-white cursor-pointer group`}
              >
                <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">
                  {topic.icon}
                </div>
                <h3 className="text-xl font-bold mb-1">{topic.title}</h3>
                <p className="text-lg urdu-text font-semibold mb-2 opacity-90">
                  {topic.titleUrdu}
                </p>
                <p className="text-sm text-white/80">{topic.desc}</p>
                <div className="mt-3 flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Listen Now <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8"
          >
            <h3 className="text-3xl font-bold text-white text-center mb-8">
              What You'll Learn • آپ کیا سیکھیں گے
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: '🎧', text: 'AI-generated podcasts in Urdu', textUrdu: 'اردو میں AI سے بنے پوڈکاسٹ' },
                { icon: '🗣️', text: 'Ask any farming question', textUrdu: 'کوئی بھی کاشتکاری کا سوال پوچھیں' },
                { icon: '📖', text: 'Read text or listen to audio', textUrdu: 'متن پڑھیں یا آڈیو سنیں' },
                { icon: '💾', text: 'Save & replay anytime', textUrdu: 'محفوظ کریں اور کبھی بھی دوبارہ سنیں' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 bg-white/10 rounded-xl p-4"
                >
                  <div className="text-4xl">{feature.icon}</div>
                  <div>
                    <p className="text-white font-semibold">{feature.text}</p>
                    <p className="text-blue-200 urdu-text text-sm">{feature.textUrdu}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-700 rounded-full font-bold text-xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <span className="text-3xl">🎓</span>
              Start Learning Now
              <FaArrowRight />
            </Link>
            <p className="mt-4 text-blue-200 urdu-text text-lg">
              ابھی سیکھنا شروع کریں - بالکل مفت!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-farm-green-800 mb-4">
            What Farmers Say • کسان کیا کہتے ہیں
          </h2>
          <p className="text-xl text-gray-600">
            Real stories from real farmers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'محمد علی',
              nameEn: 'Muhammad Ali',
              location: 'Punjab',
              image: '👨‍🌾',
              rating: 5,
              text: 'This app has transformed my farming. Now I get instant answers to all my questions in Punjabi!',
              textUrdu: 'اس ایپ نے میری کاشتکاری کو بدل دیا ہے۔ اب مجھے پنجابی میں اپنے تمام سوالوں کے فوری جوابات مل جاتے ہیں!'
            },
            {
              name: 'فاطمہ بی بی',
              nameEn: 'Fatima Bibi',
              location: 'Sindh',
              image: '👩‍🌾',
              rating: 5,
              text: 'Voice feature is amazing! I can ask questions while working in the field.',
              textUrdu: 'آواز کی خصوصیت حیرت انگیز ہے! میں کھیت میں کام کرتے ہوئے سوال پوچھ سکتی ہوں۔'
            },
            {
              name: 'احمد خان',
              nameEn: 'Ahmed Khan',
              location: 'KPK',
              image: '🧑‍🌾',
              rating: 5,
              text: 'Market prices and weather updates help me make better decisions for my crops.',
              textUrdu: 'مارکیٹ کی قیمتیں اور موسم کی اپ ڈیٹس میری فصلوں کے لیے بہتر فیصلے کرنے میں مدد کرتی ہیں۔'
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">
                  {testimonial.image}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-farm-green-800 urdu-text">
                    {testimonial.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {testimonial.nameEn} • {testimonial.location}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-3 italic">
                "{testimonial.text}"
              </p>
              <p className="text-gray-600 text-sm urdu-text leading-relaxed">
                "{testimonial.textUrdu}"
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-farm-green-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-farm-green-800 mb-4">
              Why Choose Us • ہمیں کیوں چنیں
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <FaMobileAlt className="text-4xl" />,
                title: 'Works Offline',
                titleUrdu: 'آف لائن کام کرتا ہے',
                desc: 'Access basic features even without internet'
              },
              {
                icon: <FaTractor className="text-4xl" />,
                title: 'Practical Advice',
                titleUrdu: 'عملی مشورہ',
                desc: 'Real farming solutions, not just theory'
              },
              {
                icon: <FaLightbulb className="text-4xl" />,
                title: 'AI-Powered',
                titleUrdu: 'AI سے چلنے والا',
                desc: 'Latest technology for better answers'
              },
              {
                icon: <FaShieldAlt className="text-4xl" />,
                title: 'Free to Use',
                titleUrdu: 'استعمال کرنے کے لیے مفت',
                desc: 'No hidden charges, completely free'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-farm-green-600 flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-farm-green-800 mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-lg urdu-text font-semibold text-farm-green-600 mb-2">
                    {benefit.titleUrdu}
                  </p>
                  <p className="text-gray-600">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-farm-green-600 to-farm-green-800 rounded-3xl p-12 text-center text-white shadow-2xl"
        >
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-2xl urdu-text mb-6">
            کیا آپ اپنی کاشتکاری کو تبدیل کرنے کے لیے تیار ہیں؟
          </p>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of farmers already using Awaz-e-Kisan
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-farm-green-700 rounded-full font-bold text-xl hover:bg-green-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Start Now • ابھی شروع کریں
            <FaArrowRight />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-farm-green-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">آوازِ کسان</h3>
              <p className="text-green-200">
                Empowering Pakistani farmers with AI-driven insights and support.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-green-200 hover:text-white transition">Dashboard</Link></li>
                <li><Link to="/login" className="text-green-200 hover:text-white transition">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact</h4>
              <p className="text-green-200">
                Built with ❤️ for Pakistani Farmers
              </p>
            </div>
          </div>
          <div className="border-t border-green-700 pt-8 text-center text-green-200">
            <p>© 2025 Awaz-e-Kisan • All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
