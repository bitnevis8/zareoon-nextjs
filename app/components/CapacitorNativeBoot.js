"use client";

import { useLayoutEffect } from "react";

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

function unlockDocumentScroll() {
  const root = document.documentElement;
  const body = document.body;
  root.classList.remove("phone-preview");
  root.style.removeProperty("overflow");
  root.style.removeProperty("height");
  root.style.removeProperty("max-height");
  root.style.removeProperty("touch-action");
  root.style.removeProperty("pointer-events");
  if (body) {
    body.style.removeProperty("overflow");
    body.style.removeProperty("height");
    body.style.removeProperty("max-height");
    body.style.removeProperty("touch-action");
    body.style.removeProperty("pointer-events");
  }
}

function markNative() {
  document.documentElement.classList.add("capacitor-native");
  document.body?.classList.add("capacitor-native");
  document.documentElement.style.setProperty("--capacitor-safe-top", "0px");
  unlockDocumentScroll();
}

/**
 * اپ Capacitor: Status Bar + باز کردن قفل اسکرول روی همه WebViewها
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
          // overlay=false با decorFitsSystemWindows نیتیو هم‌خوان است و لمس را خراب نمی‌کند
          await StatusBar.setOverlaysWebView({ overlay: false });
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

        unlockDocumentScroll();
      } catch {
        if (!cancelled && isCapacitorNative()) markNative();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
