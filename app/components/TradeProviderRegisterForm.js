"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { API_ENDPOINTS } from "../config/api";
import { getL1Categories } from "../data/tradeServicesCatalog";
import { authFetch } from "../utils/authHeaders";
import { showToast } from "../utils/toast";
import TradeProviderServicePicker from "./TradeProviderServicePicker";
import ServiceProviderOnboardingIntro from "./ServiceProviderOnboardingIntro";
import { resolveVipCategoryMessage } from "@/app/utils/vipCategoryHelpers";
import { isPlatformExclusiveCategory } from "@/app/utils/platformExclusiveCategories";
import PublicPageSlugField from "@/app/components/ui/PublicPageSlugField";
import ExistingPublicPageNotice from "@/app/components/ui/ExistingPublicPageNotice";
import { useExistingPublicSlug } from "@/app/hooks/useExistingPublicSlug";
import BusinessHoursEditor from "@/app/components/ui/BusinessHoursEditor";
import LocationPickerMap from "@/app/components/ui/LocationPickerMap";
import { DEFAULT_BUSINESS_HOURS } from "@/app/utils/businessHours";
import { dash } from "@/app/components/dashboard/dashboardTheme";

const initialForm = {
  entityType: "individual",
  displayName: "",
  profileSlug: "",
  contactName: "",
  phone: "",
  email: "",
  notes: "",
  businessHours: DEFAULT_BUSINESS_HOURS,
  latitude: null,
  longitude: null,
  addressLabel: "",
};

function SectionCard({ title, description, children, step }) {
  return (
    <section className={`${dash.card} ${dash.cardBody}`}>
      <div className="mb-4 flex items-start gap-3">
        {step ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-800">
            {step}
          </span>
        ) : null}
        <div>
          <h2 className={dash.cardTitle}>{title}</h2>
          {description ? <p className="mt-1 text-xs leading-6 text-slate-500">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function TradeProviderRegisterForm() {
  const { t, isRTL, language } = useLanguage();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCategory = searchParams.get("category") || "";
  const startForm = searchParams.get("start") === "1";
  const { slug: existingSlug, loading: slugLoading, hasSlug } = useExistingPublicSlug();

  const categories = useMemo(() => getL1Categories(language), [language]);
  const [introAccepted, setIntroAccepted] = useState(startForm);
  const [form, setForm] = useState(initialForm);
  const [selectedServices, setSelectedServices] = useState([]);
  const [vipCategories, setVipCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [awaitsApproval, setAwaitsApproval] = useState(false);

  const profileFullName = useMemo(() => {
    const user = auth?.user;
    if (!user) return "";
    return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  }, [auth?.user]);

  useEffect(() => {
    if (auth?.loading) return;
    if (!auth?.user) {
      showToast.warning(t("toastLoginRequired"));
      const nextPath = prefillCategory
        ? `/trade-services/register?category=${encodeURIComponent(prefillCategory)}`
        : "/trade-services/register";
      router.replace(`/auth/login?next=${encodeURIComponent(nextPath)}`);
    }
  }, [auth?.loading, auth?.user, prefillCategory, router, t]);

  useEffect(() => {
    const user = auth?.user;
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      contactName: profileFullName,
      displayName: prev.displayName || profileFullName,
      phone: prev.phone || user.mobile || user.phone || "",
      email: prev.email || user.email || "",
      profileSlug: existingSlug || prev.profileSlug,
    }));
  }, [auth?.user, profileFullName, existingSlug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.siteSettings.public, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.success) {
          setVipCategories(json.data?.vipCategories || {});
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const displayName = form.displayName.trim() || profileFullName;
    const contactName = profileFullName || displayName;
    const pageSlug = hasSlug ? existingSlug : form.profileSlug.trim();

    if (!displayName || !form.phone.trim()) {
      setError(t("lcFormRequiredError"));
      showToast.error(t("lcFormRequiredError"));
      return;
    }

    if (!pageSlug) {
      const msg = "نام صفحه عمومی را وارد کنید";
      setError(msg);
      showToast.error(msg);
      return;
    }

    if (!selectedServices.length) {
      const msg = t("tradeProviderNoServicesSelected");
      setError(msg);
      showToast.warning(msg);
      return;
    }

    const blockedVip = selectedServices.find(
      (s) => vipCategories[s.categoryId]?.enabled || isPlatformExclusiveCategory(s.categoryId)
    );
    if (blockedVip) {
      const msg = isPlatformExclusiveCategory(blockedVip.categoryId)
        ? t("packagingAdFooter")
        : resolveVipCategoryMessage(vipCategories, blockedVip.categoryId, language, t) ||
          t("tradeProviderVipMessage");
      setError(msg);
      showToast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        entityType: "individual",
        displayName,
        contactName,
        phone: form.phone,
        email: form.email,
        notes: form.notes,
        profileSlug: pageSlug,
        selectedServices: selectedServices.map(({ categoryId, subcategoryId }) => ({
          categoryId,
          subcategoryId,
        })),
        categoryId: selectedServices[0].categoryId,
        subcategoryIds: selectedServices.map((s) => s.subcategoryId),
        businessHours: form.businessHours,
        latitude: form.latitude,
        longitude: form.longitude,
        addressLabel: form.addressLabel,
      };

      const response = await authFetch(API_ENDPOINTS.tradeServiceProviders.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        const msg = data.message || t("lcFormSubmitError");
        setError(msg);
        showToast.error(msg);
        return;
      }
      showToast.success(data.message || t("tradeProviderRegisterSuccess"));
      setSuccessMessage(data.message || t("tradeProviderRegisterSuccess"));
      setSuccessNotice(data.createNotice || "");
      setAwaitsApproval(!!data.awaitsApproval);
      setSuccess(true);
      if (data.user && auth?.updateUser) {
        auth.updateUser(data.user);
      } else if (auth?.updateUser) {
        try {
          const me = await authFetch(API_ENDPOINTS.auth.me, { credentials: "include" });
          const meData = await me.json();
          if (meData.success && meData.data) auth.updateUser(meData.data);
        } catch {
          /* ignore */
        }
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("trade-provider-mine-updated"));
      }
    } catch {
      setError(t("lcFormSubmitError"));
      showToast.error(t("lcFormSubmitError"));
    } finally {
      setLoading(false);
    }
  };

  if (!auth?.loading && !auth?.user) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10 text-center" dir={isRTL ? "rtl" : "ltr"}>
        <p className="text-sm text-slate-600">{t("toastLoginRequired")}</p>
      </main>
    );
  }

  if (success) {
    return (
      <main className="mx-auto max-w-md px-4 py-12" dir={isRTL ? "rtl" : "ltr"}>
        <div className={`${dash.card} ${dash.cardBody} space-y-5 text-center`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
            ✓
          </div>
          <div>
            <h1 className={dash.pageTitle}>{t("lcFormSuccessTitle")}</h1>
            <p className={dash.pageSubtitle}>{successMessage || t("tradeProviderRegisterSuccess")}</p>
            {successNotice ? (
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-start text-xs leading-6 text-slate-600">
                {successNotice}
              </p>
            ) : null}
            {awaitsApproval ? (
              <p className="mt-2 text-xs text-amber-800">پس از تأیید مدیریت، صفحه برای عموم فعال می‌شود.</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard/service-provider-profile" className={`${dash.btnPrimary} min-h-11`}>
              صفحه خدمات من
            </Link>
            <Link
              href={`/${encodeURIComponent(existingSlug || form.profileSlug)}`}
              className={`${dash.btnSecondary} min-h-11`}
            >
              مشاهده صفحه عمومی
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!introAccepted) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
        <div className="mt-2">
          <ServiceProviderOnboardingIntro
            onAccept={() => setIntroAccepted(true)}
            showBrowseLink={false}
            showDeclineButton
            declineHref="/dashboard"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6" dir={isRTL ? "rtl" : "ltr"}>
      <header className="mb-6">
        <p className="text-xs font-medium text-emerald-700">ثبت‌نام خدمات‌دهنده</p>
        <h1 className={dash.pageTitle}>صفحه خدمات خود را بسازید</h1>
        <p className={dash.pageSubtitle}>خدمات، آدرس صفحه، موقعیت و ساعات کاری — ساده و قابل ویرایش بعدی</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <SectionCard step="1" title="نام و آدرس صفحه" description="همان آدرس برای فروشگاه و خدمات استفاده می‌شود">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">نام نمایشی *</span>
            <input
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              required
              className={`${dash.input} mt-1.5`}
              placeholder="نام شما یا برند خدمات"
            />
          </label>
          <div className="mt-4">
            {slugLoading ? (
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ) : hasSlug ? (
              <ExistingPublicPageNotice slug={existingSlug} />
            ) : (
              <PublicPageSlugField
                value={form.profileSlug}
                onChange={(v) => setForm((prev) => ({ ...prev, profileSlug: v }))}
                checkUrl={API_ENDPOINTS.tradeServiceProviders.slugAvailable}
                context="services-create"
                previewPrefix="zareoon.ir/"
              />
            )}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">تلفن *</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                dir="ltr"
                className={`${dash.input} mt-1.5 text-start`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">ایمیل</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                dir="ltr"
                className={`${dash.input} mt-1.5 text-start`}
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard
          step="2"
          title="خدماتی که ارائه می‌دهید"
          description="حداقل یک خدمت را انتخاب کنید"
        >
          <TradeProviderServicePicker
            categories={categories}
            selected={selectedServices}
            onChange={setSelectedServices}
            initialExpandedCategoryId={prefillCategory}
            vipCategories={vipCategories}
            language={language}
            t={t}
            isRTL={isRTL}
          />
        </SectionCard>

        <SectionCard step="3" title="موقعیت روی نقشه">
          <LocationPickerMap
            latitude={form.latitude}
            longitude={form.longitude}
            addressLabel={form.addressLabel}
            onChange={(loc) =>
              setForm((f) => ({
                ...f,
                latitude: loc.latitude,
                longitude: loc.longitude,
                addressLabel: loc.addressLabel,
              }))
            }
          />
        </SectionCard>

        <SectionCard step="4" title="ساعات کاری">
          <BusinessHoursEditor
            value={form.businessHours}
            onChange={(businessHours) => setForm((f) => ({ ...f, businessHours }))}
          />
        </SectionCard>

        <SectionCard step="5" title="توضیح کوتاه (اختیاری)">
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className={`${dash.input}`}
            placeholder="درباره خدمات خود بنویسید"
          />
        </SectionCard>

        <button
          type="submit"
          disabled={loading || auth?.loading || slugLoading}
          className={`${dash.btnPrimary} w-full min-h-11`}
        >
          {loading ? "در حال ثبت…" : "ثبت صفحه خدمات"}
        </button>
      </form>
    </main>
  );
}
