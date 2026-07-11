"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "../config/api";
import { useLanguage } from "../context/LanguageContext";
import { getLocalizedText } from "../utils/localize";
import { sortCatalogItems } from "../utils/productSort";
import { getMainCategoryIcon, isMainRootCategory } from "../utils/mainCategoryIcons";

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

export default function CategoryDrillDownMenu({ isOpen, onClose, rootTitle }) {
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const menuRootTitle = rootTitle || t("categoriesShort");
  const [stack, setStack] = useState([{ parentId: null, title: menuRootTitle }]);

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
    router.push(`/catalog/${item.id}`);
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
        aria-label={t("closeMenu")}
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-3 py-3 sm:px-4">
          {canGoBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-xl px-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              <ChevronIcon className={isRTL ? "" : "rotate-180"} />
              {t("back")}
            </button>
          ) : (
            <span className="w-16 shrink-0" aria-hidden />
          )}
          <h2 className="min-w-0 flex-1 truncate text-base font-bold text-slate-900 sm:text-lg">
            {current.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label={t("closeMenu")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="space-y-2 p-3 sm:p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <ul className="space-y-1.5 p-2 sm:p-3">
              {items.map((item) => {
                const label = getLocalizedText(item, language);
                const drillable = hasChildren(item.id);
                const showRootIcon = current.parentId == null && isMainRootCategory(item);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={`flex w-full min-h-[48px] items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-200 hover:bg-slate-50 active:bg-slate-100 sm:text-[15px] ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {showRootIcon ? (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                          {getMainCategoryIcon(item)}
                        </span>
                      ) : null}
                      <span className="min-w-0 flex-1 leading-snug">{label}</span>
                      {drillable ? (
                        <ChevronIcon className={isRTL ? "rotate-180" : ""} />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-12 text-center text-sm text-slate-500 sm:text-base">
              {t("noCategoryRegistered")}
            </p>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-500 sm:text-sm">
          {t("browseByCategoryHint")}
        </div>
      </aside>
    </div>
  );
}
