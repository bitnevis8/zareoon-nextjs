"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "../config/api";
import { useLanguage } from "../context/LanguageContext";
import { getLocalizedText } from "../utils/localize";
import { sortCatalogItems } from "../utils/productSort";
import { getMainCategoryIcon, isMainRootCategory } from "../utils/mainCategoryIcons";
import { catalogProductPath } from "../utils/catalogProductPath";

function ChevronIcon({ className = "" }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-400 ${className}`}
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

export default function CategoryDrillDownMenu({ isOpen, onClose, rootTitle }) {
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const menuRootTitle = rootTitle || t("categoriesShort");
  const [stack, setStack] = useState([{ parentId: null, title: menuRootTitle }]);

  const current = stack[stack.length - 1];
  const canGoBack = stack.length > 1;
  const isRootLevel = current.parentId == null;

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
      setStack([{ parentId: null, title: menuRootTitle }]);
    }
  }, [isOpen, menuRootTitle]);

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
    router.push(catalogProductPath(item));
  };

  const handleBack = () => {
    if (!canGoBack) return;
    setStack((prev) => prev.slice(0, -1));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10002] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={menuRootTitle}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t("close") || "بستن"}
      />

      <aside className="absolute inset-x-0 bottom-0 top-[max(0.5rem,env(safe-area-inset-top))] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:inset-y-0 sm:start-auto sm:end-0 sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none">
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-2.5 py-2">
          {canGoBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex min-h-9 items-center gap-0.5 rounded-lg px-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              <ChevronIcon className={isRTL ? "" : "rotate-180"} />
              {t("back")}
            </button>
          ) : (
            <span className="w-2 shrink-0" aria-hidden />
          )}
          <h2 className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">
            {current.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
            aria-label={t("close") || "بستن"}
          >
            <span>{t("close") || "بستن"}</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y pb-[calc(4.25rem+env(safe-area-inset-bottom))] sm:pb-0">
          {loading ? (
            <div className="divide-y divide-base-200 px-1" aria-busy="true">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 px-2 py-2">
                  <div className="skeleton h-8 w-8 shrink-0 rounded-lg" />
                  <div className="skeleton h-3 w-2/3 rounded-md" />
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => {
                const label = getLocalizedText(item, language);
                const drillable = hasChildren(item.id);
                const showRootIcon = isRootLevel && isMainRootCategory(item);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] font-semibold leading-snug text-slate-800 transition active:bg-emerald-50/80 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {showRootIcon ? (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-base leading-none">
                          {getMainCategoryIcon(item)}
                        </span>
                      ) : (
                        <span className="h-8 w-1 shrink-0 rounded-full bg-emerald-100/80" aria-hidden />
                      )}
                      <span className="min-w-0 flex-1 py-0.5">{label}</span>
                      {drillable ? (
                        <ChevronIcon className={isRTL ? "rotate-180" : ""} />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              {t("noCategoryRegistered")}
            </p>
          )}
        </div>

        <div className="hidden shrink-0 border-t border-slate-100 px-3 py-2 text-center text-[11px] text-slate-400 sm:block">
          {t("browseByCategoryHint")}
        </div>
      </aside>
    </div>
  );
}
