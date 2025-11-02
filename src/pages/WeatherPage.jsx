import React from 'react';
import WeatherAdvisor from '../components/WeatherAdvisor';

const WeatherPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <WeatherAdvisor />
    </div>
  );
};

export default WeatherPage;