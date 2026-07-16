"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { useAuth } from "@/app/context/AuthContext";
import { authFetch } from "@/app/utils/authHeaders";

function formatToman(value) {
  if (!value) return "رایگان";
  return `${Number(value).toLocaleString("fa-IR")} تومان`;
}

export default function PricingPage() {
  const router = useRouter();
  const auth = useAuth();
  const [plans, setPlans] = useState([]);
  const [gateway, setGateway] = useState(null);
  const [myPlan, setMyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_ENDPOINTS.subscription.plans, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setPlans(json.data || []);
        setGateway(json.gateway || null);
      } else {
        setError(json.message || "خطا در دریافت بسته‌ها");
      }

      if (auth?.user) {
        const meRes = await authFetch(API_ENDPOINTS.subscription.me, { cache: "no-store" });
        const meJson = await meRes.json();
        if (meJson.success) setMyPlan(meJson.data);
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [auth?.user]);

  useEffect(() => {
    load();
  }, [load]);

  const startPay = async (plan) => {
    setError("");
    if (plan.isFree || plan.priceToman === 0) {
      router.push("/auth/register/complete");
      return;
    }
    if (!auth?.user) {
      router.push(`/auth/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    setPayingId(plan.id);
    try {
      const res = await authFetch(API_ENDPOINTS.subscription.checkout, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const json = await res.json();
      if (!json.success || !json.data?.paymentUrl) {
        setError(json.message || "امکان شروع پرداخت نبود");
        return;
      }
      window.location.href = json.data.paymentUrl;
    } catch {
      setError("خطا در شروع پرداخت");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-8 max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">اشتراک فروشندگان</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            بسته مناسب را انتخاب کنید تا آگهی‌هایتان بهتر دیده شوند. ارتباط با خریدار مستقیم و بدون واسطه است.
          </p>
          {myPlan?.planId && myPlan.planId !== "free" && myPlan.status === "active" ? (
            <p className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              اشتراک فعال: {myPlan.plan?.name || myPlan.planId}
            </p>
          ) : null}
        </header>

        {error ? (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${
                  plan.highlight ? "border-emerald-400 ring-2 ring-emerald-200" : "border-slate-200"
                }`}
              >
                {plan.badge ? (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-bold text-white">
                    {plan.badge}
                  </span>
                ) : null}
                <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
                <p className="mt-3 text-2xl font-extrabold tabular-nums text-emerald-800">
                  {formatToman(plan.priceToman)}
                </p>
                {plan.totalMonths > 0 ? (
                  <p className="mt-1 text-xs text-slate-500">مدت اعتبار: {plan.totalMonths.toLocaleString("fa-IR")} ماه</p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">شروع بدون هزینه</p>
                )}

                <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-700">
                  {(plan.features || []).map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-0.5 text-emerald-600">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={payingId === plan.id}
                  onClick={() => startPay(plan)}
                  className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-60 ${
                    plan.highlight
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                  }`}
                >
                  {payingId === plan.id
                    ? "در حال انتقال…"
                    : plan.isFree
                      ? "شروع رایگان"
                      : "انتخاب و پرداخت"}
                </button>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          <p className="font-semibold text-slate-800">نکات مهم</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>پرداخت از طریق درگاه اینترنتی زرین‌پال انجام می‌شود.</li>
            <li>
              وضعیت درگاه:{" "}
              {gateway?.configured ? (gateway.sandbox ? "حالت آزمایشی (Sandbox)" : "فعال") : "هنوز Merchant ID تنظیم نشده"}
            </li>
            <li>
              با خرید اشتراک، زارعون طرف معامله کالای شما نمی‌شود. جزئیات در{" "}
              <Link href="/terms" className="text-emerald-700 hover:underline">
                قوانین و مقررات
              </Link>{" "}
              آمده است.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
