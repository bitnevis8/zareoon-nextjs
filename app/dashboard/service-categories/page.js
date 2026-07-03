"use client";

import Link from "next/link";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { exclusiveServicesContent } from "@/app/data/zareoonExclusiveServices";

export default function ServiceCategoriesPage() {
  const { allowed, loading } = useRequireAdmin();
  const services = exclusiveServicesContent.fa.items;

  if (loading || !allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 md:text-2xl">دسته‌بندی خدمات</h1>
        <p className="mt-1 text-sm text-slate-600">
          خدمات بازرگانی نمایش‌داده‌شده در صفحه اصلی و فرم‌های درخواست
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h2 className="font-bold text-slate-900">{service.title}</h2>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-emerald-800">
                {service.id}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{service.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/service-request/${service.id}`}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                target="_blank"
              >
                مشاهده فرم عمومی
              </Link>
              <Link
                href={`/dashboard/service-requests?type=${service.id}`}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                درخواست‌های این خدمت
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
