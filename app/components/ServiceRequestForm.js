"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { API_ENDPOINTS } from "../config/api";
import { getExclusiveServicesContent } from "../data/zareoonExclusiveServices";
import { serviceRequestFormConfig } from "../data/serviceRequestForms";

const commonInitial = {
  fullName: "",
  company: "",
  phone: "",
  email: "",
  tradeType: "import",
  productDescription: "",
  estimatedAmount: "",
  currency: "USD",
  notes: "",
};

function buildInitialForm(serviceType) {
  const config = serviceRequestFormConfig[serviceType];
  const details = {};
  for (const field of config?.extraFields || []) {
    details[field.name] = "";
  }
  return { ...commonInitial, details };
}

export default function ServiceRequestForm({ serviceType }) {
  const { t, isRTL, language } = useLanguage();
  const auth = useAuth();
  const router = useRouter();
  const config = serviceRequestFormConfig[serviceType];

  const serviceMeta = useMemo(() => {
    const content = getExclusiveServicesContent(language);
    return content.items.find((item) => item.id === serviceType);
  }, [language, serviceType]);

  const [form, setForm] = useState(() => buildInitialForm(serviceType));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setForm(buildInitialForm(serviceType));
  }, [serviceType]);

  useEffect(() => {
    const user = auth?.user;
    if (!user) return;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || fullName,
      phone: prev.phone || user.mobile || user.phone || "",
      email: prev.email || user.email || "",
    }));
  }, [auth?.user]);

  const handleCommonChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      details: { ...prev.details, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim() || !form.phone.trim()) {
      setError(t("lcFormRequiredError"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.serviceRequests.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          serviceType,
          fullName: form.fullName,
          company: form.company,
          phone: form.phone,
          email: form.email,
          tradeType: form.tradeType,
          productDescription: form.productDescription,
          estimatedAmount: form.estimatedAmount,
          currency: form.currency,
          notes: form.notes,
          details: form.details,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || t("lcFormSubmitError"));
        return;
      }
      setSuccess(true);
    } catch {
      setError(t("lcFormSubmitError"));
    } finally {
      setLoading(false);
    }
  };

  if (!config) return null;

  if (success) {
    return (
      <main className="max-w-lg mx-auto px-4 py-10 text-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 space-y-4">
          <div className="text-4xl">✓</div>
          <h1 className="text-xl font-bold text-slate-900">{t("lcFormSuccessTitle")}</h1>
          <p className="text-sm text-slate-600 leading-7">{t("lcFormSuccessMessage")}</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            {t("home")}
          </button>
        </div>
      </main>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 sm:py-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6">
        <Link href="/" className="text-sm text-emerald-700 hover:underline">
          ← {t("home")}
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
          {t("serviceRequestFormTitle", { service: serviceMeta?.title || serviceType })}
        </h1>
        {serviceMeta?.description ? (
          <p className="mt-2 text-sm text-slate-600 leading-7">{serviceMeta.description}</p>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
      >
        {error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">{t("lcFormFullName")} *</span>
            <input name="fullName" value={form.fullName} onChange={handleCommonChange} required className={inputClass} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("lcFormPhone")} *</span>
            <input
              name="phone"
              value={form.phone}
              onChange={handleCommonChange}
              required
              dir="ltr"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("lcFormEmail")}</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleCommonChange}
              dir="ltr"
              className={inputClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">{t("lcFormCompany")}</span>
            <input name="company" value={form.company} onChange={handleCommonChange} className={inputClass} />
          </label>

          {config.showTradeType !== false ? (
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">{t("lcFormTradeType")}</span>
              <select name="tradeType" value={form.tradeType} onChange={handleCommonChange} className={inputClass}>
                <option value="import">{t("lcFormTradeImport")}</option>
                <option value="export">{t("lcFormTradeExport")}</option>
                <option value="both">{t("lcFormTradeBoth")}</option>
              </select>
            </label>
          ) : null}

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">{t("lcFormProductDescription")}</span>
            <textarea
              name="productDescription"
              value={form.productDescription}
              onChange={handleCommonChange}
              rows={3}
              className={inputClass}
            />
          </label>

          {config.extraFields.map((field) => (
            <label key={field.name} className={`block ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
              <span className="text-sm font-medium text-slate-700">{t(field.labelKey)}</span>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={form.details[field.name] || ""}
                  onChange={handleDetailChange}
                  className={inputClass}
                >
                  <option value="">—</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={form.details[field.name] || ""}
                  onChange={handleDetailChange}
                  rows={3}
                  className={inputClass}
                />
              ) : (
                <input
                  name={field.name}
                  type={field.type === "number" ? "number" : "text"}
                  value={form.details[field.name] || ""}
                  onChange={handleDetailChange}
                  className={inputClass}
                />
              )}
            </label>
          ))}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("lcFormEstimatedAmount")}</span>
            <input
              name="estimatedAmount"
              type="number"
              min="0"
              step="0.01"
              value={form.estimatedAmount}
              onChange={handleCommonChange}
              dir="ltr"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("lcFormCurrency")}</span>
            <input
              name="currency"
              value={form.currency}
              onChange={handleCommonChange}
              dir="ltr"
              className={inputClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">{t("lcFormNotes")}</span>
            <textarea name="notes" value={form.notes} onChange={handleCommonChange} rows={3} className={inputClass} />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors"
        >
          {loading ? t("lcFormSubmitting") : t("serviceRequestCta")}
        </button>
      </form>
    </main>
  );
}
