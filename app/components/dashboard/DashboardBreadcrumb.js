"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { buildDashboardBreadcrumbs } from "@/app/dashboard/dashboardRoutes";

export default function DashboardBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const crumbs = useMemo(
    () => buildDashboardBreadcrumbs(pathname, searchParams),
    [pathname, searchParams]
  );

  if (!crumbs.length) return null;

  return (
    <nav
      className="mb-4 flex min-h-[2rem] flex-wrap items-center gap-1 border-b border-slate-200/80 pb-3 text-xs text-slate-500 sm:text-sm"
      aria-label="مسیر صفحه"
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
