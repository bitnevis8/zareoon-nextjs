"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import {
  DashAction,
  DashActionGrid,
  DashEmpty,
  DashHero,
  DashKpi,
  DashKpiGrid,
  DashListCard,
  DashLoading,
  DashPage,
  DashSection,
} from "./DashboardHomeKit";

export default function AdminDashboardHome({ user }) {
  const t = useTranslations("dashboard.homeAdmin");
  const tDash = useTranslations("dashboard");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lots, setLots] = useState([]);
  const [tradeProviders, setTradeProviders] = useState([]);

  const orderStatusLabel = (status) =>
    tDash.has(`adminHome.orderStatus.${status}`) ? tDash(`adminHome.orderStatus.${status}`) : status;

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

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 6),
    [orders]
  );

  if (loading) return <DashLoading />;

  return (
    <DashPage>
      <DashHero
        tone="emerald"
        badge={t("badge")}
        title={t("title", { name: user?.firstName || "" })}
        subtitle={t("subtitle")}
      />

      <DashKpiGrid>
        <DashKpi label={t("kpi.users")} value={users.length} href="/dashboard/user-management/users" tone="violet" />
        <DashKpi
          label={t("kpi.orders")}
          value={orders.length}
          hint={t("kpi.pendingOrders", { count: pendingOrders })}
          href="/dashboard/order-management"
          tone="amber"
        />
        <DashKpi
          label={t("kpi.products")}
          value={activeLots}
          hint={t("kpi.lotsTotal", { count: lots.length })}
          href="/dashboard/supplier/inventory"
          tone="emerald"
        />
        <DashKpi
          label={t("kpi.providers")}
          value={tradeProviders.length}
          hint={t("kpi.pendingProviders", { count: pendingProviders })}
          href={
            pendingProviders > 0
              ? "/dashboard/trade-service-provider-requests"
              : "/dashboard/trade-service-providers"
          }
          tone="sky"
        />
      </DashKpiGrid>

      {(pendingOrders > 0 || pendingProviders > 0) && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {pendingOrders > 0 ? (
            <Link
              href="/dashboard/order-management"
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950"
            >
              {t("alert.pendingOrders", { count: pendingOrders })}
            </Link>
          ) : null}
          {pendingProviders > 0 ? (
            <Link
              href="/dashboard/trade-service-provider-requests"
              className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-950"
            >
              {t("alert.pendingProviders", { count: pendingProviders })}
            </Link>
          ) : null}
        </div>
      )}

      <DashSection title={t("actionsTitle")}>
        <DashActionGrid>
          <DashAction href="/dashboard/user-management/users" title={t("actions.users")} desc={t("actions.usersDesc")} tone="violet" />
          <DashAction href="/dashboard/order-management" title={t("actions.orders")} desc={t("actions.ordersDesc")} tone="amber" />
          <DashAction href="/dashboard/supplier/inventory" title={t("actions.inventory")} desc={t("actions.inventoryDesc")} tone="emerald" />
          <DashAction href="/dashboard/trade-service-provider-requests" title={t("actions.providers")} desc={t("actions.providersDesc")} tone="sky" />
          <DashAction href="/dashboard/settings" title={t("actions.settings")} desc={t("actions.settingsDesc")} tone="violet" />
          <DashAction href="/dashboard/homepage-order" title={t("actions.homepage")} desc={t("actions.homepageDesc")} tone="emerald" />
        </DashActionGrid>
      </DashSection>

      <DashSection title={t("recentOrders")} actionHref="/dashboard/order-management" actionLabel={t("viewAll")}>
        {recentOrders.length === 0 ? (
          <DashEmpty>{t("emptyOrders")}</DashEmpty>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <DashListCard
                key={o.id}
                href="/dashboard/order-management"
                title={`${t("orderHash")}${o.id}`}
                meta={
                  o.createdAt
                    ? new Date(o.createdAt).toLocaleDateString("fa-IR", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"
                }
                badge={orderStatusLabel(o.status)}
              />
            ))}
          </div>
        )}
      </DashSection>
    </DashPage>
  );
}
