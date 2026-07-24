"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useAuth } from "@/app/context/AuthContext";

function CallbackInner() {
  const params = useSearchParams();
  const auth = useAuth();
  const [state, setState] = useState({ loading: true, ok: false, message: "", refId: "" });

  useEffect(() => {
    const trackId =
      params.get("trackId") || params.get("Authority") || params.get("authority") || "";
    const success = params.get("success");
    const status = params.get("status") || params.get("Status") || "";

    const run = async () => {
      if (!trackId) {
        setState({ loading: false, ok: false, message: "کد پیگیری پرداخت یافت نشد", refId: "" });
        return;
      }

      try {
        const endpoint = auth?.user ? API_ENDPOINTS.subscription.verify : API_ENDPOINTS.subscription.verifyPublic;
        const fetcher = auth?.user ? authFetch : fetch;
        const res = await fetcher(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId, success, status, authority: trackId }),
        });
        const json = await res.json();
        if (json.success) {
          setState({
            loading: false,
            ok: true,
            message: "پرداخت با موفقیت تأیید و اشتراک فعال شد.",
            refId: json.data?.refId || json.data?.subscription?.refId || "",
          });
        } else {
          setState({ loading: false, ok: false, message: json.message || "تأیید پرداخت ناموفق بود", refId: "" });
        }
      } catch {
        setState({ loading: false, ok: false, message: "خطا در ارتباط با سرور", refId: "" });
      }
    };

    run();
  }, [params, auth?.user]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      {state.loading ? (
        <>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-600">در حال تأیید پرداخت…</p>
        </>
      ) : (
        <>
          <h1 className={`text-xl font-bold ${state.ok ? "text-emerald-800" : "text-rose-700"}`}>
            {state.ok ? "پرداخت موفق" : "پرداخت ناموفق"}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">{state.message}</p>
          {state.refId ? (
            <p className="mt-2 text-xs text-slate-500" dir="ltr">
              کد پیگیری: {state.refId}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/pricing" className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50">
              بازگشت به اشتراک‌ها
            </Link>
            <Link href="/dashboard" className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
              داشبورد
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function PricingCallbackPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <Suspense fallback={<div className="text-center text-sm text-slate-500">در حال بارگذاری…</div>}>
        <CallbackInner />
      </Suspense>
    </div>
  );
}
