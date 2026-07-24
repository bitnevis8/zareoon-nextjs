"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import DashboardListToolbar, { DashboardItemActions } from "@/app/components/dashboard/DashboardListToolbar";

function ApplicantRequestsListContent() {
  const router = useRouter();
  const t = useTranslations("applicant");
  const tCommon = useTranslations("common");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("cards");

  const statusLabel = (status) => (t.has(`status.${status}`) ? t(`status.${status}`) : status);

  useEffect(() => {
    authFetch(API_ENDPOINTS.applicantRequests.mine, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => setRequests(Array.isArray(json?.data) ? json.data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();
    return requests.filter((item) => {
      if (typeFilter && item.requestType !== typeFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${item.title || ""} ${item.categoryLabel || ""} ${item.id || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [requests, appliedSearch, typeFilter, statusFilter]);

  const filterCount = [typeFilter, statusFilter].filter(Boolean).length;

  return (
    <div className={dash.page}>
      <header className="mb-4 sm:mb-6">
        <h1 className={dash.pageTitle}>{t("requestsList.title")}</h1>
        <p className={dash.pageSubtitle}>{t("requestsList.subtitle")}</p>
      </header>

      <div className="mb-4">
        <DashboardListToolbar
          searchDraft={searchDraft}
          onSearchDraftChange={setSearchDraft}
          onSearchSubmit={() => setAppliedSearch(searchDraft.trim())}
          searchPlaceholder="جستجو در درخواست‌ها…"
          searchButtonLabel="جستجو"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filterOpen={filterOpen}
          onToggleFilter={() => setFilterOpen((v) => !v)}
          filterActiveCount={filterCount}
          filterLabel="فیلتر"
          filterPanel={
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-500">نوع</label>
                <select
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">همه</option>
                  <option value="product">{t("type.product")}</option>
                  <option value="service">{t("type.service")}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-500">وضعیت</label>
                <select
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">همه</option>
                  <option value="open">{statusLabel("open")}</option>
                  <option value="in_progress">{statusLabel("in_progress")}</option>
                  <option value="closed">{statusLabel("closed")}</option>
                  <option value="cancelled">{statusLabel("cancelled")}</option>
                </select>
              </div>
            </div>
          }
          resultLabel={
            loading ? null : `${filtered.length.toLocaleString("fa-IR")} از ${requests.length.toLocaleString("fa-IR")}`
          }
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">{tCommon("loading")}</p>
      ) : requests.length === 0 ? (
        <div className={`${dash.card} ${dash.cardBody}`}>
          <p className="text-sm text-slate-600">{t("requestsList.empty")}</p>
          <Link href="/dashboard/submit-request" className={`mt-4 inline-flex ${dash.btnPrimary}`}>
            {t("form.newRequest")}
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${dash.card} ${dash.cardBody}`}>
          <p className="text-sm text-slate-600">نتیجه‌ای یافت نشد</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {filtered.map((item) => (
            <article key={item.id} className={`${dash.card} overflow-hidden`}>
              <div className={`${dash.cardBody} space-y-2`}>
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.categoryLabel}</p>
                <p className="text-[11px] text-slate-400">
                  {statusLabel(item.status)} ·{" "}
                  {item.requestType === "product" ? t("type.product") : t("type.service")}
                </p>
                <DashboardItemActions
                  compact
                  onView={() => router.push(`/dashboard/applicant-requests/${item.id}`)}
                  viewLabel="مشاهده"
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <ul className={`${dash.card} overflow-hidden`}>
          {filtered.map((item) => (
            <li key={item.id} className="border-b border-slate-100 px-3 py-2.5 last:border-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {statusLabel(item.status)} · {item.categoryLabel}
                  </p>
                </div>
                <DashboardItemActions
                  compact
                  onView={() => router.push(`/dashboard/applicant-requests/${item.id}`)}
                  viewLabel="مشاهده"
                />
              </div>
            </li>
          ))}
        </ul>
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
