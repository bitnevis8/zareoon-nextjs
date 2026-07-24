"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DashboardListToolbar from "@/app/components/dashboard/DashboardListToolbar";
import { inv } from "../inventoryTheme";
import { DEFAULT_FILTERS, LOT_STATUSES, QUALITY_GRADES, SORT_OPTIONS } from "../inventoryConstants";
import { localizeStatus } from "@/app/utils/localize";

function FilterSelect({ label, value, onChange, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[11px] font-semibold text-slate-500">{label}</label>
      <select className={inv.select} value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </div>
  );
}

function ActiveChip({ label, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100"
    >
      {label}
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

export default function InventoryFilters({
  filters,
  setFilters,
  products,
  farmers = [],
  showFarmerFilter,
  resultCount,
  totalCount,
  onClear,
  activeCount,
  viewMode,
  onViewModeChange,
}) {
  const t = useTranslations("inventory");
  const [searchDraft, setSearchDraft] = useState(filters.search || "");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setSearchDraft(filters.search || "");
  }, [filters.search]);

  const chips = [];
  if (filters.productId) {
    const p = products.find((x) => x.id === Number(filters.productId));
    chips.push({ key: "productId", label: t("filters.chipProduct", { name: p?.name || filters.productId }) });
  }
  if (filters.qualityGrade) chips.push({ key: "qualityGrade", label: t("filters.chipGrade", { grade: filters.qualityGrade }) });
  if (filters.status) chips.push({ key: "status", label: t("filters.chipStatus", { status: localizeStatus(filters.status, t) }) });
  if (filters.farmerId) {
    const f = farmers.find(([id]) => String(id) === String(filters.farmerId));
    chips.push({ key: "farmerId", label: t("filters.chipSupplier", { name: f?.[1] || filters.farmerId }) });
  }
  if (filters.hasPrice === "yes") chips.push({ key: "hasPrice", label: t("filters.hasPrice") });
  if (filters.hasPrice === "no") chips.push({ key: "hasPrice", label: t("filters.noPrice") });
  if (filters.sort && filters.sort !== "newest") {
    const s = SORT_OPTIONS.find((o) => o.value === filters.sort);
    chips.push({ key: "sort", label: t("filters.chipSort", { label: s ? t(s.labelKey) : filters.sort }) });
  }

  const removeChip = (key) => {
    if (key === "sort") setFilters({ ...filters, sort: "newest" });
    else setFilters({ ...filters, [key]: "" });
  };

  const applySearch = () => {
    setFilters({ ...filters, search: searchDraft.trim() });
  };

  const filterPanel = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <FilterSelect label={t("filters.product")} value={filters.productId} onChange={(v) => setFilters({ ...filters, productId: v })}>
          <option value="">{t("filters.allProducts")}</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label={t("filters.qualityGrade")}
          value={filters.qualityGrade}
          onChange={(v) => setFilters({ ...filters, qualityGrade: v })}
        >
          <option value="">{t("filters.allGrades")}</option>
          {QUALITY_GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label={t("filters.status")} value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })}>
          <option value="">{t("filters.allStatuses")}</option>
          {LOT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {localizeStatus(s.value, t)}
            </option>
          ))}
        </FilterSelect>

        {showFarmerFilter ? (
          <FilterSelect label={t("filters.supplier")} value={filters.farmerId} onChange={(v) => setFilters({ ...filters, farmerId: v })}>
            <option value="">{t("filters.all")}</option>
            {farmers.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </FilterSelect>
        ) : null}

        <FilterSelect label={t("filters.price")} value={filters.hasPrice} onChange={(v) => setFilters({ ...filters, hasPrice: v })}>
          <option value="">{t("filters.all")}</option>
          <option value="yes">{t("filters.hasPrice")}</option>
          <option value="no">{t("filters.noPrice")}</option>
        </FilterSelect>

        <FilterSelect label={t("filters.sort")} value={filters.sort} onChange={(v) => setFilters({ ...filters, sort: v })}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.labelKey)}
            </option>
          ))}
        </FilterSelect>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        <p className="text-xs text-slate-500">
          {t.rich("filters.showingCount", {
            resultCount,
            totalCount,
            strong: (chunks) => <strong className="text-slate-800">{chunks}</strong>,
          })}
        </p>
        {activeCount > 0 ? (
          <button type="button" onClick={onClear} className="text-xs font-semibold text-rose-600 hover:text-rose-800">
            {t("filters.clearFilters")}
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-2.5">
      <DashboardListToolbar
        searchDraft={searchDraft}
        onSearchDraftChange={setSearchDraft}
        onSearchSubmit={applySearch}
        searchPlaceholder={t("filters.searchPlaceholder")}
        searchButtonLabel={t("filters.search")}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((v) => !v)}
        filterActiveCount={activeCount}
        filterLabel={t("filters.filters")}
        filterPanel={filterPanel}
        resultLabel={t.rich("filters.showingCount", {
          resultCount,
          totalCount,
          strong: (chunks) => <strong className="text-slate-800">{chunks}</strong>,
        })}
      />

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <ActiveChip key={c.key} label={c.label} onRemove={() => removeChip(c.key)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { DEFAULT_FILTERS };
