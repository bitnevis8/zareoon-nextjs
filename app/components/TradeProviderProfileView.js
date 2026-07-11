"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { API_ENDPOINTS } from "@/app/config/api";
import {
  findCatalogService,
  getCategoryById,
  getTradeServicesContent,
} from "@/app/data/tradeServicesCatalog";
import {
  findSampleProviderById,
  mapApiProviderRow,
  mapSampleProviderEntry,
} from "@/app/utils/tradeProviderMapper";
import ProviderAvatar from "@/app/components/trade/ProviderAvatar";

function StarRating({ rating, reviewCount, t }) {
  if (rating == null) return null;
  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-sm font-bold tabular-nums">{Number(rating).toFixed(1)}</span>
      </span>
      {reviewCount ? (
        <span className="text-xs text-slate-500">
          {t("tradeProviderReviews")}: {reviewCount.toLocaleString("fa-IR")}
        </span>
      ) : null}
    </div>
  );
}

function ContactButton({ href, label, variant = "primary", external }) {
  const base =
    "inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:flex-none sm:min-w-[9rem]";
  const styles =
    variant === "primary"
      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
      : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50";

  if (href.startsWith("tel:") || href.startsWith("mailto:") || external) {
    return (
      <a href={href} className={`${base} ${styles}`}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {label}
    </Link>
  );
}

export default function TradeProviderProfileView({ providerId }) {
  const { language, isRTL, t } = useLanguage();
  const section = getTradeServicesContent(language);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setMissing(false);
      try {
        const isNumeric = /^\d+$/.test(providerId);
        if (isNumeric) {
          const res = await fetch(API_ENDPOINTS.tradeServiceProviders.getPublicById(providerId), {
            cache: "no-store",
          });
          const json = await res.json();
          if (!cancelled && json.success && json.data) {
            setProvider(mapApiProviderRow(json.data, t, language));
            return;
          }
        }

        const sampleHit = findSampleProviderById(providerId);
        if (!cancelled && sampleHit) {
          setProvider(
            mapSampleProviderEntry(sampleHit.provider, sampleHit.categoryId, language, t)
          );
          return;
        }

        if (!cancelled) setMissing(true);
      } catch {
        if (!cancelled) setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [providerId, t, language]);

  const primaryCategory = useMemo(() => {
    if (!provider?.primaryCategoryId) return null;
    return getCategoryById(language, provider.primaryCategoryId);
  }, [provider, language]);

  const groupedServices = useMemo(() => {
    if (!provider?.serviceDetails?.length) {
      if (!provider?.services?.length) return [];
      return [{ title: t("tradeProviderServices"), items: provider.services }];
    }
    const groups = {};
    provider.serviceDetails.forEach((item) => {
      if (!groups[item.categoryTitle]) groups[item.categoryTitle] = [];
      groups[item.categoryTitle].push(item.subcategoryTitle);
    });
    return Object.entries(groups).map(([title, items]) => ({ title, items }));
  }, [provider, t]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (missing || !provider) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
        <p className="text-sm text-slate-600">{t("tradeProviderProfileNotFound")}</p>
        <Link href="/trade-services" className="text-sm font-semibold text-emerald-700 hover:underline">
          {t("tradeServicesBrowseCta")}
        </Link>
      </div>
    );
  }

  const cooperationHref = primaryCategory
    ? `/service-request/${primaryCategory.id}?provider=${provider.id}`
    : `/trade-services`;

  return (
    <div className={`min-h-screen bg-slate-100 ${isRTL ? "text-right" : "text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
      <section className="relative isolate pb-10">
        {/* Cover — stays behind the profile card */}
        <div className="relative z-0 h-36 overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 sm:h-48 md:h-56">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
          <div className="relative z-[1] mx-auto flex h-full max-w-5xl items-start px-4 pt-4 sm:px-6">
            <nav className="text-xs text-emerald-100/90 sm:text-sm">
              <Link href="/" className="hover:text-white">
                {t("mainPage")}
              </Link>
              <span className="mx-2 opacity-60">/</span>
              <Link href="/trade-services" className="hover:text-white">
                {section.title}
              </Link>
              {primaryCategory ? (
                <>
                  <span className="mx-2 opacity-60">/</span>
                  <Link href={`/trade-services/${primaryCategory.id}`} className="hover:text-white">
                    {primaryCategory.title}
                  </Link>
                </>
              ) : null}
            </nav>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
          {/* Profile header card — overlaps cover but renders above it */}
          <div className="-mt-14 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg sm:-mt-16 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <ProviderAvatar provider={provider} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 sm:text-2xl md:text-3xl">{provider.name}</h1>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {provider.entityType}
                </span>
              </div>
              {provider.contactName && provider.entityTypeKey === "company" ? (
                <p className="mt-1 text-sm text-slate-500">
                  {t("tradeProviderProfileContactPerson")}: {provider.contactName}
                </p>
              ) : null}
              <div className="mt-3">
                <StarRating rating={provider.rating} reviewCount={provider.reviewCount} t={t} />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {provider.phone ? (
              <ContactButton href={`tel:${provider.phone}`} label={t("tradeProviderCall")} variant="primary" external />
            ) : null}
            {provider.email ? (
              <ContactButton
                href={`mailto:${provider.email}`}
                label={t("tradeProviderEmail")}
                variant="secondary"
                external
              />
            ) : null}
            <ContactButton href={cooperationHref} label={t("tradeServicesCooperationCta")} variant="secondary" />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {provider.routes ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-3 text-sm font-bold text-slate-900">{t("tradeProviderRoutes")}</h2>
                <p className="text-sm leading-7 text-slate-700">{provider.routes}</p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-sm font-bold text-slate-900">{t("tradeProviderProfileCapabilities")}</h2>
              <div className="space-y-4">
                {groupedServices.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">{group.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {provider.notes ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-3 text-sm font-bold text-slate-900">{t("tradeProviderProfileAbout")}</h2>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{provider.notes}</p>
              </section>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-bold text-slate-900">{t("tradeProviderProfileContactBox")}</h2>
              <dl className="space-y-3 text-sm">
                {provider.contactName ? (
                  <div>
                    <dt className="text-xs font-semibold text-slate-500">{t("tradeProviderProfileName")}</dt>
                    <dd className="mt-0.5 font-medium text-slate-800">{provider.contactName}</dd>
                  </div>
                ) : null}
                {provider.phone ? (
                  <div>
                    <dt className="text-xs font-semibold text-slate-500">{t("lcFormPhone")}</dt>
                    <dd className="mt-0.5 font-medium text-slate-800" dir="ltr">
                      {provider.phone}
                    </dd>
                  </div>
                ) : null}
                {provider.email ? (
                  <div>
                    <dt className="text-xs font-semibold text-slate-500">{t("lcFormEmail")}</dt>
                    <dd className="mt-0.5 break-all font-medium text-slate-800" dir="ltr">
                      {provider.email}
                    </dd>
                  </div>
                ) : null}
                {provider.experienceYears ? (
                  <div>
                    <dt className="text-xs font-semibold text-slate-500">{t("tradeProviderExperience")}</dt>
                    <dd className="mt-0.5 font-medium text-slate-800">
                      {t("tradeProviderExperienceYears", { years: provider.experienceYears })}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>

            {provider.licenses ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-bold text-slate-900">{t("tradeProviderLicenses")}</h2>
                <p className="text-sm leading-7 text-slate-700">{provider.licenses}</p>
              </section>
            ) : null}

            {primaryCategory ? (
              <Link
                href={`/trade-services/${primaryCategory.id}`}
                className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                {t("tradeProviderBackToCategory")}
                <span aria-hidden>←</span>
              </Link>
            ) : null}
          </aside>
        </div>
        </div>
      </section>
    </div>
  );
}
