"use client";

import Link from "next/link";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { getTradeServicesContent } from "@/app/data/tradeServicesCatalog";
import { dash } from "@/app/components/dashboard/dashboardTheme";

export default function ServiceCategoriesPage() {
  const { allowed, loading } = useRequireAdmin();
  const services = getTradeServicesContent("fa").categories;

  if (loading || !allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={dash.page}>
      <header>
        <h1 className={dash.pageTitle}>دسته‌بندی خدمات بازرگانی</h1>
        <p className={dash.pageSubtitle}>
          ده دسته اصلی «خدمات بازرگانی و تجارت بین‌الملل»
        </p>
      </header>

      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.id} className={`${dash.card} ${dash.cardBody}`}>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-bold text-slate-900">{service.title}</h2>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-emerald-800">
                {service.id}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{service.description}</p>
            <p className="mt-2 text-xs text-slate-500">
              {service.children.length} زیرخدمت:{" "}
              {service.children.map((c) => c.title).join(" · ")}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href={`/trade-services/${service.id}`}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                target="_blank"
              >
                صفحه عمومی دسته
              </Link>
              <Link
                href={`/trade-services/register?category=${service.id}`}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                target="_blank"
              >
                عضویت ارائه‌دهنده
              </Link>
              <Link
                href={`/dashboard/trade-service-providers?category=${service.id}`}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                ارائه‌دهندگان این دسته
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
