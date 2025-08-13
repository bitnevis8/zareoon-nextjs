'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import LocationDetailPageClient from './LocationDetailPageClient';
import { API_ENDPOINTS } from '../../config/api';
import Link from 'next/link';

const isNumeric = (str) => /^\d+$/.test(str);

export default function LocationDetailPageBySlug() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        let data;
        if (isNumeric(params.slug)) {
          // اگر ورودی عددی بود، بر اساس id واکشی کن
          const response = await fetch(API_ENDPOINTS.locations.getById(params.slug));
          data = await response.json();
        } else {
          // در غیر این صورت، بر اساس slug واکشی کن
          const response = await fetch(API_ENDPOINTS.locations.getBySlug(params.slug));
          data = await response.json();
        }
        if (data.success) {
          setLocationData(data.data);
          // دریافت breadcrumb (مسیر سلسله‌مراتبی)
          let breadcrumbResponse, breadcrumbData;
          if (isNumeric(params.slug)) {
            breadcrumbResponse = await fetch(API_ENDPOINTS.locations.getHierarchy(params.slug));
            breadcrumbData = await breadcrumbResponse.json();
          } else {
            breadcrumbResponse = await fetch(API_ENDPOINTS.locations.getHierarchyBySlug(params.slug));
            breadcrumbData = await breadcrumbResponse.json();
          }
          if (breadcrumbData.success) {
            setBreadcrumb(breadcrumbData.data);
          }
        } else {
          setError(data.message || 'خطا در دریافت داده‌ها');
        }
      } catch (error) {
        setError('خطا در اتصال به سرور');
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) {
      fetchLocationData();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">خطا</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">Slug: {params.slug}</p>
          <p className="text-sm text-gray-500 mb-4">Decoded: {decodeURIComponent(params.slug)}</p>
          <Link href="/location" className="text-blue-600 hover:text-blue-800">
            بازگشت به صفحه مکان‌ها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <LocationDetailPageClient 
      locationData={locationData} 
      breadcrumb={breadcrumb}
    />
  );
} 