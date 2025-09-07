'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/app/context/SidebarContext';
import MobileBottomBar from './MobileBottomBar';

export default function MobileBottomBarWrapper() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  // Menu button should work for logged-in users on any page
  const handleMenuClick = () => {
    console.log('Menu button clicked, isDashboard:', isDashboard, 'isSidebarOpen:', isSidebarOpen);
    console.log('Calling toggleSidebar...');
    toggleSidebar();
  };

  return (
    <MobileBottomBar 
      onMenuClick={handleMenuClick} 
      isSidebarOpen={isSidebarOpen}
    />
  );
}
