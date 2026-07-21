"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import AuthShell, {
  AuthField,
  authInputClass,
} from "../../components/auth/AuthShell";

function LoginForm() {
  const t = useTranslations("auth");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.mustChangePassword) router.replace("/auth/set-password");
      else router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError(t("termsRequired"));
      return;
    }
    const mobile = identifier.trim();
    if (!/^09\d{9}$/.test(mobile)) {
      setError("شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.auth.checkIdentifier, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier: mobile }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || t("checkError"));
        return;
      }
      if (data.data?.userExists) {
        router.push(`/auth/login/password?identifier=${encodeURIComponent(mobile)}`);
      } else {
        router.push(`/auth/verification/code?identifier=${encodeURIComponent(mobile)}&action=register`);
      }
    } catch {
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <AuthShell title={t("loginRegisterTitle")} subtitle={t("loginRegisterSubtitle")}>
        <p className="text-center text-sm text-slate-500">{t("loading")}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("loginRegisterTitle")}
      subtitle={t("loginRegisterSubtitle")}
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label={t("mobileLabel")} error={error}>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            dir="ltr"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder={t("mobilePlaceholder")}
            className={`${authInputClass} text-center text-base tracking-[0.18em]`}
            required
          />
        </AuthField>

        <label className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>{t("termsAcceptLabel")}</span>
        </label>

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("checking") : t("continue")}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">...</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
