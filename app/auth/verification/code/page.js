"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";
import AuthShell, { authPrimaryBtnClass, authGhostBtnClass } from "../../../components/auth/AuthShell";
import SmsCountdown from "../../../components/auth/SmsCountdown";

function VerificationForm() {
  const t = useTranslations("auth");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [smsActive, setSmsActive] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [action, setAction] = useState("register");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();

  useEffect(() => {
    setIdentifier(searchParams.get("identifier") || "");
    setAction(searchParams.get("action") || "register");
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.mustChangePassword ? "/auth/set-password" : "/dashboard");
    }
  }, [user, authLoading, router]);

  const sendCode = useCallback(async () => {
    if (!identifier) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.auth.sendCodeForRegistration, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mobile: identifier }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || t("sendCodeError"));
        setCanResend(true);
        return;
      }
      setSmsActive(false);
      setCanResend(false);
      requestAnimationFrame(() => setSmsActive(true));
    } catch {
      setError(t("serverError"));
      setCanResend(true);
    } finally {
      setSending(false);
    }
  }, [identifier, t]);

  useEffect(() => {
    if (identifier && action === "register") {
      sendCode();
    }
  }, [identifier, action, sendCode]);

  const submitCode = async (codeStr) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.auth.verifyCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, code: codeStr, action: "register" }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || t("wrongCode"));
        setDigits(["", "", "", "", "", ""]);
        return;
      }
      router.push(`/auth/register/complete?identifier=${encodeURIComponent(identifier)}`);
    } catch {
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  const onDigitChange = (index, value) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    if (v && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (next.every((d) => d) && next.join("").length === 6) {
      submitCode(next.join(""));
    }
  };

  const onKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  if (authLoading) {
    return (
      <AuthShell title={t("verifyCodeTitle")}>
        <p className="text-center text-sm text-slate-500">{t("loading")}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("verifyCodeTitle")}>
      <p className="mb-5 text-center text-sm leading-6 text-slate-600">
        {t("codeSentTo", { identifier })}
      </p>

      <div className="mb-2 flex justify-center gap-2 dir-ltr" dir="ltr">
        {digits.map((d, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={d}
            onChange={(e) => onDigitChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="h-12 w-10 rounded-xl border border-slate-200 text-center text-lg font-bold text-slate-900 shadow-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15 sm:h-14 sm:w-11"
            disabled={loading}
          />
        ))}
      </div>

      {error ? <p className="mt-3 text-center text-xs font-medium text-red-600">{error}</p> : null}
      {loading || sending ? (
        <p className="mt-3 text-center text-xs text-slate-500">
          {loading ? t("checking") : t("sending")}
        </p>
      ) : null}

      <SmsCountdown
        active={smsActive}
        onExpire={() => setCanResend(true)}
        labelRemaining={(time) => t("timerRemaining", { time })}
        labelExpired={t("timerExpired")}
      />

      <button
        type="button"
        disabled={!canResend || sending}
        onClick={sendCode}
        className={`${authGhostBtnClass} mt-4`}
      >
        {sending ? t("sending") : t("resendCode")}
      </button>

      <button
        type="button"
        onClick={() => router.push("/auth/login")}
        className="mt-3 w-full text-center text-sm font-semibold text-slate-500 hover:text-emerald-700"
      >
        {t("changeMobile")}
      </button>

      <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">{t("blacklistHint")}</p>
    </AuthShell>
  );
}

export default function VerificationCodePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">...</div>}>
      <VerificationForm />
    </Suspense>
  );
}
