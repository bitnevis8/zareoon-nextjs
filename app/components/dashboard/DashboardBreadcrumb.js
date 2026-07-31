"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { buildDashboardBreadcrumbs } from "@/app/dashboard/dashboardRoutes";
import DaisyBreadcrumbs from "@/app/components/ui/DaisyBreadcrumbs";

export default function DashboardBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSellerView, isServicesView } = useDashboardPersona();
  const t = useTranslations("dashboard");

  const items = useMemo(() => {
    const raw = buildDashboardBreadcrumbs(pathname, searchParams, { isSellerView, isServicesView });
    return raw.map((crumb) => ({
      href: crumb.href || null,
      label: crumb.labelKey ? t(crumb.labelKey) : crumb.labelFallback || t("fallbackPage"),
    }));
  }, [pathname, searchParams, isSellerView, isServicesView, t]);

  if (!items.length) return null;

  return (
    <DaisyBreadcrumbs
      items={items}
      ariaLabel={t("ariaLabel")}
      className="mb-2 md:mb-4"
    />
  );
}
