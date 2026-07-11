"use client";

import { Suspense } from "react";
import TradeServiceProvidersDashboardContent from "./TradeServiceProvidersDashboardContent";

export default function TradeServiceProvidersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-slate-600">در حال بارگذاری...</div>
      }
    >
      <TradeServiceProvidersDashboardContent />
    </Suspense>
  );
}
