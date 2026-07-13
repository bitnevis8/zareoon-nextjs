"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import EscrowAgreementList from "@/app/components/dashboard/EscrowAgreementList";

export default function EscrowPage() {
  return (
    <ProtectedRoute>
      <EscrowAgreementList />
    </ProtectedRoute>
  );
}
