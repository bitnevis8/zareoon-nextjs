'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/app/context/SidebarContext';
import MobileBottomBar from './MobileBottomBar';

export default function MobileBottomBarWrapper() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  // For non-dashboard pages, menu button should do nothing
  const handleMenuClick = () => {
    if (isDashboard) {
      toggleSidebar();
    }
    // For non-dashboard pages, do nothing
  };

  return (
    <MobileBottomBar 
      onMenuClick={handleMenuClick} 
      isSidebarOpen={isSidebarOpen}
    />
  );
}
