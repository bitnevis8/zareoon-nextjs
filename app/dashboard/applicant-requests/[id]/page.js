"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { dash } from "@/app/components/dashboard/dashboardTheme";

const STATUS_LABELS = {
  open: "باز",
  closed: "بسته",
  fulfilled: "برآورده‌شده",
  cancelled: "لغو‌شده",
};

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function ApplicantRequestDetailContent() {
  const params = useParams();
  const id = params?.id;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    authFetch(API_ENDPOINTS.applicantRequests.getById(id), { cache: "no-store" })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.message || "خطا");
        setItem(json.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6 text-sm text-slate-500">در حال بارگذاری…</p>;
  if (error) {
    return (
      <div className={`${dash.page}`}>
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/dashboard/applicant-requests" className="mt-4 inline-block text-sm text-sky-700">
          بازگشت
        </Link>
      </div>
    );
  }
  if (!item) return null;

  return (
    <div className={dash.page}>
      <Link href="/dashboard/applicant-requests" className="mb-4 inline-block text-sm text-sky-700 hover:underline">
        ← بازگشت به درخواست‌ها
      </Link>
      <header className="mb-4">
        <h1 className={dash.pageTitle}>{item.title}</h1>
        <p className={dash.pageSubtitle}>
          {item.categoryLabel} · {item.requestType === "product" ? "متقاضی محصول" : "متقاضی خدمات"} ·{" "}
          {STATUS_LABELS[item.status] || item.status}
        </p>
      </header>
      <div className={`${dash.card} ${dash.cardBody}`}>
        <dl>
          <DetailRow label="شرح نیاز" value={item.description} />
          {item.requestType === "product" && item.quantity ? (
            <DetailRow label="مقدار" value={`${item.quantity}${item.unit ? ` ${item.unit}` : ""}`} />
          ) : null}
          <DetailRow label="شماره تماس" value={item.phone} />
          <DetailRow label="شرکت / سازمان" value={item.company} />
          <DetailRow label="توضیحات تکمیلی" value={item.notes} />
        </dl>
      </div>
    </div>
  );
}

export default function ApplicantRequestDetailPage() {
  return (
    <ProtectedRoute>
      <ApplicantRequestDetailContent />
    </ProtectedRoute>
  );
}
