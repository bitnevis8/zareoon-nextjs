"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { ZAREOON_LOGO } from "../data/tradeProviderBranding";

export const PACKAGING_FEATURED_HREF = "/featured/packaging";

/**
 * کارت تمام‌عرض بسته‌بندی زارعون — موبایل سبک، کل کارت لینک به صفحه جزئیات.
 */
export default function ZareoonPackagingAd({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const enterLabel = t("packagingAdEnterCta");

  return (
    <Link
      href={PACKAGING_FEATURED_HREF}
      className={`group block w-full ${className}`}
      aria-label={enterLabel}
    >
      <article
        className={`relative w-full overflow-hidden rounded-xl border border-slate-200/90 bg-gradient-to-br from-slate-100 via-slate-50 to-white shadow-sm transition hover:border-slate-300 hover:shadow-md sm:rounded-2xl ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        <div className="flex items-center gap-3 px-3.5 py-3 sm:hidden">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <Image src={ZAREOON_LOGO} alt="" width={44} height={44} className="h-full w-full object-contain" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-slate-900">{t("packagingAdBrandName")}</p>
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-5 text-slate-600">{t("packagingAdTitle")}</p>
          </div>
          <span className="inline-flex shrink-0 flex-col items-end gap-0.5 text-slate-700">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/80 transition group-hover:bg-slate-300/80">
              <svg className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <span className="max-w-[4.5rem] text-end text-[9px] font-bold leading-tight">{enterLabel}</span>
          </span>
        </div>

        <div className="relative hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 start-0 w-28 bg-gradient-to-l from-transparent to-slate-200/35" />
          <div className="relative flex items-stretch gap-4 px-5 py-4 lg:px-6 lg:py-5">
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-xs font-semibold text-slate-500">{t("packagingAdBadge")}</p>
              <h2 className="text-base font-extrabold leading-7 text-slate-900 lg:text-lg">
                <span className="text-slate-900">{t("packagingAdBrandName")}</span>
                <span className="mx-1.5 text-slate-300" aria-hidden>
                  ·
                </span>
                <span className="text-slate-800">{t("packagingAdTitle")}</span>
              </h2>
              <p className="line-clamp-2 text-sm leading-6 text-slate-600">{t("packagingAdDescription")}</p>
            </div>
            <div className="flex shrink-0 flex-col items-center justify-between gap-3 self-stretch">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-md lg:h-20 lg:w-20">
                <Image
                  src={ZAREOON_LOGO}
                  alt={t("packagingAdBrandName")}
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 transition group-hover:text-slate-900 group-hover:underline lg:text-xs">
                {enterLabel}
                <svg className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
