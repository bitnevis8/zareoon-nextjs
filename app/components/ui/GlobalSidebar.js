'use client';

import { useSidebar } from '@/app/context/SidebarContext';
import { useAuth } from '@/app/context/AuthContext';
import Sidebar from './Sidebar';
import { useEffect } from 'react';

export default function GlobalSidebar() {
  const { isSidebarOpen, closeSidebar, openSidebar } = useSidebar();
  const auth = useAuth();
  const { user } = auth || {};

  // Add event listener for opening sidebar
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

  // Only show sidebar for logged-in users
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Mobile Sidebar - Slide in from right */}
      <div className={`md:hidden fixed inset-0 z-[10000] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50" 
          onClick={closeSidebar}
        />
        <aside className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[10001] overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <Sidebar onLinkClick={closeSidebar} />
        </aside>
      </div>
    </>
  );
}
