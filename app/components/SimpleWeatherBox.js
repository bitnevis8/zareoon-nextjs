'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getCityCoords, getWeatherIcon, WEATHER_CONFIG } from '@/app/config/weather';

export default function SimpleWeatherBox({ locationName }) {
  const t = useTranslations('home.weather');
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

        const coords = await getCityCoords(locationName);
        const { API_KEY } = WEATHER_CONFIG;

        const currentRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&lang=fa`
        );

        if (!currentRes.ok) {
          throw new Error(t('fetchError'));
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
        setError(t('connectionErrorShort'));
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [locationName, t]);

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
          {t('unknown')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="text-xl">
          {getWeatherIcon(weatherData.condition)}
        </div>
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
