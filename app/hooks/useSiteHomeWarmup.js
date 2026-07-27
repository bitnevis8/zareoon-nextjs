"use client";

import { useEffect, useRef } from "react";
import { API_ENDPOINTS } from "@/app/config/api";

let homeWarmupStarted = false;

function scheduleIdle(fn, timeout = 1800) {
  if (typeof window === "undefined") return () => {};
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(() => fn(), { timeout });
    return () => window.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(fn, Math.min(600, timeout));
  return () => window.clearTimeout(id);
}

async function warm(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    await fetch(url, { cache: "no-store", signal: controller.signal });
  } catch {
    /* ignore */
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Warmup استاندارد صفحه اصلی: فروشگاه‌ها، خدمات، VIP — بعد از idle تا LCP ضربه نخورد.
 */
export function useSiteHomeWarmup() {
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    if (homeWarmupStarted) return undefined;
    homeWarmupStarted = true;

    const cancelIdle = scheduleIdle(() => {
      if (cancelled.current) return;
      Promise.allSettled([
        warm(`${API_ENDPOINTS.tamin.recentShops}?limit=10`),
        warm(`${API_ENDPOINTS.tradeServiceProviders.getPublic}?limit=10`),
        warm(API_ENDPOINTS.siteSettings.getVipPublic),
        warm(API_ENDPOINTS.siteSettings.getLanguagesPublic),
      ]);
    }, 1600);

    return () => {
      cancelled.current = true;
      cancelIdle();
    };
  }, []);
}
