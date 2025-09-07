'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function MobileBottomBar({ onMenuClick, isSidebarOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, loading, setUser } = auth || {};
  const isDashboard = pathname.startsWith('/dashboard');
  const [mounted, setMounted] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (setUser) setUser(null);
      if (typeof window !== 'undefined') localStorage.clear();
      setShowUserDropdown(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Always show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[10001]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col items-center justify-center p-2 text-gray-400">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mt-1"></div>
          </div>
          <div className="flex flex-col items-center justify-center p-2 text-gray-400">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mt-1"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[10001]">
      <div className="flex items-center justify-between px-4 py-3">
        {user ? (
          // Logged in user layout
          <>
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

            {/* Shopping Cart - Center */}
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

            {/* User Name - Right with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleUserClick}
                className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs mt-1 text-center max-w-16 truncate">
                  {user.firstName || user.username || 'کاربر'}
                </span>
              </button>
              
              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-[10003]">
                  <div className="py-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <svg className="h-4 w-4 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                      </svg>
                      داشبورد
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="h-4 w-4 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      خروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // Not logged in user layout
          <>
            {/* Home Button - Left */}
            <Link
              href="/"
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">صفحه اصلی</span>
            </Link>

            {/* Login Button - Right */}
            <Link
              href="/auth/login"
              className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs mt-1">ورود</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
