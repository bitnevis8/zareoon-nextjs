"use client";

import { inv } from "../inventoryTheme";

export function Field({ label, hint, children, className = "", compact = false }) {
  return (
    <div className={className}>
      {label ? <label className={compact ? inv.labelCompact : inv.label}>{label}</label> : null}
      {children}
      {hint ? <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function Section({ title, desc, children, action }) {
  return (
    <section className={inv.card}>
      {(title || action) && (
        <div className={`${inv.cardHeader} flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`}>
          <div>
            {title ? <h2 className="text-base font-bold text-slate-900">{title}</h2> : null}
            {desc ? <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{desc}</p> : null}
          </div>
          {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
        </div>
      )}
      <div className={inv.cardBody}>{children}</div>
    </section>
  );
}
