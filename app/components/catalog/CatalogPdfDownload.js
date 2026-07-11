"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { generateCatalogPdf } from "@/app/utils/catalogPdf/generateCatalogPdf";
import { canDownloadCatalogPdf } from "@/app/utils/catalogPdfAccess";

export default function CatalogPdfDownload({
  scope = "full",
  productId,
  categoryId,
  lotId,
  supplierUserId,
  productIsOrderable = true,
  user: userProp,
  label,
  variant = "catalog",
  className = "",
  compact = false,
  block = false,
}) {
  const auth = useAuth();
  const user = userProp ?? auth?.user ?? null;
  const allowed = canDownloadCatalogPdf({ user, scope, productIsOrderable, supplierUserId });

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  if (!allowed) return null;

  const download = async () => {
    setError("");
    setLoading(true);
    setProgress("در حال آماده‌سازی…");
    try {
      await generateCatalogPdf({
        scope,
        productId,
        categoryId,
        lotId,
        supplierUserId,
        productIsOrderable,
        user,
        onProgress: (p) => {
          if (typeof p === "string" && p.startsWith("page-")) {
            const [, cur, total] = p.split("-");
            setProgress(`صفحه ${cur} از ${total}`);
          } else if (p === "loading") setProgress("بارگذاری داده…");
          else if (p === "rendering") setProgress("آماده‌سازی صفحات…");
          else if (p === "generating") setProgress("ساخت PDF…");
        },
      });
    } catch (e) {
      console.error(e);
      setError(e?.message || "خطا در ساخت PDF. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const isCatalog = variant === "catalog";
  const btnBase = compact
    ? "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition"
    : "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition";

  const btnClass = isCatalog
    ? `${btnBase}${block ? " w-full justify-center" : ""} border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60`
    : `${btnBase}${block ? " w-full justify-center" : ""} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60`;

  return (
    <div className={`${block ? "flex w-full flex-col" : "inline-flex flex-col items-start"} ${className}`}>
      <button type="button" disabled={loading} onClick={download} className={btnClass}>
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <span className="max-w-[140px] truncate">{progress || "در حال ساخت…"}</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {label || "دانلود PDF"}
          </>
        )}
      </button>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
