"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useAuth } from "@/app/context/AuthContext";
import { isAdmin } from "@/app/utils/roles";
import EscrowCreateAgreementForm from "@/app/components/dashboard/EscrowCreateAgreementForm";
import {
  ESCROW_DEPOSIT_LABEL,
  ESCROW_PAGE_TITLE,
  ESCROW_SETTINGS_TITLE,
  ESCROW_TAGLINE,
  formatUserDisplayName,
} from "@/app/components/dashboard/escrowCopy";
import { formatEscrowMoney } from "@/app/utils/escrowCurrencies";
import { dash } from "@/app/components/dashboard/dashboardTheme";

const STATUS_LABELS = {
  draft: "پیش‌نویس",
  awaiting_payment: "منتظر پرداخت",
  funds_locked: "وجه قفل شده",
  in_progress: "در حال انجام",
  partially_released: "آزادسازی جزئی",
  fully_released: "آزادسازی کامل",
  refunded: "برگشت داده شده",
  cancelled: "لغو شده",
  expired: "منقضی",
  disputed: "اختلاف",
  completed: "تکمیل شده",
};

const STATUS_CLASS = {
  draft: "bg-slate-100 text-slate-700",
  awaiting_payment: "bg-amber-100 text-amber-800",
  funds_locked: "bg-sky-100 text-sky-800",
  in_progress: "bg-blue-100 text-blue-800",
  partially_released: "bg-indigo-100 text-indigo-800",
  fully_released: "bg-emerald-100 text-emerald-800",
  refunded: "bg-rose-100 text-rose-800",
  cancelled: "bg-slate-200 text-slate-600",
  expired: "bg-slate-200 text-slate-600",
  disputed: "bg-orange-100 text-orange-900",
  completed: "bg-emerald-100 text-emerald-900",
};

export default function EscrowAgreementList() {
  const auth = useAuth();
  const user = auth?.user;
  const admin = isAdmin(user);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(API_ENDPOINTS.escrow.agreements, { cache: "no-store" });
      const json = await res.json();
      setItems(Array.isArray(json?.data) ? json.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={`${dash.page} mx-auto max-w-6xl`}>
      <header className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-slate-900 md:text-xl">{ESCROW_PAGE_TITLE}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{ESCROW_TAGLINE}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {admin ? (
              <Link
                href="/dashboard/escrow-settings"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {ESCROW_SETTINGS_TITLE}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              {showCreate ? "بستن فرم" : "قرارداد جدید"}
            </button>
          </div>
        </div>
      </header>

      {showCreate ? (
        <EscrowCreateAgreementForm
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
          onCancel={() => setShowCreate(false)}
        />
      ) : null}

      <section aria-label="فهرست قراردادها">
        {loading ? (
          <div className={`${dash.card} ${dash.cardBody}`}>
            <p className="text-sm text-slate-500">در حال بارگذاری…</p>
          </div>
        ) : items.length === 0 ? (
          <div className={`${dash.card} ${dash.cardBody} text-center md:py-10`}>
            <p className="text-sm font-medium text-slate-700">هنوز قرارداد تضمین معاملاتی ثبت نشده است.</p>
            <p className="mt-2 text-xs text-slate-500">
              با «قرارداد جدید» می‌توانید به‌عنوان خریدار یا فروشنده قرارداد ثبت کنید.
            </p>
            {!showCreate ? (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-4 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                ایجاد اولین قرارداد
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-3 md:gap-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/escrow/${item.id}`}
                className={`${dash.card} block overflow-hidden transition hover:border-sky-200 hover:shadow-md`}
              >
                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between md:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start gap-2">
                      <h2 className="text-sm font-bold text-slate-900 md:text-base">{item.title}</h2>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_CLASS[item.status] || STATUS_CLASS.draft}`}
                      >
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400" dir="ltr">
                      {item.referenceCode}
                    </p>
                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <span className="text-slate-500">خریدار</span>
                        <p className="mt-0.5 font-semibold text-slate-800">
                          {formatUserDisplayName(item.buyer) || `کاربر ${item.buyerId}`}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <span className="text-slate-500">فروشنده</span>
                        <p className="mt-0.5 font-semibold text-slate-800">
                          {formatUserDisplayName(item.seller) || `کاربر ${item.sellerId}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 md:min-w-[280px] md:max-w-md lg:min-w-[320px]">
                    <div className="rounded-lg border border-slate-100 px-2.5 py-2">
                      <p className="text-slate-500">کل معامله</p>
                      <p className="mt-0.5 font-bold text-slate-900" dir="ltr">
                        {formatEscrowMoney(item.dealTotalAmount, item.currency)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 px-2.5 py-2">
                      <p className="text-slate-500">{ESCROW_DEPOSIT_LABEL}</p>
                      <p className="mt-0.5 font-bold text-slate-900" dir="ltr">
                        {formatEscrowMoney(item.depositAmount, item.currency)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-sky-100 bg-sky-50/50 px-2.5 py-2">
                      <p className="text-sky-700">قفل‌شده</p>
                      <p className="mt-0.5 font-bold text-sky-900" dir="ltr">
                        {formatEscrowMoney(item.lockedAmount, item.currency)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-2.5 py-2">
                      <p className="text-emerald-700">آزادشده</p>
                      <p className="mt-0.5 font-bold text-emerald-900" dir="ltr">
                        {formatEscrowMoney(item.releasedAmount, item.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
