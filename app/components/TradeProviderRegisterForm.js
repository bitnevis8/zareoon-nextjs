"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { API_ENDPOINTS } from "../config/api";
import { getL1Categories } from "../data/tradeServicesCatalog";
import { showToast } from "../utils/toast";
import TradeProviderServicePicker from "./TradeProviderServicePicker";
import { resolveVipCategoryMessage } from "@/app/utils/vipCategoryHelpers";

const initialForm = {
  entityType: "company",
  displayName: "",
  contactName: "",
  phone: "",
  email: "",
  countriesRoutes: "",
  licenses: "",
  experienceYears: "",
  notes: "",
};

function SectionCard({ title, description, children, step }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        {step ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-800">
            {step}
          </span>
        ) : null}
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
          {description ? <p className="mt-1 text-xs leading-6 text-slate-500 sm:text-sm">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function ReadOnlyField({ label, value, hint, dir }) {
  return (
    <div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
      <p
        className="mt-1.5 rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-2.5 text-sm font-medium text-slate-800"
        dir={dir}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function resolveVipMessage(vipCategories, categoryId, language, t) {
  return resolveVipCategoryMessage(vipCategories, categoryId, language, t) || t("tradeProviderVipMessage");
}

export default function TradeProviderRegisterForm() {
  const { t, isRTL, language } = useLanguage();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCategory = searchParams.get("category") || "";

  const categories = useMemo(() => getL1Categories(language), [language]);
  const [form, setForm] = useState(initialForm);
  const [selectedServices, setSelectedServices] = useState([]);
  const [vipCategories, setVipCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
      displayName: prev.entityType === "individual" ? profileFullName : prev.displayName,
      phone: prev.phone || user.mobile || user.phone || "",
      email: prev.email || user.email || "",
    }));
  }, [auth?.user, profileFullName]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.siteSettings.getVipPublic, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.success) {
          setVipCategories(data.data?.categories || {});
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!Object.keys(vipCategories).length) return;
    setSelectedServices((prev) => prev.filter((s) => !vipCategories[s.categoryId]?.enabled));
  }, [vipCategories]);

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/25";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setEntityType = (entityType) => {
    setForm((prev) => ({
      ...prev,
      entityType,
      displayName: entityType === "individual" ? profileFullName : prev.entityType === "individual" ? "" : prev.displayName,
      contactName: profileFullName,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const displayName =
      form.entityType === "individual" ? profileFullName : form.displayName.trim();
    const contactName = profileFullName;

    if (!displayName || !contactName || !form.phone.trim()) {
      setError(t("lcFormRequiredError"));
      showToast.error(t("lcFormRequiredError"));
      return;
    }

    if (!selectedServices.length) {
      const msg = t("tradeProviderNoServicesSelected");
      setError(msg);
      showToast.warning(msg);
      return;
    }

    const blockedVip = selectedServices.find((s) => vipCategories[s.categoryId]?.enabled);
    if (blockedVip) {
      const msg = resolveVipMessage(vipCategories, blockedVip.categoryId, language, t);
      setError(msg);
      showToast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        displayName,
        contactName,
        selectedServices: selectedServices.map(({ categoryId, subcategoryId }) => ({
          categoryId,
          subcategoryId,
        })),
        categoryId: selectedServices[0].categoryId,
        subcategoryIds: selectedServices.map((s) => s.subcategoryId),
      };

      const response = await fetch(API_ENDPOINTS.tradeServiceProviders.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
      setSuccess(true);
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
      <main className="mx-auto max-w-lg px-4 py-10" dir={isRTL ? "rtl" : "ltr"}>
        <div className="space-y-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-6 py-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
            ✓
          </div>
          <h1 className="text-xl font-bold text-slate-900">{t("lcFormSuccessTitle")}</h1>
          <p className="text-sm leading-7 text-slate-600">{successMessage || t("tradeProviderRegisterSuccess")}</p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Link
              href="/trade-services"
              className="inline-flex rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              {t("tradeServicesBrowseCta")}
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("home")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isCompany = form.entityType === "company";

  return (
    <main className="min-h-[70vh] bg-gradient-to-b from-emerald-50/40 via-white to-slate-50/80 pb-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <Link href="/trade-services" className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-900">
          ← {t("tradeServicesBrowseCta")}
        </Link>

        <header className="mt-4 mb-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-800 to-emerald-950 px-5 py-6 text-white shadow-lg sm:px-7 sm:py-8">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-200/90">{t("tradeServicesJoinBadge")}</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">{t("tradeProviderRegisterTitle")}</h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-emerald-50/90">{t("tradeProviderRegisterDesc")}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <SectionCard step="1" title={t("tradeProviderSectionProfile")}>
            <div className="grid grid-cols-2 gap-2 sm:max-w-md">
              {[
                { id: "company", label: t("tradeProviderEntityCompany") },
                { id: "individual", label: t("tradeProviderEntityIndividual") },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEntityType(opt.id)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    form.entityType === opt.id
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {isCompany ? (
              <label className="mt-4 block">
                <span className="text-sm font-medium text-slate-700">{t("tradeProviderCompanyName")} *</span>
                <input
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="مثلاً شرکت بازرسی آریا فولاد قرن"
                />
              </label>
            ) : (
              <div className="mt-4">
                <ReadOnlyField
                  label={t("tradeProviderProfileName")}
                  hint={t("tradeProviderProfileNameHint")}
                  value={profileFullName}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard step="2" title={t("tradeProviderSectionContact")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ReadOnlyField label={t("tradeProviderProfileName")} value={profileFullName} />
              <label className="block">
                <span className="text-sm font-medium text-slate-700">{t("lcFormPhone")} *</span>
                <input name="phone" value={form.phone} onChange={handleChange} required dir="ltr" className={`${inputClass} text-start`} />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">{t("lcFormEmail")}</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} dir="ltr" className={`${inputClass} text-start`} />
            </label>
          </SectionCard>

          <SectionCard
            step="3"
            title={t("tradeProviderSelectServices")}
            description={t("tradeProviderSelectServicesHint")}
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

          <SectionCard step="4" title={t("tradeProviderSectionExtra")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">{t("tradeProviderRoutes")}</span>
                <input name="countriesRoutes" value={form.countriesRoutes} onChange={handleChange} className={inputClass} placeholder="ایران — ترکیه — امارات" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">{t("tradeProviderLicenses")}</span>
                <textarea name="licenses" value={form.licenses} onChange={handleChange} rows={2} className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">{t("tradeProviderExperience")}</span>
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
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">{t("lcFormNotes")}</span>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={inputClass} />
              </label>
            </div>
          </SectionCard>

          <button
            type="submit"
            disabled={loading || auth?.loading}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:from-emerald-800 hover:to-emerald-900 disabled:opacity-60 sm:text-base"
          >
            {loading ? t("lcFormSubmitting") : t("tradeProviderRegisterCta")}
          </button>
        </form>
      </div>
    </main>
  );
}
