import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '../../config/api';
// Removed LocationNews box
import ZoomableImage from '../../components/ui/ZoomableImage/ZoomableImage';
import CompactWeatherBox from '../../components/CompactWeatherBox';
import TemperatureOnly from '../../components/TemperatureOnly';
import WikidataMap from '../../components/WikidataMap';

export default function LocationDetailPageClient({ locationData, breadcrumb }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wikiLoading, setWikiLoading] = useState(true);
  const [wikiData, setWikiData] = useState(null);
  const [wikidataInfo, setWikidataInfo] = useState(null);

  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [textRef, setTextRef] = useState(null);
  const [showAllChildren, setShowAllChildren] = useState(false);

  // تابع انتخاب نام مناسب بر اساس divisionType
  const getDisplayName = () => {
    if (locationData.divisionType <= 2) {
      return locationData.displayName;
    } else {
      return locationData.displayNameFull2 || locationData.displayName;
    }
  };

  // تابع کنترل طول متن
  const MAX_TEXT_LENGTH = 700;

  // تابع کنترل نمایش کامل متن
  const handleReadMore = () => {
    setIsTextExpanded(true);
    // اسکرول خودکار به متن
    setTimeout(() => {
      if (textRef) {
        textRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // تابع دریافت اطلاعات ویکی‌پدیا و Wikidata
  const fetchWikiData = async () => {
    if (!locationData) return;
    
    setWikiLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.locations.getWikiDetails(locationData.id));
      const data = await response.json();
      
      if (data.success) {
        if (data.data.wiki) {
          setWikiData(data.data.wiki);
        }
        if (data.data.wikidata) {
          setWikidataInfo(data.data.wikidata);
        }
      }
    } catch (error) {
      console.error('Error fetching Wikipedia and Wikidata:', error);
    } finally {
      setWikiLoading(false);
    }
  };

  useEffect(() => {
    const fetchChildren = async () => {
      if (!locationData) return;
      try {
        const response = await fetch(API_ENDPOINTS.locations.getChildren(locationData.id));
        const data = await response.json();
        if (data.success) {
          setChildren(data.data);
        }
      } catch (error) {
        console.error('Error fetching children:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
    fetchWikiData();
  }, [locationData]);

  if (!locationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">مکان یافت نشد</h1>
          <Link href="/location" className="text-blue-600 hover:text-blue-800">
            بازگشت به صفحه مکان‌ها
          </Link>
        </div>
      </div>
    );
  }

  // تعیین عنوان بر اساس نوع تقسیمات
  const getChildrenTitle = () => {
    switch (locationData.divisionType) {
      case 0: return 'استان‌ها';
      case 1: return 'شهرستان‌ها';
      case 2: return 'بخش‌ها';
      case 3: return 'دهستان‌ها';
      case 4: return 'شهرها';
      case 5: return 'آبادی‌ها';
      default: return 'زیرمجموعه‌ها';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-sky-900 bg-opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/location" className="text-white hover:text-gray-200 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              
              <div className="flex items-center mr-6">
                {/* Location Image */}
                <div className="relative group">
                  {wikiData && wikiData.image ? (
                    <ZoomableImage
                      src={wikiData.image} 
                      alt={locationData.name}
                      thumbnailClassName="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 border-4 border-white shadow-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="mr-4">
                  <h1 className="text-2xl font-bold mb-1">
                    {locationData.name}
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {getDisplayName()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Temperature Widget */}
            <div className="hidden md:flex items-center">
              <TemperatureOnly locationName={locationData.name} />
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4 space-x-reverse">
                {breadcrumb.map((item, index) => (
                  <li key={item.id} className="flex items-center">
                    {index > 0 && (
                      <svg className="w-5 h-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <Link
                      href={`/location/${item.slug || item.id}`}
                      className={`text-sm font-medium ${index === breadcrumb.length - 1 ? 'text-gray-500 cursor-default' : 'text-blue-600 hover:text-blue-800'}`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      )}

              {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Location Information Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="relative">
              {/* Background Image or Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100"></div>
              
              <div className="relative p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Wikipedia Image */}
                  <div className="lg:col-span-1">
                    {wikiData && wikiData.image ? (
                      <div className="relative group h-80">
                        <ZoomableImage
                          src={wikiData.image} 
                          alt={wikiData.title || locationData.name}
                          thumbnailClassName="w-full h-80 object-cover rounded-lg shadow-lg"
                        />
                        {wikiData.url && (
                          <a 
                            href={wikiData.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors z-10"
                            title="مشاهده در ویکی‌پدیا"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-80 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Location Info */}
                  <div className="lg:col-span-2">
                    <div className="mb-6">
                      {/* <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {locationData.name}
                      </h2>
                      <p className="text-lg text-gray-600 mb-4">
                        {getDisplayName()}
                      </p> */}

                      {/* Wikipedia Description - moved to top */}
                      {wikiLoading ? (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4 h-80 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      ) : wikiData && wikiData.extract ? (
                        <div 
                          ref={(el) => setTextRef(el)}
                          className={`bg-blue-50  rounded-lg text p-4 mb-4 h-80 ${isTextExpanded ? 'overflow-hidden' : 'overflow-hidden'} relative`}
                        >
                          {isTextExpanded ? (
                            <div className="relative h-full flex flex-col">
                              <div className="flex-1 overflow-y-auto pb-12">
                                <p className="text-gray-700 leading-relaxed text-sm">
                                  {wikiData.extract}
                                </p>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-50 to-transparent p-2 flex justify-center">
                                <button
                                  onClick={() => setIsTextExpanded(false)}
                                  className="bg-cyan-100 text-cyan-600 px-4 py-2 rounded-md text-sm hover:bg-cyan-200 transition-colors shadow-md"
                                >
                                  بستن
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 leading-relaxed text-sm">
                              {wikiData.extract && wikiData.extract.length > MAX_TEXT_LENGTH ? (
                                <>
                                  {wikiData.extract.substring(0, MAX_TEXT_LENGTH)}
                                  <button
                                    onClick={handleReadMore}
                                    className="inline-block mr-1 text-blue-600 font-bold px-2 py-0.5 rounded text-xs hover:bg-blue-100 transition-colors"
                                  >
                                    ادامه متن
                                  </button>
                                </>
                              ) : (
                                wikiData.extract
                              )}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4 h-80 flex items-center justify-center">
                          <p className="text-gray-500 text-sm">اطلاعات ویکی‌پدیا موجود نیست</p>
                        </div>
                      )}
                      
                      {/* Location Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Basic Info */}
           

                        {/* Stats */}
                        <div className="space-y-3">
                          {locationData.population && (
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-red-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="text-gray-700">جمعیت: <strong>{locationData.population.toLocaleString()} نفر</strong></span>
                            </div>
                          )}
                          {locationData.area && (
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-gray-700">مساحت: <strong>{locationData.area.toLocaleString()} کیلومتر مربع</strong></span>
                            </div>
                          )}
                          {locationData.latitude && locationData.longitude && (
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-blue-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                              <span className="text-gray-700">مختصات: <strong>{locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wikidata Map with Children */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Map */}
          <WikidataMap 
            wikidataInfo={wikidataInfo} 
            locationName={locationData.name}
            divisionType={locationData.divisionType}
          />
          
          {/* Children Section */}
          {children.length > 0 && (
            <div className="p-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {getChildrenTitle()}
                </h3>
                {children.length > 12 && (
                  <button
                    onClick={() => setShowAllChildren(!showAllChildren)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showAllChildren ? 'نمایش کمتر' : 'نمایش بیشتر'}
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">در حال بارگذاری...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {(showAllChildren ? children : children.slice(0, 12)).map((child) => (
                    <Link
                      key={child.id}
                      href={`/location/${child.slug || child.id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-50 to-white"
                    >
                      <div className="font-medium text-gray-900 mb-1 text-sm">
                        {child.name}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {child.displayName}
                      </div>
                      {child.population && (
                        <div className="text-xs text-gray-500 mt-1">
                          {child.population.toLocaleString()} نفر
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Weather Info */}
        {/* <CompactWeatherBox locationName={locationData.name} /> */}

        {/* Location News removed */}
      </div>
    </div>
  );
}