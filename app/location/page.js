'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import LocationPageClient from './LocationPageClient';
import { API_ENDPOINTS } from '../config/api';

export default function LocationPage() {
  const t = useTranslations('location');
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.locations.getAll}?type=0`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          const iran = data.data.find(
            (loc) => loc.name === t('iran.countryName') || loc.displayName.includes(t('iran.matchToken'))
          );
          setLocationData(iran || data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <LocationPageClient locationData={locationData} />;
} 