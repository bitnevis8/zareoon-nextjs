"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const tCommon = useTranslations("common");

  useEffect(() => {
    console.log("🔍 ProtectedRoute - user:", user, "loading:", loading);
    if (!loading && !user) {
      console.log("🔍 Redirecting to login - user:", user, "loading:", loading);
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  if (loading) {
    console.log("🔍 ProtectedRoute - showing loading");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{tCommon("loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("🔍 ProtectedRoute - no user, showing nothing");
    return null;
  }

  console.log("🔍 ProtectedRoute - user exists, showing content");
  return <>{children}</>;
}
