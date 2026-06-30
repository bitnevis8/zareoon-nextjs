"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { API_ENDPOINTS } from "../config/api";

const initialForm = {
  fullName: "",
  company: "",
  phone: "",
  email: "",
  tradeType: "import",
  productDescription: "",
  estimatedAmount: "",
  currency: "USD",
  bankName: "",
  notes: "",
};

export default function LcRequestPage() {
  const { t, isRTL } = useLanguage();
  const auth = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      const response = await fetch(API_ENDPOINTS.lcRequests.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
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

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 sm:py-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6">
        <Link href="/" className="text-sm text-emerald-700 hover:underline">
          ← {t("home")}
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900">{t("lcFormTitle")}</h1>
        <p className="mt-2 text-sm text-slate-600 leading-7">{t("lcDescription")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        {error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">{t("lcFormFullName")} *</span>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("lcFormPhone")} *</span>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              dir="ltr"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("lcFormEmail")}</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              dir="ltr"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">{t("lcFormCompany")}</span>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">{t("lcFormTradeType")} *</span>
            <select
              name="tradeType"
              value={form.tradeType}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="import">{t("lcFormTradeImport")}</option>
              <option value="export">{t("lcFormTradeExport")}</option>
              <option value="both">{t("lcFormTradeBoth")}</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">{t("lcFormProductDescription")}</span>
            <textarea
              name="productDescription"
              value={form.productDescription}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("lcFormEstimatedAmount")}</span>
            <input
              name="estimatedAmount"
              type="number"
              min="0"
              step="0.01"
              value={form.estimatedAmount}
              onChange={handleChange}
              dir="ltr"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("lcFormCurrency")}</span>
            <input
              name="currency"
              value={form.currency}
              onChange={handleChange}
              dir="ltr"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">{t("lcFormBankName")}</span>
            <input
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">{t("lcFormNotes")}</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors"
        >
          {loading ? t("lcFormSubmitting") : t("lcRequestCta")}
        </button>
      </form>
    </main>
  );
}
