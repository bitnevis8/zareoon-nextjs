"use client";

import { useId } from "react";
import { useLanguage } from "../context/LanguageContext";
import AuthRequiredButton from "./ui/AuthRequiredButton";

function JoinBannerPattern({ gridId }) {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={gridId} width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-white" />
          <circle cx="14" cy="14" r="1" fill="currentColor" className="text-emerald-200" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${gridId})`} />
    </svg>
  );
}

function NetworkIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path strokeLinecap="round" d="M12 7.5v3M9.2 13.5 6.8 16.8M14.8 13.5l2.4 3.3" />
    </svg>
  );
}

export default function TradeServicesJoinBanner({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const patternId = useId();

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-emerald-700/20 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(6,78,59,0.18)] sm:rounded-2xl sm:shadow-[0_16px_48px_rgba(6,78,59,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] ${className}`}
    >
      <JoinBannerPattern gridId={patternId} />
      <div
        className="pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl sm:h-48 sm:w-48"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 end-0 h-40 w-40 rounded-full bg-teal-300/15 blur-3xl sm:-bottom-20 sm:h-56 sm:w-56"
        aria-hidden
      />

      <div
        className={`relative flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:py-7 ${
          isRTL ? "text-right sm:text-right" : "text-left sm:text-left"
        }`}
      >
        <div className={`flex items-start gap-3 sm:max-w-3xl sm:items-center sm:gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm sm:h-14 sm:w-14 sm:rounded-2xl">
            <NetworkIcon className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 space-y-1 sm:space-y-1.5">
            <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-50 sm:px-2.5 sm:text-[11px]">
              {t("tradeServicesJoinBadge")}
            </p>
            <p className="text-xs font-medium leading-6 text-emerald-50/95 sm:text-[15px] sm:leading-8">
              {t("tradeServicesJoinBanner")}
            </p>
          </div>
        </div>

        <AuthRequiredButton
          href="/trade-services/register"
          className="group inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-60 sm:min-h-11 sm:w-auto sm:rounded-xl sm:bg-gradient-to-b sm:from-white sm:to-emerald-50 sm:px-5 sm:py-3 sm:text-sm sm:text-emerald-900 sm:shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:hover:from-amber-50 sm:hover:to-white sm:hover:shadow-[0_6px_28px_rgba(251,191,36,0.25)] sm:focus-visible:ring-amber-300/60"
        >
          {t("tradeProviderRegisterCta")}
          <svg
            className={`h-3.5 w-3.5 transition group-hover:translate-x-0.5 sm:h-4 sm:w-4 sm:text-emerald-700 ${isRTL ? "rotate-180 group-hover:-translate-x-0.5" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </AuthRequiredButton>
      </div>
    </div>
  );
}
