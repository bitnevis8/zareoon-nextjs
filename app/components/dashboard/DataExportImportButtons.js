"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch, getAuthHeaders } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";

async function downloadExport(url, fallbackName) {
  const res = await authFetch(url, { cache: "no-store" });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.message) message = j.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition") || "";
  const match = cd.match(/filename=\"?([^\";]+)\"?/i);
  const filename = match?.[1] || fallbackName;
  const a = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

/**
 * Compact export/import controls for a single backup section.
 * @param {{ section: string, onImported?: () => void, className?: string, compact?: boolean }} props
 */
export default function DataExportImportButtons({
  section,
  onImported,
  className = "",
  compact = false,
}) {
  const t = useTranslations("backup");
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("merge");

  const handleExport = async () => {
    setBusy(true);
    try {
      await downloadExport(
        API_ENDPOINTS.backup.exportSection(section),
        `zareoon-${section}.json`
      );
      showToast.success(t("exportSuccess"));
    } catch (e) {
      showToast.error(e.message || t("exportError"));
    } finally {
      setBusy(false);
    }
  };

  const handleImportFile = async (file) => {
    if (!file) return;
    if (mode === "replace" && !confirm(t("replaceConfirm"))) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const url = `${API_ENDPOINTS.backup.importSection(section)}?mode=${encodeURIComponent(mode)}`;
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || t("importError"));
      const d = json.data || {};
      showToast.success(
        t("importSuccessDetail", {
          created: d.created ?? 0,
          updated: d.updated ?? 0,
          skipped: d.skipped ?? 0,
        })
      );
      onImported?.();
    } catch (e) {
      showToast.error(e.message || t("importError"));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const btnBase = compact
    ? "rounded-md border px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50"
    : "rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:opacity-50";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        disabled={busy}
        onClick={handleExport}
        className={`${btnBase} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
      >
        {busy ? t("working") : t("export")}
      </button>
      <select
        className={`${btnBase} border-slate-200 bg-white text-slate-700`}
        value={mode}
        disabled={busy}
        onChange={(e) => setMode(e.target.value)}
        title={t("importModeHint")}
      >
        <option value="merge">{t("modeMerge")}</option>
        <option value="replace">{t("modeReplace")}</option>
      </select>
      <button
        type="button"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
        className={`${btnBase} border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100`}
      >
        {t("import")}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => handleImportFile(e.target.files?.[0])}
      />
    </div>
  );
}

export { downloadExport };
