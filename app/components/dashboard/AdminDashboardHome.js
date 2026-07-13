"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { getRoleLabelFa } from "@/app/utils/roles";
import SimpleBarChart from "./SimpleBarChart";
import { dash } from "./dashboardTheme";

const ORDER_STATUS_FA = {
  pending: "در انتظار",
  reserved: "رزرو شده",
  completed: "تکمیل‌شده",
  cancelled: "لغو شده",
  approved: "تأیید شده",
};

const PROVIDER_STATUS_FA = {
  pending: "در انتظار",
  approved: "تأیید شده",
  rejected: "رد شده",
};

function KpiCard({ label, value, hint, tone = "emerald", href }) {
  const tones = {
    emerald: "border-emerald-100 bg-emerald-50/60 text-emerald-900",
    sky: "border-sky-100 bg-sky-50/60 text-sky-900",
    amber: "border-amber-100 bg-amber-50/60 text-amber-900",
    violet: "border-violet-100 bg-violet-50/60 text-violet-900",
  };
  const inner = (
    <div className={`${dash.card} p-4 transition hover:shadow-md ${tones[tone] || tones.emerald}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString("fa-IR")}</p>
      {hint ? <p className="mt-1 text-xs opacity-75">{hint}</p> : null}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboardHome({ user }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lots, setLots] = useState([]);
  const [tradeProviders, setTradeProviders] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [uRes, oRes, lRes, tpRes] = await Promise.all([
          authFetch(API_ENDPOINTS.users.getAll),
          authFetch(API_ENDPOINTS.supplier.orders.getAdminOrders, { cache: "no-store" }),
          authFetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" }),
          authFetch(API_ENDPOINTS.tradeServiceProviders.getAll, { cache: "no-store" }),
        ]);
        const [uData, oData, lData, tpData] = await Promise.all([
          uRes.json(),
          oRes.json(),
          lRes.json(),
          tpRes.json(),
        ]);
        if (cancelled) return;
        setUsers(uData?.data || []);
        setOrders(oData?.data || []);
        setLots(lData?.data || []);
        setTradeProviders(tpData?.data || []);
      } catch (e) {
        console.error("Dashboard stats:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const pendingProviders = tradeProviders.filter((p) => p.status === "pending").length;
  const activeLots = lots.filter((l) => l.status === "harvested" || l.status === "on_field").length;

  const orderChart = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      const key = o.status || "unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      label: ORDER_STATUS_FA[key] || key,
      value,
      color: key === "pending" ? "bg-amber-500" : key === "completed" ? "bg-emerald-500" : "bg-sky-500",
    }));
  }, [orders]);

  const roleChart = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      const roles = u.userRoles?.length ? u.userRoles : u.roles || [];
      roles.forEach((r) => {
        const label = getRoleLabelFa(r);
        counts[label] = (counts[label] || 0) + 1;
      });
      if (!roles.length) counts["بدون نقش"] = (counts["بدون نقش"] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value, color: "bg-violet-500" }));
  }, [users]);

  const providerChart = useMemo(() => {
    const counts = {};
    tradeProviders.forEach((p) => {
      const key = p.status || "pending";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      label: PROVIDER_STATUS_FA[key] || key,
      value,
      color: key === "pending" ? "bg-amber-500" : key === "approved" ? "bg-emerald-500" : "bg-rose-500",
    }));
  }, [tradeProviders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    [orders]
  );

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
        <h1 className={dash.pageTitle}>داشبورد مدیریت</h1>
        <p className={dash.pageSubtitle}>
          سلام {user?.firstName}، خلاصه وضعیت سامانه را اینجا ببینید.
        </p>
      </header>

      <div className={dash.gridKpi}>
        <KpiCard label="کاربران" value={users.length} href="/dashboard/user-management/users" tone="violet" />
        <KpiCard
          label="سفارش‌ها"
          value={orders.length}
          hint={`${pendingOrders.toLocaleString("fa-IR")} در انتظار`}
          href="/dashboard/order-management"
          tone="amber"
        />
        <KpiCard
          label="محصولات فعال"
          value={activeLots}
          hint={`از ${lots.length.toLocaleString("fa-IR")} بار`}
          href="/dashboard/supplier/inventory"
          tone="emerald"
        />
        <KpiCard
          label="ارائه‌دهندگان"
          value={tradeProviders.length}
          hint={`${pendingProviders.toLocaleString("fa-IR")} در انتظار تأیید`}
          href={
            pendingProviders > 0
              ? "/dashboard/trade-service-provider-requests"
              : "/dashboard/trade-service-providers"
          }
          tone="sky"
        />
      </div>

      <div className={dash.grid2}>
        <SimpleBarChart title="وضعیت سفارش‌ها" items={orderChart} />
        <SimpleBarChart title="کاربران بر اساس نقش" items={roleChart} />
      </div>

      <SimpleBarChart title="وضعیت ارائه‌دهندگان خدمات" items={providerChart} />

      <div className={dash.card}>
        <div className={dash.cardHeader}>
          <h3 className={dash.cardTitle}>آخرین سفارش‌ها</h3>
          <Link href="/dashboard/order-management" className="text-xs font-medium text-emerald-700 hover:underline">
            مشاهده همه
          </Link>
        </div>
        <div className={dash.tableWrap}>
          <table className={dash.table}>
            <thead>
              <tr className="bg-slate-50">
                <th className={dash.th}>#</th>
                <th className={dash.th}>وضعیت</th>
                <th className={dash.th}>تاریخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={3} className={dash.empty}>
                    سفارشی ثبت نشده
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80">
                    <td className={`${dash.td} font-mono text-slate-600`}>{o.id}</td>
                    <td className={dash.td}>{ORDER_STATUS_FA[o.status] || o.status}</td>
                    <td className={`${dash.td} text-slate-500`}>
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString("fa-IR", {
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/dashboard/user-management/users", label: "مدیریت کاربران" },
          { href: "/dashboard/supplier/inventory", label: "لیست محصولات" },
          { href: "/dashboard/order-management", label: "مدیریت سفارش‌ها" },
          { href: "/dashboard/trade-service-provider-requests", label: "درخواست‌های عضویت" },
          { href: "/dashboard/trade-service-providers", label: "ارائه‌دهندگان" },
          { href: "/dashboard/settings", label: "تنظیمات" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${dash.card} flex h-11 items-center px-4 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/40`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
