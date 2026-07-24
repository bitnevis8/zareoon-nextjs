"use client";

import { useEffect, useState } from "react";
import AvatarUpload from "@/app/components/ui/AvatarUpload";
import DocumentUpload from "@/app/components/ui/DocumentUpload";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

function Field({ label, children, hint, className = "" }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-xs font-semibold text-slate-600">{label}</label>
      {children}
      {hint ? <p className="text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="mb-3 text-sm font-bold text-slate-800 sm:mb-3.5">{children}</h2>;
}

function Divider() {
  return <div className="my-4 border-t border-slate-100 sm:my-5" />;
}

function IdDocumentIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6a.75.75 0 010 1.5H7A.75.75 0 017 5zm0 3h6a.75.75 0 010 1.5H7A.75.75 0 017 8zm0 3h3.5a.75.75 0 010 1.5H7A.75.75 0 017 11z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ProfileTabIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
    </svg>
  );
}

export default function AccountPageContent() {
  const { user, updateUser, checkAuthStatus } = useAuth();
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("profile");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    nationalId: "",
    address: "",
    postalCode: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        const result = await response.json();
        if (!active) return;

        if (result.success && result.data) {
          const data = result.data;
          updateUser(data);
          setForm((prev) => ({
            ...prev,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            fatherName: data.fatherName || "",
            nationalId: data.nationalId || "",
            address: data.address || "",
            postalCode: data.postalCode || "",
            email: data.email || "",
            phone: data.phone || "",
          }));
        }
      } catch {
        if (active) setError(t("profileUpdateFailed"));
      } finally {
        if (active) setLoadingProfile(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (result.success) {
        updateUser(result.data);
        setForm((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setMessage(result.message || t("profileUpdated"));
        await checkAuthStatus();
      } else {
        setError(result.message || t("profileUpdateFailed"));
      }
    } catch {
      setError(t("profileUpdateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: t("profile"), accent: false },
    { id: "documents", label: t("accountTabDocuments"), accent: true },
  ];

  if (loadingProfile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const displayName = [form.firstName, form.lastName].filter(Boolean).join(" ") || user?.username || "";

  return (
    <div className={`mx-auto max-w-5xl ${isRTL ? "text-right" : "text-left"}`}>
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{t("account")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("accountPageSubtitle")}</p>
        </div>
        {activeTab === "profile" ? (
          <button
            type="submit"
            form="account-form"
            disabled={saving}
            className="hidden shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 lg:inline-flex"
          >
            {saving ? t("saving") : t("saveChanges")}
          </button>
        ) : null}
      </div>

      {message ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/60 px-2 pt-2 sm:px-4">
          <nav className="flex gap-1.5 overflow-x-auto pb-0.5" aria-label={t("account")}>
            {tabs.map((tab) => {
              const selected = activeTab === tab.id;
              if (tab.accent) {
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-t-xl border px-3 py-2.5 text-xs font-black transition sm:px-4 sm:text-sm ${
                      selected
                        ? "border-amber-300 border-b-white bg-white text-amber-800 shadow-sm"
                        : "border-amber-200/80 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-950"
                    }`}
                  >
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
                        selected ? "bg-amber-100 text-amber-700" : "bg-amber-200/70 text-amber-800"
                      }`}
                    >
                      <IdDocumentIcon className="h-4 w-4" />
                    </span>
                    {tab.label}
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-t-xl border px-3 py-2.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                    selected
                      ? "border-slate-200 border-b-white bg-white text-emerald-700"
                      : "border-transparent text-slate-500 hover:bg-white/70 hover:text-slate-700"
                  }`}
                >
                  <ProfileTabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {activeTab === "profile" ? (
          <form id="account-form" onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-[minmax(0,220px)_1fr]">
              <aside className="border-b border-slate-100 bg-gradient-to-b from-emerald-50/60 to-white px-4 py-5 lg:border-b-0 lg:border-e lg:px-5 lg:py-6">
                <div className="lg:sticky lg:top-4">
                  <AvatarUpload
                    currentAvatar={user?.avatar}
                    onUploadSuccess={() => checkAuthStatus()}
                    variant="profile"
                    purpose="user"
                    hint="دایره — پس از انتخاب، ناحیه نمایش را با کراپ تنظیم کنید"
                  />
                  {displayName ? (
                    <p className="mt-4 text-center text-sm font-bold text-slate-800 lg:mt-5">{displayName}</p>
                  ) : null}
                  {user?.mobile ? (
                    <p className="mt-0.5 text-center text-xs text-slate-500" dir="ltr">
                      {user.mobile}
                    </p>
                  ) : null}
                </div>
              </aside>

              <div className="px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
                <SectionTitle>{t("personalInfo")}</SectionTitle>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Field label={t("firstName")}>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.firstName}
                      onChange={handleChange("firstName")}
                      required
                    />
                  </Field>
                  <Field label={t("lastName")}>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.lastName}
                      onChange={handleChange("lastName")}
                      required
                    />
                  </Field>
                  <Field label={t("fatherName")}>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.fatherName}
                      onChange={handleChange("fatherName")}
                    />
                  </Field>
                  <Field label={t("nationalId")}>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.nationalId}
                      onChange={handleChange("nationalId")}
                      inputMode="numeric"
                    />
                  </Field>
                </div>

                <Divider />

                <SectionTitle>{t("contactInfo")}</SectionTitle>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <Field label={t("email")}>
                    <input
                      type="email"
                      className={inputClass}
                      value={form.email}
                      onChange={handleChange("email")}
                    />
                  </Field>
                  <Field label={t("phone")}>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.phone}
                      onChange={handleChange("phone")}
                    />
                  </Field>
                  <Field label={t("mobile")} hint={t("readOnlyField")}>
                    <input
                      type="text"
                      className={inputClass}
                      value={user?.mobile || ""}
                      disabled
                      readOnly
                      dir="ltr"
                    />
                  </Field>
                </div>

                <Divider />

                <SectionTitle>{t("address")}</SectionTitle>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_160px]">
                  <Field label={t("address")}>
                    <textarea
                      rows={2}
                      className={`${inputClass} min-h-[4.5rem] resize-y`}
                      value={form.address}
                      onChange={handleChange("address")}
                    />
                  </Field>
                  <Field label={t("postalCode")}>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.postalCode}
                      onChange={handleChange("postalCode")}
                      inputMode="numeric"
                    />
                  </Field>
                </div>

                <Divider />

                <button
                  type="button"
                  onClick={() => setPasswordOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <span>{t("changePassword")}</span>
                  <svg
                    className={`h-4 w-4 text-slate-400 transition ${passwordOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {passwordOpen ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <p className="col-span-full text-xs text-slate-500">{t("changePasswordHint")}</p>
                    <Field label={t("currentPassword")}>
                      <input
                        type="password"
                        className={inputClass}
                        value={form.currentPassword}
                        onChange={handleChange("currentPassword")}
                        autoComplete="current-password"
                      />
                    </Field>
                    <Field label={t("newPassword")}>
                      <input
                        type="password"
                        className={inputClass}
                        value={form.newPassword}
                        onChange={handleChange("newPassword")}
                        autoComplete="new-password"
                      />
                    </Field>
                    <Field label={t("confirmPassword")}>
                      <input
                        type="password"
                        className={inputClass}
                        value={form.confirmPassword}
                        onChange={handleChange("confirmPassword")}
                        autoComplete="new-password"
                      />
                    </Field>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-6">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
              >
                {saving ? t("saving") : t("saveChanges")}
              </button>
            </div>
          </form>
        ) : null}

        {activeTab === "documents" ? (
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <SectionTitle>{t("accountTabDocuments")}</SectionTitle>
            <p className="mb-4 text-sm text-slate-500">{t("accountDocumentsHint")}</p>
            <DocumentUpload />
          </div>
        ) : null}
      </div>
    </div>
  );
}
