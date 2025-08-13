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

export default function TemperatureOnly({ locationName }) {
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
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
          throw new Error('خطا در دریافت آب و هوا');
        }
        
        const data = await response.json();
        setWeatherData({
          temp: data.main.temp,
          condition: data.weather[0].main
        });
        
      } catch (err) {
        setError(true);
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [locationName]);

  const formatTemperature = (temp) => {
    if (!temp) return '—';
    return `${Math.round(temp)}°C`;
  };

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

  if (loading) {
    return (
      <div className="inline-flex items-center justify-center  bg-opacity-20  border-opacity-30 rounded-lg px-3 py-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="inline-flex items-center bg-opacity-20  border-opacity-30 rounded-lg px-3 py-2">
        <span className="text-2xl font-semibold text-white">🌤️ —°C</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center bg-opacity-20  border-opacity-30 rounded-lg px-3 py-2">
      <span className="text-2xl font-semibold text-white">
        {getWeatherIcon(weatherData.condition)} {formatTemperature(weatherData.temp)}
      </span>
    </div>
  );
}