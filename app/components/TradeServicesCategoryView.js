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
  getTradeServicesContent,
} from "../data/tradeServicesCatalog";
import { mapApiProviderRow } from "@/app/utils/tradeProviderMapper";
import {
  resolveVipBannerImage,
  resolveVipCategoryMessage,
  shouldUseFeaturedProviderCard,
} from "@/app/utils/vipCategoryHelpers";
import { isPlatformExclusiveCategory, isZareoonOperatedCategory } from "@/app/utils/platformExclusiveCategories";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { getSubcategoryIconPath } from "@/app/utils/tradeServiceIcons";
import ZareoonPackagingAd from "./ZareoonPackagingAd";

function SubserviceIcon({ subcategoryId, className = "h-5 w-5" }) {
  const d = getSubcategoryIconPath(subcategoryId);
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function providerOffersSubservice(provider, subcategoryId, subcategoryTitle) {
  if (!provider) return false;
  const details = Array.isArray(provider.serviceDetails) ? provider.serviceDetails : [];
  if (details.some((s) => s?.subcategoryId === subcategoryId)) return true;
  const titles = Array.isArray(provider.services) ? provider.services : [];
  return titles.some((title) => String(title).trim() === String(subcategoryTitle).trim());
}

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
  const [liveProviders, setLiveProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [vipCategories, setVipCategories] = useState({});
  const [selectedSubId, setSelectedSubId] = useState("all");
  const locale = language === "en" ? "en-US" : language === "ru" ? "ru-RU" : "fa-IR";

  useEffect(() => {
    setSelectedSubId("all");
  }, [categoryId]);

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
  const isPlatformExclusive = isPlatformExclusiveCategory(categoryId);
  const isPackagingExclusive = isZareoonOperatedCategory(categoryId);
  const membershipClosed = isVipCategory || isPlatformExclusive;
  const vipMessage = resolveVipCategoryMessage(vipCategories, categoryId, language, t);
  // بازرسی و بسته‌بندی: بدون پیام «عضویت فعال نیست» — تبلیغ/برند کافی است
  const exclusiveMessage = isPlatformExclusive ? null : vipMessage;
  const vipBannerImage = resolveVipBannerImage(vipCategories, categoryId);

  const providers = useMemo(() => {
    if (liveProviders.length) return liveProviders;
    return [];
  }, [liveProviders]);

  const selectedChild =
    selectedSubId === "all"
      ? null
      : (category?.children || []).find((c) => c.id === selectedSubId) || null;

  const filteredProviders = useMemo(() => {
    if (!selectedChild) return providers;
    return providers.filter((p) =>
      providerOffersSubservice(p, selectedChild.id, selectedChild.title)
    );
  }, [providers, selectedChild]);

  if (!category) return null;

  const children = category.children || [];

  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? "text-right" : "text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-emerald-900/10 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-emerald-400/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
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
                {membershipClosed ? (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isPackagingExclusive
                        ? "bg-emerald-300 text-emerald-950"
                        : "bg-amber-300 text-amber-950"
                    }`}
                  >
                    {isPackagingExclusive ? t("packagingAdBadge") : t("tradeProviderVipBadge")}
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
              {!membershipClosed ? (
                <AuthRequiredButton
                  href={`/trade-services/register?category=${category.id}`}
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
                >
                  {t("tradeProviderRegisterCta")}
                </AuthRequiredButton>
              ) : null}
              </div>
            </div>
          </div>

          {membershipClosed && exclusiveMessage ? (
            <p
              className={`mt-4 max-w-3xl rounded-xl border px-4 py-3 text-sm leading-7 ${
                isPackagingExclusive
                  ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-50"
                  : "border-amber-300/40 bg-amber-400/15 text-amber-50"
              }`}
            >
              {exclusiveMessage}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <p className="text-[10px] text-emerald-100">{t("tradeServicesProvidersTitle")}</p>
              <p className="text-lg font-bold tabular-nums">{filteredProviders.length.toLocaleString(locale)}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <p className="text-[10px] text-emerald-100">{t("tradeServicesSubcategoriesTitle")}</p>
              <p className="text-lg font-bold tabular-nums">{children.length.toLocaleString(locale)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
        {isPackagingExclusive ? <ZareoonPackagingAd /> : null}

        {/* Subcategory filters */}
        {children.length > 0 ? (
          <section
            aria-labelledby="subcategories-heading"
            className="rounded-3xl border border-emerald-100/90 bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="subcategories-heading" className="text-lg font-bold text-slate-900 sm:text-xl">
                  {t("tradeServicesSubcategoriesTitle")}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  {t("tradeServicesSubcategoriesDesc")}
                </p>
              </div>
              {selectedChild ? (
                <button
                  type="button"
                  onClick={() => setSelectedSubId("all")}
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  {t("tradeServicesClearFilter")}
                </button>
              ) : null}
            </div>

            <div
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4"
              role="listbox"
              aria-label={t("tradeServicesSubcategoriesTitle")}
            >
              <button
                type="button"
                role="option"
                aria-selected={selectedSubId === "all"}
                onClick={() => setSelectedSubId("all")}
                className={`group flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-center transition ${
                  selectedSubId === "all"
                    ? "border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500/30"
                    : "border-slate-200/90 bg-slate-50/80 hover:border-emerald-200 hover:bg-white"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    selectedSubId === "all"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/80"
                  }`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
                  </svg>
                </span>
                <span
                  className={`text-xs font-bold leading-5 sm:text-sm ${
                    selectedSubId === "all" ? "text-emerald-900" : "text-slate-800"
                  }`}
                >
                  {t("tradeServicesFilterAll")}
                </span>
              </button>

              {children.map((child) => {
                const active = selectedSubId === child.id;
                return (
                  <button
                    key={child.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => setSelectedSubId(child.id)}
                    className={`group flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-center transition ${
                      active
                        ? "border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500/30"
                        : "border-slate-200/90 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        active
                          ? "bg-emerald-600 text-white"
                          : "bg-gradient-to-br from-emerald-50 to-white text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                      }`}
                    >
                      <SubserviceIcon subcategoryId={child.id} className="h-5 w-5" />
                    </span>
                    <span
                      className={`line-clamp-2 text-xs font-semibold leading-5 sm:text-sm ${
                        active ? "text-emerald-900" : "text-slate-800"
                      }`}
                    >
                      {child.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Providers */}
        <section aria-labelledby="providers-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="providers-heading" className="text-lg font-bold text-slate-900 sm:text-xl">
                {t("tradeServicesProvidersTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {selectedChild
                  ? t("tradeServicesProvidersFilteredDesc", {
                      service: selectedChild.title,
                      count: filteredProviders.length,
                    })
                  : t("tradeServicesProvidersDesc")}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-slate-500">
              {filteredProviders.length.toLocaleString(locale)}
            </p>
          </div>

          {loadingProviders ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <SkeletonCard featured={membershipClosed} />
              {!membershipClosed ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : null}
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="text-sm text-slate-600">
                {selectedChild
                  ? t("tradeServicesNoProvidersForFilter")
                  : membershipClosed
                    ? exclusiveMessage
                    : t("tradeServicesNoProvidersYet")}
              </p>
              {selectedChild ? (
                <button
                  type="button"
                  onClick={() => setSelectedSubId("all")}
                  className="mt-4 inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  {t("tradeServicesFilterAll")}
                </button>
              ) : !membershipClosed ? (
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
              {filteredProviders.map((provider) =>
                shouldUseFeaturedProviderCard({
                  isVipCategory: membershipClosed,
                  provider,
                  providerCount: filteredProviders.length,
                }) ? (
                  <VipFeaturedProviderCard
                    key={provider.id}
                    provider={provider}
                    t={t}
                    locale={locale}
                    vipMessage={exclusiveMessage}
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
