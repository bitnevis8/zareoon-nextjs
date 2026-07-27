"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { dash } from "@/app/components/dashboard/dashboardTheme";

export default function BarterInboxPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API_ENDPOINTS.barter.inbox}?limit=50`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "خطا");
      setItems(Array.isArray(json?.data) ? json.data : []);
    } catch (e) {
      setError(e.message || "خطا در دریافت");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={`${dash.page} space-y-4`} dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">صندوق معاوضه</h1>
          <p className="mt-1 text-sm text-slate-500">
            پیشنهادهایی که فروشندگان دیگر می‌خواهند با کالای شما معاوضه کنند.
          </p>
        </div>
        <Link href="/barter" className={`${dash.btnSecondary} text-xs`}>
          بازار معاوضه
        </Link>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-400">در حال بارگذاری…</p>
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : !items.length ? (
        <div className={`${dash.card} ${dash.cardBody} text-center`}>
          <p className="text-sm font-semibold text-slate-700">اعلان معاوضه‌ای ندارید</p>
          <p className="mt-1 text-xs text-slate-500">وقتی کسی دسته کالا یا خدمات شما را برای معاوضه اعلام کند، اینجا می‌آید.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const lot = n.inventoryLot || {};
            const productName = lot.product?.name || "محصول";
            const want =
              lot.barterDesiredName ||
              lot.barterDesiredCategoryLabel ||
              (lot.barterDesiredKind === "service" ? "خدمت" : "—");
            const unread = !n.readAt;
            return (
              <li key={n.id}>
                <Link
                  href={`/dashboard/barter-inbox/${lot.id || n.inventoryLotId}`}
                  className={`block rounded-xl border px-4 py-3 transition hover:border-amber-300 hover:bg-amber-50/40 ${
                    unread ? "border-amber-300 bg-amber-50/50" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`text-sm ${unread ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                        {productName} ↔ {want}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {lot.barterDesiredKind === "service" ? "کالا به خدمات" : "کالا به کالا"} ·{" "}
                        {lot.barterDesiredCategoryLabel || "بدون دسته"} ·{" "}
                        {lot.barterAnnounceMode === "announce" ? "اعلام‌شده" : "بی‌صدا"}
                      </p>
                    </div>
                    {unread ? (
                      <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        جدید
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
