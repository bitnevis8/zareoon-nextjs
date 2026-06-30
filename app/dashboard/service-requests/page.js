"use client";

import { Suspense } from "react";
import ServiceRequestsDashboardContent from "./ServiceRequestsDashboardContent";

export default function ServiceRequestsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64 text-gray-600">در حال بارگذاری...</div>}>
      <ServiceRequestsDashboardContent />
    </Suspense>
  );
}
