"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";
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
import DedicatedPageTip from "@/app/components/ui/DedicatedPageTip";
import { useExistingPublicSlug } from "@/app/hooks/useExistingPublicSlug";
import BusinessHoursEditor from "@/app/components/ui/BusinessHoursEditor";
import LocationPickerMap from "@/app/components/ui/LocationPickerMap";
import { DEFAULT_BUSINESS_HOURS } from "@/app/utils/businessHours";
import { dash } from "@/app/components/dashboard/dashboardTheme";

const STEPS = [
  { id: 1, title: "آدرس" },
  { id: 2, title: "خدمات" },
  { id: 3, title: "تماس" },
  { id: 4, title: "ساعات کاری" },
  { id: 5, title: "موقعیت" },
];

const TOTAL_STEPS = 5;

const initialForm = {
  displayName: "",
  profileSlug: "",
  phone: "",
  email: "",
  notes: "",
  businessHours: DEFAULT_BUSINESS_HOURS,
  latitude: null,
  longitude: null,
  addressLabel: "",
};

export default function TradeProviderRegisterForm() {
  const { t, isRTL, language } = useLanguage();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPersona } = useDashboardPersona();
  const prefillCategory = searchParams.get("category") || "";
  const startForm = searchParams.get("start") === "1";
  const { slug: existingSlug, loading: slugLoading, hasSlug } = useExistingPublicSlug();

  const categories = useMemo(() => getL1Categories(language), [language]);
  const [introAccepted, setIntroAccepted] = useState(startForm);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [selectedServices, setSelectedServices] = useState([]);
  const [vipCategories, setVipCategories] = useState({});
  const [includeHours, setIncludeHours] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

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

  const validateStep = (current) => {
    if (current === 1) {
      if (!form.displayName.trim() && !profileFullName) {
        setError("نام نمایشی را وارد کنید");
        return false;
      }
      if (!hasSlug && !form.profileSlug.trim()) {
        setError("نام صفحه را وارد کنید");
        return false;
      }
    }
    if (current === 2) {
      if (!selectedServices.length) {
        setError(t("tradeProviderNoServicesSelected"));
        return false;
      }
      const blockedVip = selectedServices.find(
        (s) => vipCategories[s.categoryId]?.enabled || isPlatformExclusiveCategory(s.categoryId)
      );
      if (blockedVip) {
        setError(
          isPlatformExclusiveCategory(blockedVip.categoryId)
            ? t("packagingAdFooter")
            : resolveVipCategoryMessage(vipCategories, blockedVip.categoryId, language, t) ||
                t("tradeProviderVipMessage")
        );
        return false;
      }
    }
    if (current === 3 && !form.phone.trim()) {
      setError("شماره تماس را وارد کنید");
      return false;
    }
    setError("");
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const submit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      if (!form.displayName.trim() && !profileFullName) setStep(1);
      else if (!hasSlug && !form.profileSlug.trim()) setStep(1);
      else if (!selectedServices.length) setStep(2);
      else if (!form.phone.trim()) setStep(3);
      return;
    }

    const displayName = form.displayName.trim() || profileFullName;
    const pageSlug = hasSlug ? existingSlug : form.profileSlug.trim();

    setLoading(true);
    setError("");
    try {
      const payload = {
        entityType: "individual",
        displayName,
        contactName: profileFullName || displayName,
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
        latitude: form.latitude,
        longitude: form.longitude,
        addressLabel: form.addressLabel,
      };
      if (includeHours) payload.businessHours = form.businessHours;

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
      setPersona(DASHBOARD_PERSONAS.SERVICES);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("trade-provider-mine-updated"));
      }
      setDone({
        message: data.message || t("tradeProviderRegisterSuccess"),
        notice: data.createNotice || "",
        slug: pageSlug,
        awaitsApproval: !!data.awaitsApproval,
      });
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

  if (done) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10 sm:max-w-xl sm:px-6 md:max-w-2xl md:py-14" dir={isRTL ? "rtl" : "ltr"}>
        <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-5 py-8 text-center text-white sm:px-8 sm:py-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
              ✓
            </div>
            <h1 className="text-xl font-bold sm:text-2xl">
              {done.awaitsApproval ? "درخواست ثبت شد" : "صفحه خدمات آماده است"}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-50/95">{done.message}</p>
            {done.notice ? (
              <p className="mx-auto mt-3 max-w-md rounded-lg bg-black/15 px-3 py-2 text-xs leading-6 text-emerald-50">
                {done.notice}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2.5 p-4 sm:grid-cols-2 sm:gap-3 sm:p-6">
            <Link href="/dashboard/service-provider-profile" className={`${dash.btnPrimary} min-h-11 w-full`}>
              تنظیمات صفحه خدمات
            </Link>
            {done.slug ? (
              <Link
                href={`/${encodeURIComponent(done.slug)}`}
                className={`${dash.btnSecondary} min-h-11 w-full`}
              >
                مشاهده صفحه
              </Link>
            ) : null}
            <Link
              href="/dashboard/supplier/inventory/create?scope=own"
              className={`${dash.btnSecondary} min-h-11 w-full sm:col-span-2`}
            >
              افزودن محصول (اختیاری)
            </Link>
          </div>
          <p className="border-t border-slate-100 px-4 py-3 text-center text-[11px] leading-5 text-slate-500 sm:px-6">
            همین صفحه ویترین شماست؛ بعداً می‌توانید از همان آدرس، محصول هم برای فروش اضافه کنید.
          </p>
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
    <main
      className="mx-auto max-w-lg px-4 py-6 sm:max-w-xl sm:px-6 sm:py-8 md:max-w-2xl lg:max-w-3xl lg:py-10"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <header className="mb-5 sm:mb-6">
        <p className="text-xs font-medium text-emerald-700">ایجاد خدمات</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          صفحه اختصاصی خدمات خود را بسازید
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          پنج مرحله — مثل ایجاد فروشگاه؛ ساعات کاری و موقعیت اختیاری‌اند و بعداً هم قابل تکمیل هستند.
        </p>
      </header>

      <DedicatedPageTip context="services-create" className="mb-5" />

      <div className="mb-5 grid grid-cols-5 gap-1 sm:gap-1.5">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`rounded-lg border px-0.5 py-2.5 text-center text-[9px] font-semibold sm:px-1 sm:py-3 sm:text-[10px] md:text-xs ${
              step === s.id
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : step > s.id
                  ? "border-emerald-200 bg-white text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <span className="block sm:inline">{s.id}.</span> {s.title}
          </div>
        ))}
      </div>

      <div className={`${dash.card} space-y-5 p-4 sm:p-6 md:p-7`}>
        {step === 1 ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              نام نمایشی *
              <input
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                className={`${dash.input} mt-1.5`}
                maxLength={120}
                placeholder="مثلاً خدمات صادرات پارس"
              />
              <span className="mt-1.5 block text-[11px] leading-5 text-slate-500">
                این نام روی کارت‌های خدمات و صفحه عمومی شما نشان داده می‌شود — نه لزوماً اسم و فامیل شخصی.
              </span>
            </label>
            {slugLoading ? (
              <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
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
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">حداقل یک خدمت را انتخاب کنید.</p>
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
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">شماره تماس برای ارتباط مشتریان لازم است؛ ایمیل اختیاری است.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                شماره موبایل *
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`${dash.input} mt-1.5 text-start`}
                  dir="ltr"
                  placeholder="09xxxxxxxxx"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                ایمیل
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`${dash.input} mt-1.5 text-start`}
                  dir="ltr"
                  placeholder="service@example.com"
                />
              </label>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">اختیاری — می‌توانید بعداً در تنظیمات تکمیل کنید.</p>
            <BusinessHoursEditor
              value={form.businessHours}
              onChange={(h) => {
                setIncludeHours(true);
                setForm((f) => ({ ...f, businessHours: h }));
              }}
            />
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-4">
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
              optional
            />
            <label className="block text-sm font-medium text-slate-700">
              توضیح کوتاه (اختیاری)
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className={`${dash.input} mt-1.5`}
                placeholder="درباره خدمات خود بنویسید"
              />
            </label>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-stretch gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep((s) => s - 1);
                }}
                className={`${dash.btnSecondary} h-11 min-h-11 shrink-0 px-5 sm:px-6`}
              >
                قبلی
              </button>
            ) : null}
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={goNext}
                disabled={slugLoading}
                className={`${dash.btnPrimary} h-11 min-h-11 flex-1`}
              >
                بعدی
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className={`${dash.btnPrimary} h-11 min-h-11 flex-1`}
              >
                {loading ? "در حال ایجاد…" : "ایجاد صفحه خدمات"}
              </button>
            )}
          </div>
        </div>

        {step === 4 || step === 5 ? (
          <button
            type="button"
            onClick={() => {
              if (step === TOTAL_STEPS) submit();
              else {
                setError("");
                setStep((s) => s + 1);
              }
            }}
            className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            فعلاً رد شو
          </button>
        ) : null}
      </div>
    </main>
  );
}
