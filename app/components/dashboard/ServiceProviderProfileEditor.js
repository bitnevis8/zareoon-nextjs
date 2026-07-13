"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { getAuthHeaders } from "@/app/utils/authHeaders";
import { findCatalogService, getL1Categories } from "@/app/data/tradeServicesCatalog";
import { showToast } from "@/app/utils/toast";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import TradeProviderServicePicker from "@/app/components/TradeProviderServicePicker";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20";

const STATUS = {
  pending: { text: "در انتظار تأیید", className: "bg-amber-100 text-amber-800 ring-amber-200/80" },
  approved: { text: "منتشر شده", className: "bg-emerald-100 text-emerald-800 ring-emerald-200/80" },
  rejected: { text: "رد شده", className: "bg-rose-100 text-rose-800 ring-rose-200/80" },
};

function providerToForm(provider, profileFullName) {
  return {
    entityType: provider?.entityType === "individual" ? "individual" : "company",
    displayName: provider?.displayName || "",
    contactName: provider?.contactName || profileFullName,
    phone: provider?.phone || "",
    email: provider?.email || "",
    countriesRoutes: provider?.countriesRoutes || "",
    licenses: provider?.licenses || "",
    experienceYears: provider?.experienceYears != null ? String(provider.experienceYears) : "",
    notes: provider?.notes || "",
    servicesOffered: provider?.servicesOffered || "",
  };
}

function hydrateFormFromProvider(row, profileFullName, language) {
  const pending = row.pendingChanges;
  const source = pending && row.status === "approved" ? { ...row, ...pending } : row;
  const services = Array.isArray(source.selectedServices) ? source.selectedServices : [];
  return {
    form: providerToForm(source, profileFullName),
    selectedServices: services.map((s) => {
      const found = findCatalogService(language, s.categoryId, s.subcategoryId);
      if (found) return found;
      return {
        key: `${s.categoryId}:${s.subcategoryId}`,
        categoryId: s.categoryId,
        subcategoryId: s.subcategoryId,
        categoryTitle: s.categoryTitle || "",
        subcategoryTitle: s.subcategoryTitle || "",
      };
    }),
    documents: Array.isArray(pending?.documentUrls)
      ? pending.documentUrls
      : Array.isArray(row.documentUrls)
        ? row.documentUrls
        : [],
  };
}

function DocumentUploader({ documents, onChange }) {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      showToast.warning("فقط PDF یا تصویر مجاز است");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast.warning("حداکثر حجم فایل ۵ مگابایت است");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(API_ENDPOINTS.fileUpload.uploadUserDocument, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "خطا در آپلود");
      onChange([
        ...documents,
        {
          id: json.data.id,
          name: json.data.originalName || file.name,
          url: json.data.downloadUrl || json.data.url,
        },
      ]);
      showToast.success("مدرک آپلود شد");
    } catch (e) {
      showToast.error(e.message || "خطا در آپلود مدرک");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center transition hover:border-sky-200 hover:bg-sky-50/30">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            e.target.value = "";
          }}
        />
        <p className="text-sm font-semibold text-slate-700">{uploading ? "در حال آپلود…" : "آپلود مدرک"}</p>
        <p className="mt-1 text-xs text-slate-500">PDF یا تصویر — حداکثر ۵ مگابایت</p>
      </label>

      {documents.length > 0 ? (
        <ul className="space-y-2">
          {documents.map((doc, index) => (
            <li
              key={`${doc.id || doc.url}-${index}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
            >
              <span className="truncate text-xs font-medium text-slate-700">{doc.name}</span>
              <div className="flex shrink-0 gap-2">
                {doc.url ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-sky-700 hover:underline"
                  >
                    مشاهده
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => onChange(documents.filter((_, i) => i !== index))}
                  className="text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function InfoTile({ label, value, dir, className = "" }) {
  if (!value || value === "—") return null;
  return (
    <div className={`rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 ${className}`}>
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium leading-6 text-slate-900" dir={dir}>
        {value}
      </p>
    </div>
  );
}

function TextBlock({ label, value }) {
  if (!value?.trim()) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-slate-700">{value}</p>
    </div>
  );
}

function ProfileViewMode({
  provider,
  profileFullName,
  serviceItems,
  documents,
  hasPendingChanges,
  publicHref,
  onEdit,
}) {
  const status = STATUS[provider.status] || STATUS.pending;
  const entityLabel = provider.entityType === "individual" ? "شخص / متخصص" : "شرکت";
  const displayName =
    provider.entityType === "individual" ? profileFullName || provider.displayName : provider.displayName;

  const groupedServices = useMemo(() => {
    const groups = {};
    serviceItems.forEach((item) => {
      const key = item.categoryTitle || "سایر";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item.subcategoryTitle);
    });
    return Object.entries(groups);
  }, [serviceItems]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-20 sm:pb-4">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-600 via-sky-700 to-slate-800 text-white shadow-md">
        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${status.className}`}>
                  {status.text}
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-sky-50">
                  {entityLabel}
                </span>
              </div>
              <h2 className="text-xl font-black leading-snug sm:text-2xl">{displayName}</h2>
              <p className="text-sm text-sky-100/90">صفحه اختصاصی خدمات بازرگانی شما در زارعون</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={publicHref}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-white/95 px-4 text-sm font-bold text-sky-800 transition hover:bg-white"
              >
                مشاهده صفحه عمومی
              </Link>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                ویرایش
              </button>
            </div>
          </div>
        </div>
      </section>

      {hasPendingChanges ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
          تغییرات شما در صف تأیید مدیر است. تا زمان تأیید، صفحه عمومی با اطلاعات قبلی نمایش داده می‌شود.
        </div>
      ) : provider.status === "pending" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
          پروفایل شما در انتظار تأیید مدیر است. پس از تأیید، صفحه عمومی منتشر می‌شود.
        </div>
      ) : null}

      {/* Contact + Services side by side on large screens */}
      <div className="grid gap-4 lg:grid-cols-2">
      <section className={`${dash.card} ${dash.cardBody}`}>
        <h3 className="mb-3 text-sm font-bold text-slate-900">اطلاعات تماس</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile label="نام تماس" value={provider.contactName || profileFullName} />
          <InfoTile label="تلفن" value={provider.phone} dir="ltr" />
          <InfoTile label="ایمیل" value={provider.email} dir="ltr" />
          <InfoTile
            label="سابقه فعالیت"
            value={provider.experienceYears != null ? `${provider.experienceYears} سال` : null}
          />
        </div>
      </section>

      {/* Services */}
      <section className={`${dash.card} ${dash.cardBody}`}>
        <h3 className="mb-3 text-sm font-bold text-slate-900">خدمات ثبت‌شده</h3>
        {groupedServices.length ? (
          <div className="space-y-4">
            {groupedServices.map(([category, subs]) => (
              <div key={category}>
                <p className="mb-2 text-xs font-bold text-sky-800">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {subs.map((sub) => (
                    <span
                      key={`${category}-${sub}`}
                      className="inline-flex rounded-lg border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">هنوز خدمتی ثبت نشده است.</p>
        )}
      </section>
      </div>

      {/* Details */}
      {(provider.countriesRoutes ||
        provider.licenses ||
        provider.servicesOffered ||
        provider.notes ||
        documents.length > 0) && (
        <section className={`${dash.card} ${dash.cardBody} space-y-3`}>
          <h3 className="text-sm font-bold text-slate-900">جزئیات و مدارک</h3>
          <TextBlock label="کشورها / مسیرهای فعالیت" value={provider.countriesRoutes} />
          <TextBlock label="مجوزها" value={provider.licenses} />
          <TextBlock label="توضیح خدمات" value={provider.servicesOffered} />
          <TextBlock label="یادداشت" value={provider.notes} />

          {documents.length > 0 ? (
            <div>
              <p className="mb-2 text-[11px] font-semibold text-slate-500">مدارک</p>
              <ul className="space-y-2">
                {documents.map((doc, i) => (
                  <li
                    key={`${doc.id || doc.url}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5"
                  >
                    <span className="truncate text-sm font-medium text-slate-800">{doc.name}</span>
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-semibold text-sky-700 hover:underline"
                      >
                        مشاهده
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      {/* Mobile sticky edit */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur sm:hidden">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-sky-600 text-sm font-bold text-white"
        >
          ویرایش صفحه خدمات
        </button>
      </div>
    </div>
  );
}

function ProfileEditMode({
  form,
  setForm,
  selectedServices,
  setSelectedServices,
  documents,
  setDocuments,
  categories,
  language,
  t,
  isRTL,
  profileFullName,
  saving,
  onSubmit,
  onCancel,
  publicHref,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-6xl space-y-4 pb-6">
      <div className="rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm leading-7 text-sky-900">
        پس از ذخیره، تغییرات برای تأیید مدیر ارسال می‌شود و پس از تأیید روی صفحه عمومی اعمال می‌گردد.
      </div>

      <div className="grid gap-4 xl:grid-cols-12 xl:items-start">
        <div className="space-y-4 xl:col-span-5">
          <section className={`${dash.card} ${dash.cardBody}`}>
            <h2 className="mb-4 text-sm font-bold text-slate-900">مشخصات صفحه</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">نوع</span>
                <select name="entityType" value={form.entityType} onChange={handleChange} className={inputClass}>
                  <option value="company">شرکت</option>
                  <option value="individual">شخص / متخصص</option>
                </select>
              </label>

              {form.entityType === "company" ? (
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">نام شرکت *</span>
                  <input
                    name="displayName"
                    value={form.displayName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </label>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-3 sm:col-span-2">
                  <p className="text-xs font-semibold text-slate-500">نام نمایشی</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{profileFullName}</p>
                </div>
              )}

              <label className="block">
                <span className="text-sm font-medium text-slate-700">تلفن *</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  dir="ltr"
                  className={`${inputClass} text-start`}
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
                  className={`${inputClass} text-start`}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">سابقه (سال)</span>
                <input
                  name="experienceYears"
                  type="number"
                  min="0"
                  max="80"
                  value={form.experienceYears}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className={`${dash.card} ${dash.cardBody} space-y-4`}>
            <h2 className="text-sm font-bold text-slate-900">جزئیات و مدارک</h2>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">کشورها / مسیرهای فعالیت</span>
              <input name="countriesRoutes" value={form.countriesRoutes} onChange={handleChange} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">مجوزها</span>
              <textarea name="licenses" value={form.licenses} onChange={handleChange} rows={2} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">توضیح خدمات</span>
              <textarea
                name="servicesOffered"
                value={form.servicesOffered}
                onChange={handleChange}
                rows={3}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">یادداشت</span>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className={inputClass} />
            </label>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">مدارک (اختیاری)</p>
              <DocumentUploader documents={documents} onChange={setDocuments} />
            </div>
          </section>
        </div>

        <section className={`${dash.card} ${dash.cardBody} xl:col-span-7 xl:sticky xl:top-4`}>
          <h2 className="mb-1 text-sm font-bold text-slate-900">خدمات ارائه‌شده</h2>
          <p className="mb-4 text-xs text-slate-500">خدمات موردنظر خود را انتخاب یا تغییر دهید.</p>
          <TradeProviderServicePicker
            categories={categories}
            selected={selectedServices}
            onChange={setSelectedServices}
            language={language}
            t={t}
            isRTL={isRTL}
            catalogClassName="max-h-[min(50vh,420px)] overflow-y-auto overscroll-contain pe-0.5 xl:max-h-[min(calc(100vh-12rem),520px)]"
          />
        </section>
      </div>

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-col gap-2 border-t border-slate-200 bg-white/95 py-3 backdrop-blur sm:static sm:flex-row sm:border-0 sm:bg-transparent sm:py-0 xl:max-w-6xl">
        <button
          type="submit"
          disabled={saving}
          className="h-11 flex-1 rounded-xl bg-sky-600 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-60 sm:flex-none sm:px-6"
        >
          {saving ? "در حال ارسال…" : "ارسال برای تأیید مدیر"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex-none sm:px-6"
        >
          انصراف
        </button>
        <Link
          href={publicHref}
          className="hidden h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:inline-flex"
        >
          پیش‌نمایش
        </Link>
      </div>
    </form>
  );
}

export default function ServiceProviderProfileEditor() {
  const auth = useAuth();
  const { t, language, isRTL } = useLanguage();
  const categories = useMemo(() => getL1Categories(language), [language]);

  const [mode, setMode] = useState("view");
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [documents, setDocuments] = useState([]);

  const profileFullName = useMemo(() => {
    const user = auth?.user;
    if (!user) return "";
    return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  }, [auth?.user]);

  const loadProvider = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(API_ENDPOINTS.tradeServiceProviders.mine, { cache: "no-store" });
      const json = await res.json();
      const row = json?.primary || json?.data?.[0] || null;
      setProvider(row);
      if (row) {
        const hydrated = hydrateFormFromProvider(row, profileFullName, language);
        setForm(hydrated.form);
        setSelectedServices(hydrated.selectedServices);
        setDocuments(hydrated.documents);
      }
    } catch {
      setProvider(null);
    } finally {
      setLoading(false);
    }
  }, [profileFullName, language]);

  useEffect(() => {
    loadProvider();
  }, [loadProvider]);

  const serviceItems = useMemo(() => {
    if (!provider) return [];
    const pending = provider.pendingChanges;
    const source = pending && provider.status === "approved" ? { ...provider, ...pending } : provider;
    const selected = Array.isArray(source.selectedServices) ? source.selectedServices : [];
    return selected
      .map((item) => findCatalogService(language, item.categoryId, item.subcategoryId))
      .filter(Boolean);
  }, [provider, language]);

  const viewDocuments = useMemo(() => {
    if (!provider) return [];
    const pending = provider.pendingChanges;
    if (pending?.documentUrls?.length) return pending.documentUrls;
    return Array.isArray(provider.documentUrls) ? provider.documentUrls : [];
  }, [provider]);

  const startEdit = () => {
    if (!provider) return;
    const hydrated = hydrateFormFromProvider(provider, profileFullName, language);
    setForm(hydrated.form);
    setSelectedServices(hydrated.selectedServices);
    setDocuments(hydrated.documents);
    setMode("edit");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const cancelEdit = () => {
    setMode("view");
    if (provider) {
      const hydrated = hydrateFormFromProvider(provider, profileFullName, language);
      setForm(hydrated.form);
      setSelectedServices(hydrated.selectedServices);
      setDocuments(hydrated.documents);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form || !provider) return;

    const displayName = form.entityType === "individual" ? profileFullName : form.displayName.trim();
    if (!displayName || !form.phone.trim()) {
      showToast.error("نام و تلفن الزامی است");
      return;
    }
    if (!selectedServices.length) {
      showToast.warning("حداقل یک خدمت انتخاب کنید");
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch(API_ENDPOINTS.tradeServiceProviders.updateMine, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          displayName,
          contactName: profileFullName,
          selectedServices: selectedServices.map(({ categoryId, subcategoryId }) => ({
            categoryId,
            subcategoryId,
          })),
          documentUrls: documents,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast.error(json.message || "خطا در ذخیره");
        return;
      }
      showToast.success(json.message || "تغییرات ثبت شد");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("trade-provider-mine-updated"));
      }
      await loadProvider();
      setMode("view");
    } catch {
      showToast.error("خطا در ذخیره تغییرات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
      </div>
    );
  }

  if (!provider || !form) {
    return (
      <div className={dash.page}>
        <header className="mb-6">
          <h1 className={dash.pageTitle}>صفحه خدمات من</h1>
          <p className={dash.pageSubtitle}>هنوز در خدمات‌دهندگان عضو نشده‌اید.</p>
        </header>
        <div className={`${dash.card} ${dash.cardBody}`}>
          <Link
            href="/trade-services/register"
            className="inline-flex rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
          >
            عضویت در خدمات‌دهندگان
          </Link>
        </div>
      </div>
    );
  }

  const hasPendingChanges = Boolean(provider.pendingChanges) && provider.status === "approved";
  const publicHref = `/trade-services/provider/${provider.id}`;

  return (
    <div className={dash.page} dir={isRTL ? "rtl" : "ltr"}>
      <header className="mb-4 sm:mb-6">
        <h1 className={dash.pageTitle}>{mode === "edit" ? "ویرایش صفحه خدمات" : "صفحه خدمات من"}</h1>
        <p className={dash.pageSubtitle}>
          {mode === "edit"
            ? "تغییرات را اعمال کنید و برای تأیید مدیر ارسال نمایید."
            : "خلاصه اطلاعات ثبت‌شده در صفحه اختصاصی خدمات شما."}
        </p>
      </header>

      {mode === "view" ? (
        <ProfileViewMode
          provider={provider}
          profileFullName={profileFullName}
          serviceItems={serviceItems}
          documents={viewDocuments}
          hasPendingChanges={hasPendingChanges}
          publicHref={publicHref}
          onEdit={startEdit}
        />
      ) : (
        <ProfileEditMode
          form={form}
          setForm={setForm}
          selectedServices={selectedServices}
          setSelectedServices={setSelectedServices}
          documents={documents}
          setDocuments={setDocuments}
          categories={categories}
          language={language}
          t={t}
          isRTL={isRTL}
          profileFullName={profileFullName}
          saving={saving}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          publicHref={publicHref}
        />
      )}
    </div>
  );
}
