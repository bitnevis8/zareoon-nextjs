"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useTradeServicesContent } from "@/app/hooks/useTradeServicesContent";
import { API_ENDPOINTS } from "@/app/config/api";
import { resolveVipCategoryMessage } from "@/app/utils/vipCategoryHelpers";
import { resolveCategoryBrandLogo } from "@/app/data/tradeProviderBranding";
import TradeServicesSectionHeader from "@/app/components/TradeServicesSectionHeader";
import ZareoonEscrowFeature from "@/app/components/ZareoonEscrowFeature";
import TradeServicesCategoryPager from "@/app/components/TradeServicesCategoryPager";
import AuthRequiredButton from "@/app/components/ui/AuthRequiredButton";
import ZareoonPackagingAd from "@/app/components/ZareoonPackagingAd";
import { isPlatformExclusiveCategory, isZareoonOperatedCategory } from "@/app/utils/platformExclusiveCategories";

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

function CategoryHubIcon({ name }) {
  return (
    <svg className="h-4 w-4 text-emerald-700 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name] || "M8 6h8M8 10h8M8 14h5M6 4h12v16H6z"} />
    </svg>
  );
}

function HubCategoryIcon({ category, wide = false, tone = "amber" }) {
  const logo = resolveCategoryBrandLogo(category.id);
  const box = wide
    ? "h-9 w-[5.25rem] rounded-lg sm:h-11 sm:w-28 sm:rounded-xl"
    : "h-9 w-9 rounded-lg sm:h-12 sm:w-12 sm:rounded-xl";
  const borderTone = tone === "emerald" ? "border-emerald-200" : "border-amber-200";

  if (logo) {
    return (
      <div className={`relative shrink-0 overflow-hidden border bg-white shadow-sm ${borderTone} ${box}`}>
        <Image
          src={logo}
          alt={category.title}
          fill
          sizes={wide ? "112px" : "64px"}
          className={`object-contain ${wide ? "p-0.5 sm:p-1" : "p-1"}`}
        />
      </div>
    );
  }

  return (
    <div className={`flex shrink-0 items-center justify-center border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white ${box}`}>
      <CategoryHubIcon name={category.icon} />
    </div>
  );
}

function HubCategoryCard({ category, isVip, vipMessage, t, className = "" }) {
  const exclusive = isPlatformExclusiveCategory(category.id) || isVip;
  const isInspection = category.id === "inspection-standards";
  const isPackaging = isZareoonOperatedCategory(category.id);
  const brandedExclusive = isInspection || isPackaging;
  const joinHref = `/trade-services/register?category=${encodeURIComponent(category.id)}`;
  const providersBtn =
    "inline-flex min-h-8 w-full items-center justify-center rounded-lg border border-emerald-200 bg-white px-1.5 py-1.5 text-[10px] font-bold leading-tight text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50 sm:min-h-10 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm";
  const joinBtn =
    "inline-flex min-h-8 w-full items-center justify-center rounded-lg bg-emerald-600 px-1.5 py-1.5 text-[10px] font-bold leading-tight text-white shadow-sm transition hover:bg-emerald-700 sm:min-h-10 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm";

  return (
    <article
      className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border bg-white p-2.5 shadow-[0_4px_20px_-12px_rgba(6,78,59,0.18)] transition md:hover:-translate-y-0.5 md:hover:shadow-[0_14px_36px_-16px_rgba(6,95,70,0.22)] sm:rounded-2xl sm:p-5 ${
        exclusive
          ? isPackaging
            ? "border-emerald-200/90 md:hover:border-emerald-400"
            : "border-amber-200/80 md:hover:border-amber-300"
          : "border-emerald-100/90 md:hover:border-emerald-300"
      } ${className}`}
    >
      <div className="mb-2 flex items-start justify-between gap-1.5 sm:mb-3 sm:gap-2">
        <HubCategoryIcon
          category={category}
          wide={brandedExclusive}
          tone={isPackaging ? "emerald" : "amber"}
        />
        {!brandedExclusive && isVip ? (
          <span className="rounded-full bg-amber-200/90 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-950">VIP</span>
        ) : null}
      </div>
      {isPackaging ? (
        <p className="mb-0.5 line-clamp-2 text-start text-[11px] font-bold tracking-wide text-emerald-800 sm:mb-1 sm:text-xs">
          {t("packagingAdBrandName")}
        </p>
      ) : null}
      <h2 className="mb-1.5 line-clamp-2 min-h-[2.5rem] text-start text-[11px] font-bold leading-snug text-slate-900 sm:min-h-0 sm:text-[15px] sm:leading-6">
        {category.title}
      </h2>
      <p className="mb-3 hidden flex-1 text-start text-xs leading-6 text-slate-600 sm:line-clamp-3 sm:block sm:text-[13px]">
        {category.description}
      </p>
      {vipMessage && !brandedExclusive ? (
        <p className="mb-2 hidden rounded-xl border border-amber-200/70 bg-amber-50 px-2.5 py-2 text-[11px] leading-5 text-amber-950 sm:mb-3 sm:block">
          {vipMessage}
        </p>
      ) : null}
      <div className="mt-auto flex flex-col gap-1.5 sm:gap-2">
        <Link href={`/trade-services/${category.id}`} className={providersBtn}>
          {t("tradeServicesExploreCta")}
        </Link>
        {!exclusive ? (
          <AuthRequiredButton href={joinHref} className={joinBtn}>
            {t("tradeServicesJoinCta")}
          </AuthRequiredButton>
        ) : null}
      </div>
    </article>
  );
}

export default function TradeServicesHubPage() {
  const { t, language, isRTL } = useLanguage();
  const content = useTradeServicesContent();
  const dir = isRTL ? "rtl" : "ltr";
  const [vipCategories, setVipCategories] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.siteSettings.getVipPublic, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.success) setVipCategories(data.data?.categories || {});
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="page-shell section-stack py-6 text-start sm:py-8 lg:py-10" dir={dir}>
      <div className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-white shadow-[0_16px_48px_-28px_rgba(6,78,59,0.2)] sm:rounded-[1.75rem]">
        <TradeServicesSectionHeader
          eyebrow={content.eyebrow}
          title={content.title}
          subtitle={content.subtitle}
          titleAs="h1"
          titleId="trade-services-page-title"
          dir={dir}
        />

        <div className="space-y-3 px-9 py-2.5 text-start sm:space-y-5 sm:px-11 sm:py-5">
          <ZareoonEscrowFeature />
          <ZareoonPackagingAd />
          <TradeServicesCategoryPager
            items={content.categories}
            renderItem={(category) => {
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
            }}
          />
        </div>
      </div>
    </main>
  );
}
