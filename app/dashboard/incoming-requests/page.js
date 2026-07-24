"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import ApplicantRequestContactActions from "@/app/components/dashboard/ApplicantRequestContactActions";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import DashboardListToolbar, { DashboardItemActions } from "@/app/components/dashboard/DashboardListToolbar";

function IncomingRequestsListContent() {
  const router = useRouter();
  const t = useTranslations("applicant");
  const tCommon = useTranslations("common");
  const { isSellerView } = useDashboardPersona();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("cards");

  const copyKey = isSellerView ? "incoming.seller" : "incoming.services";

  useEffect(() => {
    authFetch(`${API_ENDPOINTS.applicantRequests.notifications}?limit=50`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((json) => setItems(Array.isArray(json?.data) ? json.data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();
    return items.filter((n) => {
      if (unreadOnly && n.readAt) return false;
      if (!q) return true;
      const req = n.request || {};
      const hay = `${req.title || ""} ${req.categoryLabel || ""} ${n.requestId || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, appliedSearch, unreadOnly]);

  return (
    <div className={dash.page}>
      <header className="mb-4 sm:mb-6">
        <h1 className={dash.pageTitle}>{t(`${copyKey}.title`)}</h1>
        <p className={dash.pageSubtitle}>{t(`${copyKey}.subtitle`)}</p>
      </header>

      <div className="mb-4">
        <DashboardListToolbar
          searchDraft={searchDraft}
          onSearchDraftChange={setSearchDraft}
          onSearchSubmit={() => setAppliedSearch(searchDraft.trim())}
          searchPlaceholder="جستجو در درخواست‌های دریافتی…"
          searchButtonLabel="جستجو"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filterOpen={filterOpen}
          onToggleFilter={() => setFilterOpen((v) => !v)}
          filterActiveCount={unreadOnly ? 1 : 0}
          filterLabel="فیلتر"
          filterPanel={
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
              />
              فقط خوانده‌نشده
            </label>
          }
          resultLabel={
            loading ? null : `${filtered.length.toLocaleString("fa-IR")} از ${items.length.toLocaleString("fa-IR")}`
          }
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">{tCommon("loading")}</p>
      ) : items.length === 0 ? (
        <div className={`${dash.card} ${dash.cardBody}`}>
          <p className="text-sm text-slate-600">{t("incoming.empty")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${dash.card} ${dash.cardBody}`}>
          <p className="text-sm text-slate-600">نتیجه‌ای یافت نشد</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {filtered.map((n) => {
            const req = n.request;
            const detailHref = `/dashboard/incoming-requests/${req?.id || n.requestId}`;
            return (
              <article
                key={n.id}
                className={`${dash.card} overflow-hidden ${!n.readAt ? "border-sky-200 bg-sky-50/30" : ""}`}
              >
                <div className={`${dash.cardBody} space-y-2`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{req?.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{req?.categoryLabel}</p>
                    </div>
                    {!n.readAt ? (
                      <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {t("incoming.newBadge")}
                      </span>
                    ) : null}
                  </div>
                  <DashboardItemActions
                    compact
                    onView={() => router.push(detailHref)}
                    viewLabel="مشاهده"
                  />
                  <ApplicantRequestContactActions request={req} compact />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <ul className={`${dash.card} overflow-hidden`}>
          {filtered.map((n) => {
            const req = n.request;
            const detailHref = `/dashboard/incoming-requests/${req?.id || n.requestId}`;
            return (
              <li
                key={n.id}
                className={`border-b border-slate-100 px-3 py-2.5 last:border-0 ${
                  !n.readAt ? "bg-sky-50/40" : ""
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{req?.title}</p>
                    <p className="text-[11px] text-slate-500">{req?.categoryLabel}</p>
                  </div>
                  <DashboardItemActions
                    compact
                    onView={() => router.push(detailHref)}
                    viewLabel="مشاهده"
                  />
                </div>
                <div className="mt-1.5">
                  <ApplicantRequestContactActions request={req} compact />
                </div>
              </li>
            );
          })}
        </ul>
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
