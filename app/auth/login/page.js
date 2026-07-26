"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import AuthShell, { AuthPrimaryButton } from "../../components/auth/AuthShell";
import AuthIdentifierFields, {
  buildAuthIdentifier,
} from "../../components/auth/AuthIdentifierFields";
import { DEFAULT_AUTH_SIGNUP_CONFIG } from "../../config/phoneCountries";
import { getSafeNextPath } from "../../utils/safeAuthRedirect";

function LoginForm() {
  const t = useTranslations("auth");
  const [cfg, setCfg] = useState(DEFAULT_AUTH_SIGNUP_CONFIG);
  const [mode, setMode] = useState("phone");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("IR");
  const [nationalNumber, setNationalNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const nextQuery = nextPath !== "/dashboard" ? `&next=${encodeURIComponent(nextPath)}` : "";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.siteSettings.getAuthSignupPublic, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled && data.success && data.data) {
          const next = { ...DEFAULT_AUTH_SIGNUP_CONFIG, ...data.data };
          setCfg(next);
          setCountryCode(next.defaultPhoneCountry || "IR");
          if (!next.phoneEnabled && next.emailEnabled) setMode("email");
          else if (next.phoneEnabled) setMode("phone");
          else if (next.emailEnabled) setMode("email");
        }
      } catch {
        /* defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.mustChangePassword) router.replace("/auth/set-password");
      else router.replace(nextPath);
    }
  }, [user, authLoading, router, nextPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError(t("termsRequired"));
      return;
    }
    const built = buildAuthIdentifier({ mode, email, countryCode, nationalNumber });
    if (!built.ok) {
      setError(built.message);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.auth.checkIdentifier, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier: built.identifier,
          countryCode: built.countryCode,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || t("checkError"));
        return;
      }
      const id = encodeURIComponent(built.identifier);
      if (data.data?.userExists) {
        router.push(`/auth/login/password?identifier=${id}${nextQuery}`);
      } else {
        router.push(
          `/auth/verification/code?identifier=${id}&action=register&channel=${
            built.isEmail ? "email" : "phone"
          }${nextQuery}`
        );
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

  const subtitle =
    cfg.emailEnabled && cfg.phoneEnabled
      ? "با موبایل یا ایمیل وارد شوید یا حساب بسازید"
      : cfg.emailEnabled
        ? "با ایمیل وارد شوید یا حساب بسازید"
        : "با شماره موبایل وارد شوید یا حساب بسازید";

  return (
    <AuthShell
      title={t("loginRegisterTitle")}
      subtitle={subtitle}
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
        <AuthIdentifierFields
          mode={mode}
          onModeChange={setMode}
          email={email}
          onEmailChange={setEmail}
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          nationalNumber={nationalNumber}
          onNationalNumberChange={setNationalNumber}
          allowedPhoneCountries={cfg.allowedPhoneCountries}
          emailEnabled={cfg.emailEnabled}
          phoneEnabled={cfg.phoneEnabled}
          error={error}
        />

        <label className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>{t("termsAcceptLabel")}</span>
        </label>

        <AuthPrimaryButton loading={loading} loadingText={t("checking")}>
          {t("continue")}
        </AuthPrimaryButton>
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
