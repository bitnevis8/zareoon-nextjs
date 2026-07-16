"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { dash } from "@/app/components/dashboard/dashboardTheme";

function MyOrdersContent() {
  const t = useTranslations("order");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const orderStatusLabel = (status) => {
    const map = {
      pending: t("status.pendingApproval"),
      reserved: t("status.reserved"),
      completed: t("status.completedCompact"),
      cancelled: t("status.cancelled"),
    };
    return map[status] || status;
  };

  const itemStatusLabel = (status) => {
    const map = {
      pending: t("itemStatus.pending"),
      approved: t("itemStatus.approvedAlt"),
      processing: t("itemStatus.processing"),
      shipped: t("status.shipped"),
      delivered: t("itemStatus.deliveredAlt"),
      cancelled: t("itemStatus.cancelledAlt"),
      rejected: t("itemStatus.rejected"),
    };
    return map[status] || status;
  };

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
        <h1 className={dash.pageTitle}>{t("myOrders.title")}</h1>
        <p className={dash.pageSubtitle}>{t("myOrders.subtitle")}</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <div className={`${dash.card} ${dash.cardBody} text-center`}>
          <p className="text-sm text-slate-600">{t("myOrders.empty")}</p>
          <Link href="/cart" className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:underline">
            {t("myOrders.goToCart")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className={`${dash.card} ${dash.cardBody}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-900">{t("myOrders.orderTitle", { id: order.id })}</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  {orderStatusLabel(order.status)}
                </span>
              </div>
              <p className="mb-3 text-xs text-slate-500">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString("fa-IR") : t("emDash")}
              </p>
              <ul className="space-y-2">
                {order.items?.map((item, i) => (
                  <li key={`i-${i}`} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-slate-800">
                        {item.inventoryLot?.product?.name ||
                          t("myOrders.productFallback", { id: item.inventoryLotId })}
                      </span>
                      <span className="text-slate-500">{itemStatusLabel(item.status)}</span>
                    </div>
                    <p className="mt-1 text-slate-500">
                      {t("myOrders.gradeLine", {
                        grade: item.inventoryLot?.qualityGrade,
                        quantity: item.quantity,
                        unit: item.inventoryLot?.unit || t("myOrders.defaultUnit"),
                      })}
                    </p>
                  </li>
                ))}
                {order.requestItems?.map((item, i) => (
                  <li key={`r-${i}`} className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs">
                    <span className="font-medium text-amber-900">
                      {t("myOrders.awaitingAllocation", { productId: item.productId })}
                    </span>
                    <p className="mt-1 text-amber-800/80">
                      {t("myOrders.gradeLine", {
                        grade: item.qualityGrade,
                        quantity: item.quantity,
                        unit: item.unit || t("myOrders.defaultUnit"),
                      })}
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
