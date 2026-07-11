"use client";

import Link from "next/link";
import { useLanguage } from "../../../context/LanguageContext";

export default function Footer({ className = "" }) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className={`relative z-10 mt-auto shrink-0 border-t border-slate-200 bg-white ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:gap-3 sm:px-6 sm:py-4 lg:px-8">
        <p className="text-center text-xs leading-relaxed text-slate-500 sm:text-right">
          © {year} {t("siteName")}. {t("allRightsReserved")}
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
          <Link href="/" className="text-slate-500 transition hover:text-emerald-700">
            {t("home") || "صفحه اصلی"}
          </Link>
          <Link href="/trade-services" className="text-slate-500 transition hover:text-emerald-700">
            {t("tradeServicesSectionLabel") || "خدمات بازرگانی"}
          </Link>
          <Link href="/auth/login" className="text-slate-500 transition hover:text-emerald-700">
            {t("login") || "ورود"}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
