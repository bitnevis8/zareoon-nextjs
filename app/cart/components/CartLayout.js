"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const SUPPORT_PHONE = "09393387148";

const GUIDE_STEP_KEYS = ["1", "2", "3"];

export function CartPageNav() {
  const t = useTranslations("cart");

  return (
    <header className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500 sm:text-sm" aria-label={t("breadcrumbAria")}>
        <Link href="/" className="transition-colors hover:text-emerald-700">
          {t("home")}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-800">{t("title")}</span>
      </nav>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 sm:text-sm"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {t("backToShop")}
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100 sm:text-sm"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          {t("dashboard")}
        </Link>
      </div>
    </header>
  );
}

export function CartGuide() {
  const t = useTranslations("cart");

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        {t("guideTitle")}
      </h2>
      <ol className="space-y-3">
        {GUIDE_STEP_KEYS.map((key) => (
          <li key={key} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
              {t(`guideSteps.${key}.n`)}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{t(`guideSteps.${key}.title`)}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t(`guideSteps.${key}.desc`)}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/80 p-3 text-xs leading-relaxed text-amber-900">
        {t("cartReservationNote")}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {t("support")}{" "}
        <a href={`tel:${SUPPORT_PHONE}`} className="font-semibold text-emerald-700 hover:underline" dir="ltr">
          {SUPPORT_PHONE}
        </a>
      </p>
    </aside>
  );
}

export { SUPPORT_PHONE };
