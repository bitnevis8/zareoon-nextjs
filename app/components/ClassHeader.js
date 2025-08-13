'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '../config/api';

export default function ClassHeader({ classId, className, description }) {
  const [children, setChildren] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch children of the class
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.classes.getChildren}/${classId}`);
        if (response.ok) {
          const data = await response.json();
          setChildren(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching children:', error);
      }
    };

    if (classId) {
      fetchChildren();
    }
  }, [classId]);

  // Fetch articles for active tab
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        // Articles removed
        setArticles([]);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchArticles();
    }
  }, [classId, activeTab]);

  return (
    <div className="mb-8">
      {/* Class Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{className}</h1>
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        <p className="text-sm text-gray-500">کلاس خبری - مشاهده اخبار و زیرمجموعه‌ها</p>
      </div>

      {/* Child Tabs */}
      <div className="bg-white rounded-lg shadow-lg p-1 border border-gray-200 mb-6">
        <nav className="flex space-x-2 space-x-reverse overflow-x-auto" aria-label="Child Tabs">
          {/* All Tab */}
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-shrink-0 text-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-cyan-100 text-cyan-900 shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              همه
            </div>
          </button>

          {/* Child Tabs */}
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/class/${child.id}`}
              className={`flex-shrink-0 text-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === child.id.toString()
                  ? 'bg-cyan-100 text-cyan-900 shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                {child.name}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Related Articles */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">اخبار مرتبط</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-gray-600">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              در حال بارگذاری...
            </div>
          </div>
        ) : articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="block rounded-lg p-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{article.title}</h3>
                  {article.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{article.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    {article.agency?.name && (
                      <span>{article.agency.name}</span>
                    )}
                    {article.publishedAt && (
                      <span>{new Date(article.publishedAt).toLocaleDateString('fa-IR')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ خبری یافت نشد</h3>
            <p className="text-gray-500">در حال حاضر هیچ خبری برای این کلاس موجود نیست.</p>
          </div>
        )}
      </div>
    </div>
  );
} 