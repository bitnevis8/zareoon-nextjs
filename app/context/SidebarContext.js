'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when navigating to a different page
  useEffect(() => {
    console.log('Pathname changed, closing sidebar:', pathname);
    setIsSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = useCallback(() => {
    console.log('Toggling sidebar, current state:', isSidebarOpen);
    setIsSidebarOpen(prev => {
      console.log('Previous state:', prev, 'New state:', !prev);
      return !prev;
    });
  }, [isSidebarOpen]);

  const closeSidebar = useCallback(() => {
    console.log('Closing sidebar');
    setIsSidebarOpen(false);
  }, []);

  return (
    <SidebarContext.Provider value={{
      isSidebarOpen,
      setIsSidebarOpen,
      toggleSidebar,
      closeSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
