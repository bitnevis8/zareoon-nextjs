"use client";

import { useLanguage } from "@/app/context/LanguageContext";

/** ارتباط مستقیم دو طرف — بدون واسطه */
function DirectLinkIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="6.5" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3.25 17.25c.7-2.15 2.2-3.25 3.25-3.25s2.55 1.1 3.25 3.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="17.5" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M14.25 17.25c.7-2.15 2.2-3.25 3.25-3.25s2.55 1.1 3.25 3.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M9.75 9.5h4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M13.15 8.1l1.4 1.4-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * پیام ارتباط مستقیم خریدار / فروشنده / خدمات — زیر دسته‌بندی‌ها
 */
export default function MarketplaceDisclaimer({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const title = t("marketplaceDirectTitle") || "ارتباط مستقیم و بی‌واسطه";
  const body =
    t("marketplaceDirectBody") ||
    "زارعون بستری برای معرفی کسب‌وکارها و برقراری ارتباط مستقیم میان خریداران، فروشندگان و ارائه‌دهندگان خدمات است. معاملات و توافق‌ها مستقیماً توسط طرفین انجام می‌شود و زارعون در معاملات عادی طرف قرارداد یا واسطه معامله نیست. پیش از هرگونه توافق یا پرداخت، اطلاعات و شرایط معامله را به‌دقت بررسی کنید.";

  return (
    <aside className={`w-full ${className}`} dir={isRTL ? "rtl" : "ltr"} role="note">
      <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 px-3.5 py-3.5 shadow-sm sm:px-4 sm:py-4">
        <div className="flex items-start gap-3 sm:items-center sm:gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 sm:h-12 sm:w-12">
            <DirectLinkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold leading-snug text-slate-900 sm:text-[15px]">{title}</p>
            <p className="mt-1.5 text-[11px] leading-6 text-slate-600 sm:text-xs sm:leading-6">{body}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
