"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import ApplicantRequestContactActions from "@/app/components/dashboard/ApplicantRequestContactActions";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { dash } from "@/app/components/dashboard/dashboardTheme";

function IncomingRequestsListContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API_ENDPOINTS.applicantRequests.notifications}?limit=50`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((json) => setItems(Array.isArray(json?.data) ? json.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={dash.page}>
      <header className="mb-6">
        <h1 className={dash.pageTitle}>درخواست‌های متقاضیان</h1>
        <p className={dash.pageSubtitle}>درخواست‌هایی که در دسته محصولات یا خدمات شما ثبت شده‌اند</p>
      </header>

      {loading ? (
        <p className="text-sm text-slate-500">در حال بارگذاری…</p>
      ) : items.length === 0 ? (
        <div className={`${dash.card} ${dash.cardBody}`}>
          <p className="text-sm text-slate-600">درخواست جدیدی برای شما ثبت نشده است.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const req = n.request;
            const detailHref = `/dashboard/incoming-requests/${req?.id || n.requestId}`;
            return (
              <article
                key={n.id}
                className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 ${
                  !n.readAt ? "border-sky-200 bg-sky-50/30" : ""
                }`}
              >
                <Link href={detailHref} className="block">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{req?.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{req?.categoryLabel}</p>
                    </div>
                    {!n.readAt ? (
                      <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        جدید
                      </span>
                    ) : null}
                  </div>
                </Link>
                <ApplicantRequestContactActions request={req} compact />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function IncomingRequestsPage() {
  return (
    <ProtectedRoute>
      <IncomingRequestsListContent />
    </ProtectedRoute>
  );
}
