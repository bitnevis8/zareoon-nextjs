"use client";

import { useAuth } from "@/app/context/AuthContext";
import { isAdmin } from "@/app/utils/roles";
import AdminDashboardHome from "@/app/components/dashboard/AdminDashboardHome";
import Link from "next/link";
import { dash } from "@/app/components/dashboard/dashboardTheme";

export default function ManagementDashboardPage() {
  const { user } = useAuth();

  if (!isAdmin(user)) {
    return (
      <div className={dash.page}>
        <div className={`${dash.card} ${dash.cardBody} text-center`}>
          <p className="text-sm text-slate-600">این بخش فقط برای مدیران است.</p>
          <Link href="/dashboard" className={`mt-4 ${dash.btnPrimary}`}>
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    );
  }

  return <AdminDashboardHome user={user} />;
}
