"use client";

import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/app/context/LanguageContext";
import MobileExploreSearch from "@/app/components/MobileExploreSearch";

function ModalFallback() {
  return (
    <div className="flex h-full min-h-[16rem] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
    </div>
  );
}

/**
 * Desktop/tablet advanced search dialog.
 * Full-viewport sheet on smaller widths; centered modal on large screens.
 */
export default function ExploreSearchModal({ isOpen, onClose, initialQuery = "" }) {
  const { t, isRTL } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      onClose();
    }, 180);
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9998] flex items-stretch justify-center p-0 sm:items-center sm:p-4 md:p-6 lg:p-8 ${
        closing ? "pointer-events-none" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={t("searchAdvanced")}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] transition-opacity duration-200 ${
          closing ? "opacity-0" : "opacity-100"
        }`}
        aria-label={t("close")}
        onClick={handleClose}
      />

      <div
        className={`relative flex h-[100dvh] w-full max-w-none flex-col overflow-hidden bg-white shadow-2xl transition duration-200 sm:h-[min(92dvh,56rem)] sm:max-w-3xl sm:rounded-2xl sm:border sm:border-slate-200 md:max-w-4xl lg:max-w-5xl xl:max-w-6xl ${
          closing ? "translate-y-3 scale-[0.98] opacity-0 sm:translate-y-2" : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 sm:text-base">{t("searchAdvanced")}</p>
            <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{t("mobileSearchHint")}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            aria-label={t("close")}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <Suspense fallback={<ModalFallback />}>
            <MobileExploreSearch
              variant="modal"
              initialQuery={initialQuery}
              onRequestClose={handleClose}
            />
          </Suspense>
        </div>
      </div>
    </div>,
    document.body
  );
}
