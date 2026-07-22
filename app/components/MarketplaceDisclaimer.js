"use client";

import { useLanguage } from "@/app/context/LanguageContext";

function HandshakeIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.5 12.5l2.2 2.2a2.1 2.1 0 003 0l.8-.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 11.2l2.4-2.4a2 2 0 012.8 0l1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.2 9.9l1.3-1.3a2 2 0 012.8 0L20.5 11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 16.5c1.2 1.1 2.7 1.8 5 1.8s3.8-.7 5-1.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M9.2 8.2L8 7a2.2 2.2 0 00-3.1 0L3.5 8.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M14.8 8.2L16 7a2.2 2.2 0 013.1 0l1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 3v5c0 4.5-2.9 7.8-7 9-4.1-1.2-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M9.5 12.2l1.7 1.7 3.5-3.8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * پیام کوتاه ارتباط مستقیم خریدار/فروشنده — نسخه موبایل ساده‌تر و بدون لینک قوانین/اشتراک
 */
export default function MarketplaceDisclaimer({ className = "" }) {
  const { t, isRTL } = useLanguage();
  // از legacy برای متن کوتاه‌تر موبایل اگر لازم بود؛ فعلاً همان legal با UI متفاوت
  const title = t("marketplaceDirectTitle") || "ارتباط مستقیم خریدار و فروشنده";
  const body =
    t("marketplaceDirectBody") ||
    "در زارعون، خریداران و فروشندگان بدون واسطه با هم در ارتباط‌اند و معامله را خودشان پیش می‌برند.";

  return (
    <aside
      className={`w-full ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      role="note"
    >
      {/* موبایل */}
      <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50/60 px-3.5 py-3.5 shadow-sm sm:hidden">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <HandshakeIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold leading-snug text-slate-900">{title}</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-600">{body}</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-white text-emerald-700">
            <ShieldIcon className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* دسکتاپ */}
      <div className="hidden rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 shadow-sm sm:block">
        <div className="flex items-center gap-3.5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-700 shadow-sm">
            <HandshakeIcon className="h-8 w-8" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-snug text-slate-900">{title}</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600">{body}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
