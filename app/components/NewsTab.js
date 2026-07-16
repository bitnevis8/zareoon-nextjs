'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const NewsTab = ({ locationName, locationId, locationDisplayName }) => {
  const t = useTranslations('home.news');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const allArticles = [];

        try {
          console.log('Searching for location:', { locationName, locationDisplayName });
          if (locationDisplayName && locationDisplayName !== locationName) {
            // Skip displayName search
          }
        } catch (err) {
          console.error('Error searching articles by title:', err);
        }

        try {
          const allMatchingTags = [];
          if (locationDisplayName && locationDisplayName !== locationName) {
            // Skip displayName tag search
          }
          const uniqueTags = allMatchingTags.filter((tag, index, self) =>
            index === self.findIndex(item => item.id === tag.id)
          );
          console.log('Found matching tags:', uniqueTags.map(tag => tag.name));
        } catch (err) {
          console.error('Error searching articles by tags:', err);
        }

        try {
          // Skip classTags logic
        } catch (err) {
          console.error('Error fetching articles by location tags:', err);
        }

        const uniqueArticles = allArticles.filter((article, index, self) =>
          index === self.findIndex(a => a.id === article.id)
        );

        setArticles(uniqueArticles);
      } catch (err) {
        setError(t('fetchError'));
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };

    if (locationId && locationName) {
      fetchArticles();
    }
  }, [locationId, locationName, locationDisplayName, t]);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">{t('statsTitle', { location: locationName })}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{articles.length}</div>
            <div className="text-blue-700">{t('total')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {articles.filter(article => {
                const today = new Date();
                const articleDate = new Date(article.publishedAt);
                return articleDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <div className="text-blue-700">{t('today')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {articles.filter(article => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const articleDate = new Date(article.publishedAt);
                return articleDate >= weekAgo;
              }).length}
            </div>
            <div className="text-blue-700">{t('week')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {articles.filter(article => {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                const articleDate = new Date(article.publishedAt);
                return articleDate >= monthAgo;
              }).length}
            </div>
            <div className="text-blue-700">{t('month')}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('loading')}</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>{t('empty', { location: locationName })}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 mb-3">{t('latestTitle', { location: locationName })}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.slice(0, 6).map((article) => (
              <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {article.imageUrl && (
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    width={800}
                    height={320}
                    unoptimized
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                )}
                <h5 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h5>
                {article.summary && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {article.summary}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString('fa-IR')}
                  </span>
                  {article.agency && (
                    <span>{article.agency.name}</span>
                  )}
                </div>
                <Link
                  href={`/news/${article.id}`}
                  className="mt-2 inline-block text-blue-600 hover:text-blue-700 text-sm"
                >
                  {t('readMore')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center pt-4">
        <Link
          href={`/news?location=${locationId}`}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          {t('viewAll', { location: locationName })}
        </Link>
      </div>
    </div>
  );
};

export default NewsTab;
