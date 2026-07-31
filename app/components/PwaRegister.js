"use client";

import { useEffect } from "react";

function isCapacitorNative() {
  if (typeof window === "undefined") return false;
  try {
    if (window.Capacitor?.isNativePlatform?.()) return true;
    const p = window.Capacitor?.getPlatform?.();
    if (p && p !== "web") return true;
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * ثبت Service Worker برای قابلیت نصب PWA (در اپ Capacitor ثبت نمی‌شود).
 */
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (isCapacitorNative()) return;
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      return;
    }

    let cancelled = false;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        /* نصب اختیاری است؛ خطا را بی‌صدا رد می‌کنیم */
      });

    return () => {
      cancelled = true;
      void cancelled;
    };
  }, []);

  return null;
}
