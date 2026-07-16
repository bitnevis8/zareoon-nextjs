"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { getRoleLabel } from "@/app/utils/roles";
import SimpleBarChart from "./SimpleBarChart";
import { dash } from "./dashboardTheme";

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
  const t = useTranslations("dashboard");
  const tShared = useTranslations("shared");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lots, setLots] = useState([]);
  const [tradeProviders, setTradeProviders] = useState([]);

  const orderStatusLabel = (status) =>
    t.has(`adminHome.orderStatus.${status}`) ? t(`adminHome.orderStatus.${status}`) : status;

  const providerStatusLabel = (status) =>
    t.has(`adminHome.providerStatus.${status}`) ? t(`adminHome.providerStatus.${status}`) : status;

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
      label: orderStatusLabel(key),
      value,
      color: key === "pending" ? "bg-amber-500" : key === "completed" ? "bg-emerald-500" : "bg-sky-500",
    }));
  }, [orders, t]);

  const roleChart = useMemo(() => {
    const counts = {};
    const noRoleLabel = t("adminHome.noRole");
    users.forEach((u) => {
      const roles = u.userRoles?.length ? u.userRoles : u.roles || [];
      roles.forEach((r) => {
        const label = getRoleLabel(r, tShared);
        counts[label] = (counts[label] || 0) + 1;
      });
      if (!roles.length) counts[noRoleLabel] = (counts[noRoleLabel] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value, color: "bg-violet-500" }));
  }, [users, t, tShared]);

  const providerChart = useMemo(() => {
    const counts = {};
    tradeProviders.forEach((p) => {
      const key = p.status || "pending";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      label: providerStatusLabel(key),
      value,
      color: key === "pending" ? "bg-amber-500" : key === "approved" ? "bg-emerald-500" : "bg-rose-500",
    }));
  }, [tradeProviders, t]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    [orders]
  );

  const quickLinks = useMemo(
    () => [
      { href: "/dashboard/user-management/users", label: t("userManagement") },
      { href: "/dashboard/supplier/inventory", label: t("inventoryList") },
      { href: "/dashboard/order-management", label: t("orderManagement") },
      { href: "/dashboard/trade-service-provider-requests", label: t("providerRequests") },
      { href: "/dashboard/trade-service-providers", label: t("adminHome.quickLinks.providers") },
      { href: "/dashboard/settings", label: t("settings") },
    ],
    [t]
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
        <h1 className={dash.pageTitle}>{t("adminHome.title")}</h1>
        <p className={dash.pageSubtitle}>{t("adminHome.subtitle", { name: user?.firstName || "" })}</p>
      </header>

      <div className={dash.gridKpi}>
        <KpiCard label={t("adminHome.kpi.users")} value={users.length} href="/dashboard/user-management/users" tone="violet" />
        <KpiCard
          label={t("adminHome.kpi.orders")}
          value={orders.length}
          hint={t("adminHome.kpi.pendingOrders", { count: pendingOrders.toLocaleString("fa-IR") })}
          href="/dashboard/order-management"
          tone="amber"
        />
        <KpiCard
          label={t("adminHome.kpi.activeProducts")}
          value={activeLots}
          hint={t("adminHome.kpi.lotsHint", { count: lots.length.toLocaleString("fa-IR") })}
          href="/dashboard/supplier/inventory"
          tone="emerald"
        />
        <KpiCard
          label={t("adminHome.kpi.providers")}
          value={tradeProviders.length}
          hint={t("adminHome.kpi.pendingProviders", { count: pendingProviders.toLocaleString("fa-IR") })}
          href={
            pendingProviders > 0
              ? "/dashboard/trade-service-provider-requests"
              : "/dashboard/trade-service-providers"
          }
          tone="sky"
        />
      </div>

      <div className={dash.grid2}>
        <SimpleBarChart title={t("adminHome.charts.orderStatus")} items={orderChart} />
        <SimpleBarChart title={t("adminHome.charts.usersByRole")} items={roleChart} />
      </div>

      <SimpleBarChart title={t("adminHome.charts.providerStatus")} items={providerChart} />

      <div className={dash.card}>
        <div className={dash.cardHeader}>
          <h3 className={dash.cardTitle}>{t("adminHome.recentOrders.title")}</h3>
          <Link href="/dashboard/order-management" className="text-xs font-medium text-emerald-700 hover:underline">
            {t("adminHome.recentOrders.viewAll")}
          </Link>
        </div>
        <div className={dash.tableWrap}>
          <table className={dash.table}>
            <thead>
              <tr className="bg-slate-50">
                <th className={dash.th}>#</th>
                <th className={dash.th}>{t("adminHome.recentOrders.status")}</th>
                <th className={dash.th}>{t("adminHome.recentOrders.date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={3} className={dash.empty}>
                    {t("adminHome.recentOrders.empty")}
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80">
                    <td className={`${dash.td} font-mono text-slate-600`}>{o.id}</td>
                    <td className={dash.td}>{orderStatusLabel(o.status)}</td>
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
        {quickLinks.map((link) => (
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
