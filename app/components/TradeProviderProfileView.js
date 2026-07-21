"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/app/context/LanguageContext";
import { API_ENDPOINTS } from "@/app/config/api";
import {
  getCategoryById,
  getTradeServicesContent,
} from "@/app/data/tradeServicesCatalog";
import { mapApiProviderRow } from "@/app/utils/tradeProviderMapper";
import ProviderAvatar from "@/app/components/trade/ProviderAvatar";
import PublicHoursAndMap from "@/app/components/ui/PublicHoursAndMap";
import PageStatusBanner from "@/app/components/ui/PageStatusBanner";
import { mergeBusinessHours } from "@/app/utils/businessHours";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";

function ReviewStars({ value, onChange, readonly }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={`text-lg leading-none ${n <= value ? "text-amber-500" : "text-slate-300"} ${readonly ? "cursor-default" : ""}`}
          aria-label={`${n}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

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

export default function TradeProviderProfileView({ providerId, embedded = false, panelOnly = false }) {
  const ts = useTranslations("supplier.tradeProvider");
  const { language, isRTL, t } = useLanguage();
  const section = getTradeServicesContent(language);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [isOwnerPreview, setIsOwnerPreview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [canOrder, setCanOrder] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setMissing(false);
      try {
        const res = await fetch(API_ENDPOINTS.tradeServiceProviders.getPublicById(encodeURIComponent(providerId)), {
          cache: "no-store",
          credentials: "include",
        });
        const json = await res.json();
        if (cancelled) return;
        if (json.success && json.data) {
          setProvider(mapApiProviderRow(json.data, t, language));
          setIsOwnerPreview(Boolean(json.meta?.isOwnerPreview));
          setCanReview(Boolean(json.meta?.canReview) && !json.meta?.myReview);
          setMyReview(json.meta?.myReview || null);
          setReviews(Array.isArray(json.meta?.reviews) ? json.meta.reviews : []);
          setStatusMessage(json.data.statusMessage || null);
          setCanOrder(json.data.canOrder !== false);
          return;
        }
        setMissing(true);
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

  const submitReview = async () => {
    if (!provider?.id) return;
    setReviewSubmitting(true);
    try {
      const res = await authFetch(API_ENDPOINTS.tradeServiceProviders.createReview(provider.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json.message || "خطا در ثبت امتیاز");
        return;
      }
      showToast.success(json.message || "ثبت شد");
      setMyReview(json.data.review);
      setCanReview(false);
      setProvider((p) =>
        p
          ? {
              ...p,
              rating: json.data.rating,
              reviewCount: json.data.reviewCount,
            }
          : p
      );
      setReviews((prev) => [json.data.review, ...prev.filter((r) => r.id !== json.data.review?.id)]);
    } catch {
      showToast.error("خطا در ثبت امتیاز");
    } finally {
      setReviewSubmitting(false);
    }
  };

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
      <div className={`flex items-center justify-center bg-transparent ${panelOnly ? "min-h-[30vh]" : "min-h-[50vh] bg-slate-50"}`}>
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (missing || !provider) {
    if (panelOnly) {
      return <p className="px-4 py-10 text-center text-sm text-slate-500">{t("tradeProviderProfileNotFound")}</p>;
    }
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
        <p className="text-sm text-slate-600">{t("tradeProviderProfileNotFound")}</p>
        <Link href="/trade-services" className="text-sm font-semibold text-emerald-700 hover:underline">
          {t("tradeServicesBrowseCta")}
        </Link>
      </div>
    );
  }

  const servicesBody = (
    <div className={`mx-auto max-w-5xl px-4 sm:px-6 ${panelOnly ? "pb-8 pt-2" : ""}`}>
      <div className="mb-4">
        <PageStatusBanner message={statusMessage} canOrder={canOrder} />
      </div>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {provider.routes ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-3 text-sm font-bold text-slate-900">{t("tradeProviderRoutes")}</h2>
              <p className="text-sm leading-7 text-slate-700">{provider.routes}</p>
            </section>
          ) : null}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-sm font-bold text-slate-900">{t("tradeProviderProfileCapabilities")}</h2>
            <div className="space-y-4">
              {groupedServices.length === 0 ? (
                <p className="text-sm text-slate-500">خدمتی ثبت نشده است.</p>
              ) : (
                groupedServices.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 text-xs font-semibold text-emerald-700">{group.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-sm font-bold text-slate-900">
              امتیاز کاربران
              {provider.reviewCount ? ` (${Number(provider.reviewCount).toLocaleString("fa-IR")})` : ""}
            </h2>
            {canReview ? (
              <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50/80 p-4">
                <ReviewStars value={reviewRating} onChange={setReviewRating} />
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={2}
                  placeholder="نظر کوتاه (اختیاری)"
                  className="mt-2 w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={submitReview}
                  disabled={reviewSubmitting}
                  className="mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {reviewSubmitting ? "…" : "ثبت امتیاز"}
                </button>
              </div>
            ) : null}
            {myReview ? (
              <p className="mb-3 text-xs text-slate-500">امتیاز شما ثبت شده است.</p>
            ) : null}
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500">هنوز نظری ثبت نشده است.</p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        {[r.reviewer?.firstName, r.reviewer?.lastName].filter(Boolean).join(" ") || "کاربر"}
                      </span>
                      <ReviewStars value={r.rating} readonly />
                    </div>
                    {r.comment ? <p className="mt-2 text-sm text-slate-600">{r.comment}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {provider.notes ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-3 text-sm font-bold text-slate-900">{t("tradeProviderProfileAbout")}</h2>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{provider.notes}</p>
            </section>
          ) : null}

          <PublicHoursAndMap
            businessHours={provider.businessHours ? mergeBusinessHours(provider.businessHours) : null}
            latitude={provider.latitude}
            longitude={provider.longitude}
            addressLabel={provider.addressLabel}
            title="ساعات کاری و موقعیت"
          />
        </div>

        <aside className="space-y-4 sm:space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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
            {!panelOnly && provider.phone ? (
              <a
                href={`tel:${provider.phone}`}
                className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700"
              >
                {t("tradeProviderCall")}
              </a>
            ) : null}
          </section>

          {provider.licenses ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-3 text-sm font-bold text-slate-900">{t("tradeProviderLicenses")}</h2>
              <p className="text-sm leading-7 text-slate-700">{provider.licenses}</p>
            </section>
          ) : null}

          {!panelOnly && primaryCategory ? (
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
  );

  if (panelOnly) {
    return (
      <div className={`${isRTL ? "text-right" : "text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
        {isOwnerPreview ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-900">
            {ts("ownerPreviewBanner")}
          </div>
        ) : null}
        {servicesBody}
      </div>
    );
  }

  const shellClass = embedded
    ? `bg-transparent ${isRTL ? "text-right" : "text-left"}`
    : `min-h-screen bg-slate-50 ${isRTL ? "text-right" : "text-left"}`;

  return (
    <div className={shellClass} dir={isRTL ? "rtl" : "ltr"}>
      {isOwnerPreview ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-900">
          {ts("ownerPreviewBanner")}
        </div>
      ) : null}
      <section className={`relative isolate ${embedded ? "pb-4" : "pb-10"}`}>
        <div className={`relative z-0 overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 ${embedded ? "h-24 sm:h-28" : "h-36 sm:h-48 md:h-56"}`}>
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
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-6">{servicesBody}</div>
      </section>
    </div>
  );
}
