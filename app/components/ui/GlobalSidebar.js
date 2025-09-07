'use client';

import { useSidebar } from '@/app/context/SidebarContext';
import { useAuth } from '@/app/context/AuthContext';
import Sidebar from './Sidebar';

export default function GlobalSidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const auth = useAuth();
  const { user } = auth || {};

  // Only show sidebar for logged-in users
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Mobile Sidebar - Slide in from right */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-[9999]"
          onClick={closeSidebar}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <aside className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[10000]">
            <Sidebar onLinkClick={closeSidebar} />
          </aside>
        </div>
      )}
    </>
  );
}
