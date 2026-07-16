"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import AsyncSelect from "react-select/async";
import { selectStyles } from "../inventoryTheme";
import {
  buildCatalogIndex,
  getChildren,
  getProductBreadcrumb,
  getProductLabel,
  isCategoryNode,
  isSelectableProductNode,
} from "./productCatalogUtils";

function ModeTab({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md px-2 py-1.5 text-center text-xs font-semibold transition sm:py-2 sm:text-sm ${
        active
          ? "bg-emerald-600 text-white"
          : "text-slate-600 hover:bg-white hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function CategoryRow({ item, hasChildren, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-right transition hover:border-emerald-300 hover:bg-emerald-50/40 active:bg-emerald-50/60"
    >
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{item.name}</span>
      {hasChildren ? <ChevronIcon /> : null}
    </button>
  );
}

function ProductRow({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-right text-sm transition ${
        selected
          ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-900"
          : "border-slate-200 bg-white font-medium text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/30"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
          selected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"
        }`}
        aria-hidden
      >
        {selected ? "✓" : ""}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

export default function ProductCatalogPicker({
  catalogItems = [],
  catalogLoading = false,
  catalogError = "",
  onRetryCatalog,
  fallbackProducts = [],
  selectedProductId,
  onSelectProduct,
  loadProductOptions,
}) {
  const t = useTranslations("inventory");
  const rootCrumb = useMemo(() => ({ id: null, name: t("catalog.rootCategories") }), [t]);
  const [mode, setMode] = useState("category");
  const [path, setPath] = useState([rootCrumb]);

  const { byId, childrenByParent } = useMemo(() => buildCatalogIndex(catalogItems), [catalogItems]);

  const currentCrumb = path[path.length - 1];
  const currentParentId = currentCrumb?.id ?? null;
  const canGoBack = path.length > 1;

  const currentChildren = useMemo(
    () => getChildren(currentParentId, childrenByParent),
    [currentParentId, childrenByParent]
  );

  const categories = useMemo(
    () => currentChildren.filter((item) => isCategoryNode(item, childrenByParent)),
    [currentChildren, childrenByParent]
  );

  const productsHere = useMemo(
    () => currentChildren.filter((item) => isSelectableProductNode(item, childrenByParent)),
    [currentChildren, childrenByParent]
  );

  const selectedLabel = getProductLabel(selectedProductId, fallbackProducts, byId);
  const selectedPath = selectedProductId
    ? getProductBreadcrumb(selectedProductId, byId)
        .map((p) => p.name)
        .join(" › ")
    : "";

  const enterCategory = (item) => {
    setPath((prev) => [...prev, { id: item.id, name: item.name }]);
  };

  const goBack = () => {
    if (!canGoBack) return;
    setPath((prev) => prev.slice(0, -1));
  };

  const goToCrumb = (index) => {
    setPath((prev) => prev.slice(0, index + 1));
  };

  const crumbLabel = (crumb, index) => {
    if (index === 0 && crumb.id === null) return t("catalog.rootCategories");
    return crumb.name;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-2.5 py-2 sm:px-3">
        <div className="flex gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <ModeTab active={mode === "category"} onClick={() => setMode("category")}>
            {t("catalog.category")}
          </ModeTab>
          <ModeTab active={mode === "search"} onClick={() => setMode("search")}>
            {t("catalog.search")}
          </ModeTab>
        </div>
      </div>

      {selectedProductId ? (
        <div className="border-b border-emerald-100 bg-emerald-50/60 px-2.5 py-2 sm:px-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-emerald-700">{t("catalog.selectedProductType")}</p>
              <p className="truncate text-sm font-bold text-slate-900">{selectedLabel}</p>
              {selectedPath ? (
                <p className="mt-0.5 truncate text-[11px] text-slate-500">{selectedPath}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onSelectProduct("")}
              className="shrink-0 rounded-md border border-emerald-200 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              {t("catalog.change")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="p-2.5 sm:p-3">
        {mode === "search" ? (
          <div>
            <p className="mb-1.5 text-[11px] text-slate-500">{t("catalog.searchProductHint")}</p>
            <AsyncSelect
              cacheOptions
              styles={selectStyles}
              defaultOptions={fallbackProducts.map((p) => ({ value: p.id, label: p.name }))}
              loadOptions={loadProductOptions}
              placeholder={t("catalog.searchProductPlaceholder")}
              noOptionsMessage={() => t("create.noOptions")}
              onChange={(opt) => onSelectProduct(opt?.value || "")}
              value={selectedProductId ? { value: selectedProductId, label: selectedLabel } : null}
            />
          </div>
        ) : catalogLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : catalogError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-4 text-center">
            <p className="text-xs text-rose-800">{catalogError}</p>
            {onRetryCatalog ? (
              <button
                type="button"
                onClick={onRetryCatalog}
                className="mt-2 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
              >
                {t("catalog.retry")}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              {canGoBack ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ChevronIcon />
                  {t("catalog.back")}
                </button>
              ) : null}
              <nav
                className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5 text-[11px] text-slate-500"
                aria-label={t("catalog.breadcrumbAria")}
              >
                {path.map((crumb, index) => (
                  <span key={`${crumb.id}-${index}`} className="inline-flex min-w-0 items-center gap-0.5">
                    {index > 0 ? <span className="text-slate-300">›</span> : null}
                    <button
                      type="button"
                      onClick={() => goToCrumb(index)}
                      className={`max-w-[8rem] truncate rounded px-1 py-0.5 transition sm:max-w-none ${
                        index === path.length - 1
                          ? "font-bold text-emerald-800"
                          : "hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      {crumbLabel(crumb, index)}
                    </button>
                  </span>
                ))}
              </nav>
            </div>

            <div className="max-h-[min(18rem,50vh)] space-y-3 overflow-y-auto overscroll-contain sm:max-h-[min(20rem,55vh)]">
              {categories.length > 0 ? (
                <div className="space-y-1">
                  {categories.length > 1 ? (
                    <p className="px-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {t("catalog.categoriesCount", { count: categories.length.toLocaleString("fa-IR") })}
                    </p>
                  ) : null}
                  {categories.map((item) => (
                    <CategoryRow
                      key={item.id}
                      item={item}
                      hasChildren={getChildren(item.id, childrenByParent).length > 0}
                      onClick={() => enterCategory(item)}
                    />
                  ))}
                </div>
              ) : null}

              {productsHere.length > 0 ? (
                <div className="space-y-1">
                  {categories.length > 0 ? (
                    <hr className="border-slate-100" />
                  ) : null}
                  <p className="px-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {t("catalog.productTypesCount", { count: productsHere.length.toLocaleString("fa-IR") })}
                  </p>
                  {productsHere.map((item) => (
                    <ProductRow
                      key={item.id}
                      label={item.name}
                      selected={Number(selectedProductId) === Number(item.id)}
                      onClick={() => onSelectProduct(item.id)}
                    />
                  ))}
                </div>
              ) : null}

              {!categories.length && !productsHere.length ? (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-2 py-4 text-center text-xs text-slate-500">
                  {canGoBack
                    ? t("catalog.emptyNoSubcategories")
                    : t("catalog.emptyNoRootCategories")}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
