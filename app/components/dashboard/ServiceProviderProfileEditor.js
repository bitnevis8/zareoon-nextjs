"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { getAuthHeaders } from "@/app/utils/authHeaders";
import { findCatalogService, getL1Categories } from "@/app/data/tradeServicesCatalog";
import { showToast } from "@/app/utils/toast";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import TradeProviderServicePicker from "@/app/components/TradeProviderServicePicker";
import BusinessHoursEditor from "@/app/components/ui/BusinessHoursEditor";
import LocationPickerMap from "@/app/components/ui/LocationPickerMap";
import PublicHoursAndMap from "@/app/components/ui/PublicHoursAndMap";
import { DEFAULT_BUSINESS_HOURS, mergeBusinessHours } from "@/app/utils/businessHours";

const inputClass = dash.input + " mt-1.5";

const STATUS_KEYS = {
  pending: { key: "pending", className: "bg-amber-100 text-amber-800 ring-amber-200/80" },
  approved: { key: "approved", className: "bg-emerald-100 text-emerald-800 ring-emerald-200/80" },
  rejected: { key: "rejected", className: "bg-rose-100 text-rose-800 ring-rose-200/80" },
};

function providerToForm(provider, profileFullName) {
  return {
    entityType: "individual",
    displayName: provider?.displayName || profileFullName || "",
    contactName: provider?.contactName || profileFullName,
    phone: provider?.phone || "",
    email: provider?.email || "",
    notes: provider?.notes || "",
    businessHours: mergeBusinessHours(provider?.businessHours),
    latitude: provider?.latitude ?? null,
    longitude: provider?.longitude ?? null,
    addressLabel: provider?.addressLabel || "",
  };
}

function hydrateFormFromProvider(row, profileFullName, language) {
  const source = row;
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
    documents: Array.isArray(row.documentUrls) ? row.documentUrls : [],
  };
}

function DocumentUploader({ documents, onChange }) {
  const td = useTranslations("supplier.tradeProvider.documents");
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      showToast.warning(td("pdfOrImageOnly"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast.warning(td("maxFileSize"));
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
      if (!res.ok || !json.success) throw new Error(json.message || td("uploadError"));
      onChange([
        ...documents,
        {
          id: json.data.id,
          name: json.data.originalName || file.name,
          url: json.data.downloadUrl || json.data.url,
        },
      ]);
      showToast.success(td("uploadSuccess"));
    } catch (e) {
      showToast.error(e.message || td("uploadDocError"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center transition hover:border-emerald-200 hover:bg-emerald-50/30">
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
        <p className="text-sm font-semibold text-slate-700">{uploading ? td("uploading") : td("uploadLabel")}</p>
        <p className="mt-1 text-xs text-slate-500">{td("uploadHint")}</p>
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
                    className="text-[11px] font-semibold text-emerald-700 hover:underline"
                  >
                    {td("view")}
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => onChange(documents.filter((_, i) => i !== index))}
                  className="text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  {td("remove")}
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
  onTogglePublic,
  togglingPublic,
  canHidePublicPage = false,
}) {
  const te = useTranslations("supplier.tradeProvider.editor");
  const ts = useTranslations("supplier.tradeProvider");
  const tst = useTranslations("supplier.tradeProvider.status");
  const statusMeta = STATUS_KEYS[provider.status] || STATUS_KEYS.pending;
  const status = { text: tst(statusMeta.key), className: statusMeta.className };
  const entityLabel =
    provider.entityType === "individual" ? ts("entityIndividual") : ts("entityCompany");
  const displayName =
    provider.entityType === "individual" ? profileFullName || provider.displayName : provider.displayName;
  const isPublic = provider.isPublic !== false;

  const groupedServices = useMemo(() => {
    const groups = {};
    serviceItems.forEach((item) => {
      const key = item.categoryTitle || ts("otherCategory");
      if (!groups[key]) groups[key] = [];
      groups[key].push(item.subcategoryTitle);
    });
    return Object.entries(groups);
  }, [serviceItems, ts]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-20 sm:pb-4">
      <section className={`${dash.card} ${dash.cardBody}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${status.className}`}>
                {status.text}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                {entityLabel}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{displayName}</h2>
            <p className="text-sm text-slate-500">{te("heroSubtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {publicHref ? (
              <Link href={publicHref} className={`${dash.btnSecondary} min-h-10`}>
                {te("viewPublicPage")}
              </Link>
            ) : null}
            <button type="button" onClick={onEdit} className={`${dash.btnPrimary} min-h-10`}>
              {te("edit")}
            </button>
          </div>
        </div>
      </section>

      {provider.status === "pending" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
          {te("pendingApprovalNotice")}
        </div>
      ) : null}

      <div className={`${dash.card} ${dash.cardBody}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">نمایش صفحه خدمات</p>
            {canHidePublicPage ? (
              <p className="mt-0.5 text-xs text-slate-500">
                با غیرفعال کردن، صفحه از دسترس عموم خارج می‌شود؛ داده حذف نمی‌شود.
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-slate-500">
                صفحه شما همیشه عمومی است. خصوصی‌سازی فقط با مجوز مدیریت ممکن است.
              </p>
            )}
            {provider.profileSlug ? (
              <p className="mt-1 text-[11px] text-slate-400" dir="ltr">
                /{provider.profileSlug}
              </p>
            ) : null}
          </div>
          {canHidePublicPage ? (
            <button
              type="button"
              disabled={togglingPublic}
              onClick={() => onTogglePublic?.(!isPublic)}
              className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-bold transition disabled:opacity-60 ${
                isPublic
                  ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {togglingPublic ? "…" : isPublic ? "غیرفعال‌سازی صفحه" : "فعال‌سازی صفحه"}
            </button>
          ) : (
            <span className="inline-flex min-h-10 items-center rounded-xl bg-emerald-50 px-3 text-xs font-bold text-emerald-800">
              عمومی
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
      <section className={`${dash.card} ${dash.cardBody}`}>
        <h3 className="mb-3 text-sm font-bold text-slate-900">{te("contactInfo")}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile label={te("contactName")} value={provider.contactName || profileFullName} />
          <InfoTile label={te("phone")} value={provider.phone} dir="ltr" />
          <InfoTile label={te("email")} value={provider.email} dir="ltr" />
          <InfoTile label="نام نمایشی" value={provider.displayName} />
        </div>
        {provider.notes ? (
          <div className="mt-3">
            <TextBlock label="درباره خدمات" value={provider.notes} />
          </div>
        ) : null}
      </section>

      <section className={`${dash.card} ${dash.cardBody}`}>
        <h3 className="mb-3 text-sm font-bold text-slate-900">{te("registeredServices")}</h3>
        {groupedServices.length ? (
          <div className="space-y-4">
            {groupedServices.map(([category, subs]) => (
              <div key={category}>
                <p className="mb-2 text-xs font-bold text-emerald-800">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {subs.map((sub) => (
                    <span
                      key={`${category}-${sub}`}
                      className="inline-flex rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{te("noServicesYet")}</p>
        )}
      </section>
      </div>

      <PublicHoursAndMap
        businessHours={provider.businessHours ? mergeBusinessHours(provider.businessHours) : null}
        latitude={provider.latitude}
        longitude={provider.longitude}
        addressLabel={provider.addressLabel}
      />

      {documents.length > 0 ? (
        <section className={`${dash.card} ${dash.cardBody} space-y-3`}>
          <h3 className="text-sm font-bold text-slate-900">{ts("documents.title")}</h3>
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
                    className="shrink-0 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    {ts("documents.view")}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur sm:hidden">
        <button
          type="button"
          onClick={onEdit}
          className={`${dash.btnPrimary} h-11 w-full`}
        >
          {te("editMobileCta")}
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
  saving,
  onSubmit,
  onCancel,
  publicHref,
}) {
  const te = useTranslations("supplier.tradeProvider.editor");
  const ts = useTranslations("supplier.tradeProvider");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-6xl space-y-4 pb-6">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
        {te("saveNotice")}
      </div>

      <div className="grid gap-4 xl:grid-cols-12 xl:items-start">
        <div className="space-y-4 xl:col-span-5">
          <section className={`${dash.card} ${dash.cardBody}`}>
            <h2 className="mb-4 text-sm font-bold text-slate-900">{te("pageDetails")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">نام نمایشی *</span>
                <input
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">{te("phone")} *</span>
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
                <span className="text-sm font-medium text-slate-700">{te("email")}</span>
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
                <span className="text-sm font-medium text-slate-700">درباره خدمات</span>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className={`${dash.card} ${dash.cardBody} space-y-3`}>
            <h2 className="text-sm font-bold text-slate-900">موقعیت روی نقشه</h2>
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
          </section>

          <section className={`${dash.card} ${dash.cardBody} space-y-3`}>
            <h2 className="text-sm font-bold text-slate-900">ساعات کاری</h2>
            <BusinessHoursEditor
              value={form.businessHours || DEFAULT_BUSINESS_HOURS}
              onChange={(businessHours) => setForm((f) => ({ ...f, businessHours }))}
            />
          </section>

          <section className={`${dash.card} ${dash.cardBody} space-y-4`}>
            <h2 className="text-sm font-bold text-slate-900">{te("detailsAndDocs")}</h2>
            <p className="text-xs text-slate-500">{ts("documents.optional")}</p>
            <DocumentUploader documents={documents} onChange={setDocuments} />
          </section>
        </div>

        <section className={`${dash.card} ${dash.cardBody} xl:col-span-7 xl:sticky xl:top-4`}>
          <h2 className="mb-1 text-sm font-bold text-slate-900">{te("offeredServices")}</h2>
          <p className="mb-4 text-xs text-slate-500">{te("offeredServicesHint")}</p>
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
          className={`${dash.btnPrimary} h-11 flex-1 sm:flex-none sm:px-6`}
        >
          {saving ? te("submitting") : te("submitForApproval")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`${dash.btnSecondary} h-11 flex-1 sm:flex-none sm:px-6`}
        >
          {te("cancel")}
        </button>
        {publicHref ? (
          <Link
            href={publicHref}
            className={`${dash.btnSecondary} hidden h-11 sm:inline-flex`}
          >
            {te("preview")}
          </Link>
        ) : null}
      </div>
    </form>
  );
}

export default function ServiceProviderProfileEditor() {
  const te = useTranslations("supplier.tradeProvider.editor");
  const auth = useAuth();
  const { t, language, isRTL } = useLanguage();
  const categories = useMemo(() => getL1Categories(language), [language]);

  const [mode, setMode] = useState("view");
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingPublic, setTogglingPublic] = useState(false);
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

    const displayName = String(form.displayName || "").trim() || profileFullName;
    if (!displayName || !String(form.phone || "").trim()) {
      showToast.error(te("namePhoneRequired"));
      return;
    }
    if (!selectedServices.length) {
      showToast.warning(te("selectOneService"));
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch(API_ENDPOINTS.tradeServiceProviders.updateMine, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "individual",
          displayName,
          contactName: profileFullName,
          phone: form.phone,
          email: form.email || "",
          notes: form.notes || "",
          businessHours: form.businessHours,
          latitude: form.latitude,
          longitude: form.longitude,
          addressLabel: form.addressLabel || "",
          selectedServices: selectedServices.map(({ categoryId, subcategoryId }) => ({
            categoryId,
            subcategoryId,
          })),
          documentUrls: documents,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast.error(json.message || te("saveError"));
        return;
      }
      showToast.success(json.message || te("saveSuccess"));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("trade-provider-mine-updated"));
      }
      await loadProvider();
      setMode("view");
    } catch {
      showToast.error(te("saveChangesError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!provider || !form) {
    return (
      <div className={dash.page}>
        <header className="mb-6">
          <h1 className={dash.pageTitle}>{te("myServicesPage")}</h1>
          <p className={dash.pageSubtitle}>{te("notMemberYet")}</p>
        </header>
        <div className={`${dash.card} ${dash.cardBody}`}>
          <Link href="/trade-services/register" className={`${dash.btnPrimary} min-h-11`}>
            {te("joinProviders")}
          </Link>
        </div>
      </div>
    );
  }

  const hasPendingChanges = Boolean(provider.pendingChanges) && provider.status === "approved";
  const publicHref = provider.profileSlug ? `/${provider.profileSlug}` : null;

  const onTogglePublic = async (nextPublic) => {
    setTogglingPublic(true);
    try {
      const res = await authFetch(API_ENDPOINTS.tradeServiceProviders.updateVisibility, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: nextPublic }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json.message || "خطا در تغییر وضعیت");
        return;
      }
      showToast.success(json.message || "ذخیره شد");
      await loadProvider();
    } catch {
      showToast.error("خطا در تغییر وضعیت");
    } finally {
      setTogglingPublic(false);
    }
  };

  return (
    <div className={dash.page} dir={isRTL ? "rtl" : "ltr"}>
      <header className="mb-4 sm:mb-6">
        <h1 className={dash.pageTitle}>{mode === "edit" ? te("editServicesPage") : te("myServicesPage")}</h1>
        <p className={dash.pageSubtitle}>
          {mode === "edit" ? te("editSubtitle") : te("viewSubtitle")}
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
          onTogglePublic={onTogglePublic}
          togglingPublic={togglingPublic}
          canHidePublicPage={!!provider.canHidePublicPage}
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
          saving={saving}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          publicHref={publicHref}
        />
      )}
    </div>
  );
}
