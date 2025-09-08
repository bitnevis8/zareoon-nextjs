"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 ProtectedRoute - user:", user, "loading:", loading);
    if (!loading && !user) {
      // اگر کاربر لاگین نکرده، به صفحه ورود ببر
      console.log("🔍 Redirecting to login - user:", user, "loading:", loading);
      // یک delay کوچک اضافه کن تا مطمئن شویم که AuthContext کاملاً لود شده
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  // اگر در حال لود است، loading نشان بده
  if (loading) {
    console.log("🔍 ProtectedRoute - showing loading");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // اگر کاربر لاگین نکرده، چیزی نشان نده (redirect می‌شود)
  if (!user) {
    console.log("🔍 ProtectedRoute - no user, showing nothing");
    return null;
  }

  // اگر کاربر لاگین کرده، محتوا را نشان بده
  console.log("🔍 ProtectedRoute - user exists, showing content");
  return <>{children}</>;
}
