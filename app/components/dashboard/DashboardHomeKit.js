"use client";

import Link from "next/link";
import { dash } from "./dashboardTheme";

export function DashHero({ title, subtitle, badge, tone = "emerald" }) {
  const badgeTones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    violet: "border-violet-200 bg-violet-50 text-violet-900",
  };

  return (
    <header className="rounded-xl border border-slate-200/90 bg-white px-3.5 py-3.5 shadow-sm sm:rounded-lg sm:px-5 sm:py-5">
      {badge ? (
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
            badgeTones[tone] || badgeTones.emerald
          }`}
        >
          {badge}
        </span>
      ) : null}
      <h1 className={`text-base font-semibold leading-snug tracking-tight text-slate-900 sm:text-xl ${badge ? "mt-1.5" : ""}`}>
        {title}
      </h1>
      {subtitle ? <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:mt-1.5 sm:text-sm sm:leading-6">{subtitle}</p> : null}
    </header>
  );
}

export function DashKpi({ label, value, hint, href, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-white",
    emerald: "border-emerald-200/80 bg-emerald-50/60",
    amber: "border-amber-200/80 bg-amber-50/60",
    sky: "border-sky-200/80 bg-sky-50/60",
    violet: "border-violet-200/80 bg-violet-50/60",
  };
  const inner = (
    <div
      className={`flex h-full min-h-[5.5rem] flex-col rounded-xl border p-3 shadow-sm transition active:scale-[0.99] sm:min-h-[5.75rem] sm:rounded-2xl sm:p-3.5 ${
        tones[tone] || tones.slate
      } ${href ? "hover:border-emerald-300 hover:shadow-md" : ""}`}
    >
      <p className="line-clamp-2 text-[10px] font-semibold leading-4 text-slate-500 sm:text-[11px]">{label}</p>
      <p className="mt-auto pt-1.5 text-lg font-bold tabular-nums leading-none text-slate-900 sm:text-xl">
        {Number(value || 0).toLocaleString("fa-IR")}
      </p>
      <p className="mt-1 min-h-[1rem] text-[10px] leading-4 text-slate-500">{hint || "\u00a0"}</p>
    </div>
  );
  return href ? <Link href={href} className="h-full">{inner}</Link> : inner;
}

export function DashKpiGrid({ children }) {
  return <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-2.5 lg:grid-cols-4">{children}</div>;
}

export function DashAction({ href, title, desc, tone = "emerald" }) {
  const accents = {
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    sky: "bg-sky-600",
    violet: "bg-violet-600",
  };
  return (
    <Link
      href={href}
      className="flex h-full min-h-[3.75rem] items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40 active:scale-[0.99] sm:min-h-[4rem] sm:gap-3 sm:rounded-2xl sm:px-3.5 sm:py-3"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${accents[tone] || accents.emerald}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold leading-snug text-slate-900 sm:text-sm">{title}</span>
        {desc ? (
          <span className="mt-0.5 block text-[10px] leading-4 text-slate-500 sm:text-[11px] sm:leading-5">{desc}</span>
        ) : null}
      </span>
    </Link>
  );
}

export function DashActionGrid({ children }) {
  return <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2 sm:gap-2.5">{children}</div>;
}

export function DashSection({ title, actionHref, actionLabel, children }) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="text-xs font-semibold text-emerald-700 hover:underline">
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function DashEmpty({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export function DashListCard({ href, title, meta, badge }) {
  const body = (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30 sm:p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900">{title}</p>
        {meta ? <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">{meta}</p> : null}
      </div>
      {badge ? <span className="shrink-0 text-[11px] font-semibold text-slate-600">{badge}</span> : null}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function DashLoading() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
    </div>
  );
}

export function DashPage({ children }) {
  return <div className={`${dash.page} pb-2`}>{children}</div>;
}
