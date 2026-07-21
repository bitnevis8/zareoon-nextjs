"use client";

import Link from "next/link";

/**
 * دعوت مینیمال برای عضویت — بدون تکرار توضیح نقش (توضیح فقط بالای سایدبار است).
 */
export default function SidebarSetupCta({
  href,
  label,
  active,
  onClick,
  tone = "emerald",
}) {
  const tones = {
    emerald: {
      idle: "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50",
      active: "border-emerald-300 bg-emerald-50",
      text: "text-emerald-900",
      chevron: "text-emerald-700",
    },
    amber: {
      idle: "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/50",
      active: "border-amber-300 bg-amber-50",
      text: "text-amber-950",
      chevron: "text-amber-700",
    },
    sky: {
      idle: "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/50",
      active: "border-sky-300 bg-sky-50",
      text: "text-sky-950",
      chevron: "text-sky-700",
    },
  };
  const c = tones[tone] || tones.emerald;

  return (
    <div className="px-2 pt-3">
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-3 transition ${
          active ? c.active : c.idle
        }`}
      >
        <span className={`text-[13px] font-bold ${c.text}`}>{label}</span>
        <span className={`text-sm font-semibold ${c.chevron}`} aria-hidden>
          ←
        </span>
      </Link>
    </div>
  );
}
