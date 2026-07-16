"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLanguage } from "../../../context/LanguageContext";
import EnamadSeal from "../../legal/EnamadSeal";

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

export default function Footer({ className = "" }) {
  const { t } = useLanguage();
  const legalT = useTranslations("legal");
  const year = new Date().getFullYear();

  return (
    <footer className={`relative z-10 mt-auto shrink-0 border-t border-slate-200 bg-white ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <p className="text-center text-xs leading-relaxed text-slate-500 sm:text-right">
              © {year} {t("siteName")}. {t("allRightsReserved")}
            </p>
            <p className="max-w-md text-center text-[11px] leading-5 text-slate-400 sm:text-right">
              زارعون بستر معرفی است؛ خریدار و فروشنده مستقیم ارتباط می‌گیرند و مسئولیت معامله با خودشان است.
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:justify-start">
              <Link href="/" className="text-slate-500 transition hover:text-emerald-700">
                {t("home")}
              </Link>
              <Link href="/trade-services" className="text-slate-500 transition hover:text-emerald-700">
                {t("tradeServicesSectionLabel")}
              </Link>
              <Link href="/auth/login" className="text-slate-500 transition hover:text-emerald-700">
                {t("login")}
              </Link>
            </nav>
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-end">
            <p className="text-xs font-semibold text-slate-600">{legalT("nav.aria")}</p>
            <nav className="flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] sm:justify-end">
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
            <EnamadSeal className="mt-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
