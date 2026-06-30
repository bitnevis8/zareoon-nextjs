"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

const LC_REQUEST_PATH = "/lc-request";

function LcMainContent({ t }) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-4xl space-y-2">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold leading-8 sm:leading-10 text-slate-900">
            {t("lcTitle")}
          </h2>
          <p className="text-sm sm:text-base leading-7 text-slate-700">{t("lcDescription")}</p>
        </div>
        <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 border border-emerald-200/80 shadow-md overflow-hidden self-start">
          <Image
            src="/images/logo.png"
            alt={t("siteName")}
            width={80}
            height={80}
            className="object-contain w-full h-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5 text-sm">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="rounded-2xl border border-emerald-100 bg-white/90 px-3 py-3 text-slate-800 shadow-sm flex items-start gap-2"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>{t(`lcItem${n}`)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function LcFooterBar({ t, isRTL, rounded = false, asLink = false }) {
  const className = `flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-emerald-800 px-4 py-3.5 sm:px-6 text-sm font-semibold text-white border-t border-emerald-900/40 ${
    rounded ? "rounded-b-[1.75rem]" : ""
  } ${isRTL ? "text-right" : "text-left"}`;

  const inner = (
    <>
      <span className="text-emerald-50/95 leading-relaxed">{t("lcFooter")}</span>
      <span className="inline-flex items-center justify-center rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-emerald-100 text-xs sm:text-sm whitespace-nowrap">
        {t("lcRequestCta")}
      </span>
    </>
  );

  if (asLink) {
    return (
      <Link href={LC_REQUEST_PATH} className={`${className} hover:bg-emerald-900 transition-colors`}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

export default function ZareoonLcAd() {
  const { t, isRTL } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <>
      {/* Desktop: full inline box */}
      <div className="hidden lg:block w-full max-w-5xl mx-auto space-y-2">
        <div className={`flex items-center gap-2 px-1 ${isRTL ? "justify-end" : "justify-start"}`}>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300/70 bg-emerald-50 px-2.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-emerald-900">
            {t("lcBadge")}
          </span>
          <span className="text-[11px] sm:text-xs text-slate-400">{t("siteName")}</span>
        </div>
        <div
          className={`block w-full rounded-[2rem] border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-white to-teal-50 shadow-[0_18px_50px_-18px_rgba(16,185,129,0.28)] overflow-hidden relative ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-emerald-100/40 to-transparent pointer-events-none" />
          <div className="relative px-4 py-4 sm:px-6 sm:py-5 lg:px-8 space-y-4">
            <LcMainContent t={t} />
          </div>
          <LcFooterBar t={t} isRTL={isRTL} asLink />
        </div>
      </div>

      {/* Mobile: compact teaser */}
      <button
        type="button"
        onClick={openModal}
        dir={isRTL ? "rtl" : "ltr"}
        className={`lg:hidden w-full rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/80 px-3.5 py-3 text-start shadow-sm hover:shadow-md transition-shadow ${
          isRTL ? "text-right" : "text-left"
        }`}
        aria-label={`${t("openLcDetails")}: ${t("lcTitle")}`}
      >
        <div className="flex items-start gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 border border-emerald-200/80 shadow-sm overflow-hidden">
            <Image
              src="/images/logo.png"
              alt=""
              width={40}
              height={40}
              className="object-contain w-full h-full"
              aria-hidden
            />
          </div>
          <p className="text-xs leading-6 text-slate-700 flex-1 min-w-0">
            <span className="font-extrabold text-emerald-900">{t("siteName")}</span>
            <span className="text-slate-400 mx-1" aria-hidden>
              ·
            </span>
            <span>{t("lcTitle")}</span>
          </p>
          <span className="inline-flex shrink-0 items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 mt-0.5">
            <svg className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </button>

      {/* Mobile modal */}
      {modalOpen ? (
        <div
          className="lg:hidden fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="zareoon-lc-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={closeModal}
            aria-label={t("closeGuide")}
          />
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-gradient-to-b from-emerald-50 via-white to-white shadow-xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-emerald-100/80 bg-white/95 backdrop-blur px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">{t("lcBadge")}</p>
                <h2 id="zareoon-lc-modal-title" className="text-sm font-extrabold text-slate-900 truncate">
                  {t("lcTitle")}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex shrink-0 items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label={t("closeGuide")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 py-4 sm:px-5 space-y-4">
              <LcMainContent t={t} />
              <LcFooterBar t={t} isRTL={isRTL} rounded />
            </div>

            <div className="sticky bottom-0 border-t border-slate-100 bg-white/95 backdrop-blur px-4 py-3 sm:px-5">
              <Link
                href={LC_REQUEST_PATH}
                onClick={closeModal}
                className="flex w-full items-center justify-center rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900 transition-colors"
              >
                {t("lcRequestCta")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
