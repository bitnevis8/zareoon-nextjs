"use client";

import { useState } from "react";
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

const BOOL_LABELS = { true: "بله", false: "خیر" };

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
  const [expanded, setExpanded] = useState(false);

  const chips = [];
  if (filters.role) {
    const role = roles.find((r) => r.name === filters.role);
    chips.push({ key: "role", label: `نقش: ${role?.nameFa || filters.role}` });
  }
  if (filters.isActive !== "") chips.push({ key: "isActive", label: `فعال: ${BOOL_LABELS[filters.isActive]}` });
  if (filters.isEmailVerified !== "")
    chips.push({ key: "isEmailVerified", label: `ایمیل: ${BOOL_LABELS[filters.isEmailVerified]}` });
  if (filters.isMobileVerified !== "")
    chips.push({ key: "isMobileVerified", label: `موبایل: ${BOOL_LABELS[filters.isMobileVerified]}` });

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
          placeholder="جستجو: نام، ایمیل، موبایل، نام کاربری…"
          className={`${inv.input} pr-10`}
          aria-label="جستجوی کاربران"
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
          فیلترها
          {activeCount > 0 ? (
            <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </button>

        <FilterSelect label="" value={sortValue} onChange={onSortChange} className="min-w-[160px] flex-1 sm:flex-none">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </FilterSelect>

        <span className="mr-auto text-xs text-slate-500">
          {resultCount.toLocaleString("fa-IR")} از {totalCount.toLocaleString("fa-IR")} کاربر
        </span>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <ActiveChip key={c.key} label={c.label} onRemove={() => removeChip(c.key)} />
          ))}
          <button type="button" onClick={onClear} className="text-xs font-medium text-slate-500 hover:text-slate-800">
            پاک کردن همه
          </button>
        </div>
      ) : null}

      {expanded ? (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="نقش" value={filters.role} onChange={(v) => setFilters({ ...filters, role: v })}>
            <option value="">همه نقش‌ها</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.nameFa || role.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="وضعیت" value={filters.isActive} onChange={(v) => setFilters({ ...filters, isActive: v })}>
            <option value="">همه</option>
            <option value="true">فعال</option>
            <option value="false">غیرفعال</option>
          </FilterSelect>

          <FilterSelect
            label="تأیید ایمیل"
            value={filters.isEmailVerified}
            onChange={(v) => setFilters({ ...filters, isEmailVerified: v })}
          >
            <option value="">همه</option>
            <option value="true">تأیید شده</option>
            <option value="false">تأیید نشده</option>
          </FilterSelect>

          <FilterSelect
            label="تأیید موبایل"
            value={filters.isMobileVerified}
            onChange={(v) => setFilters({ ...filters, isMobileVerified: v })}
          >
            <option value="">همه</option>
            <option value="true">تأیید شده</option>
            <option value="false">تأیید نشده</option>
          </FilterSelect>

          <div className="col-span-full flex justify-end gap-2 pt-1">
            <button type="button" className={inv.btnSecondary} onClick={() => setFilters(DEFAULT_FILTERS)}>
              بازنشانی فیلترها
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
