"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AuthRequiredButton from "./ui/AuthRequiredButton";
import ProviderAvatar from "./trade/ProviderAvatar";
import { useLanguage } from "../context/LanguageContext";
import { API_ENDPOINTS } from "../config/api";
import {
  getCategoryById,
  getSampleProviders,
  getTradeServicesContent,
} from "../data/tradeServicesCatalog";
import {
  mapApiProviderRow,
  mapSampleProviderEntry,
} from "@/app/utils/tradeProviderMapper";
import {
  resolveVipBannerImage,
  resolveVipCategoryMessage,
  shouldUseFeaturedProviderCard,
} from "@/app/utils/vipCategoryHelpers";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";

function StarRating({ rating, size = "sm" }) {
  if (rating == null) return null;
  const iconClass = size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5";
  const textClass = size === "lg" ? "text-sm" : "text-xs";
  return (
    <span className="inline-flex items-center gap-1.5 text-amber-600">
      <svg className={`${iconClass} fill-current`} viewBox="0 0 20 20" aria-hidden>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className={`${textClass} font-bold tabular-nums`}>{Number(rating).toFixed(1)}</span>
    </span>
  );
}

function ServiceTags({ services, moreCount, locale }) {
  if (!services.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {services.map((svc) => (
        <span
          key={svc}
          className="rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-700"
        >
          {svc}
        </span>
      ))}
      {moreCount > 0 ? (
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          +{moreCount.toLocaleString(locale)}
        </span>
      ) : null}
    </div>
  );
}

function VipHeroBanner({ src, alt }) {
  const imageSrc = resolveMediaUrl(src);
  return (
    <div className="w-full max-w-[220px] rounded-xl border border-white/25 bg-white/95 p-3 shadow-lg sm:max-w-[260px]">
      <div className="relative aspect-[5/2] w-full">
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 220px, 260px"
        />
      </div>
    </div>
  );
}

function ProviderCard({ provider, t, locale }) {
  const previewServices = provider.services.slice(0, 3);
  const moreCount = Math.max(0, provider.services.length - 3);

  return (
    <Link
      href={provider.profilePath}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_12px_40px_rgba(6,95,70,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start gap-4 p-5">
        <ProviderAvatar provider={provider} size="sm" className="border-0 shadow-inner" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-slate-900">{provider.name}</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{provider.entityType}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StarRating rating={provider.rating} />
            {provider.experienceYears ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {t("tradeProviderExperienceYears", { years: provider.experienceYears })}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col border-t border-slate-100 px-5 pb-5 pt-4">
        {provider.routes ? (
          <p className="mb-3 line-clamp-2 text-xs leading-6 text-slate-600 sm:text-sm">
            <span className="font-semibold text-slate-500">{t("tradeProviderRoutes")}: </span>
            {provider.routes}
          </p>
        ) : null}

        {previewServices.length ? (
          <div className="mb-4">
            <ServiceTags services={previewServices} moreCount={moreCount} locale={locale} />
          </div>
        ) : null}

        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-900">
          {t("tradeProviderViewProfile")}
          <span className="transition group-hover:translate-x-[-3px]" aria-hidden>
            ←
          </span>
        </span>
      </div>
    </Link>
  );
}

function VipFeaturedProviderCard({ provider, t, locale, vipMessage }) {
  const previewServices = provider.services.slice(0, 6);
  const moreCount = Math.max(0, provider.services.length - 6);

  return (
    <Link
      href={provider.profilePath}
      className="group col-span-full block overflow-hidden rounded-3xl border-2 border-amber-200/70 bg-white shadow-[0_8px_40px_rgba(180,83,9,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_16px_48px_rgba(180,83,9,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <div className="flex flex-col lg:flex-row">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 px-6 py-8 text-white lg:w-80 lg:shrink-0 xl:w-96">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_55%)]" />
          <div className="relative flex flex-col items-center text-center lg:items-start lg:text-right">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-amber-950">
              {t("tradeProviderVipBadge")}
            </span>
            <div className="mb-4 flex h-24 w-24 items-center justify-center">
              <ProviderAvatar provider={provider} size="lg" className="h-24 w-24 border-white/20 bg-white/10" />
            </div>
            <h3 className="text-2xl font-black leading-tight">{provider.name}</h3>
            <p className="mt-1 text-sm text-emerald-100/90">{provider.entityType}</p>
            <div className="mt-3">
              <StarRating rating={provider.rating} size="lg" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-4 p-6 sm:p-8">
          {vipMessage ? (
            <p className="rounded-2xl border border-amber-200/80 bg-gradient-to-l from-amber-50 to-amber-50/40 px-4 py-3 text-sm leading-7 text-amber-950">
              {vipMessage}
            </p>
          ) : null}

          {provider.routes ? (
            <p className="text-sm leading-7 text-slate-700">
              <span className="font-bold text-slate-900">{t("tradeProviderRoutes")}: </span>
              {provider.routes}
            </p>
          ) : null}

          {previewServices.length ? (
            <ServiceTags services={previewServices} moreCount={moreCount} locale={locale} />
          ) : null}

          {provider.licenses ? (
            <p className="text-xs leading-6 text-slate-500">
              <span className="font-semibold text-slate-600">{t("tradeProviderLicenses")}: </span>
              {provider.licenses}
            </p>
          ) : null}

          <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-emerald-700">
            {t("tradeProviderViewProfile")}
            <span aria-hidden>←</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard({ featured = false }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200/70 ${featured ? "col-span-full h-64" : "h-60"}`}
    />
  );
}

export default function TradeServicesCategoryView({ categoryId }) {
  const { language, isRTL, t } = useLanguage();
  const section = getTradeServicesContent(language);
  const category = getCategoryById(language, categoryId);
  const sampleProviders = getSampleProviders(categoryId);
  const [liveProviders, setLiveProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [vipCategories, setVipCategories] = useState({});
  const locale = language === "en" ? "en-US" : language === "ru" ? "ru-RU" : "fa-IR";

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${API_ENDPOINTS.tradeServiceProviders.getPublic}?categoryId=${encodeURIComponent(categoryId)}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.data)) {
          setLiveProviders(json.data.map((row) => mapApiProviderRow(row, t, language)));
        }
      } catch {
        if (!cancelled) setLiveProviders([]);
      } finally {
        if (!cancelled) setLoadingProviders(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId, t, language]);

  const isVipCategory = !!vipCategories[categoryId]?.enabled;
  const vipMessage = resolveVipCategoryMessage(vipCategories, categoryId, language, t);
  const vipBannerImage = resolveVipBannerImage(vipCategories, categoryId);

  const providers = useMemo(() => {
    if (liveProviders.length) return liveProviders;
    if (isVipCategory) return [];
    return sampleProviders.map((p) => mapSampleProviderEntry(p, categoryId, language, t));
  }, [liveProviders, sampleProviders, categoryId, language, t, isVipCategory]);

  if (!category) return null;

  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? "text-right" : "text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="border-b border-emerald-900/10 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <nav className="mb-4 text-xs text-emerald-100/90 sm:text-sm">
            <Link href="/" className="hover:text-white">
              {t("mainPage")}
            </Link>
            <span className="mx-2 opacity-50">/</span>
            <Link href="/trade-services" className="hover:text-white">
              {section.title}
            </Link>
            <span className="mx-2 opacity-50">/</span>
            <span className="text-white">{category.title}</span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  {t("tradeServicesSectionLabel")}
                </span>
                {isVipCategory ? (
                  <span className="rounded-full bg-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-amber-950">
                    {t("tradeProviderVipBadge")}
                  </span>
                ) : null}
              </div>
              <h1 className="text-2xl font-black leading-tight sm:text-3xl md:text-4xl">{category.title}</h1>
              <p className="mt-3 text-sm leading-7 text-emerald-50/95 sm:text-base">{category.description}</p>
            </div>
            <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
              {vipBannerImage ? (
                <VipHeroBanner src={vipBannerImage} alt={category.title} />
              ) : null}
              <div className="flex flex-wrap gap-2 sm:justify-end">
              {!isVipCategory ? (
                <AuthRequiredButton
                  href={`/trade-services/register?category=${category.id}`}
                  className="inline-flex min-h-[44px] items-center rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-60"
                >
                  {t("tradeProviderRegisterCta")}
                </AuthRequiredButton>
              ) : null}
              <Link
                href={`/service-request/${category.id}`}
                className="inline-flex min-h-[44px] items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
              >
                {t("tradeServicesCooperationCta")}
              </Link>
              </div>
            </div>
          </div>

          {isVipCategory && vipMessage ? (
            <p className="mt-4 max-w-3xl rounded-xl border border-amber-300/40 bg-amber-400/15 px-4 py-3 text-sm leading-7 text-amber-50">
              {vipMessage}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <p className="text-[10px] text-emerald-100">{t("tradeServicesProvidersTitle")}</p>
              <p className="text-lg font-bold tabular-nums">{providers.length.toLocaleString(locale)}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <p className="text-[10px] text-emerald-100">{t("tradeServicesSubcategoriesTitle")}</p>
              <p className="text-lg font-bold tabular-nums">{category.children.length.toLocaleString(locale)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
        {/* Subcategories */}
        <section aria-labelledby="subcategories-heading">
          <h2 id="subcategories-heading" className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">
            {t("tradeServicesSubcategoriesTitle")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/service-request/${category.id}?sub=${child.id}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
              >
                {child.title}
              </Link>
            ))}
          </div>
        </section>

        {/* Providers */}
        <section aria-labelledby="providers-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="providers-heading" className="text-lg font-bold text-slate-900 sm:text-xl">
                {t("tradeServicesProvidersTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{t("tradeServicesProvidersDesc")}</p>
            </div>
          </div>

          {loadingProviders ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <SkeletonCard featured={isVipCategory} />
              {!isVipCategory ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : null}
            </div>
          ) : providers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="text-sm text-slate-600">{isVipCategory ? vipMessage : t("tradeServicesNoProvidersYet")}</p>
              {!isVipCategory ? (
                <AuthRequiredButton
                  href={`/trade-services/register?category=${category.id}`}
                  className="mt-4 inline-flex rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                >
                  {t("tradeProviderRegisterCta")}
                </AuthRequiredButton>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {providers.map((provider) =>
                shouldUseFeaturedProviderCard({
                  isVipCategory,
                  provider,
                  providerCount: providers.length,
                }) ? (
                  <VipFeaturedProviderCard
                    key={provider.id}
                    provider={provider}
                    t={t}
                    locale={locale}
                    vipMessage={vipMessage}
                  />
                ) : (
                  <ProviderCard key={provider.id} provider={provider} t={t} locale={locale} />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
