"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";
import { shouldShowSellerPanel } from "@/app/utils/roles";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";

export default function SellerJoinPage() {
  const { t, isRTL } = useLanguage();
  const auth = useAuth();
  const router = useRouter();
  const { setPersona } = useDashboardPersona();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const alreadySeller = shouldShowSellerPanel(auth?.user);

  const join = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await authFetch(API_ENDPOINTS.auth.becomeSeller, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || t("sellerJoinError"));
        return;
      }
      if (data.data) {
        auth.updateUser(data.data);
      } else {
        const me = await authFetch(API_ENDPOINTS.auth.me, { credentials: "include" });
        const meData = await me.json();
        if (meData.success && meData.data) auth.updateUser(meData.data);
      }
      setPersona(DASHBOARD_PERSONAS.SELLER);
      router.push("/dashboard/supplier-profile");
    } catch (e) {
      console.error(e);
      setError(t("sellerJoinError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-[0_16px_40px_-24px_rgba(6,78,59,0.35)]">
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 px-5 py-6 text-white sm:px-7">
          <p className="text-xs font-bold text-emerald-100/90">{t("sellerJoinBadge")}</p>
          <h1 className="mt-2 text-xl font-black sm:text-2xl">{t("sellerJoinTitle")}</h1>
          <p className="mt-2 text-sm leading-7 text-emerald-50/95">{t("sellerJoinDesc")}</p>
        </div>

        <div className="space-y-4 px-5 py-6 sm:px-7">
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            <li className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              <span>{t("sellerJoinPoint1")}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              <span>{t("sellerJoinPoint2")}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              <span>{t("sellerJoinPoint3")}</span>
            </li>
          </ul>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          {alreadySeller ? (
            <Link
              href="/dashboard/supplier-profile"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              {t("sellerJoinGoProfile")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={join}
              disabled={loading || !auth?.user}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t("sellerJoinSubmitting") : t("sellerJoinCta")}
            </button>
          )}

          <p className="text-center text-xs text-slate-500">
            <Link href="/dashboard" className="font-semibold text-emerald-800 hover:underline">
              {t("sellerJoinBack")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
