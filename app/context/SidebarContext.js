'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SidebarContext = createContext();

/** دو حالت استاندارد: باز (با متن) و جمع (فقط آیکن) */
export const DESKTOP_SIDEBAR_MODES = {
  EXPANDED: 'expanded',
  ICONS: 'icons',
};

const DESKTOP_MODE_STORAGE_KEY = 'zareoon_desktop_sidebar_mode_v3';

function normalizeDesktopMode(value) {
  if (value === DESKTOP_SIDEBAR_MODES.ICONS) return DESKTOP_SIDEBAR_MODES.ICONS;
  // حالت قدیمی collapsed → آیکن‌ها
  if (value === 'collapsed') return DESKTOP_SIDEBAR_MODES.ICONS;
  return DESKTOP_SIDEBAR_MODES.EXPANDED;
}

export function SidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [desktopSidebarMode, setDesktopSidebarModeState] = useState(DESKTOP_SIDEBAR_MODES.EXPANDED);
  const [desktopModeHydrated, setDesktopModeHydrated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DESKTOP_MODE_STORAGE_KEY);
      setDesktopSidebarModeState(normalizeDesktopMode(stored));
    } catch {
      setDesktopSidebarModeState(DESKTOP_SIDEBAR_MODES.EXPANDED);
    }
    setDesktopModeHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('openMobileSidebar') === '1') {
      sessionStorage.removeItem('openMobileSidebar');
      setIsSidebarOpen(true);
      return;
    }
    setIsSidebarOpen(false);
  }, [pathname]);

  const setDesktopSidebarMode = useCallback((next) => {
    const normalized = normalizeDesktopMode(next);
    setDesktopSidebarModeState(normalized);
    try {
      localStorage.setItem(DESKTOP_MODE_STORAGE_KEY, normalized);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleDesktopSidebar = useCallback(() => {
    setDesktopSidebarModeState((prev) => {
      const next =
        normalizeDesktopMode(prev) === DESKTOP_SIDEBAR_MODES.EXPANDED
          ? DESKTOP_SIDEBAR_MODES.ICONS
          : DESKTOP_SIDEBAR_MODES.EXPANDED;
      try {
        localStorage.setItem(DESKTOP_MODE_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const mode = normalizeDesktopMode(desktopSidebarMode);
  const isDesktopSidebarExpanded = mode === DESKTOP_SIDEBAR_MODES.EXPANDED;
  const isDesktopSidebarIcons = mode === DESKTOP_SIDEBAR_MODES.ICONS;

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        closeSidebar,
        openSidebar,
        desktopSidebarMode: mode,
        setDesktopSidebarMode,
        toggleDesktopSidebar,
        /** سازگاری با کدهای قبلی */
        expandDesktopSidebar: () => setDesktopSidebarMode(DESKTOP_SIDEBAR_MODES.EXPANDED),
        collapseDesktopSidebar: () => setDesktopSidebarMode(DESKTOP_SIDEBAR_MODES.ICONS),
        desktopModeHydrated,
        canExpandDesktopSidebar: isDesktopSidebarIcons,
        canCollapseDesktopSidebar: isDesktopSidebarExpanded,
        isDesktopSidebarExpanded,
        isDesktopSidebarIcons,
        isDesktopSidebarCollapsed: false,
      }}
    >
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
