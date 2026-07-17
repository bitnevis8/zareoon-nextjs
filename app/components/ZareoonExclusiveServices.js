"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "../context/LanguageContext";
import { getExclusiveServicesContent } from "../data/zareoonExclusiveServices";
import { countProvidersByCategory } from "../data/tradeServicesCatalog";
import { API_ENDPOINTS } from "../config/api";
import { getVipCompanyName } from "@/app/utils/vipCategoryHelpers";
import { resolveCategoryBrandLogo } from "@/app/data/tradeProviderBranding";
import TradeServicesJoinBanner from "./TradeServicesJoinBanner";
import TradeServicesSectionHeader from "./TradeServicesSectionHeader";
import ZareoonEscrowFeature from "./ZareoonEscrowFeature";
import AuthRequiredButton from "./ui/AuthRequiredButton";

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

function MemberCountBadge({ count, label, locale = "fa-IR", compact = false }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 font-semibold text-emerald-800 ${
        compact ? "px-1.5 py-0.5 text-[10px]" : "gap-1.5 px-2 py-1 text-xs"
      }`}
      title={label}
      aria-label={label}
    >
      <PeopleIcon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span className="tabular-nums leading-none">{count.toLocaleString(locale)}</span>
    </span>
  );
}

const ICON_PATHS = {
  "import-export": "M3 7h18M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2M7 11h10M9 15h6M12 7v12",
  "intl-logistics": "M3 16h2l2-7h11l2 5h2M7 16a2 2 0 104 0M15 16a2 2 0 104 0",
  "customs-clearance": "M9 12h6m-8 8h10a2 2 0 002-2V8l-4-4H8L4 8v10a2 2 0 002 2z",
  "intl-finance": "M3 10h18M7 14h.01M11 14h.01M15 14h.01M6 6h12v12H6z",
  "inspection-standards":
    "M9 12l2 2 4-4M7.2 20.2l-4.1-1.1a1 1 0 01-.6-1.3l1.1-4.1 9.9-9.9a2 2 0 012.8 0l1.1 1.1a2 2 0 010 2.8l-9.9 9.9-4.1 1.1z",
  "insurance-risk": "M12 3l8 4v6c0 4.4-3.4 7.7-8 8-4.6-.3-8-3.6-8-8V7l8-4z",
  "legal-trade": "M12 3v18M8 7h8M6 21h12M9 7V5h6v2",
  "market-development": "M4 19V5M4 19h16M8 15l3-4 3 2 4-6",
  "packaging-prep": "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5",
  "specialized-trade": "M8 10h8M8 14h5M12 20a8 8 0 100-16 8 8 0 000 16z",
  "intl-certificates": "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  "export-compliance": "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  "trade-documents": "M8 4h6l4 4v10a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2zM14 4v4h4M9 13h6M9 17h4",
  "supply-chain": "M4 6h4v4H4zM10 6h4v4h-4zM16 6h4v4h-4zM7 14h4v4H7zM13 14h4v4h-4zM9 10v4M15 10v4",
  "ecommerce-marketplace": "M3 9l1-4h16l1 4M4 9v10a1 1 0 001 1h4V13h6v7h4a1 1 0 001-1V9",
  "trade-digital": "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "investment-consulting": "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  "trade-events": "M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z",
  "business-immigration": "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "esg-sustainability": "M12 3c4 6 6 10 6 13a6 6 0 11-12 0c0-3 2-7 6-13z",
};

function ServiceIcon({ name, className = "h-5 w-5 text-emerald-700" }) {
  const d = ICON_PATHS[name] || "M8 6h8M8 10h8M8 14h5M6 4h12v16H6z";
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function CategoryBrandMark({ item, size = "md", alt = "" }) {
  const logo = resolveCategoryBrandLogo(item.id);
  const sizeClass =
    size === "lg"
      ? "h-14 w-14 sm:h-16 sm:w-16 rounded-2xl"
      : size === "sm"
        ? "h-10 w-10 rounded-xl"
        : "h-11 w-11 sm:h-12 sm:w-12 rounded-xl";

  if (logo) {
    return (
      <div className={`relative shrink-0 overflow-hidden border border-amber-200/90 bg-white shadow-sm ${sizeClass}`}>
        <Image src={logo} alt={alt || item.title} fill sizes="64px" className="object-contain p-1" />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white text-emerald-700 shadow-sm ${sizeClass}`}
    >
      <ServiceIcon name={item.icon} className={size === "lg" ? "h-7 w-7 text-emerald-700" : "h-5 w-5 text-emerald-700"} />
    </div>
  );
}

function CategoryCard({ item, count, isVip, companyName, t, locale, memberLabel }) {
  const isInspection = item.id === "inspection-standards";
  const joinHref = `/trade-services/register?category=${encodeURIComponent(item.id)}`;

  const providersBtn =
    "inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 sm:text-sm";
  const joinBtn =
    "inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-50 sm:text-sm";

  return (
    <article
      className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-white p-3.5 shadow-[0_4px_20px_-12px_rgba(6,78,59,0.18)] transition duration-300 md:hover:-translate-y-1 md:hover:shadow-[0_14px_36px_-16px_rgba(6,95,70,0.22)] sm:p-5 ${
        isInspection || isVip
          ? "border-amber-200/80 md:hover:border-amber-300"
          : "border-emerald-100/90 md:hover:border-emerald-300"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-70 ${
          isInspection || isVip
            ? "bg-gradient-to-r from-amber-500 to-emerald-600"
            : "bg-gradient-to-r from-emerald-500 to-teal-500"
        }`}
      />
      <div className="mb-3 flex items-start justify-between gap-2">
        <CategoryBrandMark item={item} size="md" alt={companyName || item.title} />
        <div className="flex flex-col items-end gap-1">
          {isVip ? (
            <span className="rounded-full bg-amber-200/90 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-950">
              VIP
            </span>
          ) : null}
          <MemberCountBadge count={count} label={memberLabel(count)} locale={locale} compact />
        </div>
      </div>
      {isInspection && companyName ? (
        <p className="mb-1 line-clamp-1 text-[11px] font-bold tracking-wide text-amber-800">{companyName}</p>
      ) : null}
      <h3 className="mb-1.5 line-clamp-2 text-sm font-bold leading-6 text-slate-900 sm:text-[15px] sm:leading-6">
        {item.title}
      </h3>
      <p className="mb-4 line-clamp-3 flex-1 text-xs leading-6 text-slate-600 sm:text-[13px] sm:leading-6">
        {item.description}
      </p>
      <div className="mt-auto flex flex-col gap-2">
        <Link href={`/trade-services/${item.id}`} className={providersBtn}>
          {t("tradeServicesExploreCta")}
        </Link>
        {!isVip ? (
          <AuthRequiredButton href={joinHref} className={joinBtn}>
            {t("tradeServicesJoinCta")}
          </AuthRequiredButton>
        ) : null}
      </div>
    </article>
  );
}

export default function ZareoonExclusiveServices({ className = "" }) {
  const ts = useTranslations("supplier.tradeProvider");
  const tShared = useTranslations("shared");
  const { language, t } = useLanguage();
  const content = getExclusiveServicesContent(language);
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
        // fallback to sample counts
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const numberLocale =
    language === "en" ? "en-US" : language === "ru" ? "ru-RU" : language === "tr" ? "tr-TR" : "fa-IR";

  const memberLabel = (count) => {
    const formatted = count.toLocaleString(numberLocale);
    if (language === "en") return ts("memberCountEn", { count: formatted });
    if (language === "ru") return ts("memberCountRu", { count: formatted });
    return ts("memberCount", { count: formatted });
  };

  const resolveCompanyName = (itemId, isVip) => {
    if (itemId === "inspection-standards") {
      return getVipCompanyName(providers, itemId, tShared) || tShared("vip.inspectionStandardsCompany");
    }
    return isVip ? getVipCompanyName(providers, itemId, tShared) : null;
  };

  return (
    <section className={`w-full ${className}`} aria-labelledby="trade-services-hub-title">
      <div className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50/40 shadow-[0_16px_48px_-28px_rgba(6,78,59,0.28)] sm:rounded-[1.75rem]">
        <TradeServicesSectionHeader
          eyebrow={content.eyebrow}
          title={content.title}
          subtitle={content.subtitle}
          titleAs="h2"
          titleId="trade-services-hub-title"
        />

        <div className="space-y-3 p-2.5 sm:space-y-5 sm:p-5 lg:p-6">
          <ZareoonEscrowFeature />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {content.items.map((item) => {
              const count = memberCounts?.[item.id] ?? item.memberCount ?? 0;
              const isVip = !!vipCategories[item.id]?.enabled;
              return (
                <CategoryCard
                  key={item.id}
                  item={item}
                  count={count}
                  isVip={isVip}
                  companyName={resolveCompanyName(item.id, isVip)}
                  t={t}
                  locale={numberLocale}
                  memberLabel={memberLabel}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-3 sm:pt-5">
        <TradeServicesJoinBanner />
      </div>
    </section>
  );
}
