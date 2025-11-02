import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSeedling,
  FaTint,
  FaFlask,
  FaBug,
  FaTractor,
  FaLeaf,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaCalendarCheck,
  FaSun,
  FaCloudRain,
  FaThermometerHalf,
  FaBell,
  FaChartLine,
  FaCloud,
  FaWind
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const CROP_CALENDARS = {
  wheat: {
    name: 'Wheat / گندم',
    emoji: '🌾',
    variety: 'Faisalabad 2008',
    startDate: '2025-11-05',
    duration: 150,
    expectedYield: '40-45 maund/acre',
    activities: [
      { day: 0, type: 'land_prep', title: 'زمین کی تیاری', titleEn: 'Land Preparation', desc: 'ہل چلائیں اور زمین کو برابر کریں' },
      { day: 2, type: 'seed_sowing', title: 'بیج بوائی', titleEn: 'Seed Sowing', desc: 'تصدیق شدہ بیج استعمال کریں (50 کلو فی ایکڑ)' },
      { day: 7, type: 'fertilizer', title: 'پہلی کھاد', titleEn: 'First Fertilizer', desc: 'DAP 2 بوری فی ایکڑ' },
      { day: 21, type: 'irrigation', title: 'پہلا پانی', titleEn: 'First Irrigation', desc: 'پہلا پانی لگائیں' },
      { day: 35, type: 'fertilizer', title: 'یوریا کھاد', titleEn: 'Urea Application', desc: 'یوریا 1 بوری فی ایکڑ' },
      { day: 42, type: 'irrigation', title: 'دوسرا پانی', titleEn: 'Second Irrigation', desc: 'دوسرا پانی' },
      { day: 60, type: 'pest_check', title: 'کیڑوں کی جانچ', titleEn: 'Pest Check', desc: 'فصل کا معائنہ کریں' },
      { day: 75, type: 'irrigation', title: 'تیسرا پانی', titleEn: 'Third Irrigation', desc: 'تیسرا پانی' },
      { day: 90, type: 'fertilizer', title: 'آخری کھاد', titleEn: 'Final Fertilizer', desc: 'یوریا 1 بوری فی ایکڑ' },
      { day: 120, type: 'irrigation', title: 'آخری پانی', titleEn: 'Final Irrigation', desc: 'کٹائی سے پہلے آخری پانی' },
      { day: 150, type: 'harvest', title: 'کٹائی', titleEn: 'Harvest', desc: 'فصل کاٹیں' },
    ]
  },
  rice: {
    name: 'Rice / چاول',
    emoji: '🌾',
    variety: 'Basmati 385',
    startDate: '2025-11-05',
    duration: 120,
    expectedYield: '25-30 maund/acre',
    activities: [
      { day: 0, type: 'land_prep', title: 'زمین کی تیاری', titleEn: 'Land Preparation', desc: 'زمین کو پانی سے بھریں' },
      { day: 5, type: 'seed_sowing', title: 'شتل لگانا', titleEn: 'Transplanting', desc: 'شتل کی پودے لگائیں (35 دن پرانے)' },
      { day: 15, type: 'fertilizer', title: 'پہلی کھاد', titleEn: 'First Fertilizer', desc: 'یوریا 1 بوری فی ایکڑ' },
      { day: 20, type: 'irrigation', title: 'پانی کی سطح', titleEn: 'Water Level', desc: 'پانی 2-3 انچ رکھیں' },
      { day: 35, type: 'fertilizer', title: 'دوسری کھاد', titleEn: 'Second Fertilizer', desc: 'DAP 1 بوری فی ایکڑ' },
      { day: 50, type: 'pest_check', title: 'کیڑوں کا سپرے', titleEn: 'Pest Spray', desc: 'stem borer سے بچاؤ' },
      { day: 70, type: 'fertilizer', title: 'آخری کھاد', titleEn: 'Final Fertilizer', desc: 'یوریا 1 بوری فی ایکڑ' },
      { day: 90, type: 'irrigation', title: 'پانی بند کریں', titleEn: 'Stop Water', desc: 'کٹائی سے 2 ہفتے پہلے پانی بند' },
      { day: 120, type: 'harvest', title: 'کٹائی', titleEn: 'Harvest', desc: 'چاول کاٹیں' },
    ]
  },
  cotton: {
    name: 'Cotton / کپاس',
    emoji: '🌿',
    variety: 'BT Cotton',
    startDate: '2025-11-05',
    duration: 180,
    expectedYield: '30-35 maund/acre',
    activities: [
      { day: 0, type: 'land_prep', title: 'گہری ہل', titleEn: 'Deep Plowing', desc: 'گہری ہل چلائیں' },
      { day: 3, type: 'seed_sowing', title: 'بیج بوائی', titleEn: 'Seed Sowing', desc: 'BT کپاس کا بیج' },
      { day: 10, type: 'irrigation', title: 'پہلا پانی', titleEn: 'First Irrigation', desc: 'ہلکا پانی' },
      { day: 25, type: 'fertilizer', title: 'پہلی کھاد', titleEn: 'First Fertilizer', desc: 'DAP 2 بوری فی ایکڑ' },
      { day: 40, type: 'pest_check', title: 'کیڑوں کی جانچ', titleEn: 'Pest Check', desc: 'whitefly کی جانچ' },
      { day: 60, type: 'irrigation', title: 'دوسرا پانی', titleEn: 'Second Irrigation', desc: 'باقاعدہ پانی شروع' },
      { day: 80, type: 'fertilizer', title: 'یوریا', titleEn: 'Urea', desc: 'یوریا 2 بوری فی ایکڑ' },
      { day: 100, type: 'pest_spray', title: 'کیڑے مار سپرے', titleEn: 'Pesticide Spray', desc: 'bollworm سپرے' },
      { day: 140, type: 'irrigation', title: 'آخری پانی', titleEn: 'Last Irrigation', desc: 'کٹائی سے پہلے' },
      { day: 180, type: 'harvest', title: 'چنائی', titleEn: 'Picking', desc: 'کپاس کی چنائی' },
    ]
  },
  sugarcane: {
    name: 'Sugarcane / گنا',
    emoji: '🎋',
    variety: 'CPF-246',
    startDate: '2025-11-05',
    duration: 365,
    expectedYield: '500-600 maund/acre',
    activities: [
      { day: 0, type: 'land_prep', title: 'زمین کی تیاری', titleEn: 'Land Preparation', desc: 'گہری ہل اور نالیاں' },
      { day: 5, type: 'seed_sowing', title: 'گنا بوائی', titleEn: 'Planting', desc: 'تین آنکھ والے ٹکڑے' },
      { day: 15, type: 'irrigation', title: 'پہلا پانی', titleEn: 'First Irrigation', desc: 'شروعاتی پانی' },
      { day: 30, type: 'fertilizer', title: 'پہلی کھاد', titleEn: 'First Fertilizer', desc: 'DAP اور یوریا' },
      { day: 60, type: 'irrigation', title: 'باقاعدہ پانی', titleEn: 'Regular Irrigation', desc: '15 دن بعد پانی' },
      { day: 90, type: 'fertilizer', title: 'دوسری کھاد', titleEn: 'Second Fertilizer', desc: 'یوریا' },
      { day: 150, type: 'pest_check', title: 'کیڑوں کی جانچ', titleEn: 'Pest Check', desc: 'borers کی جانچ' },
      { day: 210, type: 'fertilizer', title: 'تیسری کھاد', titleEn: 'Third Fertilizer', desc: 'یوریا' },
      { day: 300, type: 'irrigation', title: 'آخری پانی بند', titleEn: 'Stop Irrigation', desc: 'کٹائی سے پہلے' },
      { day: 365, type: 'harvest', title: 'کٹائی', titleEn: 'Harvest', desc: 'گنا کاٹیں' },
    ]
  },
  maize: {
    name: 'Maize / مکئی',
    emoji: '🌽',
    variety: 'Hybrid Pioneer',
    startDate: '2025-11-05',
    duration: 90,
    expectedYield: '35-40 maund/acre',
    activities: [
      { day: 0, type: 'land_prep', title: 'زمین کی تیاری', titleEn: 'Land Preparation', desc: 'ہل چلائیں' },
      { day: 2, type: 'seed_sowing', title: 'بیج بوائی', titleEn: 'Seed Sowing', desc: 'Hybrid بیج (8 کلو فی ایکڑ)' },
      { day: 10, type: 'irrigation', title: 'پہلا پانی', titleEn: 'First Irrigation', desc: 'ہلکا پانی' },
      { day: 20, type: 'fertilizer', title: 'پہلی کھاد', titleEn: 'First Fertilizer', desc: 'DAP 1 بوری' },
      { day: 35, type: 'irrigation', title: 'دوسرا پانی', titleEn: 'Second Irrigation', desc: 'باقاعدہ پانی' },
      { day: 45, type: 'fertilizer', title: 'یوریا', titleEn: 'Urea', desc: 'یوریا 1 بوری' },
      { day: 60, type: 'pest_check', title: 'کیڑوں کی جانچ', titleEn: 'Pest Check', desc: 'stem borer جانچ' },
      { day: 75, type: 'irrigation', title: 'آخری پانی', titleEn: 'Last Irrigation', desc: 'آخری پانی' },
      { day: 90, type: 'harvest', title: 'کٹائی', titleEn: 'Harvest', desc: 'مکئی کاٹیں' },
    ]
  },
  vegetables: {
    name: 'Vegetables / سبزیاں',
    emoji: '🥬',
    variety: 'Mixed Vegetables',
    startDate: '2025-11-05',
    duration: 60,
    expectedYield: '50-60 maund/acre',
    activities: [
      { day: 0, type: 'land_prep', title: 'زمین تیار کریں', titleEn: 'Prepare Beds', desc: 'کیاریاں بنائیں' },
      { day: 2, type: 'seed_sowing', title: 'بیج/شتل', titleEn: 'Seeds/Transplant', desc: 'سبزیوں کے بیج' },
      { day: 7, type: 'irrigation', title: 'روزانہ پانی', titleEn: 'Daily Water', desc: 'ہلکا پانی روز' },
      { day: 15, type: 'fertilizer', title: 'نامیاتی کھاد', titleEn: 'Organic Fertilizer', desc: 'گوبر کی کھاد' },
      { day: 25, type: 'pest_check', title: 'کیڑوں کا سپرے', titleEn: 'Pest Spray', desc: 'نیم کا سپرے' },
      { day: 40, type: 'fertilizer', title: 'مائع کھاد', titleEn: 'Liquid Fertilizer', desc: 'NPK سپرے' },
      { day: 60, type: 'harvest', title: 'تڑائی', titleEn: 'Harvest', desc: 'سبزیاں توڑیں' },
    ]
  }
};

const CropCalendar = () => {
  const [farmerData, setFarmerData] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    farmerName: '',
    location: '',
    acres: '',
    crop: 'wheat'
  });
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [currentMonth, setCurrentMonth] = useState(new Date('2025-11-05'));
  const [completedActivities, setCompletedActivities] = useState([]);
  const [notes, setNotes] = useState({});
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState({ day: null, text: '' });
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const cropData = CROP_CALENDARS[selectedCrop];

  // Fetch real-time weather data from OpenMeteo API
  useEffect(() => {
    const fetchWeather = async () => {
      if (!farmerData?.location) return;
      
      setWeatherLoading(true);
      try {
        // Default to Pakistan coordinates (Faisalabad)
        // In production, you'd geocode the location first
        const latitude = 31.4504; // Faisalabad, Pakistan
        const longitude = 73.1350;
        
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Karachi`
        );
        
        const data = await response.json();
        
        if (data.current) {
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            precipitation: data.current.precipitation,
            weatherCode: data.current.weather_code,
            windSpeed: data.current.wind_speed_10m,
            maxTemp: Math.round(data.daily.temperature_2m_max[0]),
            minTemp: Math.round(data.daily.temperature_2m_min[0]),
            rainChance: data.daily.precipitation_probability_max[0] || 0
          });
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
        toast.error('موسم کی معلومات نہیں مل سکیں');
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [farmerData]);

  // Get weather description from WMO code
  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: { en: 'Clear sky', ur: 'صاف آسمان', icon: <FaSun /> },
      1: { en: 'Mainly clear', ur: 'زیادہ تر صاف', icon: <FaSun /> },
      2: { en: 'Partly cloudy', ur: 'جزوی ابر آلود', icon: <FaCloud /> },
      3: { en: 'Overcast', ur: 'مکمل ابر آلود', icon: <FaCloud /> },
      45: { en: 'Foggy', ur: 'دھند', icon: <FaCloud /> },
      48: { en: 'Foggy', ur: 'دھند', icon: <FaCloud /> },
      51: { en: 'Light drizzle', ur: 'ہلکی بارش', icon: <FaCloudRain /> },
      53: { en: 'Drizzle', ur: 'بوندا باندی', icon: <FaCloudRain /> },
      55: { en: 'Heavy drizzle', ur: 'تیز بوندا باندی', icon: <FaCloudRain /> },
      61: { en: 'Light rain', ur: 'ہلکی بارش', icon: <FaCloudRain /> },
      63: { en: 'Moderate rain', ur: 'بارش', icon: <FaCloudRain /> },
      65: { en: 'Heavy rain', ur: 'تیز بارش', icon: <FaCloudRain /> },
      80: { en: 'Rain showers', ur: 'بارش کی پھوار', icon: <FaCloudRain /> },
      95: { en: 'Thunderstorm', ur: 'آندھی', icon: <FaCloudRain /> },
    };
    return weatherCodes[code] || { en: 'Clear', ur: 'صاف', icon: <FaSun /> };
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.farmerName || !formData.location || !formData.acres) {
      toast.error('براہ کرم تمام خانے بھریں / Please fill all fields');
      return;
    }
    setFarmerData(formData);
    setSelectedCrop(formData.crop);
    setShowForm(false);
    toast.success('کیلنڈر تیار ہو گیا! 🎉');
  };

  const handleEditDetails = () => {
    setShowForm(true);
  };

  const getActivitiesForDate = (date) => {
    const startDate = new Date(cropData.startDate);
    const daysDiff = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    return cropData.activities.filter(activity => activity.day === daysDiff);
  };

  const isActivityCompleted = (day) => {
    return completedActivities.includes(`${selectedCrop}-${day}`);
  };

  const toggleActivity = (day) => {
    const activityId = `${selectedCrop}-${day}`;
    if (completedActivities.includes(activityId)) {
      setCompletedActivities(completedActivities.filter(id => id !== activityId));
      toast.success('مکمل سے ہٹا دیا');
    } else {
      setCompletedActivities([...completedActivities, activityId]);
      toast.success('✓ مکمل ہو گیا!');
    }
  };

  const addNote = (day, text) => {
    setNotes({ ...notes, [`${selectedCrop}-${day}`]: text });
    setShowNoteModal(false);
    setCurrentNote({ day: null, text: '' });
    toast.success('نوٹ محفوظ ہو گیا 📝');
  };

  const getMonthCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const activityIcons = {
    land_prep: <FaTractor className="text-brown-600" />,
    seed_sowing: <FaSeedling className="text-green-600" />,
    irrigation: <FaTint className="text-blue-600" />,
    fertilizer: <FaFlask className="text-purple-600" />,
    pest_check: <FaBug className="text-orange-600" />,
    pest_spray: <FaBug className="text-red-600" />,
    weeding: <FaLeaf className="text-yellow-600" />,
    harvest: <FaTractor className="text-green-800" />,
  };

  const calculateProgress = () => {
    const total = cropData.activities.length;
    const completed = cropData.activities.filter(a => isActivityCompleted(a.day)).length;
    return Math.round((completed / total) * 100);
  };

  const monthCalendar = getMonthCalendar();
  const weeks = [];
  for (let i = 0; i < monthCalendar.length; i += 7) {
    weeks.push(monthCalendar.slice(i, i + 7));
  }

  if (showForm) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-farm-green-400 to-farm-green-600 rounded-full mb-4">
              <FaSeedling className="text-5xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2" dir="rtl">
              اپنی فصل کی تفصیلات درج کریں
            </h2>
            <p className="text-gray-600">Enter Your Crop Details</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block text-right text-gray-700 font-bold mb-2" dir="rtl">
                کسان کا نام / Farmer Name
              </label>
              <input
                type="text"
                value={formData.farmerName}
                onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-farm-green-500 focus:outline-none text-right"
                placeholder="مثال: محمد احمد"
                dir="rtl"
                required
              />
            </div>

            <div>
              <label className="block text-right text-gray-700 font-bold mb-2" dir="rtl">
                مقام / Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-farm-green-500 focus:outline-none text-right"
                placeholder="مثال: فیصل آباد، پنجاب"
                dir="rtl"
                required
              />
            </div>

            <div>
              <label className="block text-right text-gray-700 font-bold mb-2" dir="rtl">
                رقبہ (ایکڑ میں) / Area in Acres
              </label>
              <input
                type="number"
                value={formData.acres}
                onChange={(e) => setFormData({ ...formData, acres: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-farm-green-500 focus:outline-none text-right"
                placeholder="مثال: 10"
                dir="rtl"
                required
                min="0.5"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-right text-gray-700 font-bold mb-2" dir="rtl">
                فصل کا انتخاب / Select Crop
              </label>
              <select
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-farm-green-500 focus:outline-none text-right"
                dir="rtl"
                required
              >
                {Object.keys(CROP_CALENDARS).map((crop) => (
                  <option key={crop} value={crop}>
                    {CROP_CALENDARS[crop].emoji} {CROP_CALENDARS[crop].name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-farm-green-500 to-farm-green-600 text-white font-bold rounded-xl hover:from-farm-green-600 hover:to-farm-green-700 transition-all shadow-lg text-lg"
            >
              🌾 کیلنڈر بنائیں / Create Calendar
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Farmer Details Card */}
      {farmerData && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-farm-green-600 to-farm-green-700 text-white rounded-2xl p-6 mb-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-5xl">{CROP_CALENDARS[selectedCrop].emoji}</div>
              <div>
                <h2 className="text-2xl font-bold">{farmerData.farmerName}</h2>
                <div className="flex items-center gap-2 text-farm-green-100">
                  <FaMapMarkerAlt />
                  <span>{farmerData.location}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleEditDetails}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-all"
            >
              <FaEdit />
              <span>ترمیم</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaSeedling />
                <p className="text-sm opacity-80">Crop / فصل</p>
              </div>
              <p className="text-xl font-bold">{cropData.name.split('/')[0]}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaRulerCombined />
                <p className="text-sm opacity-80">Area / رقبہ</p>
              </div>
              <p className="text-xl font-bold">{farmerData.acres} acres</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaCalendarCheck />
                <p className="text-sm opacity-80">Duration / مدت</p>
              </div>
              <p className="text-xl font-bold">{cropData.duration} days</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaChartLine />
                <p className="text-sm opacity-80">Expected Yield</p>
              </div>
              <p className="text-xl font-bold">{cropData.expectedYield}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">پیش رفت / Progress</span>
              <span className="text-lg font-bold">{calculateProgress()}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-yellow-400 to-green-400"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Crop Selector */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-farm-green-800 mb-4" dir="rtl">
          🌾 فصل کا کیلنڈر / Crop Calendar
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.keys(CROP_CALENDARS).map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`p-4 rounded-xl font-bold transition-all ${
                selectedCrop === crop
                  ? 'bg-gradient-to-r from-farm-green-500 to-farm-green-600 text-white shadow-lg scale-105'
                  : 'bg-white text-farm-green-700 hover:bg-farm-green-50 border-2 border-farm-green-200'
              }`}
            >
              <div className="text-2xl mb-1">{CROP_CALENDARS[crop].emoji}</div>
              <div className="text-sm" dir="rtl">{CROP_CALENDARS[crop].name.split('/')[1]}</div>
              <div className="text-xs text-gray-600">{CROP_CALENDARS[crop].name.split('/')[0]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Weather Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaSun className="text-2xl" />
                <span className="text-sm opacity-90">Today's Weather</span>
              </div>
              <p className="text-3xl font-bold">28°C</p>
              <p className="text-sm opacity-90">Sunny & Clear</p>
            </div>
            <FaSun className="text-6xl opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaCloudRain className="text-2xl" />
                <span className="text-sm opacity-90">Rainfall</span>
              </div>
              <p className="text-3xl font-bold">5%</p>
              <p className="text-sm opacity-90">Chance of rain</p>
            </div>
            <FaCloudRain className="text-6xl opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaThermometerHalf className="text-2xl" />
                <span className="text-sm opacity-90">Temperature</span>
              </div>
              <p className="text-3xl font-bold">Max 32°C</p>
              <p className="text-sm opacity-90">Min 20°C</p>
            </div>
            <FaThermometerHalf className="text-6xl opacity-30" />
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex items-center justify-between">
        <button
          onClick={() => {
            const newMonth = new Date(currentMonth);
            newMonth.setMonth(newMonth.getMonth() - 1);
            setCurrentMonth(newMonth);
          }}
          className="px-4 py-2 bg-farm-green-100 hover:bg-farm-green-200 rounded-lg font-bold transition-all"
        >
          ← Previous
        </button>
        <h3 className="text-2xl font-bold text-farm-green-800">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => {
            const newMonth = new Date(currentMonth);
            newMonth.setMonth(newMonth.getMonth() + 1);
            setCurrentMonth(newMonth);
          }}
          className="px-4 py-2 bg-farm-green-100 hover:bg-farm-green-200 rounded-lg font-bold transition-all"
        >
          Next →
        </button>
      </div>

      {/* Calendar Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
        <div className="grid grid-cols-7 bg-farm-green-600 text-white">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center font-bold border-r border-farm-green-500 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
              {week.map((date, dayIndex) => {
                if (!date) {
                  return <div key={dayIndex} className="p-2 min-h-24 bg-gray-50 border-r border-gray-200"></div>;
                }

                const activities = getActivitiesForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const startDate = new Date(cropData.startDate);
                const isInCropPeriod = date >= startDate && date <= new Date(startDate.getTime() + cropData.duration * 24 * 60 * 60 * 1000);

                return (
                  <div
                    key={dayIndex}
                    className={`p-2 min-h-24 border-r border-gray-200 last:border-r-0 ${
                      isToday ? 'bg-yellow-50 border-2 border-yellow-400' : ''
                    } ${isInCropPeriod ? 'bg-green-50' : 'bg-white'}`}
                  >
                    <div className={`text-sm font-bold mb-1 ${isToday ? 'text-yellow-600' : 'text-gray-700'}`}>
                      {date.getDate()}
                    </div>

                    {activities.length > 0 && (
                      <div className="space-y-1">
                        {activities.map((activity, idx) => {
                          const isCompleted = isActivityCompleted(activity.day);
                          const noteKey = `${selectedCrop}-${activity.day}`;
                          const hasNote = notes[noteKey];
                          
                          return (
                            <motion.div
                              key={idx}
                              whileHover={{ scale: 1.05 }}
                              className={`p-2 rounded-lg text-xs cursor-pointer transition-all ${
                                isCompleted
                                  ? 'bg-green-200 border-2 border-green-500'
                                  : 'bg-white border-2 border-farm-green-300 hover:bg-farm-green-50'
                              }`}
                            >
                              <div 
                                onClick={() => toggleActivity(activity.day)}
                                className="flex items-center gap-1 mb-1"
                              >
                                {activityIcons[activity.type]}
                                {isCompleted && <FaCheckCircle className="text-green-600 text-xs" />}
                                {hasNote && <FaBell className="text-blue-600 text-xs" />}
                              </div>
                              <div className="font-bold text-gray-800" dir="rtl">
                                {activity.title}
                              </div>
                              <div className="text-gray-600">
                                {activity.titleEn}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentNote({ day: activity.day, text: notes[noteKey] || '' });
                                  setShowNoteModal(true);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                              >
                                {hasNote ? '✏️ Edit Note' : '📝 Add Note'}
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-farm-green-800 mb-4" dir="rtl">
          📋 تمام سرگرمیاں / All Activities
        </h3>
        <div className="space-y-3">
          {cropData.activities.map((activity, index) => {
            const activityDate = new Date(cropData.startDate);
            activityDate.setDate(activityDate.getDate() + activity.day);
            const isCompleted = isActivityCompleted(activity.day);
            const isPast = activityDate < new Date();
            const noteKey = `${selectedCrop}-${activity.day}`;
            const hasNote = notes[noteKey];

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.01 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isCompleted
                    ? 'bg-green-50 border-green-500'
                    : isPast
                    ? 'bg-red-50 border-red-300'
                    : 'bg-white border-farm-green-300 hover:bg-farm-green-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    onClick={() => toggleActivity(activity.day)}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="text-2xl">
                      {activityIcons[activity.type]}
                    </div>
                    <div>
                      <div className="font-bold text-lg" dir="rtl">
                        {activity.title}
                      </div>
                      <div className="text-gray-600">
                        {activity.titleEn}
                      </div>
                      <div className="text-sm text-gray-500" dir="rtl">
                        {activity.desc}
                      </div>
                      {hasNote && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                          📝 {notes[noteKey]}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-farm-green-700">
                      Day {activity.day}
                    </div>
                    <div className="text-sm text-gray-600">
                      {activityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    {isCompleted ? (
                      <FaCheckCircle className="text-green-600 text-2xl mt-2" />
                    ) : isPast ? (
                      <FaClock className="text-red-600 text-2xl mt-2" />
                    ) : (
                      <FaClock className="text-gray-400 text-2xl mt-2" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentNote({ day: activity.day, text: notes[noteKey] || '' });
                        setShowNoteModal(true);
                      }}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      {hasNote ? '✏️ Edit' : '📝 Note'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Note Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowNoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4" dir="rtl">
                نوٹ شامل کریں / Add Note
              </h3>
              <textarea
                value={currentNote.text}
                onChange={(e) => setCurrentNote({ ...currentNote, text: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-farm-green-500 focus:outline-none resize-none"
                rows="4"
                placeholder="اپنا نوٹ یہاں لکھیں..."
                dir="rtl"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => addNote(currentNote.day, currentNote.text)}
                  className="flex-1 py-3 bg-farm-green-500 text-white font-bold rounded-xl hover:bg-farm-green-600 transition-all"
                >
                  محفوظ کریں / Save
                </button>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
                >
                  منسوخ / Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CropCalendar;
