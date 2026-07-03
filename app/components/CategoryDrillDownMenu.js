"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "../config/api";
import { useLanguage } from "../context/LanguageContext";
import { getLocalizedText } from "../utils/localize";
import { sortCatalogItems } from "../utils/productSort";

function ChevronIcon({ className = "" }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-slate-400 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export default function CategoryDrillDownMenu({ isOpen, onClose }) {
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stack, setStack] = useState([{ parentId: null, title: t("categoriesShort") }]);

  const current = stack[stack.length - 1];
  const canGoBack = stack.length > 1;

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.supplier.products.getAll}?isOrderable=false`, {
        cache: "no-store",
      });
      const data = await res.json();
      setAllCategories(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setAllCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && allCategories.length === 0) {
      loadCategories();
    }
  }, [isOpen, allCategories.length, loadCategories]);

  useEffect(() => {
    if (!isOpen) {
      setStack([{ parentId: null, title: t("categoriesShort") }]);
    }
  }, [isOpen, t]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const items = useMemo(() => {
    const parentId = current.parentId;
    const filtered = allCategories.filter((item) => {
      if (parentId == null) return item.parentId == null;
      return Number(item.parentId) === Number(parentId);
    });
    return sortCatalogItems(filtered, language);
  }, [allCategories, current.parentId, language]);

  const hasChildren = useCallback(
    (categoryId) =>
      allCategories.some((item) => Number(item.parentId) === Number(categoryId)),
    [allCategories]
  );

  const handleItemClick = (item) => {
    const label = getLocalizedText(item, language);
    if (hasChildren(item.id)) {
      setStack((prev) => [...prev, { parentId: item.id, title: label }]);
      return;
    }
    onClose();
    router.push(`/catalog/${item.id}`);
  };

  const handleBack = () => {
    if (!canGoBack) return;
    setStack((prev) => prev.slice(0, -1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10002] lg:hidden" role="dialog" aria-modal="true" aria-label={t("categoriesShort")}>
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label={t("closeMenu")}
      />

      <aside className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-3.5">
          {canGoBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              <ChevronIcon className={isRTL ? "" : "rotate-180"} />
              {t("back")}
            </button>
          ) : (
            <span className="w-[4.5rem]" aria-hidden />
          )}
          <h2 className={`flex-1 truncate text-base font-bold text-slate-900 ${isRTL ? "text-right" : "text-left"}`}>
            {current.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label={t("closeMenu")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <ul className="divide-y divide-slate-100 p-2">
              {items.map((item) => {
                const label = getLocalizedText(item, language);
                const drillable = hasChildren(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 active:bg-slate-100 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      <span className="flex-1 truncate">{label}</span>
                      {drillable ? (
                        <ChevronIcon className={isRTL ? "rotate-180" : ""} />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-slate-500">{t("noCategoryRegistered")}</p>
          )}
        </div>

        <div className="border-t border-slate-100 px-4 py-3 text-center text-[11px] text-slate-400">
          {t("browseByCategoryHint")}
        </div>
      </aside>
    </div>
  );
}
