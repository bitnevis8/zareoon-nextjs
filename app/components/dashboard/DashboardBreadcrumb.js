"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { buildDashboardBreadcrumbs } from "@/app/dashboard/dashboardRoutes";

function Chevron() {
  return (
    <svg
      className="h-3 w-3 shrink-0 text-slate-300 rtl:rotate-180"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M4.5 2.5L8 6L4.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      className="mb-2 flex min-h-0 flex-wrap items-center gap-x-1 gap-y-1 md:mb-4"
      aria-label={t("ariaLabel")}
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 ? <Chevron /> : null}
            {isLast || !crumb.href ? (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[12px] leading-5 md:text-xs ${
                  isLast
                    ? "bg-emerald-50 font-semibold text-emerald-800"
                    : "text-slate-500"
                }`}
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="rounded-md px-1.5 py-0.5 text-[12px] leading-5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-emerald-700 md:text-xs"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
