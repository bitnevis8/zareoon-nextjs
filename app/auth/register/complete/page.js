"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";
import AuthShell, { AuthField, AuthPrimaryButton, authInputClass } from "../../../components/auth/AuthShell";

function CompleteForm() {
  const t = useTranslations("auth");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    acceptTerms: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();

  useEffect(() => {
    const id = searchParams.get("identifier");
    if (id && /^09\d{9}$/.test(id)) {
      setForm((prev) => ({ ...prev, mobile: id }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.mustChangePassword ? "/auth/set-password" : "/dashboard");
    }
  }, [user, authLoading, router]);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.firstName.trim()) return setError(t("firstNameRequired"));
    if (!form.lastName.trim()) return setError(t("lastNameRequired"));
    if (form.password.length < 6) return setError(t("passwordMinLength"));
    if (form.password !== form.confirmPassword) return setError(t("passwordMismatch"));
    if (!form.acceptTerms) return setError(t("termsRequired"));

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.completeRegistration, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          mobile: form.mobile,
          password: form.password,
          acceptTerms: true,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || t("registrationError"));
        return;
      }
      await login(data.data?.user, data.data?.token);
      router.push("/dashboard");
    } catch {
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <AuthShell title={t("completeRegistrationTitle")}>
        <p className="text-center text-sm text-slate-500">{t("loading")}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("completeRegistrationTitle")}
      footer={
        <p className="text-center text-[11px] leading-5 text-slate-500">
          {t("termsPrefix")}{" "}
          <Link href="/terms" className="font-semibold text-emerald-700 hover:underline">
            {t("termsLink")}
          </Link>{" "}
          {t("termsSuffix")}
        </p>
      }
    >
      <p className="mb-5 text-sm leading-6 text-slate-600">{t("completeRegistrationSubtitle")}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AuthField label={t("firstNameLabel")}>
            <input
              name="firstName"
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              placeholder={t("firstNamePlaceholder")}
              className={authInputClass}
              required
              autoComplete="given-name"
            />
          </AuthField>
          <AuthField label={t("lastNameLabel")}>
            <input
              name="lastName"
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              placeholder={t("lastNamePlaceholder")}
              className={authInputClass}
              required
              autoComplete="family-name"
            />
          </AuthField>
        </div>

        <AuthField label={t("mobileLabelLocked")} hint={t("mobileLockedHint")}>
          <input
            type="tel"
            dir="ltr"
            value={form.mobile}
            readOnly
            disabled
            className={`${authInputClass} text-center tracking-wider`}
          />
        </AuthField>

        <AuthField label={t("passwordLabel")}>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            placeholder={t("passwordPlaceholder")}
            className={authInputClass}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </AuthField>

        <AuthField label={t("confirmPasswordLabel")}>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
            placeholder={t("confirmPasswordPlaceholder")}
            className={authInputClass}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </AuthField>

        <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-600">
          <input
            type="checkbox"
            checked={form.acceptTerms}
            onChange={(e) => setField("acceptTerms", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600"
          />
          <span>{t("termsAcceptLabel")}</span>
        </label>

        {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

        <AuthPrimaryButton loading={loading} loadingText={t("completing")} showArrow={false}>
          {t("completeRegistrationBtn")}
        </AuthPrimaryButton>
      </form>
    </AuthShell>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">...</div>}>
      <CompleteForm />
    </Suspense>
  );
}
