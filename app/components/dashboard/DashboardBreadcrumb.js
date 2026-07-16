"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { buildDashboardBreadcrumbs } from "@/app/dashboard/dashboardRoutes";

export default function DashboardBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSellerView, isServicesView } = useDashboardPersona();
  const t = useTranslations("dashboard");

  const crumbs = useMemo(() => {
    const raw = buildDashboardBreadcrumbs(pathname, searchParams, { isSellerView, isServicesView });
    return raw.map((crumb) => ({
      ...crumb,
      label: crumb.labelKey
        ? t(crumb.labelKey)
        : crumb.labelFallback || t("fallbackPage"),
    }));
  }, [pathname, searchParams, isSellerView, isServicesView, t]);

  if (!crumbs.length) return null;

  return (
    <nav
      className="mb-5 flex min-h-[1.75rem] flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500"
      aria-label={t("ariaLabel")}
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 ? <span className="text-slate-300 select-none">/</span> : null}
            {isLast || !crumb.href ? (
              <span className={`${isLast ? "font-semibold text-slate-800" : "text-slate-500"}`}>
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="text-slate-500 transition-colors hover:text-emerald-700">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
