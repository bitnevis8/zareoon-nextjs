"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import EscrowSettingsAdmin from "@/app/components/dashboard/EscrowSettingsAdmin";

export default function EscrowSettingsPage() {
  return (
    <ProtectedRoute>
      <EscrowSettingsAdmin />
    </ProtectedRoute>
  );
}
