"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";
import AuthShell, {
  AuthField,
  AuthPrimaryButton,
  authInputClass,
  authGhostBtnClass,
} from "../../../components/auth/AuthShell";
import SmsCountdown from "../../../components/auth/SmsCountdown";
import { getSafeNextPath } from "../../../utils/safeAuthRedirect";

const TEMP_PASSWORD_MS = 5 * 60 * 1000;

function PasswordForm() {
  const t = useTranslations("auth");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotSent, setForgotSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [smsLocked, setSmsLocked] = useState(false);
  const [smsActive, setSmsActive] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();
  const nextPath = getSafeNextPath(searchParams.get("next"));

  useEffect(() => {
    const id = searchParams.get("identifier");
    if (id) setIdentifier(id);
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.mustChangePassword) router.replace("/auth/set-password");
      else router.replace(nextPath);
    }
  }, [user, authLoading, router, nextPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password, rememberMe }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || t("wrongPassword"));
        return;
      }
      await login(data.data?.user, data.data?.token);
      if (data.data?.mustChangePassword || data.data?.user?.mustChangePassword) {
        router.push("/auth/set-password");
      } else {
        router.push(nextPath);
      }
    } catch {
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setForgotLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.auth.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mobile: identifier }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || t("sendCodeError"));
        return;
      }
      setForgotSent(true);
      setPassword("");
      setSmsLocked(true);
      setSmsActive(false);
      requestAnimationFrame(() => setSmsActive(true));
    } catch {
      setError(t("serverError"));
    } finally {
      setForgotLoading(false);
    }
  };

  const onExpire = useCallback(() => {
    setSmsLocked(false);
  }, []);

  if (authLoading) {
    return (
      <AuthShell title={t("loginTitle")}>
        <p className="text-center text-sm text-slate-500">{t("loading")}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("loginTitle")}>
      <p className="mb-4 text-sm text-slate-600">
        {t("loginWith", { identifier })}
      </p>
      <p className="mb-5 text-xs leading-5 text-slate-500">
        {forgotSent ? t("forgotPasswordSent") : t("passwordHint")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          label={t("passwordLabel")}
          error={error}
          hint={forgotSent ? t("tempPasswordHint") : undefined}
        >
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              className={`${authInputClass} pe-16`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 left-2 my-auto h-9 rounded-lg px-2 text-xs font-semibold text-emerald-700"
            >
              {showPassword ? "مخفی" : "نمایش"}
            </button>
          </div>
        </AuthField>

        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600"
          />
          {t("rememberMe")}
        </label>

        <AuthPrimaryButton loading={loading} loadingText={t("loggingIn")} showArrow={false}>
          {t("loginTitle")}
        </AuthPrimaryButton>
      </form>

      <button
        type="button"
        onClick={handleForgot}
        disabled={forgotLoading || smsLocked}
        className={`${authGhostBtnClass} mt-3`}
      >
        {forgotLoading ? t("forgotPasswordSending") : t("forgotPassword")}
      </button>

      <SmsCountdown
        active={smsActive}
        durationMs={TEMP_PASSWORD_MS}
        onExpire={onExpire}
        labelRemaining={(time) => t("timerTempRemaining", { time })}
        labelExpired={t("timerTempExpired")}
      />

      <button
        type="button"
        onClick={() => router.push("/auth/login")}
        className="mt-4 w-full text-center text-sm font-semibold text-slate-500 hover:text-emerald-700"
      >
        {t("changeMobile")}
      </button>
    </AuthShell>
  );
}

export default function LoginPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">...</div>}>
      <PasswordForm />
    </Suspense>
  );
}
