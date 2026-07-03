"use client";

import { useState } from "react";
import { inv } from "../inventoryTheme";
import { DEFAULT_FILTERS, LOT_STATUSES, QUALITY_GRADES, SORT_OPTIONS } from "../inventoryConstants";
import { localizeStatus } from "@/app/utils/localize";

function FilterSelect({ label, value, onChange, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</label>
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
  t,
  resultCount,
  totalCount,
  onClear,
  activeCount,
}) {
  const [expanded, setExpanded] = useState(false);

  const productOptions = products.filter((p) =>
    farmers.length === 0 || true
  );

  const chips = [];
  if (filters.productId) {
    const p = products.find((x) => x.id === Number(filters.productId));
    chips.push({ key: "productId", label: `محصول: ${p?.name || filters.productId}` });
  }
  if (filters.qualityGrade) chips.push({ key: "qualityGrade", label: `درجه: ${filters.qualityGrade}` });
  if (filters.status) chips.push({ key: "status", label: `وضعیت: ${localizeStatus(filters.status, t)}` });
  if (filters.farmerId) {
    const f = farmers.find(([id]) => String(id) === String(filters.farmerId));
    chips.push({ key: "farmerId", label: `تامین‌کننده: ${f?.[1] || filters.farmerId}` });
  }
  if (filters.hasPrice === "yes") chips.push({ key: "hasPrice", label: "دارای قیمت" });
  if (filters.hasPrice === "no") chips.push({ key: "hasPrice", label: "بدون قیمت" });
  if (filters.sort && filters.sort !== "newest") {
    const s = SORT_OPTIONS.find((o) => o.value === filters.sort);
    chips.push({ key: "sort", label: `مرتب‌سازی: ${s?.label}` });
  }

  const removeChip = (key) => {
    if (key === "sort") setFilters({ ...filters, sort: "newest" });
    else setFilters({ ...filters, [key]: "" });
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          className={`${inv.input} pr-10`}
          placeholder="جستجو: نام محصول، تامین‌کننده، درجه، شناسه…"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          فیلترها
          {activeCount > 0 ? (
            <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">{activeCount}</span>
          ) : null}
        </button>
        <FilterSelect
          label=""
          value={filters.sort}
          onChange={(v) => setFilters({ ...filters, sort: v })}
          className="w-36"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </FilterSelect>
      </div>

      {/* Filter grid */}
      <div className={`rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4 ${expanded ? "block" : "hidden sm:block"}`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <FilterSelect label="محصول" value={filters.productId} onChange={(v) => setFilters({ ...filters, productId: v })}>
            <option value="">همه محصولات</option>
            {productOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </FilterSelect>

          <FilterSelect label="درجه کیفیت" value={filters.qualityGrade} onChange={(v) => setFilters({ ...filters, qualityGrade: v })}>
            <option value="">همه درجه‌ها</option>
            {QUALITY_GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </FilterSelect>

          <FilterSelect label="وضعیت" value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })}>
            <option value="">همه وضعیت‌ها</option>
            {LOT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{localizeStatus(s.value, t)}</option>
            ))}
          </FilterSelect>

          {showFarmerFilter ? (
            <FilterSelect label="تامین‌کننده" value={filters.farmerId} onChange={(v) => setFilters({ ...filters, farmerId: v })}>
              <option value="">همه</option>
              {farmers.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </FilterSelect>
          ) : null}

          <FilterSelect label="قیمت" value={filters.hasPrice} onChange={(v) => setFilters({ ...filters, hasPrice: v })}>
            <option value="">همه</option>
            <option value="yes">دارای قیمت</option>
            <option value="no">بدون قیمت</option>
          </FilterSelect>

          <FilterSelect label="مرتب‌سازی" value={filters.sort} onChange={(v) => setFilters({ ...filters, sort: v })} className="hidden sm:block">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </FilterSelect>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-3">
          <p className="text-xs text-slate-500">
            نمایش <strong className="text-slate-800">{resultCount}</strong> از {totalCount} مورد
          </p>
          {activeCount > 0 ? (
            <button type="button" onClick={onClear} className="text-xs font-semibold text-rose-600 hover:text-rose-800">
              پاک کردن فیلترها
            </button>
          ) : null}
        </div>
      </div>

      {/* Active chips */}
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
