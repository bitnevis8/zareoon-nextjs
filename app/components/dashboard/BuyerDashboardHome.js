"use client";

import Link from "next/link";
import { dash } from "./dashboardTheme";

export default function BuyerDashboardHome({ user }) {
  return (
    <div className={dash.page}>
      <header>
        <h1 className={dash.pageTitle}>داشبورد خریدار</h1>
        <p className={dash.pageSubtitle}>
          {user?.firstName} عزیز، محصول مورد نظر را پیدا کنید و درخواست خرید ثبت کنید.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/catalog/browse"
          className={`${dash.card} ${dash.cardBody} transition hover:border-sky-200 hover:bg-sky-50/30`}
        >
          <p className="text-sm font-bold text-slate-900">مرور محصولات</p>
          <p className="mt-1 text-xs leading-6 text-slate-600">جستجو در فهرست کالاها و دسته‌بندی‌ها</p>
        </Link>
        <Link
          href="/cart"
          className={`${dash.card} ${dash.cardBody} transition hover:border-sky-200 hover:bg-sky-50/30`}
        >
          <p className="text-sm font-bold text-slate-900">سبد خرید</p>
          <p className="mt-1 text-xs leading-6 text-slate-600">مشاهده و تکمیل سفارش‌های در حال ثبت</p>
        </Link>
        <Link
          href="/dashboard/messages"
          className={`${dash.card} ${dash.cardBody} transition hover:border-sky-200 hover:bg-sky-50/30`}
        >
          <p className="text-sm font-bold text-slate-900">پیام‌ها</p>
          <p className="mt-1 text-xs leading-6 text-slate-600">گفتگو با فروشندگان و پیگیری درخواست‌ها</p>
        </Link>
        <Link
          href="/trade-services"
          className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
        >
          <p className="text-sm font-bold text-slate-900">خدمات بازرگانی</p>
          <p className="mt-1 text-xs leading-6 text-slate-600">درخواست همکاری با متخصصان تجارت بین‌الملل</p>
        </Link>
      </div>
    </div>
  );
}
