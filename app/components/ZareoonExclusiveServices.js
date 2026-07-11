"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getExclusiveServicesContent } from "../data/zareoonExclusiveServices";
import { countProvidersByCategory } from "../data/tradeServicesCatalog";
import { API_ENDPOINTS } from "../config/api";
import { getVipCompanyName } from "@/app/utils/vipCategoryHelpers";
import TradeServicesJoinBanner from "./TradeServicesJoinBanner";

function PeopleIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
      />
    </svg>
  );
}

function MemberCountBadge({ count, label, locale = "fa-IR", companyName }) {
  return (
    <span
      className="inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/90 px-2 py-1 text-xs font-semibold text-emerald-800"
      title={companyName ? `${companyName} · ${label}` : label}
      aria-label={companyName ? `${companyName} · ${label}` : label}
    >
      {companyName ? (
        <span className="max-w-[7.5rem] truncate text-[11px] font-bold leading-none sm:max-w-[9rem] sm:text-xs">
          {companyName}
        </span>
      ) : null}
      <PeopleIcon className="h-3.5 w-3.5 shrink-0" />
      <span className="tabular-nums leading-none">{count.toLocaleString(locale)}</span>
    </span>
  );
}

function ServiceIcon({ name }) {
  const className = "h-5 w-5 text-emerald-700";

  switch (name) {
    case "import-export":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2M7 11h10M9 15h6M12 7v12" />
        </svg>
      );
    case "intl-logistics":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16h2l2-7h11l2 5h2M7 16a2 2 0 104 0M15 16a2 2 0 104 0" />
        </svg>
      );
    case "customs-clearance":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-8 8h10a2 2 0 002-2V8l-4-4H8L4 8v10a2 2 0 002 2z" />
        </svg>
      );
    case "intl-finance":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 14h.01M11 14h.01M15 14h.01M6 6h12v12H6z" />
        </svg>
      );
    case "inspection-standards":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.2 20.2l-4.1-1.1a1 1 0 01-.6-1.3l1.1-4.1 9.9-9.9a2 2 0 012.8 0l1.1 1.1a2 2 0 010 2.8l-9.9 9.9-4.1 1.1z" />
        </svg>
      );
    case "insurance-risk":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v6c0 4.4-3.4 7.7-8 8-4.6-.3-8-3.6-8-8V7l8-4z" />
        </svg>
      );
    case "legal-trade":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M8 7h8M6 21h12M9 7V5h6v2" />
        </svg>
      );
    case "market-development":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6" />
        </svg>
      );
    case "packaging-prep":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5" />
        </svg>
      );
    case "specialized-trade":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M12 20a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h8M8 10h8M8 14h5M6 4h12v16H6z" />
        </svg>
      );
  }
}

function HeaderPattern({ gridId, dotsId }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.14]"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={gridId} width="32" height="32" patternUnits="userSpaceOnUse">
          <path
            d="M32 0H0V32"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            className="text-white"
          />
          <circle cx="16" cy="16" r="1.25" fill="currentColor" className="text-white" />
        </pattern>
        <pattern id={dotsId} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" className="text-emerald-200" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${gridId})`} />
      <rect width="100%" height="100%" fill={`url(#${dotsId})`} opacity="0.55" />
    </svg>
  );
}

function CategoryCard({ item, count, isVip, companyName, t, locale, memberLabel }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_12px_32px_rgba(6,95,70,0.1)] sm:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition group-hover:opacity-100" />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm transition group-hover:border-emerald-200">
          <ServiceIcon name={item.icon} />
        </div>
        <MemberCountBadge
          count={count}
          label={memberLabel(count)}
          locale={locale}
          companyName={isVip ? companyName : null}
        />
      </div>
      <h3 className="mb-2 text-sm font-bold leading-6 text-slate-900 sm:text-[15px]">{item.title}</h3>
      <p className="mb-4 flex-1 text-xs leading-6 text-slate-600 sm:text-[13px]">{item.description}</p>
      <Link
        href={`/trade-services/${item.id}`}
        className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-600/20 bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 sm:text-sm"
      >
        {t("tradeServicesExploreCta")}
      </Link>
    </article>
  );
}

export default function ZareoonExclusiveServices({ className = "" }) {
  const { language, isRTL, t } = useLanguage();
  const content = getExclusiveServicesContent(language);
  const patternBaseId = useId();
  const gridId = `${patternBaseId}-grid`;
  const dotsId = `${patternBaseId}-dots`;
  const [memberCounts, setMemberCounts] = useState(null);
  const [providers, setProviders] = useState([]);
  const [vipCategories, setVipCategories] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [providersRes, vipRes] = await Promise.all([
          fetch(API_ENDPOINTS.tradeServiceProviders.getPublic, { cache: "no-store" }),
          fetch(API_ENDPOINTS.siteSettings.getVipPublic, { cache: "no-store" }),
        ]);
        const [providersData, vipData] = await Promise.all([providersRes.json(), vipRes.json()]);
        if (!cancelled && providersData.success) {
          setProviders(providersData.data || []);
          setMemberCounts(countProvidersByCategory(providersData.data || []));
        }
        if (!cancelled && vipData.success) {
          setVipCategories(vipData.data?.categories || {});
        }
      } catch {
        // fallback to sample counts from content items
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const numberLocale = language === "en" ? "en-US" : language === "ru" ? "ru-RU" : "fa-IR";

  const memberLabel = (count) => {
    const formatted = count.toLocaleString(numberLocale);
    if (language === "en") return `${formatted} members`;
    if (language === "ru") return `${formatted} участников`;
    return `${formatted} عضو`;
  };

  return (
    <section
      className={`w-full space-y-5 ${className}`}
      aria-labelledby="trade-services-title"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border border-emerald-700/20 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_32px_rgba(6,78,59,0.28)] sm:px-7 sm:py-8 ${isRTL ? "text-right" : "text-left"}`}
      >
        <HeaderPattern gridId={gridId} dotsId={dotsId} />
        <div
          className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-teal-300/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 end-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent"
          aria-hidden
        />

        <div className="relative space-y-3 sm:space-y-3.5">
          <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-emerald-50 backdrop-blur-sm sm:text-xs">
            {content.eyebrow}
          </p>
          <h2
            id="trade-services-title"
            className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-[2rem]"
          >
            {content.title}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-emerald-50/95">
            <span className="font-bold text-white">{t("tradeServicesForBuyers")}</span>{" "}
            {content.subtitle}
          </p>
          <Link
            href="/trade-services"
            className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 sm:text-sm"
          >
            {t("tradeServicesBrowseCta")}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {content.items.map((item) => {
            const count = memberCounts?.[item.id] ?? item.memberCount ?? 0;
            const isVip = !!vipCategories[item.id]?.enabled;
            const companyName = isVip ? getVipCompanyName(providers, item.id) : null;
            return (
              <CategoryCard
                key={item.id}
                item={item}
                count={count}
                isVip={isVip}
                companyName={companyName}
                t={t}
                locale={numberLocale}
                memberLabel={memberLabel}
              />
            );
          })}
        </div>

      <TradeServicesJoinBanner />
    </section>
  );
}
