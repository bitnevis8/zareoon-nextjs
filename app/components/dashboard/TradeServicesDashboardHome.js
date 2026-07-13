"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { dash } from "./dashboardTheme";
import { useMyTradeServiceProvider } from "@/app/hooks/useMyTradeServiceProvider";
import ServiceProviderOnboardingIntro from "@/app/components/ServiceProviderOnboardingIntro";

export default function TradeServicesDashboardHome({ user }) {
  const router = useRouter();
  const { provider, hasProvider, loading } = useMyTradeServiceProvider(!!user);

  return (
    <div className={dash.page}>
      <header>
        <h1 className={dash.pageTitle}>خدمات بازرگانی</h1>
        <p className={dash.pageSubtitle}>
          {user?.firstName} عزیز، خدمات تجارت بین‌الملل را ارائه دهید یا در فهرست خدمات جستجو کنید.
        </p>
      </header>

      {!loading && !hasProvider ? (
        <div className="mb-6">
          <ServiceProviderOnboardingIntro
            compact
            onAccept={() => router.push("/trade-services/register?start=1")}
          />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {!loading && hasProvider ? (
          <>
            <Link
              href="/dashboard/service-provider-profile"
              className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
            >
              <p className="text-sm font-bold text-slate-900">صفحه خدمات من</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">
                {provider.displayName} — مشاهده و ویرایش صفحه اختصاصی خدمات
              </p>
            </Link>
            {provider.status === "approved" ? (
              <Link
                href={`/trade-services/provider/${provider.id}`}
                className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
              >
                <p className="text-sm font-bold text-slate-900">صفحه اختصاصی من</p>
                <p className="mt-1 text-xs leading-6 text-slate-600">نمایش عمومی پروفایل در فهرست خدمات</p>
              </Link>
            ) : null}
            <Link
              href="/dashboard/supplier/orders?scope=own"
              className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
            >
              <p className="text-sm font-bold text-slate-900">سفارشات مشتریان</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">پیگیری سفارشات ثبت‌شده توسط مشتریان</p>
            </Link>
            <Link
              href="/dashboard/incoming-requests"
              className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
            >
              <p className="text-sm font-bold text-slate-900">مشاهده نیازمندی‌ها به خدمات من</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">درخواست‌های متقاضیان مرتبط با خدمات شما</p>
            </Link>
          </>
        ) : null}

        <Link
          href="/trade-services"
          className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
        >
          <p className="text-sm font-bold text-slate-900">فهرست خدمات</p>
          <p className="mt-1 text-xs leading-6 text-slate-600">مرور شرکت‌ها و متخصصان خدمات بازرگانی</p>
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
