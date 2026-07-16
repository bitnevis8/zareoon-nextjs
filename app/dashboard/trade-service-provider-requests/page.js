"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import TradeServiceProvidersDashboardContent from "../trade-service-providers/TradeServiceProvidersDashboardContent";

function LoadingFallback() {
  const t = useTranslations("product");
  return (
    <div className="flex h-64 items-center justify-center text-slate-600">{t("tradeProviders.loading")}</div>
  );
}

export default function TradeServiceProviderRequestsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TradeServiceProvidersDashboardContent variant="membership-requests" defaultStatusFilter="pending" />
    </Suspense>
  );
}
