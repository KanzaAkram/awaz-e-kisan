import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaClock, 
  FaSeedling, 
  FaTint, 
  FaFlask, 
  FaBug,
  FaTractor,
  FaChartLine,
  FaUsers,
  FaBell,
  FaCalendarAlt
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';

const CropCalendar = () => {
  const { currentUser } = useAuth();
  const [calendar, setCalendar] = useState(null);
  const [activities, setActivities] = useState([]);
  const [communityInsights, setCommunityInsights] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [filter, setFilter] = useState('upcoming'); // upcoming, completed, all
  const [loading, setLoading] = useState(true);

  // Helper function to parse dates (handles both string and Firestore Timestamp)
  const parseDate = (dateValue) => {
    if (!dateValue) return new Date();
    if (typeof dateValue === 'string') return new Date(dateValue);
    if (dateValue.toDate) return dateValue.toDate();
    return new Date();
  };

  // Activity type icons
  const activityIcons = {
    land_prep: <FaTractor className="text-brown-600" />,
    seed_sowing: <FaSeedling className="text-green-600" />,
    irrigation: <FaTint className="text-blue-600" />,
    fertilizer: <FaFlask className="text-purple-600" />,
    pest_check: <FaBug className="text-red-600" />,
    pest_spray: <FaBug className="text-orange-600" />,
    weeding: <FaSeedling className="text-yellow-600" />,
    harvest: <FaTractor className="text-green-800" />,
  };

  useEffect(() => {
    if (!currentUser) return;

    // Load calendar
    const loadCalendar = async () => {
      try {
        const calendarDoc = await getDoc(doc(db, 'cropCalendars', currentUser.uid));
        if (calendarDoc.exists()) {
          setCalendar(calendarDoc.data());
        }
      } catch (error) {
        console.error('Error loading calendar:', error);
      }
    };

    // Load activities (real-time)
    const activitiesRef = collection(db, 'cropCalendars', currentUser.uid, 'activities');
    const unsubscribe = onSnapshot(activitiesRef, (snapshot) => {
      const acts = [];
      snapshot.forEach((doc) => {
        acts.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('📋 Loaded activities:', acts.length);
      
      // Sort by date
      acts.sort((a, b) => {
        const dateA = parseDate(a.scheduledDate);
        const dateB = parseDate(b.scheduledDate);
        return dateA - dateB;
      });
      
      setActivities(acts);
      setLoading(false);
    });

    // Load community insights
    loadCommunityInsights();

    // Load notifications
    loadNotifications();

    loadCalendar();

    return () => unsubscribe();
  }, [currentUser]);

  const loadCommunityInsights = async () => {
    // Cloud Functions disabled for now - using client-side only
    // TODO: Re-enable when deploying Cloud Functions
    console.log('📊 Community insights: Feature coming soon!');
    
    // Set mock data for now
    setCommunityInsights({
      success: true,
      totalFarmers: 0,
      insights: []
    });
  };

  const loadNotifications = () => {
    const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));
    
    onSnapshot(q, (snapshot) => {
      const notifs = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notifs);
    });
  };

  const completeActivity = async (activityId) => {
    try {
      const response = await fetch(
        'https://us-central1-awaz-e-kisan.cloudfunctions.net/completeActivity',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.uid,
            activityId: activityId,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Update local state
        setCalendar(prev => ({
          ...prev,
          progress: data.progress,
          estimatedYield: data.yieldPrediction,
        }));

        // Reload community insights
        loadCommunityInsights();
      }
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  const getFilteredActivities = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return activities.filter(a => !a.completed && parseDate(a.scheduledDate) >= now);
      case 'completed':
        return activities.filter(a => a.completed);
      case 'overdue':
        return activities.filter(a => !a.completed && parseDate(a.scheduledDate) < now);
      default:
        return activities;
    }
  };

  const filteredActivities = getFilteredActivities();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className="text-center py-12">
        <FaSeedling className="text-6xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          کوئی فصل کیلنڈر نہیں
        </h3>
        <p className="text-gray-600 mb-4">
          اپنی فصل کا کیلنڈر بنانے کے لیے شروع کریں
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Progress Card */}
        <motion.div
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <FaChartLine className="text-3xl mb-2" />
          <h3 className="text-sm opacity-90">پیش رفت</h3>
          <p className="text-3xl font-bold">{Math.round(calendar.progress || 0)}%</p>
          <div className="mt-2 h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${calendar.progress || 0}%` }}
            />
          </div>
        </motion.div>

        {/* Yield Prediction Card */}
        <motion.div
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6 shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <FaSeedling className="text-3xl mb-2" />
          <h3 className="text-sm opacity-90">متوقع پیداوار</h3>
          <p className="text-2xl font-bold">
            {calendar.estimatedYield?.min}-{calendar.estimatedYield?.max}
          </p>
          <p className="text-xs opacity-90">{calendar.estimatedYield?.unit}</p>
        </motion.div>

        {/* Community Card */}
        <motion.div
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <FaUsers className="text-3xl mb-2" />
          <h3 className="text-sm opacity-90">علاقے میں فعال</h3>
          <p className="text-3xl font-bold">{communityInsights?.recentActivitiesCount || 0}</p>
          <p className="text-xs opacity-90">آج کسانوں نے کام کیا</p>
        </motion.div>

        {/* Notifications Card */}
        <motion.div
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <FaBell className="text-3xl mb-2" />
          <h3 className="text-sm opacity-90">اطلاعات</h3>
          <p className="text-3xl font-bold">{notifications.length}</p>
          <p className="text-xs opacity-90">نئی یاد دہانیاں</p>
        </motion.div>
      </div>

      {/* Crop Info Banner */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1" dir="rtl">
              {calendar.crop?.urdu} - {calendar.acres} ایکڑ
            </h2>
            <p className="text-gray-600">{calendar.location}</p>
            <p className="text-sm text-gray-500 mt-2">
              شروع: {calendar.startDate ? (typeof calendar.startDate === 'string' ? new Date(calendar.startDate).toLocaleDateString('ur-PK') : calendar.startDate.toDate().toLocaleDateString('ur-PK')) : 'نامعلوم'} • 
              مدت: {calendar.duration} دن
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">🌾</div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              calendar.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {calendar.status === 'active' ? 'فعال' : 'مکمل'}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'upcoming', label: 'آنے والی', icon: <FaClock /> },
          { key: 'overdue', label: 'تاخیر', icon: <FaBell /> },
          { key: 'completed', label: 'مکمل', icon: <FaCheckCircle /> },
          { key: 'all', label: 'تمام', icon: <FaCalendarAlt /> },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              filter === f.key
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Activities Timeline */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredActivities.map((activity, index) => {
            const activityDate = parseDate(activity.scheduledDate);
            const isOverdue = !activity.completed && activityDate < new Date();
            const daysUntil = Math.ceil((activityDate - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-md overflow-hidden ${
                  activity.completed
                    ? 'opacity-75'
                    : isOverdue
                    ? 'border-2 border-red-500'
                    : 'border-2 border-transparent'
                }`}
              >
                <div className="flex items-start p-6">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    activity.completed
                      ? 'bg-green-100'
                      : isOverdue
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                  }`}>
                    {activity.completed ? (
                      <FaCheckCircle className="text-green-600" />
                    ) : (
                      activityIcons[activity.type] || <FaSeedling />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 ml-4" dir="rtl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.desc}
                        </p>
                      </div>
                      
                      {/* Date Badge */}
                      <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        activity.completed
                          ? 'bg-green-100 text-green-800'
                          : isOverdue
                          ? 'bg-red-100 text-red-800'
                          : daysUntil <= 3
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.completed
                          ? '✓ مکمل'
                          : isOverdue
                          ? `${Math.abs(daysUntil)} دن تاخیر`
                          : daysUntil === 0
                          ? 'آج'
                          : `${daysUntil} دن میں`}
                      </div>
                    </div>

                    {/* Date & Rescheduling Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt />
                        {activityDate.toLocaleDateString('ur-PK')}
                      </span>
                      {activity.rescheduled && (
                        <span className="text-orange-600 text-xs">
                          🔄 {activity.rescheduledReason}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    {!activity.completed && (
                      <button
                        onClick={() => completeActivity(activity.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold text-sm"
                      >
                        ✓ مکمل کریں
                      </button>
                    )}

                    {activity.completed && activity.completedAt && (
                      <p className="text-xs text-green-600">
                        مکمل: {activity.completedAt.toDate().toLocaleDateString('ur-PK')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-500">کوئی سرگرمی نہیں ملی</p>
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="mt-8 bg-purple-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2" dir="rtl">
            <FaBell />
            تازہ اطلاعات
          </h3>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-purple-100"
                dir="rtl"
              >
                <p className="text-gray-800">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {notif.createdAt?.toDate().toLocaleString('ur-PK')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropCalendar;
