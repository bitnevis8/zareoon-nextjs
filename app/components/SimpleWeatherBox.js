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

export default function SimpleWeatherBox({ locationName }) {
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
        
        // Fetch current weather only
        const currentRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&lang=fa`
        );
        
        if (!currentRes.ok) {
          throw new Error('خطا در دریافت اطلاعات آب و هوا');
        }
        
        const currentData = await currentRes.json();
        
        setWeatherData({
          temp: currentData.main.temp,
          condition: currentData.weather[0].main,
          description: currentData.weather[0].description,
          humidity: currentData.main.humidity,
          windSpeed: currentData.wind.speed
        });
        
      } catch (err) {
        setError('خطا در اتصال');
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
      'Haze': '🌫️'
    };
    
    return iconMap[condition] || '🌤️';
  };

  const formatTemperature = (temp) => {
    if (!temp) return '—';
    return `${Math.round(temp)}°`;
  };

  if (loading) {
    return (
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="text-center text-xs text-gray-500">
          آب و هوا نامشخص
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
      <div className="flex items-center space-x-2 space-x-reverse">
        {/* Weather Icon */}
        <div className="text-xl">
          {getWeatherIcon(weatherData.condition)}
        </div>
        
        {/* Weather Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 space-x-reverse">
            <span className="text-sm font-semibold text-gray-800">
              {formatTemperature(weatherData.temp)}
            </span>
            <span className="text-xs text-gray-600">
              {weatherData.description}
            </span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500 mt-1">
            <span>💧 {weatherData.humidity}%</span>
            <span>💨 {Math.round(weatherData.windSpeed)}m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}