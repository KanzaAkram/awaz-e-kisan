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

// Crop varieties for each crop type
const CROP_VARIETIES = {
  wheat: [
    { name: 'Faisalabad 2008', yield: '40-45 maund/acre', duration: 150, urdu: 'فیصل آباد 2008' },
    { name: 'Punjab 2016', yield: '38-42 maund/acre', duration: 145, urdu: 'پنجاب 2016' },
    { name: 'Akbar 2019', yield: '42-48 maund/acre', duration: 155, urdu: 'اکبر 2019' },
    { name: 'Galaxy 2013', yield: '36-40 maund/acre', duration: 140, urdu: 'گلیکسی 2013' },
  ],
  rice: [
    { name: 'Basmati 385', yield: '25-30 maund/acre', duration: 120, urdu: 'باسمتی 385' },
    { name: 'Super Basmati', yield: '28-32 maund/acre', duration: 125, urdu: 'سپر باسمتی' },
    { name: 'Kainat', yield: '30-35 maund/acre', duration: 115, urdu: 'کائنات' },
    { name: 'Chenab', yield: '26-30 maund/acre', duration: 118, urdu: 'چناب' },
  ],
  cotton: [
    { name: 'BT Cotton (IUB-13)', yield: '30-35 maund/acre', duration: 180, urdu: 'بی ٹی کپاس IUB-13' },
    { name: 'FH-142', yield: '32-38 maund/acre', duration: 175, urdu: 'FH-142' },
    { name: 'MNH-886', yield: '28-33 maund/acre', duration: 185, urdu: 'MNH-886' },
    { name: 'CIM-602', yield: '35-40 maund/acre', duration: 170, urdu: 'CIM-602' },
  ],
  sugarcane: [
    { name: 'CPF-246', yield: '500-600 maund/acre', duration: 365, urdu: 'CPF-246' },
    { name: 'HSF-240', yield: '550-650 maund/acre', duration: 370, urdu: 'HSF-240' },
    { name: 'CPF-243', yield: '480-580 maund/acre', duration: 360, urdu: 'CPF-243' },
    { name: 'SPF-213', yield: '520-620 maund/acre', duration: 365, urdu: 'SPF-213' },
  ],
  maize: [
    { name: 'Pioneer Hybrid 30Y87', yield: '35-40 maund/acre', duration: 90, urdu: 'پائنیر 30Y87' },
    { name: 'Monsanto DK-6142', yield: '38-43 maund/acre', duration: 95, urdu: 'مونسانٹو DK-6142' },
    { name: 'Syngenta NK-6621', yield: '32-38 maund/acre', duration: 85, urdu: 'سنجنٹا NK-6621' },
    { name: 'Local Akbar', yield: '28-33 maund/acre', duration: 88, urdu: 'مقامی اکبر' },
  ],
  vegetables: [
    { name: 'Tomato (Rio Grande)', yield: '50-60 maund/acre', duration: 60, urdu: 'ٹماٹر (ریو گرانڈے)' },
    { name: 'Potato (Cardinal)', yield: '150-180 maund/acre', duration: 90, urdu: 'آلو (کارڈنل)' },
    { name: 'Onion (Phulkara)', yield: '100-120 maund/acre', duration: 120, urdu: 'پیاز (پھلکڑا)' },
    { name: 'Mixed Seasonal', yield: '40-50 maund/acre', duration: 60, urdu: 'مخلوط موسمی' },
  ],
};

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
  const [savedCalendars, setSavedCalendars] = useState([]);
  const [activeCalendarIndex, setActiveCalendarIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    farmerName: '',
    location: '',
    acres: '',
    crop: 'wheat',
    variety: 'Faisalabad 2008'
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
  const farmerData = savedCalendars[activeCalendarIndex] || null;

  // Load saved calendars from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('awaz-calendars');
    if (saved) {
      try {
        const calendars = JSON.parse(saved);
        setSavedCalendars(calendars);
        if (calendars.length > 0) {
          setSelectedCrop(calendars[0].crop);
          // Load activities and notes for first calendar
          const savedActivities = localStorage.getItem(`activities-${calendars[0].id}`);
          const savedNotes = localStorage.getItem(`notes-${calendars[0].id}`);
          if (savedActivities) setCompletedActivities(JSON.parse(savedActivities));
          if (savedNotes) setNotes(JSON.parse(savedNotes));
        } else {
          setShowForm(true);
        }
      } catch (e) {
        console.error('Error loading calendars:', e);
        setShowForm(true);
      }
    } else {
      setShowForm(true);
    }
  }, []);

  // Save activities when they change
  useEffect(() => {
    if (farmerData?.id) {
      localStorage.setItem(`activities-${farmerData.id}`, JSON.stringify(completedActivities));
    }
  }, [completedActivities, farmerData]);

  // Save notes when they change
  useEffect(() => {
    if (farmerData?.id) {
      localStorage.setItem(`notes-${farmerData.id}`, JSON.stringify(notes));
    }
  }, [notes, farmerData]);

  // Load activities and notes when switching calendars
  useEffect(() => {
    if (farmerData?.id) {
      const savedActivities = localStorage.getItem(`activities-${farmerData.id}`);
      const savedNotes = localStorage.getItem(`notes-${farmerData.id}`);
      if (savedActivities) setCompletedActivities(JSON.parse(savedActivities));
      else setCompletedActivities([]);
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      else setNotes({});
      setSelectedCrop(farmerData.crop);
    }
  }, [activeCalendarIndex, farmerData]);

  // Geocode location to get coordinates
  const geocodeLocation = async (location) => {
    try {
      // Use OpenMeteo's geocoding API
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return {
          latitude: data.results[0].latitude,
          longitude: data.results[0].longitude,
          name: data.results[0].name,
          country: data.results[0].country
        };
      }
      
      // Fallback to Pakistan cities if not found
      const pakistanCities = {
        'فیصل آباد': { latitude: 31.4504, longitude: 73.1350, name: 'Faisalabad' },
        'faisalabad': { latitude: 31.4504, longitude: 73.1350, name: 'Faisalabad' },
        'لاہور': { latitude: 31.5204, longitude: 74.3587, name: 'Lahore' },
        'lahore': { latitude: 31.5204, longitude: 74.3587, name: 'Lahore' },
        'کراچی': { latitude: 24.8607, longitude: 67.0011, name: 'Karachi' },
        'karachi': { latitude: 24.8607, longitude: 67.0011, name: 'Karachi' },
        'اسلام آباد': { latitude: 33.6844, longitude: 73.0479, name: 'Islamabad' },
        'islamabad': { latitude: 33.6844, longitude: 73.0479, name: 'Islamabad' },
        'multan': { latitude: 30.1575, longitude: 71.5249, name: 'Multan' },
        'ملتان': { latitude: 30.1575, longitude: 71.5249, name: 'Multan' },
        'peshawar': { latitude: 34.0151, longitude: 71.5249, name: 'Peshawar' },
        'پشاور': { latitude: 34.0151, longitude: 71.5249, name: 'Peshawar' },
      };
      
      const cityKey = location.toLowerCase().trim();
      if (pakistanCities[cityKey]) {
        return pakistanCities[cityKey];
      }
      
      // Default to Faisalabad if nothing found
      return { latitude: 31.4504, longitude: 73.1350, name: 'Faisalabad', country: 'Pakistan' };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { latitude: 31.4504, longitude: 73.1350, name: 'Faisalabad', country: 'Pakistan' };
    }
  };

  // Fetch real-time weather data from OpenMeteo API
  useEffect(() => {
    const fetchWeather = async () => {
      if (!farmerData?.location) return;
      
      setWeatherLoading(true);
      try {
        // Geocode the location first
        const coords = await geocodeLocation(farmerData.location);
        
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Karachi`
        );
        
        const data = await response.json();
        
        if (data.current) {
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            precipitation: data.current.precipitation,
            weatherCode: data.current.weather_code,
            windSpeed: Math.round(data.current.wind_speed_10m),
            maxTemp: Math.round(data.daily.temperature_2m_max[0]),
            minTemp: Math.round(data.daily.temperature_2m_min[0]),
            rainChance: data.daily.precipitation_probability_max[0] || 0,
            locationName: coords.name
          });
          console.log('Weather data fetched for:', coords.name, data.current);
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
        toast.error('موسم کی معلومات نہیں مل سکیں / Could not fetch weather');
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
      0: { en: 'Clear sky', ur: 'صاف آسمان', icon: 'FaSun' },
      1: { en: 'Mainly clear', ur: 'زیادہ تر صاف', icon: 'FaSun' },
      2: { en: 'Partly cloudy', ur: 'جزوی ابر آلود', icon: 'FaCloud' },
      3: { en: 'Overcast', ur: 'مکمل ابر آلود', icon: 'FaCloud' },
      45: { en: 'Foggy', ur: 'دھند', icon: 'FaCloud' },
      48: { en: 'Foggy', ur: 'دھند', icon: 'FaCloud' },
      51: { en: 'Light drizzle', ur: 'ہلکی بارش', icon: 'FaCloudRain' },
      53: { en: 'Drizzle', ur: 'بوندا باندی', icon: 'FaCloudRain' },
      55: { en: 'Heavy drizzle', ur: 'تیز بوندا باندی', icon: 'FaCloudRain' },
      61: { en: 'Light rain', ur: 'ہلکی بارش', icon: 'FaCloudRain' },
      63: { en: 'Moderate rain', ur: 'بارش', icon: 'FaCloudRain' },
      65: { en: 'Heavy rain', ur: 'تیز بارش', icon: 'FaCloudRain' },
      80: { en: 'Rain showers', ur: 'بارش کی پھوار', icon: 'FaCloudRain' },
      95: { en: 'Thunderstorm', ur: 'آندھی', icon: 'FaCloudRain' },
    };
    return weatherCodes[code] || { en: 'Clear', ur: 'صاف', icon: 'FaSun' };
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.farmerName || !formData.location || !formData.acres) {
      toast.error('براہ کرم تمام خانے بھریں / Please fill all fields');
      return;
    }
    
    // Create new calendar with unique ID
    const newCalendar = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const updatedCalendars = [...savedCalendars, newCalendar];
    setSavedCalendars(updatedCalendars);
    localStorage.setItem('awaz-calendars', JSON.stringify(updatedCalendars));
    
    // Set as active calendar
    setActiveCalendarIndex(updatedCalendars.length - 1);
    setSelectedCrop(formData.crop);
    setCompletedActivities([]);
    setNotes({});
    setShowForm(false);
    
    // Reset form
    setFormData({
      farmerName: '',
      location: '',
      acres: '',
      crop: 'wheat'
    });
    
    toast.success('کیلنڈر تیار ہو گیا! 🎉');
  };

  const handleEditDetails = () => {
    setShowForm(true);
  };

  const switchCalendar = (index) => {
    setActiveCalendarIndex(index);
  };

  const deleteCalendar = (index) => {
    if (savedCalendars.length === 1) {
      toast.error('آخری کیلنڈر حذف نہیں کر سکتے / Cannot delete last calendar');
      return;
    }
    
    const calendarToDelete = savedCalendars[index];
    const updatedCalendars = savedCalendars.filter((_, i) => i !== index);
    setSavedCalendars(updatedCalendars);
    localStorage.setItem('awaz-calendars', JSON.stringify(updatedCalendars));
    
    // Remove associated data
    localStorage.removeItem(`activities-${calendarToDelete.id}`);
    localStorage.removeItem(`notes-${calendarToDelete.id}`);
    
    // Switch to first calendar if current was deleted
    if (activeCalendarIndex >= updatedCalendars.length) {
      setActiveCalendarIndex(0);
    }
    
    toast.success('کیلنڈر حذف ہو گیا / Calendar deleted');
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
                onChange={(e) => {
                  const newCrop = e.target.value;
                  const defaultVariety = CROP_VARIETIES[newCrop][0].name;
                  setFormData({ ...formData, crop: newCrop, variety: defaultVariety });
                }}
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

            <div>
              <label className="block text-right text-gray-700 font-bold mb-2" dir="rtl">
                قسم کا انتخاب / Select Variety
              </label>
              <select
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-farm-green-500 focus:outline-none text-right"
                dir="rtl"
                required
              >
                {CROP_VARIETIES[formData.crop].map((variety) => (
                  <option key={variety.name} value={variety.name}>
                    {variety.urdu} - {variety.yield} ({variety.duration} دن)
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-600 text-right" dir="rtl">
                {CROP_VARIETIES[formData.crop].find(v => v.name === formData.variety)?.yield} متوقع پیداوار
              </p>
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
      {/* Calendar Tabs */}
      {savedCalendars.length > 0 && (
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-farm-green-800" dir="rtl">
              اپنے کیلنڈرز / Your Calendars
            </h3>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-farm-green-500 to-farm-green-600 text-white font-bold rounded-lg hover:from-farm-green-600 hover:to-farm-green-700 transition-all shadow-md flex items-center gap-2"
            >
              <span>+</span>
              <span>نیا کیلنڈر / New Calendar</span>
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {savedCalendars.map((calendar, index) => (
              <motion.div
                key={calendar.id}
                whileHover={{ scale: 1.02 }}
                className={`relative min-w-[250px] p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  activeCalendarIndex === index
                    ? 'bg-gradient-to-r from-farm-green-100 to-farm-green-50 border-farm-green-500 shadow-lg'
                    : 'bg-white border-gray-200 hover:border-farm-green-300'
                }`}
                onClick={() => switchCalendar(index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{CROP_CALENDARS[calendar.crop].emoji}</span>
                      <h4 className="font-bold text-gray-800">{calendar.farmerName}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{CROP_CALENDARS[calendar.crop].name.split('/')[1]}</p>
                    {calendar.variety && (
                      <p className="text-xs text-farm-green-600 font-semibold mt-1">
                        {CROP_VARIETIES[calendar.crop].find(v => v.name === calendar.variety)?.urdu || calendar.variety}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <FaMapMarkerAlt />
                      {calendar.location}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {calendar.acres} acres
                    </p>
                  </div>
                  {savedCalendars.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('کیا آپ واقعی یہ کیلنڈر حذف کرنا چاہتے ہیں؟ / Delete this calendar?')) {
                          deleteCalendar(index);
                        }
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {activeCalendarIndex === index && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-farm-green-500 to-farm-green-600 rounded-b-xl"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaSeedling />
                <p className="text-sm opacity-80">Crop / فصل</p>
              </div>
              <p className="text-xl font-bold">{cropData.name.split('/')[0]}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaLeaf />
                <p className="text-sm opacity-80">Variety / قسم</p>
              </div>
              <p className="text-lg font-bold">
                {farmerData.variety ? 
                  CROP_VARIETIES[farmerData.crop].find(v => v.name === farmerData.variety)?.urdu || farmerData.variety
                  : cropData.variety}
              </p>
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
              <p className="text-xl font-bold">
                {farmerData.variety ? 
                  CROP_VARIETIES[farmerData.crop].find(v => v.name === farmerData.variety)?.duration || cropData.duration
                  : cropData.duration} days
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaChartLine />
                <p className="text-sm opacity-80">Expected Yield</p>
              </div>
              <p className="text-lg font-bold">
                {farmerData.variety ? 
                  CROP_VARIETIES[farmerData.crop].find(v => v.name === farmerData.variety)?.yield || cropData.expectedYield
                  : cropData.expectedYield}
              </p>
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
      {weatherLoading ? (
        <div className="bg-white rounded-xl p-8 mb-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">موسم کی معلومات لوڈ ہو رہی ہیں... / Loading weather data...</p>
        </div>
      ) : weather ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Current Weather */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {weather.weatherCode <= 1 ? <FaSun className="text-2xl" /> : 
                   weather.weatherCode <= 3 ? <FaCloud className="text-2xl" /> : 
                   <FaCloudRain className="text-2xl" />}
                  <span className="text-sm opacity-90">موسم / Weather</span>
                </div>
                <p className="text-3xl font-bold">{weather.temperature}°C</p>
                <p className="text-sm opacity-90">{getWeatherDescription(weather.weatherCode).ur}</p>
                {weather.locationName && (
                  <p className="text-xs opacity-75 mt-1">📍 {weather.locationName}</p>
                )}
              </div>
              {weather.weatherCode <= 1 ? <FaSun className="text-6xl opacity-30" /> : 
               weather.weatherCode <= 3 ? <FaCloud className="text-6xl opacity-30" /> : 
               <FaCloudRain className="text-6xl opacity-30" />}
            </div>
          </div>

          {/* Rainfall */}
          <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaCloudRain className="text-2xl" />
                  <span className="text-sm opacity-90">بارش / Rain</span>
                </div>
                <p className="text-3xl font-bold">{weather.rainChance}%</p>
                <p className="text-sm opacity-90">Chance today</p>
                {weather.precipitation > 0 && (
                  <p className="text-xs opacity-90 mt-1">Current: {weather.precipitation}mm</p>
                )}
              </div>
              <FaCloudRain className="text-6xl opacity-30" />
            </div>
          </div>

          {/* Temperature Range */}
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaThermometerHalf className="text-2xl" />
                  <span className="text-sm opacity-90">درجہ حرارت / Temp</span>
                </div>
                <p className="text-3xl font-bold">↑ {weather.maxTemp}°C</p>
                <p className="text-sm opacity-90">↓ Min {weather.minTemp}°C</p>
              </div>
              <FaThermometerHalf className="text-6xl opacity-30" />
            </div>
          </div>

          {/* Wind & Humidity */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaWind className="text-2xl" />
                  <span className="text-sm opacity-90">ہوا / Wind</span>
                </div>
                <p className="text-3xl font-bold">{weather.windSpeed} km/h</p>
                <p className="text-sm opacity-90">💧 Humidity {weather.humidity}%</p>
              </div>
              <FaWind className="text-6xl opacity-30" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 mb-6 text-center text-gray-600">
          <FaCloud className="text-4xl mx-auto mb-2 text-gray-400" />
          <p>موسم کی معلومات دستیاب نہیں / Weather data not available</p>
        </div>
      )}

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
