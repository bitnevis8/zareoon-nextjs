"use client";

import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">داشبورد</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          خوش آمدید {user?.firstName} {user?.lastName}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          از منوی سایدبار برای دسترسی به بخش‌های مختلف استفاده کنید
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">اطلاعات کاربری</h4>
            <p className="text-blue-600 text-sm">
              موبایل: {user?.mobile}
            </p>
            {user?.email && (
              <p className="text-blue-600 text-sm">
                ایمیل: {user?.email}
              </p>
            )}
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">وضعیت حساب</h4>
            <p className="text-green-600 text-sm">
              {user?.isActive ? "فعال" : "غیرفعال"}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">نقش‌ها</h4>
            <div className="text-purple-600 text-sm">
              {user?.roles?.map(role => role.nameFa).join(", ") || "بدون نقش"}
            </div>
          </div>
        </div>
      </div>
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