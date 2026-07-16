'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getCityCoords, getWeatherIcon, WEATHER_CONFIG } from '@/app/config/weather';

export default function TemperatureOnly({ locationName }) {
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

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
          throw new Error(t('fetchErrorShort'));
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
  }, [locationName, t]);

  const formatTemperature = (temp) => {
    if (!temp) return '—';
    return `${Math.round(temp)}°C`;
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
