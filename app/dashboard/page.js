"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/roles";
import { useDashboardPersona } from "../context/DashboardPersonaContext";
import AdminDashboardHome from "../components/dashboard/AdminDashboardHome";
import MobileDashboardHome from "../components/dashboard/MobileDashboardHome";
import { dash } from "../components/dashboard/dashboardTheme";

function DashboardContent() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { isSellerView, isServicesView, isApplicantView } = useDashboardPersona();
  const personaHome = isSellerView || isServicesView || isApplicantView;

  return (
    <div className={dash.page}>
      <MobileDashboardHome />
      {admin && !personaHome ? (
        <div className="hidden md:block">
          <AdminDashboardHome user={user} />
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
