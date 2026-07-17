"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useAuth } from "@/app/context/AuthContext";
import { isAdmin } from "@/app/utils/roles";
import { showToast } from "@/app/utils/toast";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import DataExportImportButtons from "@/app/components/dashboard/DataExportImportButtons";

import {
  findCatalogService,
  getL1Categories,
} from "@/app/data/tradeServicesCatalog";

const STATUS_CLASSES = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

function resolveServiceLabels(services) {
  if (!Array.isArray(services)) return [];
  return services.map((item) => {
    const found = findCatalogService("fa", item.categoryId, item.subcategoryId);
    return {
      key: `${item.categoryId}:${item.subcategoryId}`,
      categoryTitle: found?.categoryTitle || item.categoryId,
      subcategoryTitle: found?.subcategoryTitle || item.subcategoryId,
    };
  });
}

export default function TradeServiceProvidersDashboardContent({
  variant = "providers",
  defaultStatusFilter = "",
}) {
  const t = useTranslations("product");
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus =
    searchParams.get("status") || (variant === "membership-requests" ? defaultStatusFilter : defaultStatusFilter);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const admin = isAdmin(auth?.user);
  const categories = useMemo(() => getL1Categories("fa"), []);

  const statusLabel = (key) => t(`tradeProviders.status.${key}`);
  const entityLabel = (key) => t(`tradeProviders.entityType.${key}`);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      const query = params.toString() ? `?${params.toString()}` : "";
      const [listRes, statsRes] = await Promise.all([
        authFetch(`${API_ENDPOINTS.tradeServiceProviders.getAll}${query}`, { cache: "no-store" }),
        authFetch(API_ENDPOINTS.tradeServiceProviders.getAll, { cache: "no-store" }),
      ]);
      if (listRes.ok) {
        const data = await listRes.json();
        setProviders(data.data || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const rows = statsData.data || [];
        const nextStats = { pending: 0, approved: 0, rejected: 0 };
        rows.forEach((p) => {
          if (nextStats[p.status] != null) nextStats[p.status] += 1;
        });
        setStats(nextStats);
      }
    } catch (error) {
      console.error("Error loading trade providers:", error);
      showToast.error(t("tradeProviders.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth?.loading && !admin) {
      router.replace("/dashboard");
      return;
    }
    if (admin) loadProviders();
  }, [auth?.loading, admin, router, statusFilter, categoryFilter]);

  const openDetail = (item) => {
    setSelected(item);
    setAdminNotes(item.adminNotes || "");
    setStatus(item.status);
  };

  const saveUpdate = async (nextStatus) => {
    if (!selected) return;
    const statusToSave = nextStatus ?? status;
    setSaving(true);
    try {
      const response = await authFetch(API_ENDPOINTS.tradeServiceProviders.updateStatus(selected.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToSave, adminNotes }),
      });
      const data = await response.json();
      if (response.ok) {
        showToast.success(
          statusToSave === "approved" ? t("tradeProviders.approveSuccess") : data.message
        );
        setSelected(null);
        loadProviders();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("trade-provider-pending-updated"));
          window.dispatchEvent(new CustomEvent("trade-provider-mine-updated"));
        }
      } else {
        showToast.error(data.message || t("tradeProviders.updateError"));
      }
    } catch {
      showToast.error(t("tradeProviders.updateError"));
    } finally {
      setSaving(false);
    }
  };

  const selectedServices = useMemo(
    () => resolveServiceLabels(selected?.selectedServices),
    [selected]
  );

  const counts = stats;

  const pageTitle =
    variant === "membership-requests"
      ? t("tradeProviders.membershipRequestsTitle")
      : t("tradeProviders.providersListTitle");
  const pageSubtitle =
    variant === "membership-requests"
      ? t("tradeProviders.membershipRequestsSubtitle")
      : t("tradeProviders.providersListSubtitle");

  const emptyMessage =
    variant === "membership-requests"
      ? t("tradeProviders.noPendingRequests")
      : t("tradeProviders.noRegistrations");

  if (auth?.loading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className={dash.page}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={dash.pageTitle}>{pageTitle}</h1>
          <p className={dash.pageSubtitle}>
            {pageSubtitle}{" "}
            {variant !== "membership-requests" ? (
              <Link href="/dashboard/settings" className="font-medium text-emerald-700 hover:underline">
                {t("tradeProviders.autoApproveSettingsLink")}
              </Link>
            ) : (
              <Link href="/dashboard/trade-service-providers" className="font-medium text-emerald-700 hover:underline">
                {t("tradeProviders.allProvidersLink")}
              </Link>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <DataExportImportButtons
            section="tradeServiceProviders"
            onImported={loadProviders}
            compact
          />
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-900">
            {t("tradeProviders.pendingCount", { count: counts.pending.toLocaleString("fa-IR") })}
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">
            {t("tradeProviders.approvedCount", { count: counts.approved.toLocaleString("fa-IR") })}
          </span>
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-800">
            {t("tradeProviders.rejectedCount", { count: counts.rejected.toLocaleString("fa-IR") })}
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">{t("tradeProviders.statusFilterLabel")}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[10rem] rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">{t("tradeProviders.allStatuses")}</option>
            {["pending", "approved", "rejected"].map((key) => (
              <option key={key} value={key}>
                {statusLabel(key)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">{t("tradeProviders.categoryFilterLabel")}</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-w-[14rem] rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="">{t("tradeProviders.allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={`${dash.card} overflow-hidden`}>
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-slate-600">#</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">{t("tradeProviders.colName")}</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">{t("tradeProviders.colType")}</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">{t("tradeProviders.colContact")}</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">{t("tradeProviders.colServices")}</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">{t("tradeProviders.colStatus")}</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">{t("tradeProviders.colDate")}</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">{t("tradeProviders.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {providers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                providers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.displayName}</td>
                    <td className="px-4 py-3 text-slate-600">{entityLabel(item.entityType) || item.entityType}</td>
                    <td className="px-4 py-3" dir="ltr">
                      {item.phone}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {t("tradeProviders.serviceCount", {
                        count: (item.selectedServices?.length || item.subcategoryIds?.length || 0).toLocaleString(
                          "fa-IR"
                        ),
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[item.status] || ""}`}
                      >
                        {statusLabel(item.status) || item.status}
                      </span>
                      {item.pendingChanges && item.status === "approved" ? (
                        <span className="mr-1.5 inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                          {t("tradeProviders.editPending")}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("fa-IR") : t("emDash")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDetail(item)}
                        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                      >
                        {t("tradeProviders.detailsApprove")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {providers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">{emptyMessage}</p>
          ) : (
            providers.map((item) => (
              <div key={item.id} className="space-y-2 px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{item.displayName}</p>
                    <p className="text-xs text-slate-500">{entityLabel(item.entityType)}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CLASSES[item.status] || ""}`}
                  >
                    {statusLabel(item.status)}
                  </span>
                </div>
                <p className="text-sm text-slate-600" dir="ltr">
                  {item.phone}
                </p>
                <button
                  type="button"
                  onClick={() => openDetail(item)}
                  className="text-xs font-semibold text-emerald-700"
                >
                  {t("tradeProviders.detailsAndApprove")}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
              <h2 className="text-base font-bold text-slate-900">
                {t("tradeProviders.registrationDetails", { id: selected.id })}
              </h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label={t("tradeProviders.closeAria")}
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 px-4 py-5 sm:px-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label={t("tradeProviders.displayName")} value={selected.displayName} />
                <Detail label={t("tradeProviders.colType")} value={entityLabel(selected.entityType)} />
                <Detail label={t("tradeProviders.contactName")} value={selected.contactName} />
                <Detail label={t("tradeProviders.phone")} value={selected.phone} dir="ltr" />
                <Detail label={t("tradeProviders.email")} value={selected.email || t("emDash")} dir="ltr" />
                <Detail
                  label={t("tradeProviders.experienceYears")}
                  value={selected.experienceYears != null ? String(selected.experienceYears) : t("emDash")}
                />
              </div>

              {selected.user ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-sm">
                  <p className="mb-1 text-xs font-semibold text-slate-500">{t("tradeProviders.linkedUser")}</p>
                  <p className="font-medium text-slate-800">
                    {[selected.user.firstName, selected.user.lastName].filter(Boolean).join(" ") ||
                      selected.user.username}
                  </p>
                  <p className="text-xs text-slate-500" dir="ltr">
                    {selected.user.email || selected.user.mobile}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">{t("tradeProviders.noLinkedUser")}</p>
              )}

              {selected.pendingChanges ? (
                <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                  <p className="font-bold">{t("tradeProviders.editPendingTitle")}</p>
                  <p className="mt-1 text-xs leading-6">{t("tradeProviders.editPendingDesc")}</p>
                </div>
              ) : null}

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-600">{t("tradeProviders.selectedServices")}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((svc) => (
                    <span
                      key={svc.key}
                      className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-2.5 py-1 text-xs text-emerald-900"
                    >
                      {svc.categoryTitle} — {svc.subcategoryTitle}
                    </span>
                  ))}
                </div>
              </div>

              {selected.countriesRoutes ? (
                <DetailBlock label={t("tradeProviders.countriesRoutes")} value={selected.countriesRoutes} />
              ) : null}
              {selected.licenses ? <DetailBlock label={t("tradeProviders.licenses")} value={selected.licenses} /> : null}
              {selected.servicesOffered ? (
                <DetailBlock label={t("tradeProviders.servicesOffered")} value={selected.servicesOffered} />
              ) : null}
              {selected.notes ? <DetailBlock label={t("tradeProviders.applicantNotes")} value={selected.notes} /> : null}

              {selected.status === "approved" && selected.id ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-sm">
                  <p className="text-xs font-semibold text-emerald-800">{t("tradeProviders.dedicatedPage")}</p>
                  <Link
                    href={`/trade-services/provider/${selected.id}`}
                    className="mt-1 inline-block font-medium text-emerald-900 hover:underline"
                    target="_blank"
                  >
                    {t("tradeProviders.viewPublicProviderPage")}
                  </Link>
                </div>
              ) : null}

              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-slate-700">{t("tradeProviders.colStatus")}</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  >
                    {["pending", "approved", "rejected"].map((key) => (
                      <option key={key} value={key}>
                        {statusLabel(key)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-slate-700">{t("tradeProviders.adminNotes")}</span>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder={t("tradeProviders.adminNotesPlaceholder")}
                  />
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => saveUpdate("approved")}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {t("tradeProviders.approve")}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => saveUpdate("rejected")}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {t("tradeProviders.reject")}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => saveUpdate()}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {saving ? t("tradeProviders.saving") : t("tradeProviders.saveChanges")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Detail({ label, value, dir }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900" dir={dir}>
        {value}
      </p>
    </div>
  );
}

function DetailBlock({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-slate-600">{label}</p>
      <p className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm leading-7 text-slate-700">
        {value}
      </p>
    </div>
  );
}
