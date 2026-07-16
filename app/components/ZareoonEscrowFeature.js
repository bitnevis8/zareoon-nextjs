"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

function ShieldIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v6c0 4.4-3.4 7.7-8 8-4.6-.3-8-3.6-8-8V7l8-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.8 1.8 3.7-3.8" />
    </svg>
  );
}

function DocIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h6l4 4v10a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 4v4h4M9 13h6M9 17h4" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0L3.296 9.23a1 1 0 011.42-1.42l3.04 3.04 6.54-6.54a1 1 0 011.42 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FeatureList({ items, accent = "emerald" }) {
  const iconCls = accent === "teal" ? "text-teal-600" : "text-emerald-600";
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((text) => (
        <li key={text} className="flex gap-2.5 text-sm leading-6 text-slate-700">
          <span className={`mt-0.5 shrink-0 ${iconCls}`}>
            <CheckIcon />
          </span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ZareoonEscrowFeature({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const escrowItems = [1, 2, 3, 4].map((n) => t(`escrowItem${n}`));
  const lcItems = [1, 2, 3, 4].map((n) => t(`lcItem${n}`));

  return (
    <section
      className={`w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby="zareoon-exclusive-services-title"
    >
      {/* Header */}
      <header className="border-b border-slate-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_55%,#f0fdfa_100%)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <p className="text-[11px] font-semibold tracking-wide text-emerald-700 sm:text-xs">
          {t("escrowBadge")}
        </p>
        <h3
          id="zareoon-exclusive-services-title"
          className="mt-2 max-w-3xl text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl"
        >
          {t("escrowTitle")}
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px] sm:leading-7">
          {t("escrowDescription")}
        </p>
        <p className="mt-2 text-xs leading-6 text-slate-500 sm:text-sm">{t("escrowTagline")}</p>
      </header>

      {/* Services — one surface, two columns */}
      <div className="grid lg:grid-cols-2">
        <div className="border-b border-slate-100 px-4 py-5 sm:px-6 sm:py-6 lg:border-b-0 lg:border-e lg:border-slate-100 lg:px-8">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <ShieldIcon />
            </span>
            <div className="min-w-0">
              <h4 className="text-base font-bold text-slate-900">{t("escrowBlockTitle")}</h4>
              <p className="mt-0.5 text-xs text-slate-500">{t("escrowBlockHint")}</p>
            </div>
          </div>
          <FeatureList items={escrowItems} accent="emerald" />
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-6 text-slate-600">
            {t("escrowExampleText")}
          </p>
          <Link
            href="/dashboard/escrow"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:w-auto"
          >
            {t("escrowCta")}
          </Link>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              <DocIcon />
            </span>
            <div className="min-w-0">
              <h4 className="text-base font-bold text-slate-900">{t("lcTitle")}</h4>
              <p className="mt-0.5 text-xs text-slate-500">{t("lcBlockHint")}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-600">{t("lcSectionIntro")}</p>
          <FeatureList items={lcItems} accent="teal" />
          <Link
            href="/lc-request"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-teal-200 bg-teal-50 px-4 text-sm font-semibold text-teal-900 transition hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:w-auto"
          >
            {t("lcRequestCta")}
          </Link>
        </div>
      </div>

      {/* Liability — quiet footer, not a warning card */}
      <footer className="border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-xs leading-6 text-slate-500 sm:text-[13px] sm:leading-7">
          <span className="font-semibold text-slate-700">مسئولیت زارعون: </span>
          {t("escrowFooter")} {t("zareoonServicesLiabilityNote")}
        </p>
      </footer>
    </section>
  );
}
