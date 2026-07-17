"use client";

import Link from "next/link";
import { dash } from "./dashboardTheme";

export function DashHero({ title, subtitle, badge, tone = "emerald" }) {
  const tones = {
    emerald: "from-emerald-800 via-emerald-700 to-teal-800",
    amber: "from-amber-800 via-amber-700 to-orange-800",
    sky: "from-sky-800 via-sky-700 to-cyan-800",
    violet: "from-violet-800 via-violet-700 to-indigo-800",
  };

  return (
    <header
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tones[tone] || tones.emerald} px-4 py-5 text-white shadow-sm sm:px-5 sm:py-6`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, white 0, transparent 45%), radial-gradient(circle at 80% 0%, white 0, transparent 35%)",
        }}
        aria-hidden
      />
      <div className="relative">
        {badge ? (
          <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide">
            {badge}
          </span>
        ) : null}
        <h1 className={`text-lg font-black leading-snug tracking-tight sm:text-xl ${badge ? "mt-2" : ""}`}>
          {title}
        </h1>
        {subtitle ? <p className="mt-1.5 max-w-xl text-sm leading-6 text-white/85">{subtitle}</p> : null}
      </div>
    </header>
  );
}

export function DashKpi({ label, value, hint, href, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-white",
    emerald: "border-emerald-200/80 bg-emerald-50/70",
    amber: "border-amber-200/80 bg-amber-50/70",
    sky: "border-sky-200/80 bg-sky-50/70",
    violet: "border-violet-200/80 bg-violet-50/70",
  };
  const inner = (
    <div
      className={`rounded-2xl border p-3.5 shadow-sm transition active:scale-[0.99] sm:p-4 ${tones[tone] || tones.slate} ${
        href ? "hover:border-emerald-300 hover:shadow-md" : ""
      }`}
    >
      <p className="text-[11px] font-semibold text-slate-500 sm:text-xs">{label}</p>
      <p className="mt-1 text-xl font-black tabular-nums text-slate-900 sm:text-2xl">
        {Number(value || 0).toLocaleString("fa-IR")}
      </p>
      {hint ? <p className="mt-1 text-[11px] leading-4 text-slate-500">{hint}</p> : null}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function DashKpiGrid({ children }) {
  return <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">{children}</div>;
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
      className="flex min-h-[4.5rem] items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40 active:scale-[0.99] sm:p-4"
    >
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${accents[tone] || accents.emerald}`} />
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-900">{title}</span>
        {desc ? <span className="mt-0.5 block text-[11px] leading-5 text-slate-500 sm:text-xs">{desc}</span> : null}
      </span>
    </Link>
  );
}

export function DashActionGrid({ children }) {
  return <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">{children}</div>;
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
