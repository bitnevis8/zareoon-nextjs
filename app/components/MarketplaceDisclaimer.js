"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function MarketplaceDisclaimer({ className = "" }) {
  const t = useTranslations("legal");

  return (
    <aside
      className={`mx-auto w-full max-w-4xl rounded-2xl border border-amber-200/80 bg-gradient-to-l from-amber-50 via-white to-emerald-50/40 px-4 py-4 text-center shadow-sm sm:px-6 sm:py-5 ${className}`}
      role="note"
    >
      <p className="text-sm font-bold text-slate-900 sm:text-base">{t("homepageDisclaimer.title")}</p>
      <p className="mt-2 text-xs leading-7 text-slate-600 sm:text-sm sm:leading-7">{t("homepageDisclaimer.body")}</p>
      <p className="mt-3 text-[11px] text-slate-500">
        <Link href="/terms" className="text-emerald-700 hover:underline">
          قوانین و مقررات
        </Link>
        <span className="mx-1.5 text-slate-300">·</span>
        <Link href="/pricing" className="text-emerald-700 hover:underline">
          اشتراک فروشندگان
        </Link>
      </p>
    </aside>
  );
}
