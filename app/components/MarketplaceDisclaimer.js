"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/app/context/LanguageContext";

function LawIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M5 7h14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M7 7c0 2.2-1.12 4-2.5 4S2 9.2 2 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M17 7c0 2.2 1.12 4 2.5 4S22 9.2 22 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M4 21h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M9 21v-2a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RankIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 21h8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M12 17v4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M7 4h10v5.5c0 2.9-2.2 5.3-5 5.5-2.8-.2-5-2.6-5-5.5V4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M7 6H4.8A1.8 1.8 0 0 1 3 4.2V4h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 6h2.2A1.8 1.8 0 0 0 21 4.2V4h-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MarketplaceDisclaimer({ className = "" }) {
  const t = useTranslations("legal");
  const { isRTL } = useLanguage();

  return (
    <aside
      className={`group/disclaimer w-full rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-2.5 shadow-sm sm:rounded-2xl sm:px-4 sm:py-3 ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      role="note"
    >
      <div className="flex items-stretch gap-2.5 sm:gap-3.5">
        <div
          className="relative flex w-14 min-h-[4.5rem] shrink-0 items-center justify-center self-stretch overflow-hidden rounded-xl border border-amber-200/80 bg-white text-amber-800 shadow-sm sm:w-16 sm:min-h-[5.25rem] sm:rounded-2xl"
          aria-hidden
        >
          <span className="absolute inset-0 flex items-center justify-center transition duration-500 ease-out group-hover/disclaimer:scale-90 group-hover/disclaimer:opacity-0 group-hover/disclaimer:-rotate-12 group-focus-within/disclaimer:scale-90 group-focus-within/disclaimer:opacity-0 group-focus-within/disclaimer:-rotate-12">
            <LawIcon className="h-8 w-8 sm:h-9 sm:w-9" />
          </span>
          <span className="absolute inset-0 flex items-center justify-center scale-90 rotate-12 text-emerald-700 opacity-0 transition duration-500 ease-out group-hover/disclaimer:scale-100 group-hover/disclaimer:rotate-0 group-hover/disclaimer:opacity-100 group-focus-within/disclaimer:scale-100 group-focus-within/disclaimer:rotate-0 group-focus-within/disclaimer:opacity-100">
            <RankIcon className="h-8 w-8 sm:h-9 sm:w-9" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug text-slate-900">
            {t("homepageDisclaimer.title")}
          </p>
          <p className="mt-1 text-xs leading-6 text-slate-600 sm:mt-1.5">
            {t("homepageDisclaimer.body")}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 sm:mt-2 sm:text-xs">
            <Link href="/terms" className="font-medium text-emerald-700 hover:underline">
              {t("nav.terms")}
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link href="/pricing" className="font-medium text-emerald-700 hover:underline">
              {t("nav.pricing")}
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}
