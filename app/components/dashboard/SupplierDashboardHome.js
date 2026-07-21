"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { canActAsSeller } from "@/app/utils/dashboardPersona";
import { dash } from "@/app/components/dashboard/dashboardTheme";
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

export default function SupplierDashboardHome({ user }) {
  const t = useTranslations("dashboard.homeSeller");
  const tDash = useTranslations("dashboard");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lots, setLots] = useState([]);
  const [orders, setOrders] = useState([]);
  const [incomingUnread, setIncomingUnread] = useState(0);

  const userId = user?.id ?? user?.userId;
  const isSeller = canActAsSeller(user);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        if (!isSeller) {
          if (!cancelled) setLoading(false);
          return;
        }
        const [lRes, oRes, nRes] = await Promise.all([
          authFetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" }),
          authFetch(API_ENDPOINTS.supplier.orders.getMine, { cache: "no-store" }),
          authFetch(API_ENDPOINTS.applicantRequests.unreadCount, { cache: "no-store" }),
        ]);
        const [lData, oData, nData] = await Promise.all([lRes.json(), oRes.json(), nRes.json()]);
        if (cancelled) return;
        const allLots = lData?.data || [];
        setLots(
          allLots.filter(
            (l) => Number(l.farmerId) === Number(userId) || Number(l.supplierId) === Number(userId)
          )
        );
        setOrders(Array.isArray(oData?.data) ? oData.data : oData?.data?.rows || []);
        setIncomingUnread(Number(nData?.data?.count ?? nData?.data ?? 0) || 0);
      } catch {
        if (!cancelled) {
          setLots([]);
          setOrders([]);
          setIncomingUnread(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, isSeller]);

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "pending" || o.status === "reserved").length,
    [orders]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    [orders]
  );

  const statusLabel = (status) =>
    tDash.has(`adminHome.orderStatus.${status}`) ? tDash(`adminHome.orderStatus.${status}`) : status;

  if (loading) return <DashLoading />;

  if (!isSeller) {
    return (
      <DashPage>
        <header>
          <h1 className={dash.pageTitle}>{t("joinTitle")}</h1>
          <p className={dash.pageSubtitle}>{t("joinSubtitle")}</p>
        </header>

        <section className={`${dash.card} ${dash.cardBody} mx-auto max-w-xl space-y-4 text-center sm:text-start`}>
          <p className="text-sm font-semibold text-slate-900">{t("joinEmpty")}</p>
          <p className="text-sm leading-7 text-slate-600">{t("joinBody")}</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/seller/join")}
            className={`${dash.btnPrimary} min-h-11 w-full sm:w-auto sm:px-8`}
          >
            {t("joinCta")}
          </button>
          <p className="text-xs leading-6 text-slate-500">{t("joinFootnote")}</p>
        </section>
      </DashPage>
    );
  }

  return (
    <DashPage>
      <DashHero
        tone="emerald"
        badge={t("badge")}
        title={t("title", { name: user?.firstName || "" })}
        subtitle={t("subtitle")}
      />

      <DashKpiGrid>
        <DashKpi
          label={t("kpi.products")}
          value={lots.length}
          href="/dashboard/supplier/inventory?scope=own"
          tone="emerald"
        />
        <DashKpi
          label={t("kpi.orders")}
          value={orders.length}
          href="/dashboard/supplier/orders?scope=own"
          tone="amber"
        />
        <DashKpi
          label={t("kpi.pending")}
          value={pendingOrders}
          href="/dashboard/supplier/orders?scope=own"
          tone="sky"
        />
        <DashKpi
          label={t("kpi.incoming")}
          value={incomingUnread}
          href="/dashboard/incoming-requests"
          tone="violet"
        />
      </DashKpiGrid>

      <DashSection title={t("actionsTitle")}>
        <DashActionGrid>
          <DashAction
            href="/dashboard/supplier/inventory/create?scope=own"
            title={t("actions.addProduct")}
            desc={t("actions.addProductDesc")}
            tone="emerald"
          />
          <DashAction
            href="/dashboard/supplier/inventory?scope=own"
            title={t("actions.myProducts")}
            desc={t("actions.myProductsDesc")}
            tone="amber"
          />
          <DashAction
            href="/dashboard/supplier-profile"
            title={t("actions.shop")}
            desc={t("actions.shopDesc")}
            tone="sky"
          />
          <DashAction
            href="/dashboard/incoming-requests"
            title={t("actions.incoming")}
            desc={t("actions.incomingDesc")}
            tone="violet"
          />
        </DashActionGrid>
      </DashSection>

      <DashSection
        title={t("recentOrders")}
        actionHref="/dashboard/supplier/orders?scope=own"
        actionLabel={t("viewAll")}
      >
        {recentOrders.length === 0 ? (
          <DashEmpty>{t("emptyOrders")}</DashEmpty>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <DashListCard
                key={o.id}
                href="/dashboard/supplier/orders?scope=own"
                title={`${t("orderHash")}${o.id}`}
                meta={
                  o.createdAt
                    ? new Date(o.createdAt).toLocaleDateString("fa-IR", {
                        month: "short",
                        day: "numeric",
                      })
                    : "—"
                }
                badge={statusLabel(o.status)}
              />
            ))}
          </div>
        )}
      </DashSection>
    </DashPage>
  );
}
