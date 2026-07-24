"use client";

import {
  CARDS_PER_ROW_OPTIONS,
  DEFAULT_CARDS_PER_ROW,
  normalizeCardsPerRow,
} from "@/app/utils/cardsPerRow";

/**
 * انتخاب تعداد کارت در هر سطر (پیش‌فرض ۴)
 */
export default function CardsPerRowSelect({
  value = DEFAULT_CARDS_PER_ROW,
  onChange,
  label = "در هر سطر",
  className = "",
}) {
  const current = normalizeCardsPerRow(value);

  return (
    <label
      className={`inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-600 shadow-sm sm:px-2.5 sm:text-xs ${className}`}
    >
      <span className="shrink-0 text-slate-500">{label}</span>
      <select
        value={current}
        onChange={(e) => onChange?.(normalizeCardsPerRow(e.target.value))}
        className="h-7 rounded-lg border-0 bg-transparent py-0 pe-1 ps-0.5 text-[11px] font-bold tabular-nums text-slate-800 outline-none focus:ring-0 sm:text-xs"
        aria-label={label}
      >
        {CARDS_PER_ROW_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
