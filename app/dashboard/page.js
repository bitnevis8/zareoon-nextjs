"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { useDashboardPersona } from "../context/DashboardPersonaContext";
import { isAdmin } from "../utils/roles";
import AdminDashboardHome from "../components/dashboard/AdminDashboardHome";
import SupplierDashboardHome from "../components/dashboard/SupplierDashboardHome";
import ApplicantDashboardHome from "../components/dashboard/ApplicantDashboardHome";
import TradeServicesDashboardHome from "../components/dashboard/TradeServicesDashboardHome";
import MobileDashboardHome from "../components/dashboard/MobileDashboardHome";
import { dash } from "../components/dashboard/dashboardTheme";

function DesktopDashboardBody({ user }) {
  const { isSellerView, isServicesView, isApplicantView } = useDashboardPersona();
  const admin = isAdmin(user);
  const t = useTranslations("dashboard");

  if (isServicesView) {
    return <TradeServicesDashboardHome user={user} />;
  }

  if (isSellerView) {
    return <SupplierDashboardHome user={user} />;
  }

  if (isApplicantView) {
    return <ApplicantDashboardHome user={user} />;
  }

  if (admin) {
    return <AdminDashboardHome user={user} />;
  }

  if (user) {
    return <ApplicantDashboardHome user={user} />;
  }

  return (
    <div className={dash.page}>
      <div className={`${dash.card} ${dash.cardBody}`}>
        <p className="text-sm text-slate-600">{t("welcomeFallback")}</p>
        <Link href="/catalog/browse" className={`mt-4 ${dash.btnPrimary}`}>
          {t("browseProducts")}
        </Link>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  return (
    <>
      <MobileDashboardHome />
      <div className="hidden md:block">
        <DesktopDashboardBody user={user} />
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
