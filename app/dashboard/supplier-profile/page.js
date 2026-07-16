"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { authFetch } from "@/app/utils/authHeaders";
import { shouldShowSupplierPanel } from "@/app/utils/roles";
import { getEntityTypeOptions } from "@/app/data/entityTypes";
import { useAuth } from "@/app/context/AuthContext";

const WEEK_DAY_KEYS = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

const DEFAULT_HOURS = {
  saturday: { closed: false, open: "08:00", close: "18:00" },
  sunday: { closed: false, open: "08:00", close: "18:00" },
  monday: { closed: false, open: "08:00", close: "18:00" },
  tuesday: { closed: false, open: "08:00", close: "18:00" },
  wednesday: { closed: false, open: "08:00", close: "18:00" },
  thursday: { closed: false, open: "08:00", close: "18:00" },
  friday: { closed: true, open: "", close: "" },
};

function DynamicFields({ schema, values, onChange, title }) {
  if (!schema?.length) return null;
  return (
    <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
      <h3 className="text-sm font-bold text-emerald-900">{title}</h3>
      {schema.map((field) => (
        <label key={field.key} className="block text-xs font-semibold text-slate-600">
          {field.label}
          {field.type === "textarea" ? (
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              placeholder={field.placeholder}
              value={values[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          ) : (
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder={field.placeholder}
              value={values[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          )}
        </label>
      ))}
    </div>
  );
}

function SupplierAccountEditor() {
  const t = useTranslations("product");
  const tShared = useTranslations("shared");
  const entityTypeOptions = getEntityTypeOptions(tShared);
  const auth = useAuth();
  const [entityTypes, setEntityTypes] = useState([]);
  const [fieldSchema, setFieldSchema] = useState([]);
  const [form, setForm] = useState({
    entityType: "individual",
    profileSlug: "",
    headline: "",
    bio: "",
    country: "",
    publicPhone: "",
    isProfilePublic: true,
    businessHours: DEFAULT_HOURS,
    profileFields: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    authFetch("/api/tamin/me")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) {
          const d = j.data;
          setEntityTypes(d.entityTypes || []);
          setFieldSchema(d.fieldSchema || []);
          setForm({
            entityType: d.entityType || "individual",
            profileSlug: d.profileSlug || "",
            headline: d.headline || "",
            bio: d.bio || "",
            country: d.country || "",
            publicPhone: d.publicPhone || "",
            isProfilePublic: d.isPublic !== false,
            businessHours: { ...DEFAULT_HOURS, ...d.businessHours },
            profileFields: d.profileFields || {},
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const onEntityTypeChange = (entityType) => {
    setForm((f) => ({ ...f, entityType, profileFields: {} }));
    fetch(`/api/tamin/entity-schemas`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setFieldSchema(j.data.schemas[entityType] || []);
      })
      .catch(() => {});
  };

  const setProfileField = (key, value) => {
    setForm((f) => ({
      ...f,
      profileFields: { ...f.profileFields, [key]: value },
    }));
  };

  const setHour = (day, field, value) => {
    setForm((f) => ({
      ...f,
      businessHours: {
        ...f.businessHours,
        [day]: { ...f.businessHours[day], [field]: value },
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    setMsg("");
    const res = await authFetch("/api/tamin/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entityType: form.entityType,
        profileSlug: form.profileSlug,
        headline: form.headline,
        bio: form.bio,
        country: form.country,
        publicPhone: form.publicPhone,
        businessHours: form.businessHours,
        isProfilePublic: form.isProfilePublic,
        profileFields: form.profileFields,
      }),
    });
    const j = await res.json();
    if (j.success) {
      setFieldSchema(j.data.fieldSchema || []);
      setForm((f) => ({
        ...f,
        profileSlug: j.data.profileSlug || f.profileSlug,
        profileFields: j.data.profileFields || f.profileFields,
      }));
    }
    setMsg(j.success ? t("supplierProfile.saveSuccess") : j.message || "");
    setSaving(false);
  };

  if (!shouldShowSupplierPanel(auth?.user)) {
    return <p className="p-8 text-center text-slate-600">{t("supplierProfile.suppliersOnly")}</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const publicUrl = form.profileSlug ? `/tamin/${form.profileSlug}` : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold text-slate-900">{t("supplierProfile.title")}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {t("supplierProfile.subtitle")}
      </p>
      <p className="mt-1 text-xs text-slate-400">{t("supplierProfile.urlHint")}</p>

      {publicUrl ? (
        <Link href={publicUrl} className="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:underline">
          {t("supplierProfile.viewPublicPage")}
        </Link>
      ) : null}

      <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-xs font-semibold text-slate-600">
          {t("supplierProfile.entityTypeLabel")}
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.entityType}
            onChange={(e) => onEntityTypeChange(e.target.value)}
          >
            {(entityTypes.length ? entityTypes : entityTypeOptions).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold text-slate-600">
          {t("supplierProfile.profileSlugLabel")}
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.profileSlug}
            onChange={(e) => setForm({ ...form, profileSlug: e.target.value })}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-600">
          {t("supplierProfile.countryLabel")}
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-600">
          {t("supplierProfile.headlineLabel")}
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-600">
          {t("supplierProfile.bioLabel")}
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-600">
          {t("supplierProfile.publicPhoneLabel")}
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            dir="ltr"
            value={form.publicPhone}
            onChange={(e) => setForm({ ...form, publicPhone: e.target.value })}
          />
        </label>

        <DynamicFields
          schema={fieldSchema}
          values={form.profileFields}
          onChange={setProfileField}
          title={t("supplierProfile.dynamicFieldsTitle")}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isProfilePublic}
            onChange={(e) => setForm({ ...form, isProfilePublic: e.target.checked })}
          />
          {t("supplierProfile.publicPageEnabled")}
        </label>

        <div>
          <h2 className="mb-2 text-sm font-bold text-slate-800">{t("supplierProfile.businessHoursTitle")}</h2>
          <div className="space-y-2">
            {WEEK_DAY_KEYS.map((key) => (
              <div key={key} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2 text-sm">
                <span className="w-16 font-medium">{t(`supplierProfile.weekDays.${key}`)}</span>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={!!form.businessHours[key]?.closed}
                    onChange={(e) => setHour(key, "closed", e.target.checked)}
                  />
                  {t("supplierProfile.closed")}
                </label>
                {!form.businessHours[key]?.closed ? (
                  <>
                    <input
                      type="time"
                      className="rounded border px-1"
                      value={form.businessHours[key]?.open || ""}
                      onChange={(e) => setHour(key, "open", e.target.value)}
                    />
                    <span>{t("supplierProfile.until")}</span>
                    <input
                      type="time"
                      className="rounded border px-1"
                      value={form.businessHours[key]?.close || ""}
                      onChange={(e) => setHour(key, "close", e.target.value)}
                    />
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? t("supplierProfile.saving") : t("supplierProfile.saveProfile")}
        </button>
        {msg ? <p className="text-center text-sm text-emerald-700">{msg}</p> : null}
      </div>
    </div>
  );
}

export default function SupplierProfileDashboardPage() {
  return (
    <ProtectedRoute>
      <SupplierAccountEditor />
    </ProtectedRoute>
  );
}
