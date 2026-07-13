"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { useLanguage } from "@/app/context/LanguageContext";
import {
  mapProductResults,
  mergeQuickSearchResults,
  searchServiceCatalog,
  searchServiceProviders,
} from "@/app/utils/quickSearchUtils";

const INPUT_CLASS =
  "w-full min-h-11 rounded-full border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:px-5 sm:text-sm";

function ExploreIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function resultBadge(item, t) {
  if (item.kind === "service_provider") return t("quickSearchServiceProvider");
  if (item.kind === "service_category" || item.kind === "service_subcategory") return t("quickSearchService");
  if (item.kind === "product") return t("product");
  return t("category");
}

/**
 * جستجوی سریع — محصولات + خدمات؛ دکمه جدا برای کاوش پیشرفته
 */
export default function QuickSearchBox({
  className = "",
  inputClassName = "",
  variant = "homepage",
  autoFocus = false,
  initialQuery = "",
}) {
  const router = useRouter();
  const { language, t, isRTL } = useLanguage();
  const rootRef = useRef(null);
  const providersRef = useRef(null);
  const [q, setQ] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const isHomepage = variant === "homepage";
  const textAlign = isRTL ? "text-right" : "text-left";
  const inputClass = `${inputClassName || INPUT_CLASS} ${textAlign}`;

  useEffect(() => {
    if (providersRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.tradeServiceProviders.getPublic, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled) providersRef.current = Array.isArray(json?.data) ? json.data : [];
      } catch {
        if (!cancelled) providersRef.current = [];
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const query = q.trim();
      if (!query) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const [productsRes] = await Promise.all([
          fetch(
            `${API_ENDPOINTS.supplier.products.getAll}?q=${encodeURIComponent(query)}&limit=16`,
            { cache: "no-store" }
          ),
        ]);
        const productsJson = await productsRes.json();
        const products = mapProductResults(productsJson?.data || [], language);
        const services = searchServiceCatalog(query, language);
        const providers = searchServiceProviders(providersRef.current || [], query, language);
        setResults(mergeQuickSearchResults({ products, services, providers }));
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [q, language]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const exploreHref = q.trim()
    ? `/search?mode=explore&q=${encodeURIComponent(q.trim())}`
    : "/search?mode=explore";

  const goExplore = () => {
    setOpen(false);
    router.push(exploreHref);
  };

  return (
    <div
      ref={rootRef}
      className={`relative mx-auto w-full ${isHomepage ? "max-w-xl px-1 sm:px-2" : "max-w-2xl"} ${className}`}
    >
      <input
        type="search"
        autoFocus={autoFocus}
        className={inputClass}
        placeholder={t("searchPlaceholder")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        enterKeyHint="search"
        autoComplete="off"
        dir={isRTL ? "rtl" : "ltr"}
      />

      {open ? (
        <div className={`absolute z-20 inset-x-0 mt-2 space-y-2 ${textAlign}`}>
          <button
            type="button"
            onClick={goExplore}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-emerald-200/90 bg-gradient-to-b from-emerald-50/90 to-white px-4 py-2.5 text-start shadow-sm transition hover:border-emerald-300 hover:from-emerald-50 hover:shadow-md"
          >
            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ExploreIcon />
              </span>
              <span className="text-xs font-semibold leading-snug text-emerald-900 sm:text-sm">
                {t("searchAdvancedHint")}
              </span>
            </span>
            <span className={`shrink-0 text-emerald-500 ${isRTL ? "" : "rotate-180"}`} aria-hidden>
              ‹
            </span>
          </button>

          {q.trim() ? (
            <div className="max-h-[min(20rem,55vh)] overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {searching ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between px-3 py-2.5 animate-pulse">
                      <div className="h-4 w-32 rounded bg-slate-200" />
                      <div className="h-4 w-12 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : results.length ? (
                results.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50 active:bg-slate-100"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-slate-800 break-words">{item.label}</p>
                      {item.parentLabel ? (
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">{item.parentLabel}</p>
                      ) : item.categoryLabel ? (
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">{item.categoryLabel}</p>
                      ) : null}
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {resultBadge(item, t)}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-sm text-slate-500">{t("nothingFound")}</div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
