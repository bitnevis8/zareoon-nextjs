"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { API_ENDPOINTS } from "@/app/config/api";
import AuthShell, { AuthField, AuthPrimaryButton, authInputClass } from "@/app/components/auth/AuthShell";

function SetPasswordForm() {
  const t = useTranslations("auth");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (!user.mustChangePassword) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) return setError(t("passwordMinLength"));
    if (newPassword !== confirmPassword) return setError(t("passwordMismatch"));

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.setNewPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || t("serverError"));
        return;
      }
      if (data.data?.user) {
        await login(data.data.user);
      }
      router.push("/dashboard");
    } catch {
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <AuthShell title={t("setPasswordTitle")}>
        <p className="text-center text-sm text-slate-500">{t("loading")}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("setPasswordTitle")}>
      <p className="mb-5 text-sm leading-6 text-slate-600">{t("setPasswordSubtitle")}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label={t("passwordLabel")}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={authInputClass}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </AuthField>
        <AuthField label={t("confirmPasswordLabel")}>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={authInputClass}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </AuthField>
        {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
        <AuthPrimaryButton loading={loading} loadingText={t("savingPassword")} showArrow={false}>
          {t("setPasswordBtn")}
        </AuthPrimaryButton>
      </form>
    </AuthShell>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">...</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}
