"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";

function EscrowIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l8 4v6c0 4.4-3.4 7.7-8 8-4.6-.3-8-3.6-8-8V7l8-4zM9 12l2 2 4-4"
      />
    </svg>
  );
}

export default function ZareoonEscrowFeature({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const align = isRTL ? "text-right" : "text-left";
  const items = [1, 2, 3, 4].map((n) => t(`escrowItem${n}`));

  return (
    <article
      className={`relative w-full overflow-hidden rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-white to-teal-50 shadow-[0_18px_50px_-18px_rgba(16,185,129,0.22)] sm:rounded-2xl ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className={`pointer-events-none absolute inset-y-0 start-0 w-24 bg-gradient-to-r from-emerald-100/40 to-transparent sm:w-32 ${
          isRTL ? "start-auto end-0 bg-gradient-to-l from-emerald-100/40 to-transparent" : ""
        }`}
        aria-hidden
      />

      <div className={`relative px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 ${align}`}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300/70 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-900 sm:text-xs">
            {t("escrowBadge")}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 sm:text-xs">{t("siteName")}</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(14rem,20rem)] lg:items-start lg:gap-8">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <h3 className="text-lg font-extrabold leading-snug text-slate-900 sm:text-xl lg:text-2xl">
                  {t("escrowTitle")}
                </h3>
                <p className="max-w-3xl text-sm leading-7 text-slate-700 sm:text-[15px]">{t("escrowDescription")}</p>
                <p className="max-w-3xl text-xs leading-6 text-emerald-800/90 sm:text-sm">{t("escrowTagline")}</p>
              </div>
              <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start overflow-hidden rounded-2xl border border-emerald-200/80 bg-white p-2 shadow-md sm:h-28 sm:w-28 lg:h-32 lg:w-32 lg:p-3">
                <Image
                  src="/images/logo.png"
                  alt={t("siteName")}
                  width={128}
                  height={128}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {items.map((text, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-white/90 px-3 py-2.5 text-sm leading-6 text-slate-800 shadow-sm"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-emerald-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50">
                <EscrowIcon />
              </span>
              <p className="text-sm font-bold">{t("escrowExampleTitle")}</p>
            </div>
            <p className="text-xs leading-7 text-slate-700 sm:text-sm">{t("escrowExampleText")}</p>
          </aside>
        </div>
      </div>

      <Link
        href="/dashboard/escrow"
        className={`flex flex-col gap-2 border-t border-emerald-900/30 bg-emerald-800 px-4 py-3.5 text-white transition hover:bg-emerald-900 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 ${align}`}
      >
        <span className="text-sm font-medium leading-relaxed text-emerald-50/95">{t("escrowFooter")}</span>
        <span className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-emerald-50 sm:text-sm">
          {t("escrowCta")}
        </span>
      </Link>
    </article>
  );
}
