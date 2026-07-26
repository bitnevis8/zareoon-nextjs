"use client";

import { useState } from "react";
import { authFetch, setActiveWorkspaceId } from "@/app/utils/authHeaders";
import { API_ENDPOINTS } from "@/app/config/api";
import BusinessHoursEditor from "@/app/components/ui/BusinessHoursEditor";
import LocationPickerMap from "@/app/components/ui/LocationPickerMap";
import { DEFAULT_BUSINESS_HOURS } from "@/app/utils/businessHours";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { useWorkspace } from "@/app/context/WorkspaceContext";

const STEPS = [
  { id: 1, title: "حقیقی / حقوقی" },
  { id: 2, title: "نام و آدرس" },
  { id: 3, title: "نوع فعالیت" },
  { id: 4, title: "ساعات کاری" },
  { id: 5, title: "موقعیت نقشه" },
];

export default function WorkspaceCreateWizard({ onCreated, embedded = false }) {
  const { refresh: refreshWorkspaceCtx } = useWorkspace();
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [entityType, setEntityType] = useState(""); // individual | company
  const [name, setName] = useState("");
  const [addressText, setAddressText] = useState("");
  const [activitySeller, setActivitySeller] = useState(true);
  const [activityServices, setActivityServices] = useState(false);
  const [includeHours, setIncludeHours] = useState(false);
  const [businessHours, setBusinessHours] = useState(DEFAULT_BUSINESS_HOURS);
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    addressLabel: "",
  });

  function validateStep(current) {
    if (current === 1 && entityType !== "individual" && entityType !== "company") {
      setError("مشخص کنید کسب‌وکار حقیقی است یا حقوقی");
      return false;
    }
    if (current === 2 && !name.trim()) {
      setError("نام کسب‌وکار را وارد کنید");
      return false;
    }
    if (current === 3 && !activitySeller && !activityServices) {
      setError("حداقل فروشنده یا خدمات‌دهنده را انتخاب کنید");
      return false;
    }
    setError("");
    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(5, s + 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      if (entityType !== "individual" && entityType !== "company") setStep(1);
      else if (!name.trim()) setStep(2);
      else setStep(3);
      return;
    }
    setCreating(true);
    setError("");
    try {
      const body = {
        name: name.trim(),
        displayName: name.trim(),
        entityType,
        addressText: addressText.trim() || undefined,
        activitySeller,
        activityServices,
      };
      if (includeHours) body.businessHours = businessHours;
      if (location.latitude != null && location.longitude != null) {
        body.latitude = location.latitude;
        body.longitude = location.longitude;
        body.addressLabel = location.addressLabel || undefined;
      }

      const res = await authFetch(API_ENDPOINTS.workspace.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(json.message || "خطا در ایجاد کسب‌وکار");
        return;
      }
      if (json.data?.workspace?.id) setActiveWorkspaceId(json.data.workspace.id);
      await refreshWorkspaceCtx();
      setEntityType("");
      setName("");
      setAddressText("");
      setActivitySeller(true);
      setActivityServices(false);
      setIncludeHours(false);
      setBusinessHours(DEFAULT_BUSINESS_HOURS);
      setLocation({ latitude: null, longitude: null, addressLabel: "" });
      setStep(1);
      onCreated?.(json);
    } catch (e) {
      setError(
        e?.message === "Failed to fetch"
          ? "ارتباط با سرور برقرار نشد — مطمئن شوید API روی پورت ۳۰۰۰ روشن است"
          : e.message || "خطا"
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <section
      className={embedded ? "p-4 sm:p-5" : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"}
      dir="rtl"
    >
      {!embedded ? (
        <>
          <h2 className="text-sm font-bold text-slate-900">ایجاد کسب‌وکار جدید</h2>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            ابتدا مشخص کنید کسب‌وکار حقیقی است یا حقوقی؛ مدارک احراز بعدی بر همین اساس پله‌ای گرفته می‌شود.
          </p>
        </>
      ) : (
        <p className="mb-1 text-sm leading-6 text-slate-500">
          نوع شخصیت (حقیقی/حقوقی) را انتخاب کنید؛ سپس نام و نوع فعالیت را مشخص کنید.
        </p>
      )}

      <div className={`${embedded ? "mt-3" : "mt-4"} grid grid-cols-5 gap-1 sm:gap-1.5`}>
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`rounded-lg border px-0.5 py-2 text-center text-[9px] font-semibold leading-tight sm:px-1 sm:py-2.5 sm:text-[10px] ${
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

      <div className="mt-5 space-y-4">
        {step === 1 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">این کسب‌وکار را به‌عنوان چه شخصیتی ایجاد می‌کنید؟ *</p>
            <button
              type="button"
              onClick={() => {
                setEntityType("individual");
                setError("");
              }}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-start transition ${
                entityType === "individual"
                  ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  entityType === "individual" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                }`}
              >
                {entityType === "individual" ? "✓" : null}
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-900">شخص حقیقی</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  فروشگاه یا فعالیت شخصی؛ احراز با کارت ملی صاحب کسب‌وکار و مجوز صنفی (بدون روزنامه رسمی شرکت).
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEntityType("company");
                setError("");
              }}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-start transition ${
                entityType === "company"
                  ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  entityType === "company" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                }`}
              >
                {entityType === "company" ? "✓" : null}
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-900">شخص حقوقی</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  شرکت یا مؤسسه؛ احراز با شناسه ملی / شماره ثبت، روزنامه رسمی، کد اقتصادی و مدارک شرکت.
                </span>
              </span>
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              نوع شخصیت:{" "}
              <span className="font-bold text-slate-900">
                {entityType === "individual" ? "حقیقی" : "حقوقی"}
              </span>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              {entityType === "company" ? "نام قانونی شرکت *" : "نام کسب‌وکار / فروشگاه *"}
              <input
                className={`${dash.input} mt-1.5`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                placeholder={entityType === "company" ? "مثلاً شرکت بازرگانی سبز جنوب" : "مثلاً باغ سبز جنوب"}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              آدرس (اختیاری)
              <textarea
                className={`${dash.input} mt-1.5 min-h-[88px]`}
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="شهر، خیابان، پلاک…"
              />
            </label>
          </>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">کسب‌وکار شما چه کاری انجام می‌دهد؟</p>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50">
              <input
                type="checkbox"
                className="mt-1"
                checked={activitySeller}
                onChange={(e) => setActivitySeller(e.target.checked)}
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">فروشنده</span>
                <span className="mt-0.5 block text-xs text-slate-500">فروش محصولات و مدیریت آن‌ها</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50">
              <input
                type="checkbox"
                className="mt-1"
                checked={activityServices}
                onChange={(e) => setActivityServices(e.target.checked)}
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">خدمات‌دهنده</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  ارائه خدمات تجاری و پاسخ به درخواست‌ها
                </span>
              </span>
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeHours}
                onChange={(e) => setIncludeHours(e.target.checked)}
              />
              ساعات کاری را الان مشخص می‌کنم (اختیاری)
            </label>
            {includeHours ? (
              <BusinessHoursEditor value={businessHours} onChange={setBusinessHours} />
            ) : (
              <p className="text-xs text-slate-500">بعداً هم از تنظیمات کسب‌وکار قابل تکمیل است.</p>
            )}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">موقعیت روی نقشه (اختیاری)</p>
            <LocationPickerMap
              latitude={location.latitude}
              longitude={location.longitude}
              addressLabel={location.addressLabel}
              onChange={(loc) =>
                setLocation({
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                  addressLabel: loc.addressLabel || "",
                })
              }
              optional
            />
          </div>
        ) : null}

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1 || creating}
            className={`${dash.btnSecondary} disabled:opacity-40`}
          >
            قبلی
          </button>
          {step < 5 ? (
            <button type="button" onClick={goNext} className={dash.btnPrimary}>
              بعدی
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={creating} className={dash.btnPrimary}>
              {creating ? "در حال ایجاد…" : "ایجاد کسب‌وکار"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
