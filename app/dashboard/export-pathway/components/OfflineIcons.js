/** آیکن‌های SVG محلی — بدون وابستگی به CDN / فونت خارجی */

export function IconWarning({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 4.3L2.6 18a1.5 1.5 0 001.3 2.25h16.2A1.5 1.5 0 0021.4 18L13.7 4.3a1.5 1.5 0 00-2.6 0z" />
    </svg>
  );
}

export function IconCube({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 7.5l-9-4.5-9 4.5m18 0l-9 4.5m9-4.5v9l-9 4.5m0-9L3 7.5m9 4.5v9M3 7.5v9l9 4.5"
      />
    </svg>
  );
}

export function IconChevron({ className = "h-4 w-4", open = false }) {
  return (
    <svg
      className={`${className} transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconCheck({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
