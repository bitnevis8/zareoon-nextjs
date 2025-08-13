'use client';

import { useState, useEffect } from 'react';

export default function ClassHierarchy() {
  const [classes, setClasses] = useState([]);
  const [hierarchicalClasses, setHierarchicalClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTabs, setSelectedTabs] = useState({});
  const [classNews, setClassNews] = useState({});

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/classes');
        
        if (response.ok) {
          const data = await response.json();
          setClasses(data.classes || []);
        } else {
          setError('خطا در دریافت کلاس‌ها');
        }
      } catch (error) {
        setError('خطا در اتصال به سرور');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Organize classes into hierarchical structure
  useEffect(() => {
    if (classes.length === 0) return;

    // Find parent classes (classes without parentSlug)
    const parentClasses = classes.filter(cls => !cls.parentSlug);
    
    // Create hierarchical structure
    const hierarchical = parentClasses.map(parent => {
      const children = classes.filter(cls => cls.parentSlug === parent.slug);
      return {
        ...parent,
        children: children.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      };
    });

    // Sort parent classes by sortOrder
    hierarchical.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    setHierarchicalClasses(hierarchical);

    // Initialize selected tabs
    const initialTabs = {};
    hierarchical.forEach(parent => {
      if (parent.children && parent.children.length > 0) {
        initialTabs[parent.id] = parent.children[0].id;
      }
    });
    setSelectedTabs(initialTabs);
  }, [classes]);

  // Articles module removed: skip fetching class news
  useEffect(() => {
    setClassNews({});
  }, [hierarchicalClasses]);

  const handleTabClick = (parentId, childId) => {
    setSelectedTabs(prev => ({
      ...prev,
      [parentId]: childId
    }));
  };

  const handleClassClick = (classId) => {};

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-gray-600">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            در حال بارگذاری کلاس‌ها...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-600 font-medium">{error}</div>
        </div>
      </div>
    );
  }

  if (hierarchicalClasses.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ کلاسی یافت نشد</h3>
          <p className="text-gray-500">
            در حال حاضر هیچ کلاسی در سیستم موجود نیست.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 text-right mb-2">دسته‌بندی پیشرفته کلاس‌ها</h2>
        <p className="text-gray-600 text-right">کلاس‌های اصلی و زیرمجموعه‌های آن‌ها</p>
      </div> */}

      <div className="space-y-8">
        {hierarchicalClasses.map((parentClass) => (
          <div
            key={parentClass.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            {/* Parent Class Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 text-right">
                  <h3 className="text-lg font-semibold text-white">{parentClass.name}</h3>
                  {parentClass.description && (
                    <p className="text-blue-100 text-sm mt-1">{parentClass.description}</p>
                  )}
                </div>
                <div className="mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Children Classes Tabs */}
            {parentClass.children && parentClass.children.length > 0 && (
              <div className="border-b border-gray-200">
                <div className="flex flex-wrap gap-2 p-4">
                  {/* Parent class tab */}
                  <button
                    onClick={() => handleClassClick(parentClass.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      selectedTabs[parentClass.id] === parentClass.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {parentClass.name}
                  </button>
                  
                  {/* Child class tabs */}
                  {parentClass.children.map((childClass) => (
                    <button
                      key={childClass.id}
                      onClick={() => {
                        handleTabClick(parentClass.id, childClass.id);
                        handleClassClick(childClass.id);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        selectedTabs[parentClass.id] === childClass.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {childClass.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Latest News Section removed */}

            {/* Footer with class info */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>تعداد زیرمجموعه: {parentClass.children?.length || 0}</span>
                <span>ترتیب: {parentClass.sortOrder || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">خلاصه دسته‌بندی</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded p-3">
              <div className="font-medium text-gray-900">کلاس‌های اصلی</div>
              <div className="text-2xl font-bold text-blue-600">{hierarchicalClasses.length}</div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="font-medium text-gray-900">کلاس‌های فرعی</div>
              <div className="text-2xl font-bold text-green-600">
                {hierarchicalClasses.reduce((total, parent) => total + (parent.children?.length || 0), 0)}
              </div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="font-medium text-gray-900">مجموع کلاس‌ها</div>
              <div className="text-2xl font-bold text-purple-600">
                {hierarchicalClasses.length + hierarchicalClasses.reduce((total, parent) => total + (parent.children?.length || 0), 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 