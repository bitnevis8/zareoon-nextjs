"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getExclusiveServicesContent } from "../data/zareoonExclusiveServices";
import { countProvidersByCategory } from "../data/tradeServicesCatalog";
import { API_ENDPOINTS } from "../config/api";
import { getVipCompanyName } from "@/app/utils/vipCategoryHelpers";
import TradeServicesJoinBanner from "./TradeServicesJoinBanner";
import HorizontalScrollRow from "./HorizontalScrollRow";
import ZareoonEscrowFeature from "./ZareoonEscrowFeature";

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

function MemberCountBadge({ count, label, locale = "fa-IR", companyName, compact = false }) {
  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800 ${
        compact ? "text-[10px]" : "gap-1.5 py-1 text-xs"
      }`}
      title={companyName ? `${companyName} · ${label}` : label}
      aria-label={companyName ? `${companyName} · ${label}` : label}
    >
      {companyName ? (
        <span
          className={`truncate font-bold leading-none ${
            compact ? "max-w-[5.5rem] text-[10px]" : "max-w-[7.5rem] text-[11px] sm:max-w-[9rem] sm:text-xs"
          }`}
        >
          {companyName}
        </span>
      ) : null}
      <PeopleIcon className={compact ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} />
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

function CategoryCard({ item, count, isVip, companyName, t, locale, memberLabel, compact = false, inSection = false }) {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border bg-white transition duration-300 md:hover:-translate-y-1 md:hover:border-emerald-300 md:hover:shadow-[0_12px_32px_rgba(6,95,70,0.12)] ${
        compact
          ? "min-h-[10.75rem] border-emerald-100/90 p-3 shadow-[0_2px_12px_rgba(6,78,59,0.06)]"
          : inSection
            ? "border-emerald-100/90 p-3.5 shadow-[0_2px_14px_rgba(6,78,59,0.06)] sm:rounded-2xl sm:p-5"
            : "border-slate-200/80 p-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:rounded-2xl sm:p-5"
      }`}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 ${inSection ? "opacity-60" : "opacity-0 transition group-hover:opacity-100"}`} />
      <div
        className={`flex items-center justify-between gap-2 ${
          compact ? "mb-2.5" : "mb-2.5 flex-col sm:mb-4 sm:flex-row sm:items-start sm:gap-3"
        }`}
      >
        <div
          className={`flex shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 ${
            compact ? "h-9 w-9" : "h-10 w-10 shadow-sm sm:h-11 sm:w-11 sm:rounded-xl sm:bg-gradient-to-br sm:from-emerald-50 sm:to-white"
          }`}
        >
          <ServiceIcon name={item.icon} />
        </div>
        <MemberCountBadge
          count={count}
          label={memberLabel(count)}
          locale={locale}
          companyName={isVip ? companyName : null}
          compact={compact}
        />
      </div>
      <h3
        className={`font-bold text-slate-900 ${
          compact ? "mb-1 line-clamp-2 text-xs leading-5" : "mb-2 text-sm leading-6 sm:text-[15px]"
        }`}
      >
        {item.title}
      </h3>
      <p
        className={`flex-1 text-slate-600 ${
          compact ? "mb-2.5 line-clamp-2 text-[11px] leading-[1.35rem]" : "mb-4 text-xs leading-6 sm:text-[13px]"
        }`}
      >
        {item.description}
      </p>
      <Link
        href={`/trade-services/${item.id}`}
        className={`inline-flex w-full items-center justify-center rounded-lg font-semibold transition ${
          compact
            ? "min-h-9 border border-emerald-600/15 bg-emerald-600 px-2 py-1.5 text-[11px] text-white hover:bg-emerald-700"
            : "min-h-11 rounded-xl border border-emerald-600/20 bg-emerald-600 px-3 py-2.5 text-xs text-white hover:bg-emerald-700 sm:text-sm"
        }`}
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
      className={`w-full space-y-0 sm:space-y-0 ${className}`}
      aria-labelledby="trade-services-title"
    >
      <div
        className={`relative overflow-hidden rounded-t-xl border border-b-0 border-emerald-700/20 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(6,78,59,0.18)] sm:rounded-t-2xl sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_32px_rgba(6,78,59,0.28)] ${isRTL ? "text-right" : "text-left"} px-4 py-4 sm:px-7 sm:py-8`}
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

        <div className="relative space-y-2.5 sm:space-y-3.5">
          <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-50 backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs">
            {content.eyebrow}
          </p>
          <h2
            id="trade-services-title"
            className="text-lg font-black leading-snug tracking-tight text-white sm:text-2xl sm:leading-tight lg:text-[2rem]"
          >
            {content.title}
          </h2>
          <p className="max-w-2xl text-xs leading-6 text-emerald-50/95 sm:text-sm sm:leading-7">
            <span className="font-bold text-white">{t("tradeServicesForBuyers")}</span>{" "}
            {content.subtitle}
          </p>
          <Link
            href="/trade-services"
            className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-white/25 bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 sm:min-h-11 sm:w-auto sm:rounded-xl sm:py-2.5 sm:text-sm"
          >
            {t("tradeServicesBrowseCta")}
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-b-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/40 shadow-[0_12px_32px_rgba(6,78,59,0.08)] sm:rounded-b-2xl">
        <div className="space-y-4 p-3 sm:space-y-5 sm:p-4 lg:p-5">
          <ZareoonEscrowFeature className="!shadow-[0_8px_28px_-12px_rgba(16,185,129,0.18)]" />

          <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white/90 shadow-sm">
            <div className={`border-b border-emerald-100 bg-emerald-50/80 px-3 py-3 sm:px-5 sm:py-3.5 ${isRTL ? "text-right" : "text-left"}`}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 sm:text-[11px]">
                {t("tradeServicesSectionLabel")}
              </p>
              <h3 className="mt-0.5 text-sm font-bold text-emerald-950 sm:text-base">
                {t("tradeServicesCategoriesTitle")}
              </h3>
              <p className="mt-1 text-xs leading-6 text-emerald-800/80">{t("tradeServicesCategoriesDesc")}</p>
            </div>

            <div className="sm:hidden px-2 pb-2 pt-2.5">
              <HorizontalScrollRow isRTL={isRTL} arrowPlacement="bottom" showArrows={false} showDots>
                {content.items.map((item) => {
                  const count = memberCounts?.[item.id] ?? item.memberCount ?? 0;
                  const isVip = !!vipCategories[item.id]?.enabled;
                  const companyName = isVip ? getVipCompanyName(providers, item.id) : null;
                  return (
                    <div key={item.id} className="w-[min(70vw,15.5rem)] shrink-0 snap-start">
                      <CategoryCard
                        item={item}
                        count={count}
                        isVip={isVip}
                        companyName={companyName}
                        t={t}
                        locale={numberLocale}
                        memberLabel={memberLabel}
                        compact
                        inSection
                      />
                    </div>
                  );
                })}
              </HorizontalScrollRow>
            </div>

            <div className="hidden gap-3 p-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:p-4 lg:grid-cols-3 2xl:grid-cols-5">
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
                    inSection
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 sm:pt-5">
        <TradeServicesJoinBanner />
      </div>
    </section>
  );
}
