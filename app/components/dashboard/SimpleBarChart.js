"use client";

export default function SimpleBarChart({ title, items, emptyLabel = "داده‌ای نیست" }) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {title ? <h3 className="mb-4 text-sm font-bold text-slate-800">{title}</h3> : null}
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs sm:text-sm">
                <span className="truncate text-slate-600">{item.label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                  {item.value.toLocaleString("fa-IR")}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${item.color || "bg-emerald-500"}`}
                  style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
