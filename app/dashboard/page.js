"use client";

import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { isAdmin, isSupplier } from "../utils/roles";
import AdminDashboardHome from "../components/dashboard/AdminDashboardHome";
import SupplierDashboardHome from "../components/dashboard/SupplierDashboardHome";

function DashboardContent() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const supplier = isSupplier(user);

  if (admin) {
    return <AdminDashboardHome user={user} />;
  }

  if (supplier) {
    return <SupplierDashboardHome user={user} />;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-600">
        خوش آمدید <span className="font-semibold text-slate-900">{user?.firstName}</span>. از منوی کناری به بخش‌های مورد نیاز بروید.
      </p>
      <Link
        href="/cart"
        className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        مشاهده سبد خرید
      </Link>
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
