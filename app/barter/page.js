"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";

function productLabel(lot) {
  return lot?.product?.name || lot?.englishName || "محصول";
}

export default function PublicBarterPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const url = new URL(API_ENDPOINTS.barter.offers);
      url.searchParams.set("limit", "48");
      if (query.trim()) url.searchParams.set("q", query.trim());
      const res = await fetch(url.toString(), { cache: "no-store" });
      const json = await res.json();
      setItems(Array.isArray(json?.data) ? json.data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8" dir="rtl">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-bold text-amber-700">بازار معاوضه زارعون</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">معاوضه کالا به کالا و کالا به خدمات</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          فروشندگانی که آماده‌اند محصول خود را با کالای دیگر یا خدمات بازرگانی عوض کنند. پیشنهادها را ببینید و برای هماهنگی گفتگو کنید.
        </p>
      </div>

      <form
        className="mb-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          load(q);
        }}
      >
        <input
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          placeholder="جستجو: خرما، حمل، گمرک، LC…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700">
          جستجو
        </button>
      </form>

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">در حال بارگذاری…</p>
      ) : !items.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
          <p className="text-sm font-semibold text-slate-700">هنوز پیشنهاد معاوضه‌ای ثبت نشده</p>
          <p className="mt-1 text-xs text-slate-500">فروشندگان می‌توانند هنگام ثبت موجودی، معاوضه کالا به کالا یا کالا به خدمات را فعال کنند.</p>
          <Link href="/dashboard/supplier/inventory/create" className="mt-4 inline-flex text-sm font-bold text-emerald-700 hover:underline">
            ثبت موجودی با معاوضه
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((lot) => (
            <article key={lot.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                {lot.barterDesiredKind === "service" ? "کالا به خدمات" : "کالا به کالا"}
              </span>
              <h2 className="mt-2 text-base font-bold text-slate-900">{productLabel(lot)}</h2>
              <p className="mt-1 text-sm text-slate-600">
                در ازای:{" "}
                <strong className="text-slate-900">
                  {lot.barterDesiredName ||
                    lot.barterDesiredCategoryLabel ||
                    (lot.barterDesiredKind === "service" ? "خدمت توافقی" : "توافقی")}
                </strong>
              </p>
              {lot.barterDesiredKind === "service" ? (
                <p className="mt-1 text-xs text-slate-400">معاوضه با خدمات بازرگانی</p>
              ) : lot.barterDesiredQuantity ? (
                <p className="mt-1 text-xs text-slate-500">
                  مقدار حدودی: {lot.barterDesiredQuantity} {lot.barterDesiredUnit || ""}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">مقدار منعطف</p>
              )}
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <Link
                  href={`/dashboard/barter-inbox/${lot.id}`}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                >
                  جزئیات
                </Link>
                {lot.acceptCash !== false && lot.price != null ? (
                  <span className="rounded-lg bg-emerald-50 px-2 py-1.5 text-[10px] font-semibold text-emerald-800">نقدی هم دارد</span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
