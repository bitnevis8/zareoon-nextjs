"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import SimpleBarChart from "./SimpleBarChart";
import { dash } from "./dashboardTheme";

export default function SupplierDashboardHome({ user }) {
  const [loading, setLoading] = useState(true);
  const [lots, setLots] = useState([]);
  const [orders, setOrders] = useState([]);

  const userId = user?.id ?? user?.userId;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const [lRes, oRes] = await Promise.all([
          authFetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" }),
          authFetch(API_ENDPOINTS.supplier.orders.getMine, { cache: "no-store" }),
        ]);
        const [lData, oData] = await Promise.all([lRes.json(), oRes.json()]);
        if (cancelled) return;
        const allLots = lData?.data || [];
        setLots(allLots.filter((l) => Number(l.farmerId) === Number(userId)));
        setOrders(Array.isArray(oData?.data) ? oData.data : oData?.data?.rows || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const statusItems = [
    { label: "قابل عرضه", value: lots.filter((l) => l.status === "harvested").length, color: "bg-emerald-500" },
    { label: "در مزرعه", value: lots.filter((l) => l.status === "on_field").length, color: "bg-lime-500" },
    { label: "رزرو شده", value: lots.filter((l) => l.status === "reserved").length, color: "bg-amber-500" },
    { label: "فروخته شده", value: lots.filter((l) => l.status === "sold").length, color: "bg-sky-500" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={dash.page}>
      <header>
        <h1 className={dash.pageTitle}>داشبورد فروشنده</h1>
        <p className={dash.pageSubtitle}>
          {user?.firstName} عزیز، محصولات خود را عرضه کنید و سفارشات مشتری را پیگیری کنید.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className={`${dash.card} p-4`}>
          <p className="text-xs text-slate-500">فهرست محصولات من</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">{lots.length.toLocaleString("fa-IR")}</p>
        </div>
        <div className={`${dash.card} p-4`}>
          <p className="text-xs text-slate-500">سفارشات مشتری</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">{orders.length.toLocaleString("fa-IR")}</p>
        </div>
        <div className={`${dash.card} col-span-2 p-4 sm:col-span-1`}>
          <p className="text-xs text-slate-500">در انتظار</p>
          <p className="mt-1 text-2xl font-semibold text-amber-700">
            {orders.filter((o) => o.status === "pending").length.toLocaleString("fa-IR")}
          </p>
        </div>
      </div>

      <SimpleBarChart title="وضعیت محصولات" items={statusItems} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/dashboard/supplier/inventory?scope=own"
          className={`${dash.card} p-4 text-center text-sm font-medium text-slate-700 hover:bg-slate-50`}
        >
          فهرست محصولات من
        </Link>
        <Link
          href="/dashboard/supplier/inventory/create?scope=own"
          className={`${dash.card} p-4 text-center text-sm font-medium text-slate-700 hover:bg-slate-50`}
        >
          ثبت موجودی جدید
        </Link>
        <Link
          href="/dashboard/supplier/orders?scope=own"
          className={`${dash.card} p-4 text-center text-sm font-medium text-slate-700 hover:bg-slate-50`}
        >
          سفارشات مشتری
        </Link>
      </div>
    </div>
  );
}
