"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import EscrowAgreementDetail from "@/app/components/dashboard/EscrowAgreementDetail";

export default function EscrowDetailPage() {
  return (
    <ProtectedRoute>
      <EscrowAgreementDetail />
    </ProtectedRoute>
  );
}
