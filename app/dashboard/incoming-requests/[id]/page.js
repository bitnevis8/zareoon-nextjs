"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import ApplicantRequestContactActions from "@/app/components/dashboard/ApplicantRequestContactActions";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { dash } from "@/app/components/dashboard/dashboardTheme";

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function IncomingRequestDetailContent() {
  const t = useTranslations("applicant");
  const tCommon = useTranslations("common");
  const params = useParams();
  const id = params?.id;
  const [item, setItem] = useState(null);
  const [viewerRole, setViewerRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    authFetch(API_ENDPOINTS.applicantRequests.getById(id), { cache: "no-store" })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.message);
        setItem(json.data);
        setViewerRole(json.viewerRole || null);
        return authFetch(`${API_ENDPOINTS.applicantRequests.notifications}?limit=50`, {
          cache: "no-store",
        }).then((nr) => nr.json());
      })
      .then((notifJson) => {
        const notifications = Array.isArray(notifJson?.data) ? notifJson.data : [];
        const mine = notifications.find((n) => String(n.requestId) === String(id) || String(n.request?.id) === String(id));
        if (mine && !mine.readAt) {
          authFetch(API_ENDPOINTS.applicantRequests.markRead(mine.id), {
            method: "PATCH",
          }).catch(() => {});
        }
      })
      .catch((e) => setError(e.message || t("errors.generic")))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6 text-sm text-slate-500">{tCommon("loading")}</p>;
  if (error) {
    return (
      <div className={dash.page}>
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/dashboard/incoming-requests" className="mt-4 inline-block text-sm text-sky-700">
          {t("form.back")}
        </Link>
      </div>
    );
  }
  if (!item) return null;

  const applicant = item.applicant;
  const applicantName = applicant
    ? [applicant.firstName, applicant.lastName].filter(Boolean).join(" ") || applicant.username
    : null;
  const showPhone =
    item.allowPhoneContact !== false && !item.phoneHidden && item.phone;
  const isRecipient = viewerRole === "recipient";

  return (
    <div className={dash.page}>
      <Link href="/dashboard/incoming-requests" className="mb-4 inline-block text-sm text-sky-700 hover:underline">
        {t("incoming.backToRequests")}
      </Link>
      <header className="mb-4">
        <h1 className={dash.pageTitle}>{item.title}</h1>
        <p className={dash.pageSubtitle}>
          {item.categoryLabel} ·{" "}
          {item.requestType === "product" ? t("requestTypes.product.label") : t("requestTypes.service.label")}
        </p>
      </header>

      {isRecipient ? (
        <div className={`${dash.card} mb-4 ${dash.cardBody}`}>
          <p className="mb-3 text-xs text-slate-500">{t("incoming.respondHint")}</p>
          <ApplicantRequestContactActions request={item} />
          {!showPhone && item.allowPhoneContact === false ? (
            <p className="mt-2 text-xs text-slate-500">{t("incoming.phoneHiddenHint")}</p>
          ) : null}
        </div>
      ) : null}

      <div className={`${dash.card} ${dash.cardBody}`}>
        <dl>
          <DetailRow label={t("incoming.applicant")} value={applicantName} />
          <DetailRow label={t("requestDetail.needDescription")} value={item.description} />
          {item.requestType === "product" && item.quantity ? (
            <DetailRow
              label={t("requestDetail.quantity")}
              value={`${item.quantity}${item.unit ? ` ${item.unit}` : ""}`}
            />
          ) : null}
          {showPhone ? <DetailRow label={t("requestDetail.phone")} value={item.phone} /> : null}
          <DetailRow label={t("requestDetail.company")} value={item.company} />
          <DetailRow label={t("incoming.email")} value={applicant?.email} />
          <DetailRow label={t("requestDetail.notes")} value={item.notes} />
        </dl>
      </div>
    </div>
  );
}

export default function IncomingRequestDetailPage() {
  return (
    <ProtectedRoute>
      <IncomingRequestDetailContent />
    </ProtectedRoute>
  );
}
