"use client";

import { useId } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

function ShieldIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v6c0 4.4-3.4 7.7-8 8-4.6-.3-8-3.6-8-8V7l8-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.8 1.8 3.7-3.8" />
    </svg>
  );
}

function DocIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h6l4 4v10a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 4v4h4M9 13h6M9 17h4" />
    </svg>
  );
}

/** Soft grid + dots — matches Zareoon marketplace chrome (no busy leaf clutter). */
function SoftFieldPattern({ patternId, className = "" }) {
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden>
      <defs>
        <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="#047857" strokeOpacity="0.07" strokeWidth="0.75" />
          <circle cx="14" cy="14" r="1.15" fill="#059669" fillOpacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function FeatureList({ items, tone = "emerald" }) {
  const bullet =
    tone === "teal"
      ? "bg-teal-600/12 text-teal-800 ring-teal-600/10"
      : "bg-emerald-600/12 text-emerald-800 ring-emerald-600/10";
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((text) => (
        <li key={text} className="flex gap-2.5 text-sm leading-6 text-slate-700">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ${bullet}`}
            aria-hidden
          >
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0L3.296 9.23a1 1 0 011.42-1.42l3.04 3.04 6.54-6.54a1 1 0 011.42 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

function ServicePanel({
  tone,
  icon,
  title,
  hint,
  intro,
  items,
  example,
  ctaHref,
  ctaLabel,
  ctaVariant = "solid",
  patternId,
}) {
  const isTeal = tone === "teal";
  const iconWrap = isTeal ? "bg-teal-700 text-white" : "bg-emerald-800 text-white";
  const panelBorder = isTeal ? "border-teal-200/80" : "border-emerald-200/80";
  const panelBg = isTeal ? "bg-gradient-to-b from-white to-teal-50/40" : "bg-gradient-to-b from-white to-emerald-50/50";
  const ctaClass =
    ctaVariant === "outline"
      ? "border border-teal-300/80 bg-white text-teal-900 hover:bg-teal-50 focus-visible:outline-teal-600"
      : "border border-emerald-900/10 bg-emerald-800 text-white hover:bg-emerald-900 focus-visible:outline-emerald-700";

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border ${panelBorder} ${panelBg} p-5 shadow-[0_8px_28px_-18px_rgba(6,78,59,0.28)] sm:p-6`}
    >
      <SoftFieldPattern patternId={patternId} className="opacity-80" />
      <div className="relative flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${iconWrap}`}>
          {icon}
        </span>
        <div className="min-w-0 pt-0.5">
          <h4 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">{title}</h4>
          {hint ? <p className="mt-1 text-xs font-medium text-slate-500 sm:text-[13px]">{hint}</p> : null}
        </div>
      </div>

      {intro ? <p className="relative mt-3 text-sm leading-7 text-slate-600">{intro}</p> : null}

      <FeatureList items={items} tone={tone} />

      {example ? (
        <p className="relative mt-4 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-3 text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
          {example}
        </p>
      ) : null}

      <div className="relative mt-auto pt-5">
        <Link
          href={ctaHref}
          className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto ${ctaClass}`}
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

/** Escrow + LC tools only (section header lives on parent trade-services shell). */
export default function ZareoonEscrowFeature({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const rawId = useId().replace(/:/g, "");
  const escrowItems = [1, 2, 3, 4].map((n) => t(`escrowItem${n}`));
  const lcItems = [1, 2, 3, 4].map((n) => t(`lcItem${n}`));

  return (
    <div
      className={`relative grid gap-3 sm:gap-4 lg:grid-cols-2 ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <ServicePanel
        tone="emerald"
        icon={<ShieldIcon className="h-5 w-5" />}
        title={t("escrowBlockTitle")}
        hint={t("escrowBlockHint")}
        items={escrowItems}
        example={t("escrowExampleText")}
        ctaHref="/dashboard/escrow"
        ctaLabel={t("escrowCta")}
        ctaVariant="solid"
        patternId={`${rawId}-escrow`}
      />
      <ServicePanel
        tone="teal"
        icon={<DocIcon className="h-5 w-5" />}
        title={t("lcTitle")}
        hint={t("lcBlockHint")}
        intro={t("lcSectionIntro")}
        items={lcItems}
        ctaHref="/lc-request"
        ctaLabel={t("lcRequestCta")}
        ctaVariant="outline"
        patternId={`${rawId}-lc`}
      />
    </div>
  );
}
