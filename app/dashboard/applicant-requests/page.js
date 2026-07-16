"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { dash } from "@/app/components/dashboard/dashboardTheme";

function ApplicantRequestsListContent() {
  const t = useTranslations("applicant");
  const tCommon = useTranslations("common");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusLabel = (status) => (t.has(`status.${status}`) ? t(`status.${status}`) : status);

  useEffect(() => {
    authFetch(API_ENDPOINTS.applicantRequests.mine, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => setRequests(Array.isArray(json?.data) ? json.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={dash.page}>
      <header className="mb-6">
        <h1 className={dash.pageTitle}>{t("requestsList.title")}</h1>
        <p className={dash.pageSubtitle}>{t("requestsList.subtitle")}</p>
      </header>

      {loading ? (
        <p className="text-sm text-slate-500">{tCommon("loading")}</p>
      ) : requests.length === 0 ? (
        <div className={`${dash.card} ${dash.cardBody}`}>
          <p className="text-sm text-slate-600">{t("requestsList.empty")}</p>
          <Link href="/dashboard/submit-request" className={`mt-4 inline-flex ${dash.btnPrimary}`}>
            {t("form.newRequest")}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/applicant-requests/${item.id}`}
              className={`${dash.card} block ${dash.cardBody} transition hover:border-sky-200`}
            >
              <p className="text-sm font-bold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.categoryLabel}</p>
              <p className="mt-2 text-[11px] text-slate-400">
                {statusLabel(item.status)} ·{" "}
                {item.requestType === "product" ? t("type.product") : t("type.service")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ApplicantRequestsPage() {
  return (
    <ProtectedRoute>
      <ApplicantRequestsListContent />
    </ProtectedRoute>
  );
}
