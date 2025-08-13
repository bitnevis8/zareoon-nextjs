'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MainTabNavigation() {
  const pathname = usePathname();
  const isAdvanced = pathname === '/advanced-categories';

  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow-lg   border-gray-200">
        <nav className="flex space-x-2 space-x-reverse" aria-label="Tabs">
          <Link
            href="/"
            className={`flex-1 text-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              !isAdvanced
                ? 'bg-cyan-100 text-cyan-900 shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              دسته‌بندی ساده
            </div>
          </Link>
          <Link
            href="/advanced-categories"
            className={`flex-1 text-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              isAdvanced
                ? 'bg-cyan-100 text-cyan-900 shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              دسته‌بندی پیشرفته
            </div>
          </Link>
        </nav>
      </div>
    </div>
  );
} 