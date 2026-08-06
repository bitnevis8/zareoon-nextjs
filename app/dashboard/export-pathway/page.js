"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useRequireSupplierArea } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";

function statusMeta(status) {
  if (status === "completed") return { text: "تکمیل‌شده", className: "bg-emerald-100 text-emerald-800" };
  if (status === "on_hold") return { text: "متوقف", className: "bg-amber-100 text-amber-800" };
  if (status === "cancelled") return { text: "لغو شده", className: "bg-slate-100 text-slate-600" };
  if (status === "draft") return { text: "پیش‌نویس", className: "bg-slate-100 text-slate-600" };
  return { text: "فعال", className: "bg-sky-100 text-sky-800" };
}

export default function ExportPathwayListPage() {
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope") || "own";
  const { allowed, loading: authLoading } = useRequireSupplierArea(scope);

  const [items, setItems] = useState([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(API_ENDPOINTS.exportPathway.list, { cache: "no-store" });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "خطا در بارگذاری");
      setItems(Array.isArray(json.data?.items) ? json.data.items : []);
      setDisclaimer(json.data?.disclaimer || "");
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && allowed) load();
  }, [authLoading, allowed, load]);

  if (authLoading || !allowed) {
    return <div className={dash.empty}>در حال بررسی دسترسی…</div>;
  }

  return (
    <div className={dash.page}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={dash.pageTitle}>مسیر صادرات</h1>
          <p className={dash.pageSubtitle}>
            برای هر محموله یک پروژه بسازید و مرحله‌به‌مرحله تا تحویل پیش بروید.
          </p>
        </div>
        <Link href="/dashboard/export-pathway/create?scope=own" className={dash.btnPrimary}>
          ایجاد مسیر صادرات
        </Link>
      </div>

      {disclaimer ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-950">
          {disclaimer}
        </div>
      ) : null}

      {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <div className={dash.empty}>در حال بارگذاری…</div>
      ) : items.length === 0 ? (
        <div className={`${dash.card} ${dash.cardBody}`}>
          <p className="text-sm text-slate-600">هنوز پروژه‌ای ندارید.</p>
          <Link href="/dashboard/export-pathway/create?scope=own" className={`${dash.btnPrimary} mt-4`}>
            اولین پروژه صادرات را بسازید
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const st = statusMeta(item.status);
            return (
              <li key={item.id} className={dash.card}>
                <div className={dash.cardBody}>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-400">{item.referenceCode}</p>
                      <h2 className="mt-1 text-sm font-semibold text-slate-900">{item.title}</h2>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.className}`}>{st.text}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.originCountry || "IR"} → {item.destinationCountry || "—"} · {item.exportFamily}
                  </p>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                      <span>پیشرفت</span>
                      <span>{item.progressPercent || 0}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${Math.min(100, Number(item.progressPercent) || 0)}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/export-pathway/${item.id}?scope=own`}
                    className={`${dash.btnSecondary} mt-4 w-full`}
                  >
                    ادامه مسیر
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
