import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaHistory, FaPlay } from 'react-icons/fa';

const QueryHistory = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, 'queries', currentUser.uid, 'history'),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const historyData = [];
        
        querySnapshot.forEach((doc) => {
          historyData.push({ id: doc.id, ...doc.data() });
        });

        setHistory(historyData);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLanguageClass = (lang) => {
    const classes = {
      urdu: 'urdu-text',
      punjabi: 'punjabi-text',
      sindhi: 'sindhi-text',
    };
    return classes[lang] || 'urdu-text';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-600"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FaHistory className="text-5xl mx-auto mb-4 opacity-50" />
        <p>No queries yet. Start asking questions!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-farm-green-700 mb-6 flex items-center gap-2">
        <FaHistory /> Recent Queries
      </h2>

      {history.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-gray-500">
              {formatDate(item.timestamp)}
            </span>
            <span className="px-3 py-1 bg-farm-green-100 text-farm-green-700 text-xs rounded-full">
              {item.language}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">QUESTION</p>
              <p className={`text-base ${getLanguageClass(item.language)}`}>
                {item.question}
              </p>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">ANSWER</p>
              <p className={`text-base ${getLanguageClass(item.language)}`}>
                {item.answer}
              </p>
            </div>

            {item.audioOutputUrl && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    const audio = new Audio(item.audioOutputUrl);
                    audio.play();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-farm-green-50 hover:bg-farm-green-100 text-farm-green-700 rounded-full transition-all text-sm"
                >
                  <FaPlay className="text-xs" />
                  Play Audio
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default QueryHistory;
