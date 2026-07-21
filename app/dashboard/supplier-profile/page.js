"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { authFetch } from "@/app/utils/authHeaders";
import { isSeller } from "@/app/utils/roles";
import { useAuth } from "@/app/context/AuthContext";
import { providerPublicPath } from "@/app/utils/providerPublicPath";
import PublicPageSlugField from "@/app/components/ui/PublicPageSlugField";
import BusinessHoursEditor from "@/app/components/ui/BusinessHoursEditor";
import LocationPickerMap from "@/app/components/ui/LocationPickerMap";
import ShopContactFields from "@/app/components/ui/ShopContactFields";
import { DEFAULT_BUSINESS_HOURS, mergeBusinessHours } from "@/app/utils/businessHours";
import { normalizeShopContacts, serializeShopContacts } from "@/app/utils/shopContacts";
import { API_ENDPOINTS } from "@/app/config/api";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { showToast } from "@/app/utils/toast";

function IconLink({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.122a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.5 8.25"
      />
    </svg>
  );
}

function IconMap({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

function IconClock({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconContact({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function SectionCard({ icon, title, subtitle, children, className = "" }) {
  return (
    <section className={`${dash.card} overflow-hidden ${className}`}>
      <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs leading-5 text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function SupplierAccountEditor() {
  const t = useTranslations("product");
  const auth = useAuth();
  const [canHidePublicPage, setCanHidePublicPage] = useState(false);
  const [form, setForm] = useState({
    profileSlug: "",
    headline: "",
    bio: "",
    shopContacts: normalizeShopContacts(null),
    isProfilePublic: true,
    shopStatus: "ACTIVE",
    businessHours: DEFAULT_BUSINESS_HOURS,
    latitude: null,
    longitude: null,
    addressLabel: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    authFetch(API_ENDPOINTS.tamin.me)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) {
          const d = j.data;
          setCanHidePublicPage(!!d.canHidePublicPage);
          setForm({
            profileSlug: d.profileSlug || "",
            headline: d.headline || "",
            bio: d.bio || "",
            shopContacts: normalizeShopContacts(d.shopContacts, {
              publicPhone: d.publicPhone,
              publicLandline: d.publicLandline,
              publicEmail: d.publicEmail,
            }),
            isProfilePublic: d.isPublic !== false,
            shopStatus: d.shopStatus || "ACTIVE",
            businessHours: mergeBusinessHours(d.businessHours),
            latitude: d.latitude ?? null,
            longitude: d.longitude ?? null,
            addressLabel: d.addressLabel || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg("");
    const payload = {
      profileSlug: form.profileSlug,
      headline: form.headline,
      bio: form.bio,
      shopContacts: serializeShopContacts(form.shopContacts),
      businessHours: form.businessHours,
      latitude: form.latitude,
      longitude: form.longitude,
      addressLabel: form.addressLabel,
    };
    if (canHidePublicPage) payload.isProfilePublic = form.isProfilePublic;

    const res = await authFetch(API_ENDPOINTS.tamin.me, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (j.success) {
      setForm((f) => ({
        ...f,
        profileSlug: j.data.profileSlug || f.profileSlug,
        latitude: j.data.latitude ?? f.latitude,
        longitude: j.data.longitude ?? f.longitude,
        addressLabel: j.data.addressLabel || f.addressLabel,
        shopContacts: normalizeShopContacts(j.data.shopContacts, {
          publicPhone: j.data.publicPhone,
          publicLandline: j.data.publicLandline,
          publicEmail: j.data.publicEmail,
        }),
      }));
      if (auth?.updateUser && j.data?.profileSlug) {
        auth.updateUser({
          ...auth.user,
          profileSlug: j.data.profileSlug,
          accountNav: {
            ...(auth.user?.accountNav || {}),
            profileSlug: j.data.profileSlug,
          },
        });
      }
      showToast.success(j.message || t("supplierProfile.saveSuccess"));
    } else {
      showToast.error(j.message || "خطا در ذخیره");
    }
    setMsg(j.success ? (j.message || t("supplierProfile.saveSuccess")) : j.message || "");
    if (j.slugChange) {
      setMsg(j.message || "درخواست تغییر آدرس ثبت شد");
    }
    setSaving(false);
  };

  if (!isSeller(auth?.user)) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-slate-700">{t("supplierProfile.suppliersOnly")}</p>
        <Link href="/dashboard/seller/join" className={`${dash.btnPrimary} mt-4 min-h-11`}>
          ایجاد فروشگاه
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const publicUrl = form.profileSlug ? providerPublicPath(form.profileSlug) : null;

  return (
    <div className="mx-auto max-w-5xl px-3 pb-28 pt-5 sm:px-5 sm:pt-8 lg:px-6">
      {/* Sticky mobile save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:hidden">
        <button type="button" onClick={save} disabled={saving} className={`${dash.btnPrimary} min-h-11 w-full`}>
          {saving ? "در حال ذخیره…" : "ذخیره تنظیمات"}
        </button>
      </div>

      <header className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-emerald-700">فروشگاه من</p>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">تنظیمات فروشگاه من</h1>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
            آدرس صفحه، راه‌های ارتباطی، موقعیت و ساعات کاری را اینجا مدیریت کنید.
          </p>
          {publicUrl ? (
            <Link
              href={publicUrl}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
              dir="ltr"
            >
              <IconLink className="h-4 w-4" />
              zareoon.ir/{form.profileSlug}
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className={`${dash.btnPrimary} hidden min-h-11 min-w-[140px] md:inline-flex`}
        >
          {saving ? "در حال ذخیره…" : "ذخیره تنظیمات"}
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="space-y-4 lg:col-span-7">
          <SectionCard
            icon={<IconLink />}
            title="آدرس و معرفی"
            subtitle="آدرس اختصاصی صفحه و متن معرفی فروشگاه"
          >
            <PublicPageSlugField
              value={form.profileSlug}
              onChange={(v) => setForm({ ...form, profileSlug: v })}
              checkUrl={API_ENDPOINTS.tamin.slugAvailable}
              context="shop-edit"
              previewPrefix="zareoon.ir/"
            />
            <label className="block text-sm font-medium text-slate-700">
              معرفی کوتاه
              <input
                className={`${dash.input} mt-1.5`}
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                maxLength={200}
                placeholder="یک جمله درباره فروشگاه"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              درباره فروشگاه
              <textarea
                className={`${dash.input} mt-1.5`}
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="توضیح کوتاه برای بازدیدکنندگان"
              />
            </label>
            {canHidePublicPage ? (
              <label className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={form.isProfilePublic}
                  onChange={(e) => setForm({ ...form, isProfilePublic: e.target.checked })}
                />
                <span className="font-semibold text-slate-800">صفحه عمومی فعال باشد</span>
              </label>
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">صفحه شما همیشه عمومی است.</p>
            )}
          </SectionCard>

          <SectionCard
            icon={<IconContact />}
            title="راه‌های ارتباطی"
            subtitle="تا ۳ شماره تلفن، چند ایمیل و پیام‌رسان‌های فعال"
          >
            <ShopContactFields
              value={form.shopContacts}
              onChange={(shopContacts) => setForm((f) => ({ ...f, shopContacts }))}
              inputClassName={dash.input}
            />
          </SectionCard>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <SectionCard icon={<IconMap />} title="موقعیت روی نقشه" subtitle="جستجو یا کلیک روی نقشه">
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
          </SectionCard>

          <SectionCard icon={<IconClock />} title="ساعات کاری" subtitle="اختیاری — برای نمایش در صفحه عمومی">
            <BusinessHoursEditor
              value={form.businessHours}
              onChange={(businessHours) => setForm((f) => ({ ...f, businessHours }))}
            />
          </SectionCard>

          <SectionCard
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            }
            title="بستن فروشگاه"
            subtitle="صفحه بلافاصله حذف نمی‌شود"
            className="border-rose-100"
          >
            <p className="text-xs leading-6 text-slate-500">
              با درخواست بستن، فروشگاه مدتی با پیام مناسب نمایش داده می‌شود و سفارش جدید قبول نمی‌کند.
            </p>
            {form.shopStatus === "PENDING_DELETION" ? (
              <button
                type="button"
                className={dash.btnPrimary}
                onClick={async () => {
                  const res = await authFetch(API_ENDPOINTS.tamin.cancelDeletion, { method: "POST" });
                  const j = await res.json();
                  setMsg(j.message || "");
                  if (j.success) {
                    setForm((f) => ({ ...f, shopStatus: "ACTIVE" }));
                    showToast.success(j.message || "فروشگاه دوباره فعال شد");
                  }
                }}
              >
                لغو بستن و فعال‌سازی دوباره
              </button>
            ) : (
              <button
                type="button"
                className={`${dash.btnSecondary} text-rose-700`}
                onClick={async () => {
                  if (!window.confirm("درخواست بستن فروشگاه ثبت شود؟")) return;
                  const res = await authFetch(API_ENDPOINTS.tamin.requestDeletion, { method: "POST" });
                  const j = await res.json();
                  setMsg(j.message || "");
                  if (j.success) {
                    setForm((f) => ({ ...f, shopStatus: "PENDING_DELETION" }));
                    showToast.warning(j.message || "درخواست بستن ثبت شد");
                  }
                }}
              >
                درخواست بستن فروشگاه
              </button>
            )}
          </SectionCard>
        </div>
      </div>

      {msg ? (
        <p className={`mt-4 text-sm font-medium ${msg.includes("خطا") ? "text-red-600" : "text-emerald-700"}`}>
          {msg}
        </p>
      ) : null}
    </div>
  );
}

export default function SupplierProfilePage() {
  return (
    <ProtectedRoute>
      <SupplierAccountEditor />
    </ProtectedRoute>
  );
}
