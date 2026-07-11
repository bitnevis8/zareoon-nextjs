"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useLanguage } from "@/app/context/LanguageContext";
import { findCatalogService, getCategoryById } from "@/app/data/tradeServicesCatalog";

const STATUS_LABELS = {
  pending: { text: "در انتظار تأیید", className: "bg-amber-100 text-amber-800" },
  approved: { text: "منتشر شده", className: "bg-emerald-100 text-emerald-800" },
  rejected: { text: "رد شده", className: "bg-rose-100 text-rose-800" },
};

function InfoRow({ label, value, dir }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900" dir={dir}>
        {value || "—"}
      </p>
    </div>
  );
}

function ServiceProviderProfileContent() {
  const { language } = useLanguage();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(API_ENDPOINTS.tradeServiceProviders.mine, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => setProvider(json?.primary || json?.data?.[0] || null))
      .finally(() => setLoading(false));
  }, []);

  const serviceItems = useMemo(() => {
    if (!provider) return [];
    const selected = Array.isArray(provider.selectedServices) ? provider.selectedServices : [];
    if (selected.length) {
      return selected
        .map((item) => findCatalogService(language, item.categoryId, item.subcategoryId))
        .filter(Boolean);
    }
    const category = getCategoryById(language, provider.categoryId);
    const subs = Array.isArray(provider.subcategoryIds) ? provider.subcategoryIds : [];
    return subs
      .map((subId) => findCatalogService(language, provider.categoryId, subId))
      .filter(Boolean);
  }, [provider, language]);

  if (loading) {
    return <p className="text-sm text-slate-500">در حال بارگذاری…</p>;
  }

  if (!provider) {
    return (
      <div className={dash.page}>
        <header className="mb-6">
          <h1 className={dash.pageTitle}>پروفایل ارائه‌دهنده</h1>
          <p className={dash.pageSubtitle}>هنوز به‌عنوان ارائه‌دهنده خدمات بازرگانی ثبت‌نام نکرده‌اید.</p>
        </header>
        <div className={`${dash.card} ${dash.cardBody} space-y-4`}>
          <p className="text-sm leading-7 text-slate-600">
            با ثبت‌نام در فهرست ارائه‌دهندگان، صفحه عمومی شرکت یا خدمات شما ساخته می‌شود و متقاضیان مرتبط از
            طریق اعلان مطلع می‌شوند.
          </p>
          <Link
            href="/trade-services/register"
            className="inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            عضویت ارائه‌دهنده
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_LABELS[provider.status] || STATUS_LABELS.pending;
  const publicHref = `/trade-services/provider/${provider.id}`;
  const entityLabel = provider.entityType === "individual" ? "شخص حقیقی" : "شرکت / شخص حقوقی";

  return (
    <div className={dash.page}>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={dash.pageTitle}>پروفایل شرکت / خدمات من</h1>
          <p className={dash.pageSubtitle}>اطلاعات ثبت‌شده شما به‌عنوان ارائه‌دهنده خدمات بازرگانی</p>
        </div>
        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
          {status.text}
        </span>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          <section className={`${dash.card} ${dash.cardBody}`}>
            <h2 className="mb-4 text-sm font-bold text-slate-900">اطلاعات عمومی</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="نام نمایشی" value={provider.displayName} />
              <InfoRow label="نوع شخصیت" value={entityLabel} />
              <InfoRow label="نام تماس" value={provider.contactName} />
              <InfoRow label="تلفن" value={provider.phone} dir="ltr" />
              <InfoRow label="ایمیل" value={provider.email} dir="ltr" />
              <InfoRow
                label="سابقه"
                value={provider.experienceYears != null ? `${provider.experienceYears} سال` : null}
              />
            </div>
          </section>

          <section className={`${dash.card} ${dash.cardBody}`}>
            <h2 className="mb-4 text-sm font-bold text-slate-900">خدمات ارائه‌شده</h2>
            {serviceItems.length ? (
              <ul className="space-y-2">
                {serviceItems.map((item) => (
                  <li
                    key={`${item.categoryId}-${item.subcategoryId}`}
                    className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3"
                  >
                    <p className="text-sm font-bold text-slate-900">{item.subcategoryTitle}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.categoryTitle}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">خدمتی ثبت نشده است.</p>
            )}
          </section>

          {(provider.countriesRoutes || provider.licenses || provider.servicesOffered || provider.notes) && (
            <section className={`${dash.card} ${dash.cardBody} space-y-3`}>
              <h2 className="text-sm font-bold text-slate-900">جزئیات تکمیلی</h2>
              {provider.countriesRoutes ? (
                <InfoRow label="کشورها / مسیرها" value={provider.countriesRoutes} />
              ) : null}
              {provider.licenses ? <InfoRow label="مجوزها" value={provider.licenses} /> : null}
              {provider.servicesOffered ? <InfoRow label="توضیح خدمات" value={provider.servicesOffered} /> : null}
              {provider.notes ? <InfoRow label="یادداشت" value={provider.notes} /> : null}
            </section>
          )}
        </div>

        <aside className="space-y-3">
          {provider.status === "approved" ? (
            <Link
              href={publicHref}
              className={`${dash.card} ${dash.cardBody} block transition hover:border-emerald-200 hover:bg-emerald-50/30`}
            >
              <p className="text-sm font-bold text-slate-900">مشاهده صفحه عمومی</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">صفحه‌ای که کاربران در فهرست خدمات می‌بینند</p>
            </Link>
          ) : (
            <div className={`${dash.card} ${dash.cardBody}`}>
              <p className="text-sm font-bold text-slate-900">صفحه عمومی</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">
                پس از تأیید مدیر، صفحه عمومی شرکت شما در فهرست خدمات منتشر می‌شود.
              </p>
            </div>
          )}

          <Link
            href="/dashboard/incoming-requests"
            className={`${dash.card} ${dash.cardBody} block transition hover:border-emerald-200 hover:bg-emerald-50/30`}
          >
            <p className="text-sm font-bold text-slate-900">درخواست‌های متقاضیان</p>
            <p className="mt-1 text-xs leading-6 text-slate-600">درخواست‌های مرتبط با خدمات شما</p>
          </Link>

          <Link
            href="/dashboard/messages"
            className={`${dash.card} ${dash.cardBody} block transition hover:border-emerald-200 hover:bg-emerald-50/30`}
          >
            <p className="text-sm font-bold text-slate-900">پیام‌ها</p>
            <p className="mt-1 text-xs leading-6 text-slate-600">گفتگو با متقاضیان و همکاران</p>
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default function ServiceProviderProfilePage() {
  return (
    <ProtectedRoute>
      <ServiceProviderProfileContent />
    </ProtectedRoute>
  );
}
