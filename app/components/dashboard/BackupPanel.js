"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch, getAuthHeaders } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";
import DataExportImportButtons, { downloadExport } from "@/app/components/dashboard/DataExportImportButtons";
import { dash } from "@/app/components/dashboard/dashboardTheme";

const SECTION_LABEL_KEYS = {
  products: "sectionProducts",
  inventoryLots: "sectionInventory",
  attributeDefinitions: "sectionAttributeDefs",
  attributeValues: "sectionAttributeValues",
  users: "sectionUsers",
  roles: "sectionRoles",
  userRoles: "sectionUserRoles",
  orders: "sectionOrders",
  orderItems: "sectionOrderItems",
  orderRequestItems: "sectionOrderRequests",
  transactionHistory: "sectionTransactions",
  siteSettings: "sectionSiteSettings",
  locations: "sectionLocations",
  tradeServiceProviders: "sectionTradeProviders",
  applicantRequests: "sectionApplicantRequests",
  escrowRules: "sectionEscrowRules",
  escrowAgreements: "sectionEscrowAgreements",
};

export default function BackupPanel() {
  const t = useTranslations("backup");
  const fileRef = useRef(null);
  const [sections, setSections] = useState([]);
  const [busy, setBusy] = useState(false);
  const [fullMode, setFullMode] = useState("merge");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(API_ENDPOINTS.backup.sections, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.success) setSections(json.data || []);
      } catch {
        /* ignore — still show known sections from labels */
        if (!cancelled) {
          setSections(Object.keys(SECTION_LABEL_KEYS).map((key) => ({ key, label: key })));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFullExport = async () => {
    setBusy(true);
    try {
      await downloadExport(API_ENDPOINTS.backup.exportFull, "zareoon-full-backup.json");
      showToast.success(t("fullExportSuccess"));
    } catch (e) {
      showToast.error(e.message || t("exportError"));
    } finally {
      setBusy(false);
    }
  };

  const handleFullImport = async (file) => {
    if (!file) return;
    if (fullMode === "replace" && !confirm(t("fullReplaceConfirm"))) return;
    if (!confirm(t("fullImportConfirm"))) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const url = `${API_ENDPOINTS.backup.importFull}?mode=${encodeURIComponent(fullMode)}`;
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || t("importError"));
      showToast.success(t("fullImportSuccess"));
    } catch (e) {
      showToast.error(e.message || t("importError"));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const sectionList =
    sections.length > 0
      ? sections
      : Object.keys(SECTION_LABEL_KEYS).map((key) => ({ key, label: key }));

  return (
    <section className={`${dash.card} space-y-5`}>
      <div>
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">{t("fullTitle")}</h2>
        <p className="mt-1 text-sm text-slate-600">{t("fullDesc")}</p>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
        <p className="mb-3 text-sm font-semibold text-emerald-900">{t("fullBackupCard")}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={handleFullExport}
            className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
          >
            {busy ? t("working") : t("exportFull")}
          </button>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={fullMode}
            disabled={busy}
            onChange={(e) => setFullMode(e.target.value)}
          >
            <option value="merge">{t("modeMerge")}</option>
            <option value="replace">{t("modeReplace")}</option>
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {t("importFull")}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => handleFullImport(e.target.files?.[0])}
          />
        </div>
        <p className="mt-2 text-xs text-slate-600">{t("importModeHint")}</p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-slate-800">{t("sectionsTitle")}</h3>
        <p className="mb-3 text-xs text-slate-500">{t("sectionsDesc")}</p>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
          {sectionList.map((s) => (
            <div
              key={s.key}
              className="flex flex-col gap-2 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {t(SECTION_LABEL_KEYS[s.key] || "sectionGeneric", { name: s.key })}
                </p>
                <p className="font-mono text-[11px] text-slate-400">{s.key}</p>
              </div>
              <DataExportImportButtons section={s.key} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
