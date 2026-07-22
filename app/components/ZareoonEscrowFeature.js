"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
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
        <li key={text} className="flex gap-2.5 text-xs leading-6 text-slate-700 sm:text-sm">
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

function ArrowIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={`${className} rtl:rotate-180`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GuideIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
  );
}

function EscrowGuideModal({ open, onClose, t, isRTL }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="escrow-guide-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("closeGuide")}
      />
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-emerald-100 bg-white shadow-xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-emerald-100/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
          <h2 id="escrow-guide-modal-title" className="min-w-0 text-sm font-extrabold text-slate-900 sm:text-base">
            {t("escrowGuideModalTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label={t("closeGuide")}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-xs leading-7 text-slate-600 sm:text-sm sm:leading-7">{t("escrowGuideBody")}</p>

          <ul className="space-y-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 sm:p-4">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="flex gap-2.5 text-xs leading-6 text-slate-700 sm:text-sm">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white"
                  aria-hidden
                >
                  {n}
                </span>
                <span>{t(`escrowItem${n}`)}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-3 sm:px-4 sm:py-3.5">
            <p className="text-xs font-bold text-slate-900 sm:text-sm">{t("escrowExampleTitle")}</p>
            <p className="mt-1.5 text-xs leading-7 text-slate-600 sm:text-sm sm:leading-7">{t("escrowExampleText")}</p>
          </div>

          <p className="text-[11px] leading-6 text-slate-500 sm:text-xs sm:leading-6">{t("escrowFooter")}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ServicePanel({
  tone,
  icon,
  ctaIcon,
  title,
  hint,
  intro,
  items,
  guideLabel,
  onOpenGuide,
  ctaHref,
  ctaLabel,
  patternId,
}) {
  const isTeal = tone === "teal";
  const iconWrap = isTeal ? "bg-teal-700 text-white" : "bg-emerald-800 text-white";
  const panelBorder = isTeal ? "border-teal-200/80" : "border-emerald-200/80";
  const panelBg = isTeal ? "bg-gradient-to-b from-white to-teal-50/40" : "bg-gradient-to-b from-white to-emerald-50/50";
  const ctaClass = isTeal
    ? "border border-teal-300 bg-white text-teal-900 shadow-sm ring-1 ring-teal-100/80 hover:border-teal-400 hover:bg-teal-50 hover:shadow-md focus-visible:outline-teal-600"
    : "border border-emerald-300 bg-white text-emerald-900 shadow-sm ring-1 ring-emerald-100/80 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md focus-visible:outline-emerald-600";
  const ctaIconClass = isTeal ? "text-teal-700" : "text-emerald-700";
  const guideClass = isTeal
    ? "text-teal-800 hover:bg-teal-50 hover:text-teal-950"
    : "text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950";

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-xl border ${panelBorder} ${panelBg} p-3.5 shadow-[0_8px_28px_-18px_rgba(6,78,59,0.28)] sm:rounded-2xl sm:p-6`}
    >
      <SoftFieldPattern patternId={patternId} className="opacity-80" />
      <div className="relative flex items-start gap-2.5 sm:gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm sm:h-11 sm:w-11 sm:rounded-xl ${iconWrap}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">{title}</h4>
            {onOpenGuide && guideLabel ? (
              <button
                type="button"
                onClick={onOpenGuide}
                className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition sm:text-xs ${guideClass}`}
              >
                <GuideIcon className="h-3.5 w-3.5" />
                {guideLabel}
              </button>
            ) : null}
          </div>
          {hint ? <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:mt-1 sm:text-xs">{hint}</p> : null}
        </div>
      </div>

      {intro ? <p className="relative mt-3 hidden text-xs leading-6 text-slate-600 sm:block sm:text-sm sm:leading-7">{intro}</p> : null}

      <div className="hidden sm:block">
        <FeatureList items={items} tone={tone} />
      </div>

      <div className="relative mt-3 pt-0 sm:mt-auto sm:pt-5">
        <Link
          href={ctaHref}
          className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:min-h-11 sm:text-sm ${ctaClass}`}
        >
          <span className={`shrink-0 ${ctaIconClass}`}>{ctaIcon}</span>
          <span className="min-w-0 text-center">{ctaLabel}</span>
          <ArrowIcon className={`h-4 w-4 shrink-0 opacity-70 ${ctaIconClass}`} />
        </Link>
      </div>
    </article>
  );
}

/** Escrow + LC tools only (section header lives on parent trade-services shell). */
export default function ZareoonEscrowFeature({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const rawId = useId().replace(/:/g, "");
  const [guideOpen, setGuideOpen] = useState(false);
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
        ctaIcon={<ShieldIcon className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem]" />}
        title={t("escrowBlockTitle")}
        hint={t("escrowBlockHint")}
        items={escrowItems}
        guideLabel={t("escrowGuideLink")}
        onOpenGuide={() => setGuideOpen(true)}
        ctaHref="/dashboard/escrow"
        ctaLabel={t("escrowCta")}
        patternId={`${rawId}-escrow`}
      />
      <ServicePanel
        tone="teal"
        icon={<DocIcon className="h-5 w-5" />}
        ctaIcon={<DocIcon className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem]" />}
        title={t("lcTitle")}
        hint={t("lcBlockHint")}
        intro={t("lcSectionIntro")}
        items={lcItems}
        ctaHref="/lc-request"
        ctaLabel={t("lcRequestCta")}
        patternId={`${rawId}-lc`}
      />

      <EscrowGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} t={t} isRTL={isRTL} />
    </div>
  );
}
