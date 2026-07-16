"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { inv } from "@/app/dashboard/supplier/inventory/inventoryTheme";
import { DEFAULT_FILTERS, SORT_OPTIONS } from "../userConstants";

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

export default function UserFilters({
  searchTerm,
  onSearchChange,
  filters,
  setFilters,
  roles,
  sortValue,
  onSortChange,
  resultCount,
  totalCount,
  activeCount,
  onClear,
}) {
  const t = useTranslations("users");
  const [expanded, setExpanded] = useState(false);

  const boolLabel = (value) => (value === "true" ? t("yes") : t("no"));

  const chips = [];
  if (filters.role) {
    const role = roles.find((r) => r.name === filters.role);
    chips.push({ key: "role", label: t("filters.chipRole", { name: role?.nameFa || filters.role }) });
  }
  if (filters.isActive !== "") chips.push({ key: "isActive", label: t("filters.chipActive", { value: boolLabel(filters.isActive) }) });
  if (filters.isEmailVerified !== "")
    chips.push({ key: "isEmailVerified", label: t("filters.chipEmail", { value: boolLabel(filters.isEmailVerified) }) });
  if (filters.isMobileVerified !== "")
    chips.push({ key: "isMobileVerified", label: t("filters.chipMobile", { value: boolLabel(filters.isMobileVerified) }) });

  const removeChip = (key) => setFilters({ ...filters, [key]: "" });

  return (
    <div className="space-y-3">
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
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("filters.searchPlaceholder")}
          className={`${inv.input} pr-10`}
          aria-label={t("filters.searchAriaLabel")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`${inv.btnSecondary} gap-2`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          {t("filters.filters")}
          {activeCount > 0 ? (
            <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </button>

        <FilterSelect label="" value={sortValue} onChange={onSortChange} className="min-w-[160px] flex-1 sm:flex-none">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.labelKey)}
            </option>
          ))}
        </FilterSelect>

        <span className="mr-auto text-xs text-slate-500">
          {t("filters.showingCount", {
            resultCount: resultCount.toLocaleString("fa-IR"),
            totalCount: totalCount.toLocaleString("fa-IR"),
          })}
        </span>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <ActiveChip key={c.key} label={c.label} onRemove={() => removeChip(c.key)} />
          ))}
          <button type="button" onClick={onClear} className="text-xs font-medium text-slate-500 hover:text-slate-800">
            {t("filters.clearAll")}
          </button>
        </div>
      ) : null}

      {expanded ? (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label={t("filters.role")} value={filters.role} onChange={(v) => setFilters({ ...filters, role: v })}>
            <option value="">{t("filters.allRoles")}</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.nameFa || role.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label={t("filters.status")} value={filters.isActive} onChange={(v) => setFilters({ ...filters, isActive: v })}>
            <option value="">{t("all")}</option>
            <option value="true">{t("active")}</option>
            <option value="false">{t("inactive")}</option>
          </FilterSelect>

          <FilterSelect
            label={t("filters.emailVerification")}
            value={filters.isEmailVerified}
            onChange={(v) => setFilters({ ...filters, isEmailVerified: v })}
          >
            <option value="">{t("all")}</option>
            <option value="true">{t("verified")}</option>
            <option value="false">{t("notVerified")}</option>
          </FilterSelect>

          <FilterSelect
            label={t("filters.mobileVerification")}
            value={filters.isMobileVerified}
            onChange={(v) => setFilters({ ...filters, isMobileVerified: v })}
          >
            <option value="">{t("all")}</option>
            <option value="true">{t("verified")}</option>
            <option value="false">{t("notVerified")}</option>
          </FilterSelect>

          <div className="col-span-full flex justify-end gap-2 pt-1">
            <button type="button" className={inv.btnSecondary} onClick={() => setFilters(DEFAULT_FILTERS)}>
              {t("filters.resetFilters")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
