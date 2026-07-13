"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { dash } from "@/app/components/dashboard/dashboardTheme";

const ORDER_STATUS_FA = {
  pending: "در انتظار تأیید",
  reserved: "رزرو شده",
  completed: "تکمیل‌شده",
  cancelled: "لغو شده",
};

const ITEM_STATUS_FA = {
  pending: "در انتظار",
  approved: "تأیید شده",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
  rejected: "رد شده",
};

function MyOrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(API_ENDPOINTS.supplier.orders.getCustomerOrders, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setOrders(d.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={dash.page}>
      <header className="mb-6">
        <h1 className={dash.pageTitle}>سفارشات من</h1>
        <p className={dash.pageSubtitle}>وضعیت سفارش‌های ثبت‌شده از سبد خرید را اینجا پیگیری کنید.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <div className={`${dash.card} ${dash.cardBody} text-center`}>
          <p className="text-sm text-slate-600">هنوز سفارشی ثبت نکرده‌اید.</p>
          <Link href="/cart" className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:underline">
            رفتن به سبد خرید
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className={`${dash.card} ${dash.cardBody}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-900">سفارش #{order.id}</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  {ORDER_STATUS_FA[order.status] || order.status}
                </span>
              </div>
              <p className="mb-3 text-xs text-slate-500">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString("fa-IR") : "—"}
              </p>
              <ul className="space-y-2">
                {order.items?.map((item, i) => (
                  <li key={`i-${i}`} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-slate-800">
                        {item.inventoryLot?.product?.name || `محصول #${item.inventoryLotId}`}
                      </span>
                      <span className="text-slate-500">{ITEM_STATUS_FA[item.status] || item.status}</span>
                    </div>
                    <p className="mt-1 text-slate-500">
                      درجه {item.inventoryLot?.qualityGrade} — {item.quantity}{" "}
                      {item.inventoryLot?.unit || "کیلوگرم"}
                    </p>
                  </li>
                ))}
                {order.requestItems?.map((item, i) => (
                  <li key={`r-${i}`} className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs">
                    <span className="font-medium text-amber-900">در انتظار تخصیص — محصول #{item.productId}</span>
                    <p className="mt-1 text-amber-800/80">
                      درجه {item.qualityGrade} — {item.quantity} {item.unit || "کیلوگرم"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <ProtectedRoute>
      <MyOrdersContent />
    </ProtectedRoute>
  );
}
