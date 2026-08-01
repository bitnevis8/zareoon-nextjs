"use client";

/**
 * واترمارک برند روی تصویر محصول — لوگو + Zareoon.com
 * گوشه پایین، کمی بالاتر از لبه، پس‌زمینه گرادیان با شفافیت بالا
 */
export default function ZareoonImageWatermark({ className = "" }) {
  return (
    <div
      className={`pointer-events-none absolute bottom-4 right-3 z-[15] ${className}`}
      aria-hidden
    >
      <div
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 shadow-sm backdrop-blur-[2px]"
        style={{
          background:
            "linear-gradient(105deg, rgba(15,23,42,0.22) 0%, rgba(15,23,42,0.14) 55%, rgba(15,23,42,0.08) 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt=""
          width={22}
          height={22}
          className="h-[18px] w-[18px] object-contain opacity-90 sm:h-5 sm:w-5"
          draggable={false}
        />
        <span
          className="text-[10px] font-bold tracking-wide text-white sm:text-[11px]"
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
