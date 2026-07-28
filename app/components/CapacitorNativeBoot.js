"use client";

import { useLayoutEffect } from "react";

function isCapacitorNative() {
  if (typeof window === "undefined") return false;
  try {
    // Bridge نیتیو (قابل اعتمادتر از import پکیج روی remote URL)
    if (window.Capacitor?.isNativePlatform?.()) return true;
    const p = window.Capacitor?.getPlatform?.();
    if (p && p !== "web") return true;
  } catch {
    /* ignore */
  }
  return false;
}

function markNative() {
  document.documentElement.classList.add("capacitor-native");
  document.body?.classList.add("capacitor-native");
  document.documentElement.style.setProperty("--capacitor-safe-top", "0px");
}

/**
 * اپ Capacitor: Status Bar را نشان بده.
 * فاصلهٔ بالای صفحه در MainActivity با WindowInsets داده می‌شود.
 */
export default function CapacitorNativeBoot() {
  useLayoutEffect(() => {
    let cancelled = false;

    if (isCapacitorNative()) {
      markNative();
    }

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        const native =
          Capacitor.isNativePlatform() ||
          isCapacitorNative() ||
          (Capacitor.getPlatform?.() && Capacitor.getPlatform() !== "web");
        if (!native || cancelled) return;

        markNative();

        const [{ SplashScreen }, { StatusBar, Style }] = await Promise.all([
          import("@capacitor/splash-screen"),
          import("@capacitor/status-bar"),
        ]);

        try {
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.show();
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: "#064e3b" });
        } catch {
          /* plugin optional */
        }

        try {
          await SplashScreen.hide({ fadeOutDuration: 200 });
        } catch {
          /* ignore */
        }
      } catch {
        /* مرورگر — یا اگر bridge نیتیو بود کلاس را نگه دار */
        if (!cancelled && isCapacitorNative()) markNative();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
