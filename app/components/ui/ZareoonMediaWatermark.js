"use client";

/**
 * واترمارک گوشه پایین تصویر محصول: لوگو + Zareoon.com
 * پس‌زمینه گرادیانی با شفافیت حدود ۸۰٪
 */
export default function ZareoonMediaWatermark({ className = "" }) {
  return (
    <div
      className={`pointer-events-none absolute bottom-4 right-3 z-[18] ${className}`}
      aria-hidden
    >
      <div
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 shadow-sm backdrop-blur-[2px]"
        style={{
          background:
            "linear-gradient(105deg, rgba(15,23,42,0.22) 0%, rgba(15,23,42,0.12) 55%, rgba(15,23,42,0.05) 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt=""
          width={22}
          height={22}
          className="h-[18px] w-[18px] object-contain opacity-90 sm:h-[20px] sm:w-[20px]"
          draggable={false}
        />
        <span
          className="text-[11px] font-bold tracking-wide text-white sm:text-xs"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.4)",
          }}
        >
          Zareoon.com
        </span>
      </div>
    </div>
  );
}
