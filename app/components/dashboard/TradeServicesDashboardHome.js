"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useMyTradeServiceProvider } from "@/app/hooks/useMyTradeServiceProvider";
import ServiceProviderOnboardingIntro from "@/app/components/ServiceProviderOnboardingIntro";
import {
  DashAction,
  DashActionGrid,
  DashEmpty,
  DashHero,
  DashKpi,
  DashKpiGrid,
  DashLoading,
  DashPage,
  DashSection,
} from "./DashboardHomeKit";

export default function TradeServicesDashboardHome({ user }) {
  const t = useTranslations("dashboard.homeProvider");
  const router = useRouter();
  const { provider, hasProvider, loading } = useMyTradeServiceProvider(!!user);
  const [incomingUnread, setIncomingUnread] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    if (!hasProvider) return;
    let cancelled = false;
    (async () => {
      try {
        const [nRes, oRes] = await Promise.all([
          authFetch(API_ENDPOINTS.applicantRequests.unreadCount, { cache: "no-store" }),
          authFetch(API_ENDPOINTS.supplier.orders.getMine, { cache: "no-store" }),
        ]);
        const [nData, oData] = await Promise.all([nRes.json(), oRes.json()]);
        if (cancelled) return;
        setIncomingUnread(Number(nData?.data?.count ?? nData?.data ?? 0) || 0);
        const orders = Array.isArray(oData?.data) ? oData.data : oData?.data?.rows || [];
        setOrdersCount(orders.length);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasProvider]);

  if (loading) return <DashLoading />;

  const statusKey = provider?.status || "none";
  const statusText = t.has(`status.${statusKey}`) ? t(`status.${statusKey}`) : statusKey;

  return (
    <DashPage>
      <DashHero
        tone="violet"
        badge={t("badge")}
        title={t("title", { name: user?.firstName || "" })}
        subtitle={hasProvider ? t("subtitleMember", { name: provider?.displayName || "" }) : t("subtitleGuest")}
      />

      {!hasProvider ? (
        <>
          <ServiceProviderOnboardingIntro
            compact
            onAccept={() => router.push("/trade-services/register?start=1")}
          />
          <DashSection title={t("actionsTitle")}>
            <DashActionGrid>
              <DashAction href="/trade-services/register" title={t("actions.join")} desc={t("actions.joinDesc")} tone="violet" />
              <DashAction href="/trade-services" title={t("actions.catalog")} desc={t("actions.catalogDesc")} tone="sky" />
            </DashActionGrid>
          </DashSection>
        </>
      ) : (
        <>
          <DashKpiGrid>
            <DashKpi label={t("kpi.incoming")} value={incomingUnread} href="/dashboard/incoming-requests" tone="amber" />
            <DashKpi label={t("kpi.orders")} value={ordersCount} href="/dashboard/supplier/orders?scope=own" tone="emerald" />
            <DashKpi
              label={t("kpi.services")}
              value={Array.isArray(provider?.selectedServices) ? provider.selectedServices.length : provider?.subcategoryIds?.length || 1}
              href="/dashboard/service-provider-profile"
              tone="violet"
            />
            <DashKpi
              label={t("kpi.public")}
              value={provider?.status === "approved" ? 1 : 0}
              hint={provider?.status === "approved" ? t("kpi.publicOn") : t("kpi.publicOff")}
              href={provider?.status === "approved" ? `/trade-services/provider/${provider.id}` : "/dashboard/service-provider-profile"}
              tone="sky"
            />
          </DashKpiGrid>

          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-3 text-sm text-violet-950">
            <p className="font-bold">{provider.displayName}</p>
            <p className="mt-0.5 text-xs text-violet-800/80">{t("statusLine", { status: statusText })}</p>
          </div>

          <DashSection title={t("actionsTitle")}>
            <DashActionGrid>
              <DashAction href="/dashboard/service-provider-profile" title={t("actions.profile")} desc={t("actions.profileDesc")} tone="violet" />
              <DashAction href="/dashboard/incoming-requests" title={t("actions.incoming")} desc={t("actions.incomingDesc")} tone="amber" />
              <DashAction href="/dashboard/supplier/orders?scope=own" title={t("actions.orders")} desc={t("actions.ordersDesc")} tone="emerald" />
              <DashAction href="/dashboard/messages" title={t("actions.messages")} desc={t("actions.messagesDesc")} tone="sky" />
            </DashActionGrid>
          </DashSection>

          {provider.status === "approved" ? (
            <Link
              href={`/trade-services/provider/${provider.id}`}
              className="block rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm font-bold text-emerald-900 hover:bg-emerald-50"
            >
              {t("viewPublic")}
            </Link>
          ) : (
            <DashEmpty>{t("pendingHint")}</DashEmpty>
          )}
        </>
      )}
    </DashPage>
  );
}
