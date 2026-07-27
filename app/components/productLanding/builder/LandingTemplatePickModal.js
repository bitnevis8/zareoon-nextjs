"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { dash } from "@/app/components/dashboard/dashboardTheme";

/**
 * مدال انتخاب قالب لندینگ — قبل از ورود به بیلدر
 * گزینهٔ اول همیشه «بدون قالب / صفحه خالی» است.
 */
export default function LandingTemplatePickModal({
  open,
  templates = [],
  loading = false,
  busy = false,
  title = "شروع لندینگ",
  subtitle = "می‌توانید خالی شروع کنید یا از یک قالب آماده استفاده کنید.",
  onClose,
  onPick,
  allowBlank = true,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10050] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-slate-900/45" aria-label="بستن" onClick={busy ? undefined : onClose} />
      <div
        className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
        style={{ maxHeight: "min(88dvh, 720px)" }}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">{title}</h3>
            {subtitle ? <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
          {loading ? <p className="py-8 text-center text-sm text-slate-500">بارگذاری قالب‌ها…</p> : null}

          {!loading && allowBlank ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onPick({ blank: true, themeId: "atelier" })}
              className="w-full rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-4 text-start transition hover:bg-emerald-100/80 disabled:opacity-50"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">پیشنهادی برای شروع</p>
              <p className="mt-1 text-sm font-bold text-emerald-950">بدون قالب — صفحه خالی</p>
              <p className="mt-0.5 text-[11px] text-emerald-900/70">هیچ بلوکی از قبل نیست؛ خودتان از کتابخانه اضافه کنید</p>
            </button>
          ) : null}

          {!loading && templates.length ? (
            <p className="pt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">یا از قالب آماده</p>
          ) : null}

          {!loading &&
            templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                disabled={busy}
                onClick={() =>
                  onPick({
                    templateId: tpl.id,
                    templateSlug: tpl.slug,
                    themeId: tpl.themeIdDefault || "atelier",
                    nameFa: tpl.nameFa,
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-start transition hover:border-emerald-400 hover:bg-emerald-50/50 disabled:opacity-50"
              >
                <p className="text-sm font-bold text-slate-900">{tpl.nameFa}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {tpl.category || "عمومی"} · {(tpl.recipe?.blocks || []).length} بلوک
                  {tpl.isSystem ? "" : " · سفارشی"}
                </p>
              </button>
            ))}

          {!loading && !templates.length && !allowBlank ? (
            <p className="py-6 text-center text-xs text-slate-400">قالبی یافت نشد.</p>
          ) : null}
        </div>

        <div className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <button type="button" className={`${dash.btnSecondary} !py-2 text-xs`} disabled={busy} onClick={onClose}>
            انصراف
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
