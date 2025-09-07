'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function MobileBottomBar({ onMenuClick, isSidebarOpen }) {
  const pathname = usePathname();
  const auth = useAuth();
  const roles = (auth?.user?.roles || []).map(r => (r.name || r.nameEn || '')).map(n => (n||'').toLowerCase());
  const isFarmer = roles.includes('farmer');
  const isLoader = roles.includes('loader');

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Menu Button - Left */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600 transition-colors"
          aria-label={isSidebarOpen ? "بستن منو" : "باز کردن منو"}
        >
          {isSidebarOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
          <span className="text-xs mt-1">منو</span>
        </button>

        {/* Orders - Center */}
        <Link
          href="/dashboard/farmer/orders"
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            isActive('/dashboard/farmer/orders') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs mt-1">سفارشات</span>
        </Link>

        {/* Inventory - Right */}
        <Link
          href="/dashboard/farmer/inventory"
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            isActive('/dashboard/farmer/inventory') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-xs mt-1">موجودی</span>
        </Link>
      </div>
    </div>
  );
}
