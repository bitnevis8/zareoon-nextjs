"use client";

import Link from "next/link";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useLanguage } from "@/app/context/LanguageContext";
import { dash } from "@/app/components/dashboard/dashboardTheme";

function ServiceCard({ href, title, desc, cta, iconPath, tone }) {
  const tones = {
    amber: {
      wrap: "border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white hover:border-amber-300",
      icon: "bg-amber-100 text-amber-800",
      cta: "text-amber-900",
    },
    sky: {
      wrap: "border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-white hover:border-sky-300",
      icon: "bg-sky-100 text-sky-800",
      cta: "text-sky-900",
    },
  };
  const t = tones[tone] || tones.amber;

  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${t.wrap}`}
    >
      <span className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${t.icon}`} aria-hidden>
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </span>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{desc}</p>
      <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-bold ${t.cta}`}>
        {cta}
        <span aria-hidden className="transition group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5">
          ←
        </span>
      </span>
    </Link>
  );
}

function TradeAssuranceInner() {
  const { t } = useLanguage();

  return (
    <div className={dash.page}>
      <header className="mb-2">
        <h1 className={dash.pageTitle}>
          {t("tradeAssuranceTitle") || "حساب امانی و اعتبار اسنادی"}
        </h1>
        <p className={dash.pageSubtitle}>
          {t("tradeAssuranceSubtitle") || "کدام خدمت را می‌خواهید؟ یکی را انتخاب کنید تا ادامه دهید."}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <ServiceCard
          href="/dashboard/escrow"
          tone="amber"
          title={t("tradeAssuranceEscrowTitle") || "حساب امانی زارعون"}
          desc={
            t("tradeAssuranceEscrowDesc") ||
            "تضمین معامله، قفل وجه و آزادسازی پس از توافق طرفین."
          }
          cta={t("tradeAssuranceEscrowCta") || "ورود به حساب امانی"}
          iconPath="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
        <ServiceCard
          href="/trade-services/intl-finance"
          tone="sky"
          title={t("tradeAssuranceLcTitle") || "اعتبار اسنادی (LC)"}
          desc={
            t("tradeAssuranceLcDesc") ||
            "درخواست و پیگیری اعتبار اسنادی برای معاملات بین‌المللی."
          }
          cta={t("tradeAssuranceLcCta") || "ورود به بخش LC"}
          iconPath="M3 10h18M7 15h.01M11 15h.01M15 15h.01M6 6h12a1 1 0 011 1v10a1 1 0 01-1 1H6a1 1 0 01-1-1V7a1 1 0 011-1z"
        />
      </div>
    </div>
  );
}

export default function TradeAssurancePage() {
  return (
    <ProtectedRoute>
      <TradeAssuranceInner />
    </ProtectedRoute>
  );
}
