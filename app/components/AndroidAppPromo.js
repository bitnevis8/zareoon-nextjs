"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

/** مسیر APK — پیش‌فرض هاست دانلود؛ با NEXT_PUBLIC_ANDROID_APK_URL قابل تغییر است */
export const ANDROID_APK_HREF =
  process.env.NEXT_PUBLIC_ANDROID_APK_URL ||
  "https://dl.zareoon.ir/zareoon/app/apks/zareoon-android.apk";

/** پارامتر جلوگیری از تو در تو شدن موکاپ داخل iframe (سازگاری با SiteChrome) */
export const PHONE_PREVIEW_PARAM = "phonePreview";

/** آیه واقعه ۶۴ — عربی، فارسی، سپس سه زبان دیگر */
const MOCKUP_AYAH_LINES = [
  {
    lang: "ar",
    label: "العربية",
    dir: "rtl",
    quran: true,
    text: "ءَأَنتُمۡ تَزۡرَعُونَهُۥٓ أَمۡ نَحۡنُ ٱلزَّـٰرِعُونَ",
  },
  {
    lang: "fa",
    label: "فارسی",
    dir: "rtl",
    text: "آیا شما آن را می‌رویید یا ما رویاننده‌ایم؟",
  },
  {
    lang: "en",
    label: "English",
    dir: "ltr",
    text: "Is it you who make it grow, or are We the grower?",
  },
  {
    lang: "ur",
    label: "اردو",
    dir: "rtl",
    text: "کیا تم اسے اگاتے ہو یا ہم اگانے والے ہیں؟",
  },
  {
    lang: "tr",
    label: "Türkçe",
    dir: "ltr",
    text: "Onu siz mi bitiriyorsunuz, yoksa bitiren Biz miyiz?",
  },
];

const MOCKUP_AYAH_REF = "القرآن · الواقعة ٦٤";

function AndroidIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.6 9.48l1.84-3.18a.5.5 0 10-.86-.5L16.7 9.05a7.87 7.87 0 00-4.7-1.55c-1.74 0-3.35.58-4.7 1.55L5.42 5.8a.5.5 0 10-.86.5l1.84 3.18A7.96 7.96 0 004 15.5V16a1 1 0 001 1h1v3.5a1.5 1.5 0 003 0V17h6v3.5a1.5 1.5 0 003 0V17h1a1 1 0 001-1v-.5a7.96 7.96 0 00-2.4-6.02zM9 13.75a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}

function DeviceInstallIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M12 8v6.5m0 0L9.5 12M12 14.5l2.5-2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="18.25" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function detectPlatform() {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iPad|iPhone|iPod/.test(ua) || iPadOs) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
  if (window.navigator.standalone === true) return true;
  return false;
}

function isCapacitorNative() {
  try {
    if (window.Capacitor?.isNativePlatform?.()) return true;
    const p = window.Capacitor?.getPlatform?.();
    if (p && p !== "web") return true;
  } catch {
    /* ignore */
  }
  return document.documentElement.classList.contains("capacitor-native");
}

/** صفحه داخل موکاپ: لوگو + آیه چندزبانه */
function MockupAyahScreen({ compact }) {
  return (
    <div
      className={[
        "relative flex h-full w-full flex-col overflow-hidden",
        compact ? "px-1.5 pb-1.5 pt-3" : "px-3.5 pb-3.5 pt-7",
      ].join(" ")}
      style={{
        background:
          "linear-gradient(165deg, #ecfdf5 0%, #f0fdf4 28%, #ffffff 55%, #f8fafc 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.22),transparent_72%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-6 top-16 h-28 w-28 rounded-full bg-teal-200/25 blur-2xl"
        aria-hidden
      />

      <div className={["relative z-[1] flex flex-col items-center", compact ? "gap-0.5" : "gap-1.5"].join(" ")}>
        <div
          className={[
            "flex items-center justify-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-emerald-100/80",
            compact ? "h-7 w-7 p-0.5" : "h-14 w-14 p-1.5",
          ].join(" ")}
        >
          <Image
            src="/images/logo.png"
            alt="Zareoon"
            width={compact ? 28 : 56}
            height={compact ? 28 : 56}
            className="h-full w-full object-contain"
          />
        </div>
        <p
          className={[
            "font-black tracking-tight text-emerald-950",
            compact ? "text-[7px] leading-none" : "text-[13px] leading-none",
          ].join(" ")}
        >
          زارعون
        </p>
        <div
          className={[
            "rounded-full bg-emerald-600/10 font-semibold text-emerald-800",
            compact ? "px-1 py-px text-[4px]" : "px-2 py-0.5 text-[9px]",
          ].join(" ")}
        >
          {MOCKUP_AYAH_REF}
        </div>
      </div>

      <div
        className={[
          "relative z-[1] flex min-h-0 flex-1 flex-col justify-center",
          compact ? "mt-1 gap-1" : "mt-3 gap-2.5",
        ].join(" ")}
      >
        {MOCKUP_AYAH_LINES.map((line, index) => {
          const isPrimary = index === 0;
          const isSecondary = index === 1;
          return (
            <div
              key={line.lang}
              className={[
                "rounded-xl border border-emerald-100/70 bg-white/70 backdrop-blur-[2px]",
                compact ? "px-1 py-0.5" : "px-2.5 py-2",
                isPrimary ? "ring-1 ring-emerald-200/60" : "",
              ].join(" ")}
            >
              <p
                className={[
                  "font-semibold uppercase tracking-wide text-emerald-700/70",
                  compact ? "mb-px text-[3.5px] leading-none" : "mb-1 text-[8px] leading-none",
                ].join(" ")}
              >
                {line.label}
              </p>
              <p
                lang={line.lang}
                dir={line.dir}
                className={[
                  "text-balance text-emerald-950",
                  line.quran ? "font-quran" : "font-medium",
                  compact
                    ? isPrimary
                      ? "text-[5.5px] leading-[1.45]"
                      : "text-[4.5px] leading-[1.35]"
                    : isPrimary
                      ? "text-[12px] leading-6"
                      : isSecondary
                        ? "text-[10.5px] leading-5"
                        : "text-[9.5px] leading-[1.45] text-slate-700",
                ].join(" ")}
              >
                {line.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** موکاپ گوشی — compact برای موبایل، large برای دسکتاپ */
function DaisyPhoneHomePreview({ label, size = "compact" }) {
  const isLarge = size === "large";

  return (
    <div
      className={[
        "android-phone-mockup relative shrink-0 select-none",
        isLarge ? "w-[14.4rem] xl:w-[16rem]" : "w-[4.2rem] sm:w-[5.4rem] md:w-[6.2rem]",
      ].join(" ")}
      style={{ cursor: "inherit" }}
      aria-label={label}
    >
      <div
        className={[
          "mockup-phone w-full border-[#0b1f17]",
          isLarge
            ? "shadow-[0_28px_56px_-18px_rgba(0,0,0,0.55)]"
            : "shadow-[0_16px_36px_-14px_rgba(0,0,0,0.45)]",
        ].join(" ")}
      >
        <div className="mockup-phone-camera" />
        <div className="mockup-phone-display relative overflow-hidden bg-white">
          <MockupAyahScreen compact={!isLarge} />
        </div>
      </div>
    </div>
  );
}

function InstallGuideModal({ open, onClose, title, body, closeLabel, titleId }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10080] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button type="button" className="absolute inset-0 bg-slate-950/45" aria-label={closeLabel} onClick={onClose} />
      <div className="relative z-[1] w-full max-w-md rounded-t-3xl border border-emerald-100 bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <h3 id={titleId} className="text-base font-extrabold text-emerald-950 sm:text-lg">
          {title}
        </h3>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{body}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  );
}

function useAppInstall() {
  const [platform, setPlatform] = useState("unknown");
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideKind, setGuideKind] = useState("generic");
  const [hiddenNative, setHiddenNative] = useState(false);

  useEffect(() => {
    if (isCapacitorNative()) {
      setHiddenNative(true);
      return undefined;
    }

    const p = detectPlatform();
    setPlatform(p);
    setIsInstalled(isStandaloneDisplay());

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setGuideOpen(false);
    };
    const onDisplayChange = () => setIsInstalled(isStandaloneDisplay());

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener?.("change", onDisplayChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      mq.removeEventListener?.("change", onDisplayChange);
    };
  }, []);

  const openGuide = useCallback((kind) => {
    setGuideKind(kind || detectPlatform());
    setGuideOpen(true);
  }, []);

  const installPwa = useCallback(async () => {
    if (isInstalled || busy) return;

    if (deferredPrompt) {
      setBusy(true);
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (choice?.outcome === "accepted") {
          setIsInstalled(true);
        } else {
          openGuide("denied");
        }
      } catch {
        openGuide(platform === "unknown" ? "generic" : platform);
      } finally {
        setBusy(false);
      }
      return;
    }

    openGuide(platform === "unknown" ? "generic" : platform);
  }, [busy, deferredPrompt, isInstalled, openGuide, platform]);

  return {
    platform,
    isInstalled,
    busy,
    guideOpen,
    guideKind,
    setGuideOpen,
    hiddenNative,
    installPwa,
  };
}

const BTN_BASE =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-extrabold transition active:scale-[0.99] sm:min-h-12 sm:gap-2.5 sm:rounded-2xl sm:px-4 sm:text-sm";

function AndroidApkButton({ href, label, tone = "light" }) {
  const isLight = tone === "light";
  return (
    <a
      href={href}
      download
      className={[
        BTN_BASE,
        isLight
          ? "border border-emerald-200 bg-white text-emerald-950 shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
          : "border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/16",
      ].join(" ")}
    >
      <span
        className={
          isLight
            ? "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3DDC84]/15 text-[#1B8A4A] sm:h-9 sm:w-9 sm:rounded-xl"
            : "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3DDC84]/20 text-[#3DDC84] sm:h-9 sm:w-9 sm:rounded-xl"
        }
      >
        <AndroidIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>
      <span className="min-w-0 text-center leading-snug">{label}</span>
    </a>
  );
}

function PwaActionButton({ isInstalled, busy, onInstall, installLabel, installedLabel, runLabel, busyLabel, tone = "light" }) {
  const isLight = tone === "light";

  if (isInstalled) {
    return (
      <div
        className={[
          BTN_BASE,
          "flex-col gap-0.5",
          isLight
            ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border border-white/25 bg-white/10 text-white backdrop-blur-sm",
        ].join(" ")}
        role="status"
      >
        <span className="inline-flex items-center gap-1.5">
          <CheckIcon className="h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5" />
          {installedLabel}
        </span>
        <span className={isLight ? "text-[10px] font-semibold text-emerald-800/80" : "text-[10px] font-semibold text-emerald-50/85"}>
          {runLabel}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onInstall}
      disabled={busy}
      className={[
        BTN_BASE,
        "disabled:cursor-wait disabled:opacity-80",
        isLight
          ? "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800"
          : "bg-white text-emerald-950 shadow-[0_14px_36px_-12px_rgba(255,255,255,0.45)] hover:bg-emerald-50",
      ].join(" ")}
    >
      <DeviceInstallIcon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
      <span className="min-w-0 text-center leading-snug">{busy ? busyLabel : installLabel}</span>
    </button>
  );
}

/**
 * بنر نصب اپ: متن + دکمه‌ها + موکاپ در یک سطر (موبایل‌فرست)
 */
export default function AndroidAppPromo({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const guideTitleId = useId();
  const {
    platform,
    isInstalled,
    busy,
    guideOpen,
    guideKind,
    setGuideOpen,
    hiddenNative,
    installPwa,
  } = useAppInstall();

  if (hiddenNative) return null;

  const points = [t("androidAppPoint1"), t("androidAppPoint2"), t("androidAppPoint3")];

  const guideBody =
    guideKind === "ios"
      ? t("pwaGuideIos")
      : guideKind === "android"
        ? t("pwaGuideAndroid")
        : guideKind === "desktop"
          ? t("pwaGuideDesktop")
          : guideKind === "denied"
            ? t("pwaGuideDenied")
            : t("pwaGuideGeneric");

  const pwaProps = {
    isInstalled,
    busy,
    onInstall: installPwa,
    installLabel: t("pwaInstallCta"),
    installedLabel: t("pwaInstalledLabel"),
    runLabel: t("pwaInstalledRun"),
    busyLabel: t("pwaInstallBusy"),
  };

  const installButtons = (tone) => (
    <div className="mt-3 flex w-full flex-col gap-2 min-[400px]:flex-row min-[400px]:items-stretch sm:mt-4 sm:gap-2.5">
      <AndroidApkButton href={ANDROID_APK_HREF} label={t("androidAppDownload")} tone={tone} />
      <PwaActionButton {...pwaProps} tone={tone} />
    </div>
  );

  return (
    <section
      className={`app-install-promo relative overflow-hidden ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      aria-label={t("androidAppTitle")}
    >
      {/* موبایل / تبلت — یک سطر: متن | موکاپ */}
      <div className="android-app-promo-mobile relative border-t border-emerald-100 bg-gradient-to-b from-emerald-50 via-white to-white px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-8 lg:hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-5 md:gap-6">
          <div className="min-w-0 text-start">
            <p className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-200/80 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-emerald-800 shadow-sm sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
              <DeviceInstallIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600 sm:h-4 sm:w-4" />
              <span className="truncate">{t("androidAppEyebrow")}</span>
            </p>

            <h2 className="mt-2 text-[15px] font-black leading-snug tracking-tight text-emerald-950 sm:mt-3 sm:text-xl md:text-2xl">
              {t("androidAppTitle")}
            </h2>

            <p className="mt-1.5 line-clamp-3 text-[11px] leading-5 text-slate-600 sm:mt-2 sm:line-clamp-none sm:text-sm sm:leading-6 md:text-[15px] md:leading-7">
              {t("androidAppMobileHint")}
            </p>

            {installButtons("light")}

            {!isInstalled && platform === "ios" ? (
              <p className="mt-2 text-[10px] leading-4 text-slate-500 sm:mt-3 sm:text-xs sm:leading-5">{t("pwaIosHint")}</p>
            ) : null}
          </div>

          <DaisyPhoneHomePreview label={t("androidAppPhonePreviewLabel")} />
        </div>
      </div>

      {/* دسکتاپ — متن در شروع باکس، موکاپ بزرگ روبه‌رو */}
      <div className="android-app-promo-desktop relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-800" aria-hidden />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -start-24 top-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-16 bottom-0 h-80 w-80 rounded-full bg-teal-300/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto flex max-w-7xl flex-row items-center justify-between gap-10 px-8 py-12 xl:gap-14 xl:px-10 xl:py-16">
          <div className="min-w-0 flex-1 max-w-xl text-start text-white">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-semibold text-emerald-50 backdrop-blur-sm">
              <DeviceInstallIcon className="h-5 w-5 shrink-0 text-emerald-100" />
              {t("androidAppEyebrow")}
            </p>

            <h2 className="mt-4 text-[1.75rem] font-black leading-snug tracking-tight text-white xl:text-[2.05rem]">
              {t("androidAppTitle")}
            </h2>

            <p className="mt-3 text-[15px] leading-7 text-emerald-50/90 xl:text-base xl:leading-8">
              {t("androidAppSubtitle")}
            </p>

            <ul className="mt-5 space-y-2.5">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[14px] leading-6 text-emerald-50/95">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-emerald-900"
                    aria-hidden
                  >
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-7 max-w-xl">{installButtons("dark")}</div>
          </div>

          <div className="shrink-0 self-center">
            <DaisyPhoneHomePreview
              label={t("androidAppPhonePreviewLabel")}
              size="large"
            />
          </div>
        </div>
      </div>

      <InstallGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title={t("pwaGuideTitle")}
        body={guideBody}
        closeLabel={t("pwaGuideClose")}
        titleId={guideTitleId}
      />
    </section>
  );
}
