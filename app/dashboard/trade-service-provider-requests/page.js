"use client";

import { Suspense } from "react";
import TradeServiceProvidersDashboardContent from "../trade-service-providers/TradeServiceProvidersDashboardContent";

export default function TradeServiceProviderRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-slate-600">در حال بارگذاری...</div>
      }
    >
      <TradeServiceProvidersDashboardContent variant="membership-requests" defaultStatusFilter="pending" />
    </Suspense>
  );
}
