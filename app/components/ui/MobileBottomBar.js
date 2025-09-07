'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function MobileBottomBar({ onMenuClick, isSidebarOpen }) {
  const pathname = usePathname();
  const auth = useAuth();
  const { user } = auth || {};
  const isDashboard = pathname.startsWith('/dashboard');

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Login/User Name - Left */}
        {user ? (
          <div className="flex flex-col items-center justify-center p-2 text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1 text-center max-w-16 truncate">
              {user.firstName || user.username || 'کاربر'}
            </span>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs mt-1">ورود</span>
          </Link>
        )}

        {/* Menu Button - Center (only in dashboard) */}
        {isDashboard && (
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
        )}

        {/* Shopping Cart - Right */}
        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            isActive('/cart') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l3-7H6.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
          <span className="text-xs mt-1">سبد خرید</span>
        </Link>
      </div>
    </div>
  );
}
