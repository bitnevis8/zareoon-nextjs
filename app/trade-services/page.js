"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useTradeServicesContent } from "@/app/hooks/useTradeServicesContent";
import { API_ENDPOINTS } from "@/app/config/api";
import { resolveVipCategoryMessage } from "@/app/utils/vipCategoryHelpers";
import TradeServicesJoinBanner from "@/app/components/TradeServicesJoinBanner";
import ZareoonEscrowFeature from "@/app/components/ZareoonEscrowFeature";

function CategoryHubIcon({ name }) {
  const className = "h-6 w-6 text-emerald-700";
  const paths = {
    "import-export": "M3 7h18M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2M7 11h10M9 15h6M12 7v12",
    "intl-logistics": "M3 16h2l2-7h11l2 5h2M7 16a2 2 0 104 0M15 16a2 2 0 104 0",
    "customs-clearance": "M9 12h6m-8 8h10a2 2 0 002-2V8l-4-4H8L4 8v10a2 2 0 002 2z",
    "intl-finance": "M3 10h18M7 14h.01M11 14h.01M15 14h.01M6 6h12v12H6z",
    "inspection-standards": "M9 12l2 2 4-4M7.2 20.2l-4.1-1.1a1 1 0 01-.6-1.3l1.1-4.1 9.9-9.9a2 2 0 012.8 0l1.1 1.1a2 2 0 010 2.8l-9.9 9.9-4.1 1.1z",
    "insurance-risk": "M12 3l8 4v6c0 4.4-3.4 7.7-8 8-4.6-.3-8-3.6-8-8V7l8-4z",
    "legal-trade": "M12 3v18M8 7h8M6 21h12M9 7V5h6v2",
    "market-development": "M4 19V5M4 19h16M8 15l3-4 3 2 4-6",
    "packaging-prep": "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5",
    "specialized-trade": "M8 10h8M8 14h5M12 20a8 8 0 100-16 8 8 0 000 16z",
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name] || "M8 6h8M8 10h8M8 14h5M6 4h12v16H6z"} />
    </svg>
  );
}

function HubCategoryCard({ category, isVip, vipMessage, t }) {
  if (isVip) {
    return (
      <article className="group relative col-span-2 flex flex-col overflow-hidden rounded-xl border-2 border-amber-200/80 bg-gradient-to-br from-white via-amber-50/30 to-emerald-50/20 p-3.5 shadow-[0_8px_32px_rgba(180,83,9,0.08)] transition hover:-translate-y-0.5 hover:border-amber-300 sm:rounded-2xl sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4 sm:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-white shadow-sm sm:h-12 sm:w-12 sm:rounded-2xl">
            <CategoryHubIcon name={category.icon} />
          </div>
          <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-black uppercase text-amber-950">
            VIP
          </span>
        </div>
        <h2 className="mb-1.5 text-sm font-black leading-5 text-slate-900 sm:mb-2 sm:text-lg sm:leading-normal">
          {category.title}
        </h2>
        <p className="mb-2 line-clamp-2 flex-1 text-xs leading-5 text-slate-600 sm:mb-3 sm:line-clamp-none sm:text-sm sm:leading-7">
          {category.description}
        </p>
        {vipMessage ? (
          <p className="mb-3 rounded-xl border border-amber-200/70 bg-amber-50 px-2.5 py-2 text-[11px] leading-5 text-amber-950 sm:mb-4 sm:px-3 sm:py-2.5 sm:text-xs sm:leading-6">
            {vipMessage}
          </p>
        ) : null}
        <Link
          href={`/trade-services/${category.id}`}
          className="inline-flex min-h-9 w-full items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 sm:min-h-0 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          {t("tradeServicesExploreCta")}
        </Link>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-emerald-100/90 bg-white/95 p-3.5 shadow-[0_2px_14px_rgba(6,78,59,0.06)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_12px_32px_rgba(6,95,70,0.12)] sm:rounded-2xl sm:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-60" />
      <div className="relative mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white sm:mb-4 sm:h-11 sm:w-11">
        <CategoryHubIcon name={category.icon} />
      </div>
      <h2 className="relative mb-1.5 text-sm font-bold leading-5 text-slate-900 sm:mb-2 sm:text-base sm:leading-normal">
        {category.title}
      </h2>
      <p className="relative mb-3 line-clamp-2 flex-1 text-xs leading-5 text-slate-600 sm:mb-4 sm:line-clamp-none sm:text-sm sm:leading-7">
        {category.description}
      </p>
      <Link
        href={`/trade-services/${category.id}`}
        className="relative inline-flex min-h-9 w-full items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 sm:min-h-0 sm:px-4 sm:py-2.5 sm:text-sm"
      >
        {t("tradeServicesExploreCta")}
      </Link>
    </article>
  );
}

export default function TradeServicesHubPage() {
  const { language, isRTL, t } = useLanguage();
  const content = useTradeServicesContent();
  const [vipCategories, setVipCategories] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.siteSettings.getVipPublic, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.success) setVipCategories(json.data?.categories || {});
      } catch {
        if (!cancelled) setVipCategories({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className={`mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 ${isRTL ? "text-right" : "text-left"}`}>
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-emerald-700">
          {t("mainPage")}
        </Link>
      </nav>

      <header className="overflow-hidden rounded-t-2xl border border-b-0 border-emerald-100 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 p-5 text-white sm:p-7">
        <p className="mb-2 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-50">
          {content.eyebrow}
        </p>
        <h1 className="mb-3 text-2xl font-black sm:text-3xl">{content.title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-emerald-50/95">
          <span className="font-bold text-white">{t("tradeServicesForBuyers")}</span> {content.subtitle}
        </p>
      </header>

      <div className="mb-6 overflow-hidden rounded-b-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/40 shadow-[0_12px_32px_rgba(6,78,59,0.08)]">
        <div className="space-y-4 p-3 sm:space-y-5 sm:p-4 lg:p-5">
          <ZareoonEscrowFeature />

          <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white/90 shadow-sm">
            <div className={`border-b border-emerald-100 bg-emerald-50/80 px-3 py-3 sm:px-5 sm:py-3.5 ${isRTL ? "text-right" : "text-left"}`}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 sm:text-[11px]">
                {t("tradeServicesSectionLabel")}
              </p>
              <h2 className="mt-0.5 text-sm font-bold text-emerald-950 sm:text-base">
                {t("tradeServicesCategoriesTitle")}
              </h2>
              <p className="mt-1 text-xs leading-6 text-emerald-800/80">{t("tradeServicesCategoriesDesc")}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3 sm:gap-4 sm:p-4 lg:grid-cols-3">
              {content.categories.map((category) => {
                const isVip = !!vipCategories[category.id]?.enabled;
                const vipMessage = resolveVipCategoryMessage(vipCategories, category.id, language, t);
                return (
                  <HubCategoryCard
                    key={category.id}
                    category={category}
                    isVip={isVip}
                    vipMessage={vipMessage}
                    t={t}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <TradeServicesJoinBanner className="mt-2" />
    </main>
  );
}
