"use client";

import Link from "next/link";
import { dash } from "./dashboardTheme";
import { useMyTradeServiceProvider } from "@/app/hooks/useMyTradeServiceProvider";

export default function TradeServicesDashboardHome({ user }) {
  const { provider, hasProvider, loading } = useMyTradeServiceProvider(!!user);

  return (
    <div className={dash.page}>
      <header>
        <h1 className={dash.pageTitle}>داشبورد خدمات بازرگانی</h1>
        <p className={dash.pageSubtitle}>
          {user?.firstName} عزیز، خدمات تجارت بین‌الملل را ارائه دهید یا درخواست همکاری ثبت کنید.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {!loading && hasProvider ? (
          <>
            <Link
              href="/dashboard/service-provider-profile"
              className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
            >
              <p className="text-sm font-bold text-slate-900">پروفایل شرکت من</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">
                {provider.displayName} — مشاهده خدمات و وضعیت انتشار
              </p>
            </Link>
            {provider.status === "approved" ? (
              <Link
                href={`/trade-services/provider/${provider.id}`}
                className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
              >
                <p className="text-sm font-bold text-slate-900">صفحه عمومی شرکت</p>
                <p className="mt-1 text-xs leading-6 text-slate-600">نمایش پروفایل عمومی در فهرست خدمات</p>
              </Link>
            ) : null}
            <Link
              href="/dashboard/incoming-requests"
              className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
            >
              <p className="text-sm font-bold text-slate-900">درخواست‌های متقاضیان</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">درخواست‌های مرتبط با خدمات شما</p>
            </Link>
          </>
        ) : null}

        {!loading && !hasProvider ? (
          <Link
            href="/trade-services/register"
            className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
          >
            <p className="text-sm font-bold text-slate-900">عضویت ارائه‌دهنده</p>
            <p className="mt-1 text-xs leading-6 text-slate-600">ثبت‌نام به‌عنوان ارائه‌دهنده خدمات تجاری</p>
          </Link>
        ) : null}

        <Link
          href="/trade-services"
          className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
        >
          <p className="text-sm font-bold text-slate-900">فهرست خدمات</p>
          <p className="mt-1 text-xs leading-6 text-slate-600">مرور شرکت‌ها و متخصصان خدمات بازرگانی</p>
        </Link>
        <Link
          href="/service-request/import-export"
          className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
        >
          <p className="text-sm font-bold text-slate-900">درخواست همکاری</p>
          <p className="mt-1 text-xs leading-6 text-slate-600">ارسال درخواست برای دریافت خدمات بازرگانی</p>
        </Link>
        <Link
          href="/dashboard/messages"
          className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
        >
          <p className="text-sm font-bold text-slate-900">پیام‌ها</p>
          <p className="mt-1 text-xs leading-6 text-slate-600">پیگیری گفتگو با ارائه‌دهندگان و متقاضیان</p>
        </Link>
      </div>
    </div>
  );
}
