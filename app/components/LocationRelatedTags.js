'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Removed: API calls to articles module

const LocationRelatedTags = ({ locationId, locationName, locationDisplayName, className = '' }) => {
  const [tags, setTags] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testData, setTestData] = useState(null);

  useEffect(() => {
    // Articles module removed. Disable tags fetching.
    setLoading(false);
    setTags({ totalTags: 0, groupedTags: {} });
  }, [locationId, locationName]);

  const testDataHandler = async () => {};

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        {error}
        <button 
          onClick={testDataHandler}
          className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
        >
          تست داده‌ها
        </button>
      </div>
    );
  }

  if (!tags || tags.totalTags === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        تگ مرتبطی برای این لوکیشن یافت نشد
        <button 
          onClick={testDataHandler}
          className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
        >
          تست داده‌ها
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        تگ‌های مرتبط
      </h3>
      
      <div className="space-y-4">
        {Object.entries(tags.groupedTags).map(([className, classTags]) => (
          <div key={className} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">{className}</h4>
            <div className="flex flex-wrap gap-2">
              {classTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationRelatedTags; 