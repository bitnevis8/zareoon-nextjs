"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "../../../context/LanguageContext";
import EnamadSeal from "../../legal/EnamadSeal";
import {
  SITE_EMAIL,
  SITE_EMAIL_MAILTO,
  SITE_PHONE_DISPLAY,
  SITE_PHONE_TEL,
} from "@/app/config/siteContact";
import { formatLocalizedDigits } from "@/app/utils/persianNumberUtils";
import { isRtlLanguage } from "@/app/config/siteLanguages";

const LEGAL_LINKS = [
  { href: "/about", key: "about" },
  { href: "/terms", key: "terms" },
  { href: "/privacy", key: "privacy" },
  { href: "/seller-terms", key: "sellers" },
  { href: "/buyer-terms", key: "buyers" },
  { href: "/refund-policy", key: "refund" },
  { href: "/cancellation-policy", key: "cancellation" },
  { href: "/dispute-resolution", key: "disputes" },
  { href: "/pricing", key: "pricing" },
  { href: "/help", key: "help" },
];

const MOBILE_QUICK_LINKS = [
  { href: "/help", key: "help" },
  { href: "/terms", key: "terms" },
  { href: "/privacy", key: "privacy" },
  { href: "/pricing", key: "pricing" },
  { href: "/about", key: "about" },
];

export default function Footer({ className = "" }) {
  const { t, language } = useLanguage();
  const legalT = useTranslations("legal");
  const [legalOpen, setLegalOpen] = useState(false);
  const year = new Date().getFullYear();
  const legalFromRight = isRtlLanguage(language);
  const legalDir = legalFromRight ? "rtl" : "ltr";
  const displayPhone = formatLocalizedDigits(SITE_PHONE_DISPLAY, language);
  const displayYear = formatLocalizedDigits(year, language);
  const siteAddress = formatLocalizedDigits(t("siteAddress"), language);

  return (
    <footer
      className={`relative z-10 mt-auto shrink-0 border-t border-slate-200 bg-white pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0 ${className}`}
      dir={legalDir}
    >
      {/* —— موبایل: فشرده —— */}
      <div className="mx-auto max-w-7xl px-3 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="inline-flex min-w-0 items-center gap-1.5">
            <Image
              src="/images/logo.png"
              alt={t("siteName")}
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 rounded-md border border-emerald-100 object-contain"
            />
            <span className="truncate text-xs font-bold text-slate-800">{t("siteName")}</span>
          </Link>
          <a
            href={SITE_PHONE_TEL}
            className="shrink-0 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold tabular-nums text-emerald-800"
            dir="ltr"
          >
            {displayPhone}
          </a>
        </div>

        <nav
          className="-mx-0.5 mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={legalT("nav.aria")}
        >
          {MOBILE_QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-600"
            >
              {legalT(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
          <p className="min-w-0 text-[9px] leading-4 text-slate-400">
            © {displayYear} {t("siteName")}
          </p>
          <EnamadSeal className="shrink-0 [&_img]:h-9 [&_img]:w-auto" />
        </div>

        <button
          type="button"
          onClick={() => setLegalOpen((v) => !v)}
          className="mt-2 flex w-full items-center justify-between rounded-lg px-1 py-1 text-[10px] font-medium text-slate-500"
          aria-expanded={legalOpen}
        >
          <span>{legalT("nav.aria")}</span>
          <svg
            className={`h-3.5 w-3.5 transition-transform ${legalOpen ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {legalOpen ? (
          <div className="mt-1 space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
            <nav className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]">
              {LEGAL_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-600 hover:text-emerald-700"
                >
                  {legalT(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-200/80 pt-2 text-[10px] leading-4 text-slate-500">
              <a href={SITE_EMAIL_MAILTO} className="text-emerald-700" dir="ltr">
                {SITE_EMAIL}
              </a>
              <p className="mt-1">{siteAddress}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* —— دسکتاپ: بدون تغییر چیدمان —— */}
      <div className="mx-auto hidden max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:block lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] lg:items-start lg:gap-10">
          <div className="flex flex-col gap-3 text-start">
            <Link href="/" className="inline-flex items-center gap-2 self-start transition hover:opacity-90">
              <Image
                src="/images/logo.png"
                alt={t("siteName")}
                width={28}
                height={28}
                className="h-7 w-7 shrink-0 rounded-lg border border-emerald-100 object-contain"
              />
              <span className="text-sm font-bold text-slate-800">{t("siteName")}</span>
            </Link>

            <p className="max-w-md text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-6">
              {t("footerSecureTagline")}
            </p>

            <div className="flex max-w-md flex-col gap-1 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">{t("supportContact")}</p>
              <a
                href={SITE_PHONE_TEL}
                className="w-fit font-semibold text-emerald-700 tabular-nums hover:underline"
                dir="ltr"
              >
                {displayPhone}
              </a>
              <a
                href={SITE_EMAIL_MAILTO}
                className="w-fit break-all text-emerald-700 hover:underline"
                dir="ltr"
              >
                {SITE_EMAIL}
              </a>
              <p className="text-[11px] leading-5 text-slate-500">{siteAddress}</p>
            </div>

            <nav className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <Link href="/" className="text-slate-500 transition hover:text-emerald-700">
            {t("home")}
          </Link>
              <span className="text-slate-200" aria-hidden>
                |
              </span>
          <Link href="/trade-services" className="text-slate-500 transition hover:text-emerald-700">
            {t("tradeServicesSectionLabel")}
          </Link>
              <span className="text-slate-200" aria-hidden>
                |
              </span>
          <Link href="/auth/login" className="text-slate-500 transition hover:text-emerald-700">
            {t("login")}
          </Link>
        </nav>
          </div>

          <div className="flex flex-col gap-3 text-start">
            <p className="text-xs font-semibold text-slate-700">{legalT("nav.aria")}</p>
            <nav className="flex flex-wrap gap-x-3 gap-y-2 text-xs">
              {LEGAL_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-500 transition hover:text-emerald-700"
                >
                  {legalT(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:mt-6">
          <p className="min-w-0 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
            © {displayYear} {t("siteName")}. {t("allRightsReserved")}
          </p>
          <EnamadSeal className="shrink-0" />
        </div>
      </div>
    </footer>
  );
}
