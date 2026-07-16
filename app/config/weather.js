import i18nData from "@/app/utils/i18nFaData";

export const WEATHER_CONFIG = {
  API_KEY: '7959b45847d0131c5cf5a823b1fa0d9a',
  CURRENT_WEATHER_URL: 'https://api.openweathermap.org/data/2.5/weather',
  FORECAST_URL: 'https://api.openweathermap.org/data/2.5/forecast',
  GEOCODING_URL: 'https://api.openweathermap.org/geo/1.0/direct',
  UNITS: 'metric',
  LANGUAGE: 'fa'
};

export const getCityCoords = async (cityName) => {
  const TEHRAN_COORDS = { lat: 35.6892, lon: 51.3890 };
  const defaultCity = i18nData.defaultCity;

  if (!cityName || cityName === defaultCity) return TEHRAN_COORDS;

  try {
    const res = await fetch(
      `${WEATHER_CONFIG.GEOCODING_URL}?q=${encodeURIComponent(cityName)}&limit=1&appid=${WEATHER_CONFIG.API_KEY}`
    );

    if (!res.ok) return TEHRAN_COORDS;

    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon };
    }
    return TEHRAN_COORDS;
  } catch (error) {
    console.error('Geocoding error:', error);
    return TEHRAN_COORDS;
  }
};

export const buildCurrentWeatherUrl = (lat, lon) => {
  const params = new URLSearchParams({
    lat: lat,
    lon: lon,
    appid: WEATHER_CONFIG.API_KEY,
    units: WEATHER_CONFIG.UNITS,
    lang: WEATHER_CONFIG.LANGUAGE
  });

  return `${WEATHER_CONFIG.CURRENT_WEATHER_URL}?${params.toString()}`;
};

export const buildForecastUrl = (lat, lon) => {
  const params = new URLSearchParams({
    lat: lat,
    lon: lon,
    appid: WEATHER_CONFIG.API_KEY,
    units: WEATHER_CONFIG.UNITS,
    lang: WEATHER_CONFIG.LANGUAGE
  });

  return `${WEATHER_CONFIG.FORECAST_URL}?${params.toString()}`;
};

export const getWeatherIcon = (condition) => {
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

export const getSampleWeatherData = () => {
  const samples = i18nData.weatherSamples;
  return {
    current: {
      temp: 25,
      condition: 'Clear',
      description: samples.sunny,
      humidity: 45,
      windSpeed: 3.5,
      temp_min: 18,
      temp_max: 32
    },
    forecast: [
      {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        max: 28,
        min: 20,
        condition: 'Clear',
        description: samples.sunny
      },
      {
        date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        max: 26,
        min: 19,
        condition: 'Clouds',
        description: samples.cloudy
      },
      {
        date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        max: 24,
        min: 17,
        condition: 'Rain',
        description: samples.rainy
      },
      {
        date: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
        max: 27,
        min: 21,
        condition: 'Clear',
        description: samples.sunny
      }
    ]
  };
};
