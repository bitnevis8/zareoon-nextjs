"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardBreadcrumb from "../components/dashboard/DashboardBreadcrumb";
import DashboardShell from "../components/dashboard/DashboardShell";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

function EmailVerificationBanner({
  user,
  setUser,
  emailVerificationCode,
  setEmailVerificationCode,
  verificationError,
  setVerificationError,
  verificationSuccess,
  setVerificationSuccess,
  resendLoading,
  setResendLoading,
}) {
  const t = useTranslations("layout.emailVerification");

  const handleVerifyEmail = async () => {
    setVerificationError(null);
    setVerificationSuccess(null);
    if (!user?.email) {
      setVerificationError(t("errorUserEmailUnavailable"));
      return;
    }
    if (!emailVerificationCode) {
      setVerificationError(t("errorCodeRequired"));
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, code: emailVerificationCode }),
      });
      const data = await response.json();
      if (data.success) {
        setVerificationSuccess(data.message);
        if (setUser) setUser({ ...user, isEmailVerified: true });
      } else {
        setVerificationError(data.message || t("errorVerifyFailed"));
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      setVerificationError(t("errorServer"));
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setVerificationError(null);
    setVerificationSuccess(null);
    if (!user?.email) {
      setVerificationError(t("errorUserEmailUnavailable"));
      setResendLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/resend-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await response.json();
      if (data.success) {
        setVerificationSuccess(data.message);
      } else {
        setVerificationError(data.message || t("errorResendFailed"));
      }
    } catch (error) {
      console.error("Error resending code:", error);
      setVerificationError(t("errorServer"));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4" role="alert">
      <p className="text-sm font-semibold text-amber-900">{t("title")}</p>
      <p className="mt-1 text-xs leading-6 text-amber-800">{t("prompt", { email: user.email })}</p>

      {verificationError ? (
        <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {verificationError}
        </p>
      ) : null}
      {verificationSuccess ? (
        <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {verificationSuccess}
        </p>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          placeholder={t("codePlaceholder")}
          className="h-9 flex-1 rounded-md border border-amber-200 bg-white px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          value={emailVerificationCode || ""}
          onChange={(e) => setEmailVerificationCode(e.target.value)}
        />
        <button
          type="button"
          onClick={handleVerifyEmail}
          className="h-9 rounded-md bg-amber-600 px-4 text-sm font-medium text-white hover:bg-amber-700"
        >
          {t("verifyButton")}
        </button>
        <button
          type="button"
          onClick={handleResendCode}
          disabled={resendLoading}
          className="h-9 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {resendLoading ? t("resending") : t("resend")}
        </button>
      </div>
    </div>
  );
}

function DashboardLayoutContent({ children }) {
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  const auth = useAuth();
  const { user, loading, setUser } = auth || { user: null, loading: false, setUser: undefined };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const alert =
    user && user.email && !user.isEmailVerified ? (
      <EmailVerificationBanner
        user={user}
        setUser={setUser}
        emailVerificationCode={emailVerificationCode}
        setEmailVerificationCode={setEmailVerificationCode}
        verificationError={verificationError}
        setVerificationError={setVerificationError}
        verificationSuccess={verificationSuccess}
        setVerificationSuccess={setVerificationSuccess}
        resendLoading={resendLoading}
        setResendLoading={setResendLoading}
      />
    ) : null;

  const breadcrumb = (
    <Suspense fallback={<div className="mb-2 h-5 animate-pulse rounded bg-slate-200 md:mb-4" />}>
      <DashboardBreadcrumb />
    </Suspense>
  );

  return (
    <DashboardShell breadcrumb={breadcrumb} alert={alert}>
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  );
}
