"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";

const NavigationLoadingContext = createContext(null);

function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function shouldTrackAnchor(anchor, currentUrl) {
  if (!anchor) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.dataset.noProgress === "true") return false;

  try {
    const next = new URL(href, currentUrl.origin);
    if (next.origin !== currentUrl.origin) return false;
    if (
      next.pathname === currentUrl.pathname &&
      next.search === currentUrl.search
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function NavigationLoadingProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [activeCount, setActiveCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const trickleRef = useRef(null);
  const hideRef = useRef(null);
  const showDelayRef = useRef(null);
  const hintDelayRef = useRef(null);
  const routeKeyRef = useRef(`${pathname}?${searchParams?.toString() || ""}`);
  const manualRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (trickleRef.current) {
      clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    if (hideRef.current) {
      clearTimeout(hideRef.current);
      hideRef.current = null;
    }
    if (showDelayRef.current) {
      clearTimeout(showDelayRef.current);
      showDelayRef.current = null;
    }
    if (hintDelayRef.current) {
      clearTimeout(hintDelayRef.current);
      hintDelayRef.current = null;
    }
  }, []);

  const startTrickle = useCallback(() => {
    if (trickleRef.current) return;
    trickleRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p;
        if (p < 30) return p + 8;
        if (p < 60) return p + 3.5;
        if (p < 80) return p + 1.5;
        return p + 0.4;
      });
    }, 280);
  }, []);

  const start = useCallback(() => {
    manualRef.current += 1;
    setActiveCount((c) => c + 1);
    if (hideRef.current) {
      clearTimeout(hideRef.current);
      hideRef.current = null;
    }
    setProgress((p) => (p > 0 && p < 100 ? Math.max(p, 12) : 12));
    if (!showDelayRef.current) {
      showDelayRef.current = setTimeout(() => {
        setVisible(true);
        showDelayRef.current = null;
      }, 80);
    } else {
      setVisible(true);
    }
    if (!hintDelayRef.current) {
      hintDelayRef.current = setTimeout(() => {
        setShowHint(true);
        hintDelayRef.current = null;
      }, 650);
    }
    startTrickle();
  }, [startTrickle]);

  const done = useCallback(() => {
    manualRef.current = Math.max(0, manualRef.current - 1);
    setActiveCount((c) => Math.max(0, c - 1));
  }, []);

  const forceComplete = useCallback(() => {
    clearTimers();
    setProgress(100);
    setShowHint(false);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
      hideRef.current = null;
    }, 320);
  }, [clearTimers]);

  useEffect(() => {
    const key = `${pathname}?${searchParams?.toString() || ""}`;
    if (key === routeKeyRef.current) return;
    routeKeyRef.current = key;
    if (activeCount > 0 || visible || progress > 0) {
      forceComplete();
      setActiveCount(0);
      manualRef.current = 0;
    }
  }, [pathname, searchParams, activeCount, visible, progress, forceComplete]);

  useEffect(() => {
    if (activeCount > 0) return;
    if (!visible && progress === 0) return;
    const t = setTimeout(() => {
      if (manualRef.current === 0) forceComplete();
    }, 120);
    return () => clearTimeout(t);
  }, [activeCount, visible, progress, forceComplete]);

  useEffect(() => {
    const onClick = (event) => {
      if (isModifiedClick(event)) return;
      const anchor = event.target?.closest?.("a[href]");
      if (!shouldTrackAnchor(anchor, window.location)) return;
      start();
    };

    const onPopState = () => {
      start();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [start]);

  const value = useMemo(
    () => ({
      start,
      done,
      async withLoading(fn) {
        start();
        try {
          return await fn();
        } finally {
          done();
        }
      },
      isLoading: activeCount > 0 || (visible && progress < 100),
    }),
    [start, done, activeCount, visible, progress]
  );

  return (
    <NavigationLoadingContext.Provider value={value}>
      {children}
      <NavigationProgressUI
        visible={visible}
        progress={progress}
        showHint={showHint}
        label={t("loading") || "در حال بارگذاری…"}
      />
    </NavigationLoadingContext.Provider>
  );
}

function NavigationProgressUI({ visible, progress, showHint, label }) {
  return (
    <>
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-[10050] h-[3px] overflow-hidden transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        role="progressbar"
        aria-hidden={!visible}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label={label}
      >
        <div
          className="nav-progress-bar relative h-full rounded-e-full bg-gradient-to-l from-emerald-400 via-emerald-500 to-green-600 shadow-[0_0_12px_rgba(16,185,129,0.65)] transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        >
          <span className="nav-progress-shine absolute inset-y-0 end-0 w-24" />
        </div>
      </div>

      <div
        className={`pointer-events-none fixed inset-x-0 top-3 z-[10050] flex justify-center transition-all duration-300 sm:top-4 ${
          visible && showHint ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/95 px-3.5 py-1.5 text-xs font-medium text-emerald-800 shadow-lg shadow-emerald-900/10 backdrop-blur-md">
          <span className="nav-progress-spinner h-3.5 w-3.5 shrink-0 rounded-full border-2 border-emerald-200 border-t-emerald-600" />
          <span>{label}</span>
        </div>
      </div>
    </>
  );
}

export function useNavigationLoading() {
  const ctx = useContext(NavigationLoadingContext);
  if (!ctx) {
    return {
      start: () => {},
      done: () => {},
      withLoading: async (fn) => fn(),
      isLoading: false,
    };
  }
  return ctx;
}
