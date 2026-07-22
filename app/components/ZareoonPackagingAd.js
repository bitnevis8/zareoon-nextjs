"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "../context/LanguageContext";
import AuthRequiredButton from "./ui/AuthRequiredButton";
import { ZAREOON_LOGO } from "../data/tradeProviderBranding";

const PACKAGING_CTA_HREF = "/zareoon?tab=services";

function PackageIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function PackagingCtaButton({ t, className = "", variant = "light" }) {
  const tone =
    variant === "solid"
      ? "bg-emerald-800 text-white ring-emerald-700 hover:bg-emerald-900"
      : "bg-white text-emerald-900 ring-white/40 hover:bg-emerald-50";

  return (
    <AuthRequiredButton
      href={PACKAGING_CTA_HREF}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-md ring-1 transition hover:shadow-lg active:scale-[0.99] sm:min-h-11 ${tone} ${className}`}
    >
      <PackageIcon
        className={`h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${variant === "solid" ? "text-emerald-100" : "text-emerald-700"}`}
      />
      <span>{t("packagingAdCta")}</span>
      <svg className="h-4 w-4 shrink-0 opacity-70 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
          clipRule="evenodd"
        />
      </svg>
    </AuthRequiredButton>
  );
}

function AdMainContent({ t }) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-4xl space-y-2">
          <div>
            <h2 className="text-base font-bold leading-7 text-slate-900 sm:text-lg sm:leading-8">
              {t("packagingAdTitle")}
            </h2>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:mt-1 sm:text-xs">
              {t("packagingAdBadge")}
            </p>
          </div>
          <p className="text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">{t("packagingAdDescription")}</p>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center self-start overflow-hidden rounded-2xl border border-emerald-200/80 bg-white p-1.5 shadow-md sm:h-20 sm:w-20">
          <Image
            src={ZAREOON_LOGO}
            alt={t("packagingAdBrandName")}
            width={80}
            height={80}
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:thin]">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-100 bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-slate-800 shadow-sm sm:text-xs"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>{t(`packagingAdItem${n}`)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function AdFooterBar({ t, isRTL, rounded = false }) {
  return (
    <div
      className={`flex flex-col gap-3 border-t border-emerald-900/40 bg-emerald-950 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 ${
        rounded ? "rounded-b-[1.75rem]" : ""
      } ${isRTL ? "text-right" : "text-left"}`}
    >
      <span className="text-xs leading-relaxed text-emerald-50/95 sm:text-sm">{t("packagingAdFooter")}</span>
      <PackagingCtaButton t={t} className="w-full sm:w-auto sm:shrink-0" />
    </div>
  );
}

/**
 * کارت اختصاصی بسته‌بندی زارعون — هم‌سبک آریا فولاد، با لوگوی زارعون.
 */
export default function ZareoonPackagingAd({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  return (
    <div className={`w-full ${className}`}>
      {/* دسکتاپ: کارت کامل */}
      <div className="mx-auto hidden w-full max-w-5xl lg:block">
        <div
          className={`relative block w-full overflow-hidden rounded-[2rem] border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-white to-teal-50 shadow-[0_18px_50px_-18px_rgba(16,185,129,0.35)] transition-shadow hover:shadow-[0_22px_55px_-20px_rgba(16,185,129,0.42)] ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          <div className="pointer-events-none absolute inset-y-0 start-0 w-32 bg-gradient-to-r from-emerald-100/50 to-transparent" />
          <div className="relative space-y-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
            <AdMainContent t={t} />
          </div>
          <AdFooterBar t={t} isRTL={isRTL} />
        </div>
      </div>

      {/* موبایل: تییزر فشرده */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        dir={isRTL ? "rtl" : "ltr"}
        className={`w-full rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/80 px-3.5 py-3 text-start shadow-sm transition-shadow hover:shadow-md lg:hidden ${
          isRTL ? "text-right" : "text-left"
        }`}
        aria-label={`${t("openAdDetails")}: ${t("packagingAdBrandName")}`}
      >
        <div className="flex items-start gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-200/80 bg-white p-1 shadow-sm">
            <Image src={ZAREOON_LOGO} alt="" width={40} height={40} className="h-full w-full object-contain" aria-hidden />
          </div>
          <p className="min-w-0 flex-1 text-xs leading-6 text-slate-700">
            <span className="font-extrabold text-emerald-900">{t("packagingAdBrandName")}</span>
            <span className="mx-1 text-slate-400" aria-hidden>
              ·
            </span>
            <span>{t("packagingAdTitle")}</span>
          </p>
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
            <svg className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </button>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[99999] flex items-end justify-center p-0 sm:items-center sm:p-4 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="zareoon-packaging-ad-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
            aria-label={t("closeGuide")}
          />
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-gradient-to-b from-emerald-50 via-white to-white shadow-xl sm:max-w-lg sm:rounded-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-emerald-100/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
              <h2 id="zareoon-packaging-ad-modal-title" className="truncate text-sm font-extrabold text-slate-900">
                {t("packagingAdCta")}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label={t("closeGuide")}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 px-4 py-4 sm:px-5">
              <AdMainContent t={t} />
              <p className="text-xs leading-6 text-slate-600">{t("packagingAdFooter")}</p>
            </div>

            <div className="sticky bottom-0 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
              <PackagingCtaButton t={t} variant="solid" className="w-full" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
