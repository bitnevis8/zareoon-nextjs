"use client";

import { useState } from "react";

function IconSearch({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IconFilter({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );
}

function IconCards({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5h7v7H4V5zm9 0h7v7h-7V5zM4 14h7v5H4v-5zm9 0h7v5h-7v-5z"
      />
    </svg>
  );
}

function IconList({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

/**
 * نوار جستجو / فیلتر / سوییچ کارت‌لیست — موبایل‌اول
 * جستجو فقط با دکمه یا Enter اعمال می‌شود.
 */
export default function DashboardListToolbar({
  searchDraft,
  onSearchDraftChange,
  onSearchSubmit,
  searchPlaceholder = "جستجو…",
  searchButtonLabel = "جستجو",
  viewMode = "cards",
  onViewModeChange,
  filterOpen,
  onToggleFilter,
  filterActiveCount = 0,
  filterLabel = "فیلتر",
  filterPanel = null,
  resultLabel = null,
  className = "",
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = typeof filterOpen === "boolean" ? filterOpen : localOpen;
  const toggleFilter = onToggleFilter || (() => setLocalOpen((v) => !v));

  const submit = (e) => {
    e?.preventDefault?.();
    onSearchSubmit?.();
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <form onSubmit={submit} className="flex items-stretch gap-1.5">
        <div className="relative min-w-0 flex-1">
          <IconSearch className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => onSearchDraftChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pe-3 ps-9 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            enterKeyHint="search"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.98] sm:px-4 sm:text-sm"
        >
          <IconSearch className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline sm:inline">{searchButtonLabel}</span>
        </button>
      </form>

      <div className="flex items-center gap-1.5">
        {filterPanel ? (
          <button
            type="button"
            onClick={toggleFilter}
            className={`inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition sm:flex-none ${
              open || filterActiveCount > 0
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <IconFilter />
            {filterLabel}
            {filterActiveCount > 0 ? (
              <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {filterActiveCount}
              </span>
            ) : null}
          </button>
        ) : (
          <div className="flex-1" />
        )}

        {onViewModeChange ? (
          <div className="inline-flex h-9 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => onViewModeChange("cards")}
              aria-pressed={viewMode === "cards"}
              title="نمای کارتی"
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 text-xs font-bold transition ${
                viewMode === "cards" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <IconCards />
              <span className="hidden sm:inline">کارتی</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              aria-pressed={viewMode === "list"}
              title="نمای لیستی"
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 text-xs font-bold transition ${
                viewMode === "list" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <IconList />
              <span className="hidden sm:inline">لیستی</span>
            </button>
          </div>
        ) : null}
      </div>

      {filterPanel && open ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-3.5">{filterPanel}</div>
      ) : null}

      {resultLabel ? <p className="text-[11px] font-medium text-slate-500 sm:text-xs">{resultLabel}</p> : null}
    </div>
  );
}

/** دکمه‌های مشاهده / ویرایش / حذف — فشرده و لمسی */
export function DashboardItemActions({
  onView,
  onEdit,
  onDelete,
  onMedia,
  viewLabel = "مشاهده",
  editLabel = "ویرایش",
  deleteLabel = "حذف",
  mediaLabel = "رسانه",
  compact = false,
  className = "",
}) {
  const btn =
    "inline-flex min-h-9 min-w-9 items-center justify-center gap-1 rounded-lg border text-[11px] font-bold transition active:scale-[0.97] sm:min-h-8 sm:px-2.5 sm:text-xs";

  return (
    <div className={`flex flex-wrap items-center justify-end gap-1 ${className}`}>
      {onView ? (
        <button
          type="button"
          onClick={onView}
          className={`${btn} border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100`}
          aria-label={viewLabel}
        >
          <EyeIcon />
          {!compact ? <span>{viewLabel}</span> : null}
        </button>
      ) : null}
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className={`${btn} border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100`}
          aria-label={editLabel}
        >
          <EditIcon />
          {!compact ? <span>{editLabel}</span> : null}
        </button>
      ) : null}
      {onMedia ? (
        <button
          type="button"
          onClick={onMedia}
          className={`${btn} border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100`}
          aria-label={mediaLabel}
        >
          <MediaIcon />
          {!compact ? <span>{mediaLabel}</span> : null}
        </button>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className={`${btn} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100`}
          aria-label={deleteLabel}
        >
          <TrashIcon />
          {!compact ? <span>{deleteLabel}</span> : null}
        </button>
      ) : null}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function MediaIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
