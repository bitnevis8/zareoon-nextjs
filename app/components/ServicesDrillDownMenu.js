"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { useTradeServicesContent } from "../hooks/useTradeServicesContent";
import { CATEGORY_ICON_PATHS, getSubcategoryIconPath } from "../utils/tradeServiceIcons";

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

function ServiceIcon({ path, className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

/**
 * منوی خدمات — همان الگوی منوی محصولات (باتم‌بار موبایل)
 */
export default function ServicesDrillDownMenu({ isOpen, onClose, rootTitle }) {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const content = useTradeServicesContent();
  const menuRootTitle = rootTitle || t("mobileServicesTab") || "خدمات";
  const [stack, setStack] = useState([{ categoryId: null, title: menuRootTitle }]);

  const current = stack[stack.length - 1];
  const canGoBack = stack.length > 1;
  const isRootLevel = current.categoryId == null;

  const categories = useMemo(() => content?.categories || [], [content]);

  const activeCategory = useMemo(() => {
    if (!current.categoryId) return null;
    return categories.find((c) => c.id === current.categoryId) || null;
  }, [categories, current.categoryId]);

  const items = useMemo(() => {
    if (isRootLevel) {
      return categories.map((c) => ({
        id: c.id,
        title: c.title,
        drillable: Array.isArray(c.children) && c.children.length > 0,
        iconPath: CATEGORY_ICON_PATHS[c.icon || c.id] || CATEGORY_ICON_PATHS["specialized-trade"],
        href: `/trade-services/${c.id}`,
      }));
    }
    const children = activeCategory?.children || [];
    return children.map((sub) => ({
      id: sub.id,
      title: sub.title,
      drillable: false,
      iconPath: getSubcategoryIconPath(sub.id),
      href: `/trade-services/${activeCategory.id}`,
    }));
  }, [isRootLevel, categories, activeCategory]);

  useEffect(() => {
    if (!isOpen) {
      setStack([{ categoryId: null, title: menuRootTitle }]);
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

  const handleItemClick = (item) => {
    if (item.drillable) {
      setStack((prev) => [...prev, { categoryId: item.id, title: item.title }]);
      return;
    }
    onClose();
    router.push(item.href);
  };

  const handleBack = () => {
    if (!canGoBack) return;
    setStack((prev) => prev.slice(0, -1));
  };

  const viewAllCategory = () => {
    if (!activeCategory?.id) return;
    onClose();
    router.push(`/trade-services/${activeCategory.id}`);
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
          <h2 className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">{current.title}</h2>
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
          {!isRootLevel && activeCategory ? (
            <button
              type="button"
              onClick={viewAllCategory}
              className={`flex w-full items-center gap-2.5 border-b border-emerald-100 bg-emerald-50/60 px-3 py-2.5 text-[13px] font-bold text-emerald-800 transition active:bg-emerald-100 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ServiceIcon
                  path={CATEGORY_ICON_PATHS[activeCategory.icon || activeCategory.id] || "M8 6h8M8 10h8M8 14h5"}
                  className="h-4 w-4"
                />
              </span>
              <span className="min-w-0 flex-1">
                {t("tradeServicesBrowseCta") || "مشاهده همه ارائه‌دهندگان این دسته"}
              </span>
              <ChevronIcon className={isRTL ? "rotate-180" : ""} />
            </button>
          ) : null}

          {items.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] font-semibold leading-snug text-slate-800 transition active:bg-emerald-50/80 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <ServiceIcon path={item.iconPath} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 py-0.5">{item.title}</span>
                    {item.drillable ? <ChevronIcon className={isRTL ? "rotate-180" : ""} /> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              {t("tradeServicesNoProvidersYet") || "موردی ثبت نشده است."}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
