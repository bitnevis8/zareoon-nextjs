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

function NetworkIcon({ className = "h-7 w-7" }) {
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
      className={`relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-900 shadow-[0_16px_48px_rgba(6,78,59,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] ${className}`}
    >
      <JoinBannerPattern gridId={patternId} />
      <div
        className="pointer-events-none absolute -left-12 -top-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 end-0 h-56 w-56 rounded-full bg-amber-300/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-amber-300/80 via-emerald-300/40 to-transparent"
        aria-hidden
      />

      <div
        className={`relative flex flex-col items-center gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:py-7 ${
          isRTL ? "sm:text-right" : "sm:text-left"
        } text-center`}
      >
        <div className={`flex max-w-3xl flex-col items-center gap-4 sm:flex-row sm:items-center ${isRTL ? "sm:flex-row-reverse" : ""}`}>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-sm">
            <NetworkIcon />
          </div>
          <div className="space-y-1.5">
            <p className="inline-flex items-center rounded-full border border-amber-200/25 bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-100 sm:text-[11px]">
              {t("tradeServicesJoinBadge")}
            </p>
            <p className="text-sm font-medium leading-7 text-emerald-50/95 sm:text-[15px] sm:leading-8">
              {t("tradeServicesJoinBanner")}
            </p>
          </div>
        </div>

        <AuthRequiredButton
          href="/trade-services/register"
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-white to-emerald-50 px-5 py-3 text-sm font-bold text-emerald-900 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition hover:from-amber-50 hover:to-white hover:shadow-[0_6px_28px_rgba(251,191,36,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:opacity-60"
        >
          {t("tradeProviderRegisterCta")}
          <svg
            className={`h-4 w-4 text-emerald-700 transition group-hover:translate-x-0.5 ${isRTL ? "rotate-180 group-hover:-translate-x-0.5" : ""}`}
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
