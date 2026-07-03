'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AccountNavSubtitle } from '../utils/accountNav';
import UserProfileMenu from './UserProfileMenu';
import Image from 'next/image';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const auth = useAuth();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) console.error('Logout failed:', response.status);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      auth?.logout?.();
      setIsOpen(false);
      router.push('/');
    }
  };

  if (!auth?.user) return null;

  const user = auth.user;

  return (
    <div className="relative z-[10050]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-100"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-500 text-sm font-medium text-white">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.firstName || t('profile')}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            (user.firstName?.[0] || user.username?.[0] || 'ک').toUpperCase()
          )}
        </div>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[10049] bg-black/50"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      ) : null}

      {isOpen ? (
        <div
          className={`fixed top-0 z-[10050] h-full w-80 overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
            isRTL ? 'left-0' : 'right-0'
          }`}
        >
          <div className="flex justify-end border-b border-gray-100 p-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              aria-label={t('closeMenu')}
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-500 text-lg font-medium text-white">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.firstName || t('profile')}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  (user.firstName?.[0] || user.username?.[0] || 'ک').toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="truncate text-sm text-gray-600">
                  {user.mobile || user.phone || user.username}
                </div>
                <div className="mt-1.5">
                  <AccountNavSubtitle user={user} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <UserProfileMenu
              user={user}
              onClose={() => setIsOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
