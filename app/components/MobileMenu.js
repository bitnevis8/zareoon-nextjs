'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import LoginRequiredMessage from './LoginRequiredMessage';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth() || { user: null };
  const { t } = useLanguage();

  const menuItems = [
    { titleKey: 'dashboard', href: '/dashboard', protected: true },
    { titleKey: 'cart', href: '/cart', protected: true },
    { titleKey: 'account', href: '/dashboard/account', protected: true },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors duration-200"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
                prefetch={true}
              >
                {user.firstName} {user.lastName}
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="block rounded-md bg-emerald-600 px-3 py-2 text-base font-medium text-white transition-colors duration-200 hover:bg-emerald-700"
                onClick={() => setIsOpen(false)}
                prefetch={true}
              >
                {t('loginRegister')}
              </Link>
            )}

            {menuItems.map((item) => (
              <div key={item.titleKey}>
                {item.protected && !user ? (
                  <LoginRequiredMessage>
                    <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 bg-gray-100 cursor-pointer">
                      {t(item.titleKey)}
                    </div>
                  </LoginRequiredMessage>
                ) : (
                  <Link
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                    prefetch={true}
                  >
                    {t(item.titleKey)}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
