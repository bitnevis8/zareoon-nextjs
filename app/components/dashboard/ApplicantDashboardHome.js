"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

export default function ApplicantDashboardHome({ user }) {
  const t = useTranslations("dashboard.homeBuyer");
  const tApp = useTranslations("applicant");
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const statusLabel = (status) =>
    tApp.has(`status.${status}`) ? tApp(`status.${status}`) : status;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, oRes, cRes] = await Promise.all([
        authFetch(API_ENDPOINTS.applicantRequests.mine, { cache: "no-store" }),
        authFetch(API_ENDPOINTS.supplier.orders.getCustomerOrders, { cache: "no-store" }),
        authFetch(`${API_ENDPOINTS.supplier.cart.base}/me`, { cache: "no-store" }),
      ]);
      const [rData, oData, cData] = await Promise.all([rRes.json(), oRes.json(), cRes.json()]);
      setRequests(Array.isArray(rData?.data) ? rData.data : []);
      setOrders(Array.isArray(oData?.data) ? oData.data : oData?.data?.rows || []);
      const items = cData?.data?.items || cData?.data?.cart?.items || [];
      setCartCount(Array.isArray(items) ? items.length : 0);
    } catch {
      setRequests([]);
      setOrders([]);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openRequests = useMemo(
    () => requests.filter((r) => r.status === "open" || r.status === "pending").length,
    [requests]
  );

  if (loading) return <DashLoading />;

  return (
    <DashPage>
      <DashHero
        tone="sky"
        badge={t("badge")}
        title={t("title", { name: user?.firstName || "" })}
        subtitle={t("subtitle")}
      />

      <DashKpiGrid>
        <DashKpi label={t("kpi.requests")} value={requests.length} hint={t("kpi.openHint", { count: openRequests })} href="/dashboard/applicant-requests" tone="sky" />
        <DashKpi label={t("kpi.cart")} value={cartCount} href="/cart" tone="emerald" />
        <DashKpi label={t("kpi.orders")} value={orders.length} href="/dashboard/my-orders" tone="amber" />
        <DashKpi label={t("kpi.open")} value={openRequests} href="/dashboard/applicant-requests" tone="violet" />
      </DashKpiGrid>

      <DashSection title={t("actionsTitle")}>
        <DashActionGrid>
          <DashAction href="/dashboard/submit-request" title={t("actions.submit")} desc={t("actions.submitDesc")} tone="sky" />
          <DashAction href="/catalog/browse" title={t("actions.browse")} desc={t("actions.browseDesc")} tone="emerald" />
          <DashAction href="/cart" title={t("actions.cart")} desc={t("actions.cartDesc")} tone="amber" />
          <DashAction href="/dashboard/messages" title={t("actions.messages")} desc={t("actions.messagesDesc")} tone="violet" />
        </DashActionGrid>
      </DashSection>

      <DashSection title={t("recentRequests")} actionHref="/dashboard/applicant-requests" actionLabel={t("viewAll")}>
        {requests.length === 0 ? (
          <DashEmpty>
            <p>{t("emptyRequests")}</p>
            <Link href="/dashboard/submit-request" className="mt-3 inline-flex text-sm font-bold text-emerald-700 hover:underline">
              {t("actions.submit")}
            </Link>
          </DashEmpty>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 5).map((item) => (
              <DashListCard
                key={item.id}
                href={`/dashboard/applicant-requests/${item.id}`}
                title={item.title}
                meta={item.categoryLabel || "—"}
                badge={statusLabel(item.status)}
              />
            ))}
          </div>
        )}
      </DashSection>
    </DashPage>
  );
}
