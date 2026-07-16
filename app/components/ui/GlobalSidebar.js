'use client';

import { useSidebar } from '@/app/context/SidebarContext';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import Sidebar from './Sidebar';
import { useEffect } from 'react';

export default function GlobalSidebar() {
  const { isSidebarOpen, closeSidebar, openSidebar } = useSidebar();
  const { t } = useLanguage();
  const auth = useAuth();
  const { user } = auth || {};

  useEffect(() => {
    const handleOpenSidebar = () => {
      openSidebar();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('openSidebar', handleOpenSidebar);
      return () => {
        window.removeEventListener('openSidebar', handleOpenSidebar);
      };
    }
  }, [openSidebar]);

  if (!user) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[10000] transition-opacity duration-300 md:hidden ${
        isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isSidebarOpen}
    >
      <button
        type="button"
        className="fixed inset-0 bg-black/50"
        onClick={closeSidebar}
        aria-label={t('close')}
      />
      <aside
        className={`fixed top-[var(--site-mobile-top-chrome)] bottom-[calc(3.75rem+env(safe-area-inset-bottom))] right-0 z-[10001] flex w-[min(21rem,92vw)] flex-col overflow-hidden border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2.5">
          <p className="text-sm font-bold text-slate-900">{t('mobileMyZareoon')}</p>
          <button
            type="button"
            onClick={closeSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Sidebar onLinkClick={closeSidebar} showMobileUserHeader />
        </div>
      </aside>
    </div>
  );
}
