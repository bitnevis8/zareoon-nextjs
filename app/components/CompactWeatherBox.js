'use client';

import { useState, useEffect } from 'react';

const API_KEY = "7959b45847d0131c5cf5a823b1fa0d9a";
const TEHRAN_COORDS = { lat: 35.6892, lon: 51.3890 };

async function getCityCoords(city) {
  if (!city || city === "تهران") return TEHRAN_COORDS;
  const res = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
  );
  if (!res.ok) return TEHRAN_COORDS;
  const data = await res.json();
  if (data && data.length > 0) {
    return { lat: data[0].lat, lon: data[0].lon };
  }
  return TEHRAN_COORDS;
}

export default function CompactWeatherBox({ locationName }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!locationName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get coordinates
        const coords = await getCityCoords(locationName);
        
        // Fetch current weather
        const currentRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&lang=fa`
        );
        
        // Fetch 5-day forecast
        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&lang=fa`
        );
        
        if (!currentRes.ok || !forecastRes.ok) {
          throw new Error('خطا در دریافت اطلاعات آب و هوا');
        }
        
        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();
        
        // Process forecast data - get one forecast per day
        const dailyForecasts = forecastData.list.filter((item, index) => index % 8 === 0).slice(1, 5);
        
        setWeatherData({
          current: {
            temp: currentData.main.temp,
            condition: currentData.weather[0].main,
            description: currentData.weather[0].description,
            humidity: currentData.main.humidity,
            windSpeed: currentData.wind.speed,
            temp_min: currentData.main.temp_min,
            temp_max: currentData.main.temp_max
          },
          forecast: dailyForecasts.map(day => ({
            date: day.dt_txt,
            max: day.main.temp_max,
            min: day.main.temp_min,
            condition: day.weather[0].main,
            description: day.weather[0].description
          }))
        });
        
      } catch (err) {
        setError('خطا در اتصال به سرور');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [locationName]);

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️',
      'Smoke': '🌫️',
      'Dust': '🌪️',
      'Sand': '🌪️',
      'Ash': '🌋',
      'Squall': '💨',
      'Tornado': '🌪️'
    };
    
    return iconMap[condition] || '🌤️';
  };

  const formatTemperature = (temp) => {
    if (!temp) return '—';
    return `${Math.round(temp)}°`;
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'امروز';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'فردا';
    } else {
      const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
      return days[date.getDay()];
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
            <h3 className="text-sm font-semibold text-gray-800">آب و هوا</h3>
          </div>
          <div className="text-xs text-gray-500">{locationName}</div>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
            <h3 className="text-sm font-semibold text-gray-800">آب و هوا</h3>
          </div>
          <div className="text-xs text-gray-500">{locationName}</div>
        </div>
        <div className="text-center py-4 text-gray-500 text-sm">
          {error || 'اطلاعات آب و هوا در دسترس نیست'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <h3 className="text-sm font-semibold text-gray-800">آب و هوا</h3>
        </div>
        <div className="text-xs text-gray-500">{locationName}</div>
      </div>

      {/* Weather Content */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Current Weather */}
          {weatherData.current && (
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="text-3xl">
                {getWeatherIcon(weatherData.current.condition)}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-800">
                  {formatTemperature(weatherData.current.temp)}
                </div>
                <div className="text-xs text-gray-500">
                  {weatherData.current.description || 'نامشخص'}
                </div>
              </div>
            </div>
          )}

          {/* Forecast */}
          {weatherData.forecast && weatherData.forecast.length > 0 && (
            <div className="flex space-x-2 space-x-reverse">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="flex flex-col items-center text-center min-w-[40px]">
                  <span className="text-xs text-gray-600 mb-1">
                    {getDayName(day.date)}
                  </span>
                  <div className="text-lg mb-1">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <div className="text-xs font-medium">
                    <span className="text-gray-800">{formatTemperature(day.max)}</span>
                    <span className="text-gray-500 mr-1">/</span>
                    <span className="text-gray-500">{formatTemperature(day.min)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Info */}
        {weatherData.current && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500">
              <span>رطوبت: {weatherData.current.humidity || '—'}%</span>
              <span>باد: {weatherData.current.windSpeed || '—'} m/s</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>کمینه: {formatTemperature(weatherData.current.temp_min)}</span>
              <span>بیشینه: {formatTemperature(weatherData.current.temp_max)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <a 
          href={`https://www.google.com/search?q=آب+و+هوا+${encodeURIComponent(locationName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          مشاهده جزئیات بیشتر
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}