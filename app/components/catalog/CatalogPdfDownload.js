"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { generateCatalogPdf } from "@/app/utils/catalogPdf/generateCatalogPdf";
import { canDownloadCatalogPdf } from "@/app/utils/catalogPdfAccess";
import {
  resolveCatalogPdfLanguages,
} from "@/app/utils/catalogPdf/catalogPdfI18n";

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
  lot = null,
  lots = [],
  product = null,
  products = [],
}) {
  const auth = useAuth();
  const t = useTranslations("catalog");
  const user = userProp ?? auth?.user ?? null;
  const allowed = canDownloadCatalogPdf({ user, scope, productIsOrderable, supplierUserId });

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef(null);

  const languages = useMemo(
    () =>
      resolveCatalogPdfLanguages({
        lot,
        lots,
        product,
        products,
      }),
    [lot, lots, product, products]
  );

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (!allowed) return null;

  const download = async (language = "fa") => {
    setMenuOpen(false);
    setError("");
    setLoading(true);
    setProgress(t("pdf.preparing"));
    try {
      await generateCatalogPdf({
        scope,
        productId,
        categoryId,
        lotId,
        supplierUserId,
        productIsOrderable,
        user,
        language,
        onProgress: (p) => {
          if (typeof p === "string" && p.startsWith("page-")) {
            const [, cur, total] = p.split("-");
            setProgress(t("pdf.pageProgress", { current: cur, total }));
          } else if (p === "loading") setProgress(t("pdf.loadingData"));
          else if (p === "rendering") setProgress(t("pdf.renderingPages"));
          else if (p === "generating") setProgress(t("pdf.generating"));
        },
      });
    } catch (e) {
      console.error(e);
      setError(e?.message || t("pdf.buildError"));
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const onPrimaryClick = () => {
    if (loading) return;
    if (languages.length <= 1) {
      download(languages[0]?.code || "fa");
      return;
    }
    setMenuOpen((v) => !v);
  };

  const isCatalog = variant === "catalog";
  const btnBase = compact
    ? "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition"
    : "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition";

  const btnClass = isCatalog
    ? `${btnBase}${block ? " w-full justify-center" : ""} border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60`
    : `${btnBase}${block ? " w-full justify-center" : ""} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60`;

  return (
    <div
      ref={rootRef}
      className={`relative ${block ? "flex w-full flex-col" : "inline-flex flex-col items-stretch sm:items-start"} ${className}`}
    >
      <button type="button" disabled={loading} onClick={onPrimaryClick} className={btnClass} aria-expanded={menuOpen}>
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <span className="max-w-[140px] truncate">{progress || t("pdf.building")}</span>
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
            <span className="min-w-0 truncate">{label || t("downloadPdfDefault")}</span>
            {languages.length > 1 ? (
              <svg className="h-3.5 w-3.5 shrink-0 opacity-60" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            ) : null}
          </>
        )}
      </button>

      {menuOpen && languages.length > 1 ? (
        <>
          {/* موبایل: شیت پایین */}
          <div className="fixed inset-0 z-[80] sm:hidden" role="dialog" aria-modal="true" aria-label={t("pdf.chooseLanguage")}>
            <button
              type="button"
              className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
              aria-label={t("closeMenu")}
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" aria-hidden />
              <p className="mb-1 text-sm font-bold text-slate-900">{t("pdf.chooseLanguage")}</p>
              <p className="mb-3 text-xs leading-5 text-slate-500">{t("pdf.chooseLanguageHint")}</p>
              <ul className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <li key={lang.code}>
                    <button
                      type="button"
                      onClick={() => download(lang.code)}
                      className="flex w-full min-h-12 flex-col items-start justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-start transition hover:border-emerald-300 hover:bg-emerald-50"
                      dir={lang.dir}
                    >
                      <span className="text-sm font-bold text-slate-900">{lang.label}</span>
                      <span className="text-[11px] font-medium text-slate-500" dir="ltr">
                        {lang.shortLabel}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* دسکتاپ: منوی شناور */}
          <div className="absolute end-0 top-full z-[70] mt-1.5 hidden w-[min(100vw-2rem,16rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:block">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-xs font-bold text-slate-800">{t("pdf.chooseLanguage")}</p>
            </div>
            <ul className="max-h-64 overflow-y-auto p-1.5">
              {languages.map((lang) => (
                <li key={lang.code}>
                  <button
                    type="button"
                    onClick={() => download(lang.code)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-900"
                    dir={lang.dir}
                  >
                    <span>{lang.label}</span>
                    <span className="text-[11px] font-medium text-slate-400" dir="ltr">
                      {lang.shortLabel}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
