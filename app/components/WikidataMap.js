"use client";

import React from 'react';
import Map from './ui/Map/Map';

const WikidataMap = ({ wikidataInfo, locationName, divisionType }) => {
  // استخراج مختصات جغرافیایی از Wikidata
  const getCoordinates = () => {
    if (!wikidataInfo || !wikidataInfo.claims) {
      return null;
    }

    // P625 = coordinate location (مختصات جغرافیایی)
    const coordinateClaim = wikidataInfo.claims['P625'];
    
    if (coordinateClaim && coordinateClaim.length > 0) {
      const coordinateValue = coordinateClaim[0].mainsnak?.datavalue?.value;
      
      if (coordinateValue && coordinateValue.latitude && coordinateValue.longitude) {
        return {
          latitude: coordinateValue.latitude,
          longitude: coordinateValue.longitude,
          precision: coordinateValue.precision || null
        };
      }
    }

    return null;
  };

  const coordinates = getCoordinates();

  // اگر مختصات موجود نیست، نقشه نمایش داده نمی‌شود
  if (!coordinates) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-blue-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900">موقعیت جغرافیایی</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-sm">اطلاعات مختصات جغرافیایی از Wikidata در دسترس نیست</p>
        </div>
      </div>
    );
  }

  // تعیین سطح زوم بر اساس نوع تقسیمات
  // زوم کمتر = نمای کلی‌تر، زوم بیشتر = نمای جزئی‌تر
  const getZoomLevel = () => {
    switch (divisionType) {
      case 0: // کشور - نمای کلی کشور
        return 4;
      case 1: // استان - نمای کلی استان
        return 8;
      case 2: // شهرستان - نمای متوسط شهرستان
        return 10;
      case 3: // بخش - نمای نزدیک‌تر
        return 12;
      case 4: // دهستان - نمای جزئی‌تر
        return 13;
      case 5: // شهر - نمای خیابان‌ها
        return 14;
      case 6: // آبادی - نمای بسیار جزئی
        return 15;
      default:
        return 10; // پیش‌فرض برای شهرستان
    }
  };

  const markers = [{
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    name: locationName
  }];

  return (
    <div className="relative z-0">
      <Map
        center={[coordinates.latitude, coordinates.longitude]}
        zoom={getZoomLevel()}
        markers={markers}
        height="400px"
        className="z-0"
        showControls={true}
        draggable={true}
      />
    </div>
  );
};

export default WikidataMap;