"use client";

import { useAuth } from "../context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { buildLoginHref } from "../utils/safeAuthRedirect";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (!loading && !user) {
      const search = typeof window !== "undefined" ? window.location.search || "" : "";
      const returnTo = `${pathname || "/dashboard"}${search}`;
      const timer = setTimeout(() => {
        router.push(buildLoginHref(returnTo));
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
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
    return null;
  }

  return <>{children}</>;
}
