'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SidebarContext = createContext();

export const DESKTOP_SIDEBAR_MODES = {
  EXPANDED: 'expanded',
  ICONS: 'icons',
  COLLAPSED: 'collapsed',
};

const DESKTOP_MODE_ORDER = [
  DESKTOP_SIDEBAR_MODES.EXPANDED,
  DESKTOP_SIDEBAR_MODES.ICONS,
  DESKTOP_SIDEBAR_MODES.COLLAPSED,
];

const DESKTOP_MODE_STORAGE_KEY = 'zareoon_desktop_sidebar_mode_v2';

function normalizeDesktopMode(value) {
  if (DESKTOP_MODE_ORDER.includes(value)) return value;
  return DESKTOP_SIDEBAR_MODES.EXPANDED;
}

function stepDesktopMode(current, direction) {
  const idx = DESKTOP_MODE_ORDER.indexOf(normalizeDesktopMode(current));
  const nextIdx = Math.min(DESKTOP_MODE_ORDER.length - 1, Math.max(0, idx + direction));
  return DESKTOP_MODE_ORDER[nextIdx];
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
    if (typeof window !== "undefined" && sessionStorage.getItem("openMobileSidebar") === "1") {
      sessionStorage.removeItem("openMobileSidebar");
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

  const expandDesktopSidebar = useCallback(() => {
    setDesktopSidebarModeState((prev) => {
      const next = stepDesktopMode(prev, -1);
      try {
        localStorage.setItem(DESKTOP_MODE_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const collapseDesktopSidebar = useCallback(() => {
    setDesktopSidebarModeState((prev) => {
      const next = stepDesktopMode(prev, +1);
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

  return (
    <SidebarContext.Provider value={{
      isSidebarOpen,
      setIsSidebarOpen,
      toggleSidebar,
      closeSidebar,
      openSidebar,
      desktopSidebarMode: mode,
      setDesktopSidebarMode,
      expandDesktopSidebar,
      collapseDesktopSidebar,
      desktopModeHydrated,
      canExpandDesktopSidebar: mode !== DESKTOP_SIDEBAR_MODES.EXPANDED,
      canCollapseDesktopSidebar: mode !== DESKTOP_SIDEBAR_MODES.COLLAPSED,
      isDesktopSidebarExpanded: mode === DESKTOP_SIDEBAR_MODES.EXPANDED,
      isDesktopSidebarIcons: mode === DESKTOP_SIDEBAR_MODES.ICONS,
      isDesktopSidebarCollapsed: mode === DESKTOP_SIDEBAR_MODES.COLLAPSED,
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
