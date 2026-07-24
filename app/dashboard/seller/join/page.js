"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";
import { isSeller } from "@/app/utils/roles";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";
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
  { id: 2, title: "تماس" },
  { id: 3, title: "ساعات کاری" },
  { id: 4, title: "موقعیت" },
];

const TOTAL_STEPS = 4;

export default function SellerJoinPage() {
  const { t, isRTL } = useLanguage();
  const auth = useAuth();
  const { setPersona } = useDashboardPersona();
  const { slug: existingSlug, loading: slugLoading, hasSlug } = useExistingPublicSlug();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shopName, setShopName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [mobile, setMobile] = useState(auth?.user?.mobile || "");
  const [landline, setLandline] = useState("");
  const [email, setEmail] = useState(auth?.user?.email || "");
  const [includeHours, setIncludeHours] = useState(false);
  const [businessHours, setBusinessHours] = useState(DEFAULT_BUSINESS_HOURS);
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    addressLabel: "",
  });
  const [done, setDone] = useState(null);

  const alreadySeller = isSeller(auth?.user);

  const join = async () => {
    setError("");
    if (!hasSlug && !shopName.trim()) {
      setError("آدرس صفحه را وارد کنید");
      setStep(1);
      return;
    }
    if (!displayName.trim()) {
      setError("نام نمایشی فروشگاه را وارد کنید");
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      showToast.info("ایجاد فروشگاه به منزله پذیرش قوانین فروشندگان زارعون است.");

      const body = {
        displayName: displayName.trim(),
        headline: headline.trim() || undefined,
        publicPhone: mobile.trim() || undefined,
        publicLandline: landline.trim() || undefined,
        publicEmail: email.trim() || undefined,
      };
      if (includeHours) body.businessHours = businessHours;
      if (location.latitude != null && location.longitude != null) {
        body.latitude = location.latitude;
        body.longitude = location.longitude;
        body.addressLabel = location.addressLabel || undefined;
      }
      if (!hasSlug) body.profileSlug = shopName.trim();

      const res = await authFetch(API_ENDPOINTS.auth.becomeSeller, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || t("sellerJoinError"));
        return;
      }
      if (data.data) auth.updateUser(data.data);
      else {
        const me = await authFetch(API_ENDPOINTS.auth.me, { credentials: "include" });
        const meData = await me.json();
        if (meData.success && meData.data) auth.updateUser(meData.data);
      }
      setPersona(DASHBOARD_PERSONAS.SELLER);
      setDone({
        message: data.message,
        slug: data.data?.profileSlug,
        awaitsApproval: !!data.data?.awaitsApproval,
      });
    } catch (e) {
      console.error(e);
      setError(t("sellerJoinError"));
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (step === 1) {
      if (!hasSlug && !shopName.trim()) {
        setError("آدرس صفحه را وارد کنید");
        return;
      }
      if (!displayName.trim()) {
        setError("نام نمایشی فروشگاه را وارد کنید");
        return;
      }
    }
    setError("");
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  if (done) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10 sm:max-w-xl sm:px-6 md:max-w-2xl md:py-14" dir={isRTL ? "rtl" : "ltr"}>
        <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-5 py-8 text-center text-white sm:px-8 sm:py-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
              ✓
            </div>
            <h1 className="text-xl font-bold sm:text-2xl">
              {done.awaitsApproval ? "درخواست ثبت شد" : "فروشگاه آماده است"}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-50/95">{done.message}</p>
          </div>
          <div className="grid gap-2.5 p-4 sm:grid-cols-3 sm:gap-3 sm:p-6">
            {!done.awaitsApproval ? (
              <Link
                href="/dashboard/supplier/inventory/create?scope=own"
                className={`${dash.btnPrimary} min-h-11 w-full`}
              >
                افزودن محصول
              </Link>
            ) : null}
            {done.slug ? (
              <Link
                href={`/${encodeURIComponent(done.slug)}`}
                className={`${dash.btnSecondary} min-h-11 w-full`}
              >
                مشاهده صفحه
              </Link>
            ) : null}
            <Link href="/dashboard/supplier-profile" className={`${dash.btnSecondary} min-h-11 w-full`}>
              تنظیمات فروشگاه من
            </Link>
            <Link
              href="/trade-services/register?start=1"
              className={`${dash.btnSecondary} min-h-11 w-full sm:col-span-3`}
            >
              افزودن خدمات (اختیاری)
            </Link>
          </div>
          <p className="border-t border-slate-100 px-4 py-3 text-center text-[11px] leading-5 text-slate-500 sm:px-6">
            همین صفحه ویترین شماست؛ بعداً می‌توانید از همان آدرس، خدمات بازرگانی هم اضافه کنید.
          </p>
        </div>
      </main>
    );
  }

  if (alreadySeller) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10 sm:max-w-xl sm:px-6 md:max-w-2xl md:py-14" dir={isRTL ? "rtl" : "ltr"}>
        <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-5 py-8 text-center text-white sm:px-8 sm:py-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
              ✓
            </div>
            <h1 className="text-xl font-bold sm:text-2xl">فروشگاه شما آماده است</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-50/95">
              می‌توانید محصول اضافه کنید، خدمات هم عرضه کنید یا تنظیمات را ویرایش کنید.
            </p>
          </div>
          <div className="grid gap-2.5 p-4 sm:grid-cols-2 sm:gap-3 sm:p-6">
            <Link
              href="/dashboard/supplier/inventory/create?scope=own"
              className={`${dash.btnPrimary} min-h-11 w-full`}
            >
              افزودن محصول
            </Link>
            <Link href="/dashboard/supplier-profile" className={`${dash.btnSecondary} min-h-11 w-full`}>
              تنظیمات فروشگاه من
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6 sm:max-w-xl sm:px-6 sm:py-8 md:max-w-2xl lg:max-w-3xl lg:py-10" dir={isRTL ? "rtl" : "ltr"}>
      <header className="mb-5 sm:mb-6">
        <p className="text-xs font-medium text-emerald-700">ایجاد فروشگاه</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          صفحه تجاری فروشگاه خود را بسازید
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          چهار مرحله ساده؛ تماس، ساعات کاری و موقعیت اختیاری‌اند و بعداً هم قابل تکمیل هستند.
        </p>
      </header>

      <DedicatedPageTip context="shop-create" className="mb-5" />

      <div className="mb-5 grid grid-cols-4 gap-1.5 sm:gap-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`rounded-lg border px-1 py-2.5 text-center text-[10px] font-semibold sm:py-3 sm:text-xs ${
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
              نام نمایشی فروشگاه *
              <input
                className={`${dash.input} mt-1.5`}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={120}
                placeholder="مثلاً باغ سبز جنوب"
              />
              <span className="mt-1.5 block text-[11px] leading-5 text-slate-500">
                این نام روی کارت‌های فروشگاه‌ها و صفحه عمومی شما نشان داده می‌شود — نه اسم و فامیل شخصی شما.
              </span>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              توضیح کوتاه (اختیاری)
              <input
                className={`${dash.input} mt-1.5`}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={200}
                placeholder="مثلاً تأمین عمده خرما و خشکبار صادراتی"
              />
              <span className="mt-1.5 block text-[11px] leading-5 text-slate-500">
                یک جمله کوتاه زیر نام فروشگاه در فهرست‌ها و کارت‌ها نمایش داده می‌شود.
              </span>
            </label>
            {slugLoading ? (
              <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ) : hasSlug ? (
              <ExistingPublicPageNotice slug={existingSlug} />
            ) : (
              <PublicPageSlugField
                value={shopName}
                onChange={setShopName}
                checkUrl={API_ENDPOINTS.tamin.slugAvailable}
                context="shop-create"
                previewPrefix="zareoon.ir/"
              />
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">همه فیلدهای این مرحله اختیاری‌اند.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700 sm:col-span-1">
                شماره موبایل
                <input
                  className={`${dash.input} mt-1.5`}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="09xxxxxxxxx"
                  dir="ltr"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                شماره تلفن فروشگاه
                <input
                  className={`${dash.input} mt-1.5`}
                  value={landline}
                  onChange={(e) => setLandline(e.target.value)}
                  placeholder="021xxxxxxx"
                  dir="ltr"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                ایمیل فروشگاه
                <input
                  type="email"
                  className={`${dash.input} mt-1.5`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shop@example.com"
                  dir="ltr"
                />
              </label>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">اختیاری — می‌توانید بعداً در تنظیمات تکمیل کنید.</p>
            <BusinessHoursEditor
              value={businessHours}
              onChange={(h) => {
                setIncludeHours(true);
                setBusinessHours(h);
              }}
            />
          </div>
        ) : null}

        {step === 4 ? (
          <LocationPickerMap
            latitude={location.latitude}
            longitude={location.longitude}
            addressLabel={location.addressLabel}
            onChange={setLocation}
            optional
          />
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-stretch gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
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
                onClick={join}
                disabled={loading}
                className={`${dash.btnPrimary} h-11 min-h-11 flex-1`}
              >
                {loading ? "در حال ایجاد…" : "ایجاد فروشگاه"}
              </button>
            )}
          </div>
          {step === TOTAL_STEPS ? (
            <p className="text-center text-[11px] leading-5 text-slate-500">
              با زدن «ایجاد فروشگاه»،{" "}
              <Link href="/seller-terms" className="font-semibold text-emerald-700 hover:underline">
                قوانین فروشندگان
              </Link>{" "}
              زارعون را می‌پذیرید.
            </p>
          ) : null}
        </div>

        {step === 2 || step === 3 || step === 4 ? (
          <button
            type="button"
            onClick={() => {
              if (step === TOTAL_STEPS) join();
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
