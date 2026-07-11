"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import ApplicantRequestForm from "./ApplicantRequestForm";
import { dash } from "./dashboardTheme";

const STATUS_LABELS = {
  open: "باز",
  closed: "بسته",
  fulfilled: "برآورده‌شده",
  cancelled: "لغو‌شده",
};

function RequestTypeBadge({ type }) {
  const isProduct = type === "product";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        isProduct ? "bg-sky-100 text-sky-800" : "bg-violet-100 text-violet-800"
      }`}
    >
      {isProduct ? "محصول" : "خدمات"}
    </span>
  );
}

export default function ApplicantDashboardHome({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(API_ENDPOINTS.applicantRequests.mine, {
        cache: "no-store",
      });
      const json = await res.json();
      setRequests(Array.isArray(json?.data) ? json.data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return (
    <div className={dash.page}>
      <header className="mb-6">
        <h1 className={dash.pageTitle}>داشبورد متقاضی</h1>
        <p className={dash.pageSubtitle}>
          {user?.firstName} عزیز، درخواست محصول یا خدمات خود را ثبت کنید تا فروشندگان و ارائه‌دهندگان مرتبط مطلع
          شوند.
        </p>
      </header>

      <ApplicantRequestForm onSubmitted={() => loadRequests()} />

      <div className="mt-3">
        <Link href="/dashboard/submit-request" className="text-xs font-semibold text-sky-700 hover:underline">
          ثبت درخواست جدید ←
        </Link>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">درخواست‌های من</h2>
          <Link href="/dashboard/applicant-requests" className="text-xs font-semibold text-sky-700 hover:underline">
            مشاهده همه
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">در حال بارگذاری…</p>
        ) : requests.length === 0 ? (
          <div className={`${dash.card} ${dash.cardBody}`}>
            <p className="text-sm text-slate-600">هنوز درخواستی ثبت نکرده‌اید.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/applicant-requests/${item.id}`}
                className={`${dash.card} block ${dash.cardBody} transition hover:border-sky-200 hover:bg-sky-50/20`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.categoryLabel}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <RequestTypeBadge type={item.requestType} />
                    <span className="text-[11px] text-slate-500">{STATUS_LABELS[item.status] || item.status}</span>
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
