"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import ServiceProviderProfileEditor from "@/app/components/dashboard/ServiceProviderProfileEditor";

export default function ServiceProviderProfilePage() {
  return (
    <ProtectedRoute>
      <ServiceProviderProfileEditor />
    </ProtectedRoute>
  );
}
