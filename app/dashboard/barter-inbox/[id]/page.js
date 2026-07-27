"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { dash } from "@/app/components/dashboard/dashboardTheme";

export default function BarterInboxDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(API_ENDPOINTS.barter.offer(id), { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "یافت نشد");
      setLot(json.data);

      // علامت‌خوانی اعلان‌های مرتبط در پس‌زمینه
      try {
        const inboxRes = await authFetch(`${API_ENDPOINTS.barter.inbox}?limit=40`, { cache: "no-store" });
        const inboxJson = await inboxRes.json();
        const match = (inboxJson?.data || []).find(
          (n) => String(n.inventoryLotId) === String(id) || String(n.inventoryLot?.id) === String(id)
        );
        if (match && !match.readAt) {
          await authFetch(API_ENDPOINTS.barter.markRead(match.id), { method: "PATCH" });
        }
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(e.message || "خطا");
      setLot(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className={dash.page} dir="rtl">
        <p className="py-16 text-center text-sm text-slate-400">در حال بارگذاری…</p>
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className={`${dash.page} space-y-3`} dir="rtl">
        <Link href="/dashboard/barter-inbox" className="text-sm font-semibold text-emerald-700 hover:underline">
          ← بازگشت
        </Link>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || "یافت نشد"}</p>
      </div>
    );
  }

  const productName = lot.product?.name || "محصول";
  const supplier = lot.supplier || {};
  const supplierName = [supplier.firstName, supplier.lastName].filter(Boolean).join(" ") || supplier.username || "فروشنده";

  return (
    <div className={`${dash.page} space-y-4`} dir="rtl">
      <Link href="/dashboard/barter-inbox" className="inline-flex text-sm font-semibold text-emerald-700 hover:underline">
        ← صندوق معاوضه
      </Link>

      <div className={`${dash.card} ${dash.cardBody} space-y-4`}>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
            {lot.barterDesiredKind === "service" ? "معاوضه کالا به خدمات" : "معاوضه کالا به کالا"}
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">
            {productName} ↔{" "}
            {lot.barterDesiredName ||
              lot.barterDesiredCategoryLabel ||
              (lot.barterDesiredKind === "service" ? "خدمت دیگر" : "کالای دیگر")}
          </h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-bold text-slate-500">آن‌ها می‌دهند</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{productName}</p>
            <p className="mt-1 text-xs text-slate-600">
              موجودی: {lot.totalQuantity} {lot.unit}
              {lot.qualityGrade ? ` · درجه ${lot.qualityGrade}` : ""}
            </p>
            {lot.acceptCash !== false && lot.price != null ? (
              <p className="mt-1 text-xs text-emerald-700">همراه با فروش نقدی هم فعال است</p>
            ) : (
              <p className="mt-1 text-xs text-amber-700">تمرکز روی معاوضه</p>
            )}
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <p className="text-[10px] font-bold text-amber-800">
              {lot.barterDesiredKind === "service" ? "درخواست معاوضه با خدمت" : "درخواست معاوضه با کالا"}
            </p>
            <p className="mt-1 text-sm font-bold text-amber-950">{lot.barterDesiredName || "—"}</p>
            {lot.barterDesiredCategoryLabel ? (
              <p className="mt-1 text-xs text-amber-900/80">دسته: {lot.barterDesiredCategoryLabel}</p>
            ) : null}
            {lot.barterDesiredKind === "service" ? (
              <p className="mt-1 text-xs text-amber-900/70">شرایط خدمت توافقی است</p>
            ) : lot.barterDesiredQuantity ? (
              <p className="mt-1 text-xs text-amber-900/80">
                مقدار حدودی: {lot.barterDesiredQuantity} {lot.barterDesiredUnit || ""}
              </p>
            ) : (
              <p className="mt-1 text-xs text-amber-900/70">مقدار منعطف / توافقی</p>
            )}
          </div>
        </div>

        {lot.barterNotes ? (
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-[10px] font-bold text-slate-500">توضیحات فروشنده</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-slate-800">{lot.barterNotes}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <p className="me-auto text-xs text-slate-500">پیشنهاددهنده: {supplierName}</p>
          {supplier.id ? (
            <Link href={`/dashboard/messages?userId=${supplier.id}`} className={`${dash.btnPrimary} text-xs`}>
              گفتگو برای هماهنگی معاوضه
            </Link>
          ) : null}
          <Link href="/barter" className={`${dash.btnSecondary} text-xs`}>
            مشاهده بازار معاوضه
          </Link>
        </div>
      </div>
    </div>
  );
}
