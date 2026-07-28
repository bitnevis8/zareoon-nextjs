"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders children only when the placeholder enters (or nears) the viewport.
 * Keeps below-the-fold chunks and API calls off the critical path.
 */
export default function LazyWhenVisible({
  children,
  fallback = null,
  rootMargin = "240px 0px",
  minHeight,
  className = "",
  id,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // WebView اندروید گاهی IntersectionObserver را غلط می‌دهد → اسکلتون دائمی
    const forceShow =
      typeof IntersectionObserver === "undefined" ||
      document.documentElement.classList.contains("capacitor-native") ||
      Boolean(window.Capacitor?.isNativePlatform?.());
    if (forceShow) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    // اگر IO گیر کرد (بعضی WebViewها)، بعد از کمی صبر محتوا را نشان بده
    const fallback = window.setTimeout(() => setVisible(true), 1200);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={minHeight != null ? { minHeight } : undefined}
    >
      {visible ? children : fallback}
    </div>
  );
}
