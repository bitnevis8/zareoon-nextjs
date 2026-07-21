"use client";

import { useMemo, useState } from "react";
import { resolveVipCategoryMessage } from "@/app/utils/vipCategoryHelpers";
import { isPlatformExclusiveCategory } from "@/app/utils/platformExclusiveCategories";

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
    </svg>
  );
}

/**
 * @typedef {{ key: string, categoryId: string, subcategoryId: string, categoryTitle: string, subcategoryTitle: string }} CatalogService
 */

function getServiceKey(item) {
  return item.key || `${item.categoryId}:${item.subcategoryId}`;
}

export default function TradeProviderServicePicker({
  categories,
  selected,
  onChange,
  initialExpandedCategoryId = "",
  vipCategories = {},
  language = "fa",
  t,
  isRTL,
  catalogClassName = "",
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(() =>
    initialExpandedCategoryId ? new Set([initialExpandedCategoryId]) : new Set()
  );

  const selectedKeys = useMemo(() => new Set(selected.map(getServiceKey)), [selected]);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        children: cat.children.filter(
          (sub) =>
            sub.title.toLowerCase().includes(q) ||
            cat.title.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.children.length > 0);
  }, [categories, query]);

  const toggleExpand = (categoryId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const addService = (item) => {
    const key = getServiceKey(item);
    if (selectedKeys.has(key)) return;
    if (vipCategories[item.categoryId]?.enabled || isPlatformExclusiveCategory(item.categoryId)) return;
    onChange([...selected, { ...item, key }]);
  };

  const removeService = (key) => {
    onChange(selected.filter((s) => getServiceKey(s) !== key));
  };

  return (
    <div className="space-y-4">
      {selected.length > 0 ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 sm:p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-emerald-800 sm:text-sm">{t("tradeProviderSelectedServices")}</p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
              {t("tradeProviderServicesCount", { count: selected.length })}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((item) => (
              <span
                key={getServiceKey(item)}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-200 bg-white py-1 pe-1 ps-3 text-xs shadow-sm"
              >
                <span className="min-w-0 truncate">
                  <span className="font-semibold text-emerald-800">{item.categoryTitle}</span>
                  <span className="mx-1 text-emerald-400">›</span>
                  <span className="text-slate-700">{item.subcategoryTitle}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeService(getServiceKey(item))}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={t("tradeProviderRemoveService")}
                >
                  <CloseIcon />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="relative">
        <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3" : "left-3"}`}>
          <SearchIcon />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("tradeProviderSearchServices")}
          className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
            isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
          }`}
        />
      </div>

      <div
        className={`space-y-2 overscroll-contain ${catalogClassName || "max-h-[min(55vh,480px)] overflow-y-auto pe-0.5 lg:max-h-[min(calc(100vh-14rem),560px)]"}`}
      >
        {filteredCategories.map((category) => {
          const isOpen = expanded.has(category.id) || query.trim().length > 0;
          const selectedInCategory = selected.filter((s) => s.categoryId === category.id).length;
          const vipEntry = vipCategories[category.id];
          const platformExclusive = isPlatformExclusiveCategory(category.id);
          const isVip = !!vipEntry?.enabled || platformExclusive;
          const vipMessage = platformExclusive
            ? null
            : resolveVipCategoryMessage(vipCategories, category.id, language, t);

          return (
            <div
              key={category.id}
              className={`overflow-hidden rounded-xl border shadow-sm ${
                isVip
                  ? isPlatformExclusiveCategory(category.id)
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-amber-200 bg-amber-50/40"
                  : "border-slate-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => !isVip && toggleExpand(category.id)}
                disabled={isVip}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-start transition ${
                  isVip ? "cursor-not-allowed opacity-90" : "hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{category.title}</p>
                    {isVip ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isPlatformExclusiveCategory(category.id)
                            ? "bg-emerald-200 text-emerald-900"
                            : "bg-amber-200 text-amber-900"
                        }`}
                      >
                        {isPlatformExclusiveCategory(category.id)
                          ? t("packagingAdBadge")
                          : t("tradeProviderVipBadge")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                    {isVip && vipMessage ? vipMessage : category.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {selectedInCategory > 0 ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {selectedInCategory}
                    </span>
                  ) : null}
                  {!isVip ? <ChevronIcon open={isOpen} /> : null}
                </div>
              </button>

              {isVip && !platformExclusive ? (
                <div className="border-t border-amber-100 px-4 py-3 text-xs leading-6 text-amber-900">
                  {t("tradeProviderVipCategoryLocked")}
                </div>
              ) : null}

              {!isVip && isOpen ? (
                <div className="border-t border-slate-100 px-3 pb-3 pt-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {category.children.map((sub) => {
                      const key = `${category.id}:${sub.id}`;
                      const active = selectedKeys.has(key);
                      const catalogItem = {
                        key,
                        categoryId: category.id,
                        subcategoryId: sub.id,
                        categoryTitle: category.title,
                        subcategoryTitle: sub.title,
                      };
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => (active ? removeService(key) : addService(catalogItem))}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium transition sm:text-[13px] ${
                            active
                              ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
                          }`}
                        >
                          {sub.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
