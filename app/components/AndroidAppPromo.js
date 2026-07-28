"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

/** مسیر APK — پیش‌فرض هاست دانلود؛ با NEXT_PUBLIC_ANDROID_APK_URL قابل تغییر است */
export const ANDROID_APK_HREF =
  process.env.NEXT_PUBLIC_ANDROID_APK_URL ||
  "https://dl.zareoon.ir/zareoon/app/apks/zareoon-android.apk";

/** پارامتر جلوگیری از تو در تو شدن موکاپ داخل iframe */
export const PHONE_PREVIEW_PARAM = "phonePreview";

function AndroidIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.6 9.48l1.84-3.18a.5.5 0 10-.86-.5L16.7 9.05a7.87 7.87 0 00-4.7-1.55c-1.74 0-3.35.58-4.7 1.55L5.42 5.8a.5.5 0 10-.86.5l1.84 3.18A7.96 7.96 0 004 15.5V16a1 1 0 001 1h1v3.5a1.5 1.5 0 003 0V17h6v3.5a1.5 1.5 0 003 0V17h1a1 1 0 001-1v-.5a7.96 7.96 0 00-2.4-6.02zM9 13.75a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}

/**
 * موکاپ daisyUI — ظاهر سایت واقعی، بدون تعامل و بدون تغییر نشانگر موس
 */
function DaisyPhoneHomePreview({ homeSrc, label }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="android-phone-mockup relative mx-auto h-[528px] w-[254px] shrink-0 select-none"
      style={{ cursor: "inherit" }}
    >
      <div className="absolute left-1/2 top-0 origin-top -translate-x-1/2 scale-[0.6]">
        {/* https://daisyui.com/components/mockup-phone/ */}
        <div className="mockup-phone border-emerald-950/80 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.55)]">
          <div className="mockup-phone-camera" />
          <div className="mockup-phone-display relative overflow-hidden bg-white">
            {!loaded ? (
              <div className="absolute inset-0 z-[2] flex items-center justify-center bg-slate-100">
                <span className="h-8 w-8 animate-pulse rounded-full bg-slate-200" aria-hidden />
              </div>
            ) : null}
            {homeSrc ? (
              <iframe
                title={label}
                src={homeSrc}
                loading="lazy"
                tabIndex={-1}
                aria-hidden
                scrolling="no"
                className="pointer-events-none h-full w-full border-0 bg-white"
                style={{ cursor: "inherit" }}
                onLoad={() => setLoaded(true)}
              />
            ) : null}
            {/* لایه شفاف: کلیک/اسکرول قطع؛ نشانگر موس عوض نمی‌شود */}
            <div
              className="absolute inset-0 z-[3]"
              aria-hidden
              style={{ cursor: "inherit" }}
              onClick={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
              onWheel={(e) => e.preventDefault()}
              onTouchMove={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * دسکتاپ: بنر تمام‌عرض + موکاپ
 * موبایل: فقط دکمه دانلود
 */
export default function AndroidAppPromo({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const [homeSrc, setHomeSrc] = useState("");

  useEffect(() => {
    const url = new URL("/", window.location.origin);
    url.searchParams.set(PHONE_PREVIEW_PARAM, "1");
    setHomeSrc(`${url.pathname}${url.search}`);
  }, []);

  const points = [t("androidAppPoint1"), t("androidAppPoint2"), t("androidAppPoint3")];

  return (
    <section
      className={`relative overflow-hidden ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby="android-app-promo-title"
    >
      {/* موبایل */}
      <div className="border-t border-emerald-100 bg-gradient-to-b from-emerald-50 to-white px-3 py-4 lg:hidden">
        <a
          href={ANDROID_APK_HREF}
          download
          className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99]"
        >
          <AndroidIcon className="h-6 w-6 shrink-0" />
          {t("androidAppMobileCta")}
        </a>
        <p className="mt-2 text-center text-[11px] leading-5 text-slate-600">{t("androidAppMobileHint")}</p>
      </div>

      {/* دسکتاپ — تمام‌عرض */}
      <div className="relative hidden lg:block">
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-800"
          aria-hidden
        />
        {/* پترن نقطه‌ای نرم */}
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden
        />
        {/* هاله‌های نرم */}
        <div
          className="pointer-events-none absolute -start-24 top-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-16 bottom-0 h-80 w-80 rounded-full bg-teal-300/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-8 py-14 xl:grid-cols-[minmax(0,1.1fr)_auto] xl:gap-16 xl:px-10 xl:py-16">
          <div className="max-w-xl text-start text-white">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-semibold text-emerald-50 backdrop-blur-sm">
              <AndroidIcon className="h-7 w-7 shrink-0 text-[#3DDC84]" />
              {t("androidAppEyebrow")}
            </p>

            <h2
              id="android-app-promo-title"
              className="mt-5 text-[1.85rem] font-black leading-snug tracking-tight text-white xl:text-[2.1rem]"
            >
              {t("androidAppTitle")}
            </h2>

            <p className="mt-4 whitespace-pre-line text-[15px] leading-8 text-emerald-50/90 xl:text-base">
              {t("androidAppSubtitle")}
            </p>

            <ul className="mt-7 space-y-3.5">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[14px] leading-7 text-emerald-50/95">
                  <span
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3DDC84] text-[11px] font-bold text-emerald-950"
                    aria-hidden
                  >
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={ANDROID_APK_HREF}
                download
                className="inline-flex min-h-12 items-center gap-2.5 rounded-2xl bg-[#3DDC84] px-6 py-3 text-sm font-extrabold text-emerald-950 shadow-[0_14px_36px_-12px_rgba(61,220,132,0.65)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                <AndroidIcon className="h-6 w-6" />
                {t("androidAppDownload")}
              </a>
              <p className="max-w-xs text-xs leading-5 text-emerald-100/75">{t("androidAppDesktopHint")}</p>
            </div>
          </div>

          <DaisyPhoneHomePreview homeSrc={homeSrc} label={t("androidAppPhonePreviewLabel")} />
        </div>
      </div>
    </section>
  );
}
