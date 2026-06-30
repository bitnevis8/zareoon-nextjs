"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getStockLegend } from "../utils/stockUtils";

function HelpIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function GuideContent({ showCategoryGuide, t, legendItems }) {
  return (
    <div className="space-y-5 text-xs leading-6">
      {showCategoryGuide ? (
        <section>
          <p className="font-semibold text-slate-800 mb-1.5">{t("categoryProductGuideTitle")}</p>
          <p className="text-slate-500 mb-2.5">{t("categoryProductGuideIntro")}</p>
          <div className="space-y-2 text-slate-600">
            <p>
              <span className="font-semibold text-slate-800">{t("category")}</span>
              <span className="text-slate-400 mx-1.5" aria-hidden>
                —
              </span>
              {t("categoryProductGuideCategory")}
            </p>
            <p>
              <span className="font-semibold text-slate-800">{t("product")}</span>
              <span className="text-slate-400 mx-1.5" aria-hidden>
                —
              </span>
              {t("categoryProductGuideProduct")}
            </p>
          </div>
        </section>
      ) : null}

      <section>
        <p className="font-medium text-slate-700 mb-2">{t("stockLegendTitle")}</p>
        <div className="flex flex-wrap gap-2">
          {legendItems.map((item) => (
            <div
              key={item.className}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs border ${item.className}`}
            >
              <span className="font-medium">{item.label}</span>
              <span className="opacity-80">({item.range})</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MobileGuideTrigger({ label, onOpen, openGuideLabel }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start hover:bg-slate-50/80 transition-colors"
      aria-label={`${openGuideLabel}: ${label}`}
    >
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600">
        <HelpIcon className="w-5 h-5" />
      </span>
    </button>
  );
}

export default function CatalogGuidePanel({ showCategoryGuide = true, className = "" }) {
  const { t, isRTL } = useLanguage();
  const legendItems = getStockLegend(t);
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
      {/* Mobile: compact title rows + help icon */}
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={`lg:hidden w-full rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden divide-y divide-slate-200 ${className}`}
      >
        {showCategoryGuide ? (
          <MobileGuideTrigger
            label={t("categoryProductGuideTitle")}
            onOpen={openModal}
            openGuideLabel={t("openGuideHelp")}
          />
        ) : null}
        <MobileGuideTrigger
          label={t("stockLegendShortTitle")}
          onOpen={openModal}
          openGuideLabel={t("openGuideHelp")}
        />
      </div>

      {/* Desktop: full inline panel */}
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={`hidden lg:block w-full rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden ${className}`}
        role="note"
        aria-label={showCategoryGuide ? t("catalogGuidePanelAriaLabel") : t("stockLegendAriaLabel")}
      >
        <div
          className={`grid grid-cols-1 ${
            showCategoryGuide ? "lg:grid-cols-2" : ""
          } divide-y lg:divide-y-0 lg:divide-x divide-slate-200`}
        >
          {showCategoryGuide ? (
            <section className="px-4 py-4 sm:px-5 sm:py-5 bg-white/90">
              <p className="text-xs font-semibold text-slate-800 mb-1.5">{t("categoryProductGuideTitle")}</p>
              <p className="text-xs text-slate-500 mb-2.5 leading-6">{t("categoryProductGuideIntro")}</p>
              <div className="space-y-2 text-xs text-slate-600 leading-6">
                <p>
                  <span className="font-semibold text-slate-800">{t("category")}</span>
                  <span className="text-slate-400 mx-1.5" aria-hidden>
                    —
                  </span>
                  {t("categoryProductGuideCategory")}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">{t("product")}</span>
                  <span className="text-slate-400 mx-1.5" aria-hidden>
                    —
                  </span>
                  {t("categoryProductGuideProduct")}
                </p>
              </div>
            </section>
          ) : null}

          <section className={`px-4 py-4 sm:px-5 sm:py-5 ${showCategoryGuide ? "" : "lg:col-span-1"}`}>
            <p className="text-xs font-medium text-slate-600 mb-2">{t("stockLegendTitle")}</p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {legendItems.map((item) => (
                <div
                  key={item.className}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs border ${item.className}`}
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="opacity-80">({item.range})</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Mobile guide modal */}
      {modalOpen ? (
        <div
          className="lg:hidden fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-guide-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={closeModal}
            aria-label={t("closeGuide")}
          />
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className="relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:px-5">
              <h2 id="catalog-guide-modal-title" className="text-base font-semibold text-slate-900">
                {t("catalogGuidePanelAriaLabel")}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label={t("closeGuide")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <GuideContent showCategoryGuide={showCategoryGuide} t={t} legendItems={legendItems} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
