'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const auth = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Clear auth context
        if (auth?.logout) {
          auth.logout();
        }
        // Redirect to home
        router.push('/');
      } else {
        console.error('Logout failed:', response.status);
        // Still clear local auth state
        if (auth?.logout) {
          auth.logout();
        }
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local auth state
      if (auth?.logout) {
        auth.logout();
      }
      router.push('/');
    }
    setIsOpen(false);
  };


  if (!auth?.user) return null;

  const user = auth.user;
  const userRoles = user.roles?.map(role => role.nameFa || role.nameEn) || [];
  

  return (
    <div className="relative" ref={dropdownRef}>
                  {/* Profile Button - Only Avatar */}
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 w-16 h-16"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.firstName || 'کاربر'}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        (user.firstName?.[0] || user.username?.[0] || 'ک').toUpperCase()
                      )}
                    </div>
                  </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[99998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu - Slide in from left like dashboard */}
      {isOpen && (
        <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-[99999] overflow-y-auto transform transition-transform duration-300 ease-in-out">
          {/* Close Button */}
          <div className="flex justify-end p-4 border-b border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="بستن منو"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.firstName || 'کاربر'}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  (user.firstName?.[0] || user.username?.[0] || 'ک').toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {user.mobile || user.phone || user.username}
                </div>
                {userRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userRoles.slice(0, 2).map((role, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {role}
                      </span>
                    ))}
                    {userRoles.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{userRoles.length - 2} نقش دیگر
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-2">
            <button
              onClick={() => { router.push('/dashboard/settings'); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-right text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">حساب کاربری</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-right text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">خروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
