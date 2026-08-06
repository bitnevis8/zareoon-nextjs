"use client";

import { useCallback, useState } from "react";
import CbmFreightCalculator from "@/app/components/CbmFreightCalculator";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { IconChevron, IconCube, IconCheck } from "./OfflineIcons";

/**
 * محاسبه حجم/وزن در صفحه پروژه — جای درست برای CBM (نه فرم ایجاد)
 */
export default function ExportCbmPanel({
  project,
  onSave,
  saving = false,
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(null);
  const saved = project?.pathwaySnapshot?.freightSnapshot || null;

  const handleResult = useCallback((r) => setResult(r), []);

  const canSave = result && Number(result.totalCbm) > 0;

  return (
    <div className={dash.card}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right md:px-5"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
            <IconCube className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-800">محاسبه حجم و وزن (CBM)</span>
            <span className="mt-0.5 block text-[11px] text-slate-500">
              هنگام بسته‌بندی و انتخاب حمل — اختیاری
            </span>
          </span>
        </span>
        <IconChevron open={open} className="h-4 w-4 text-slate-400" />
      </button>

      {saved && !open ? (
        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-600 md:px-5">
          ذخیره شده: {Number(saved.totalCbm).toLocaleString("fa-IR", { maximumFractionDigits: 3 })} CBM
          {" · "}
          {Number(saved.totalWeightKg || 0).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} kg
          {saved.modeLabel ? ` · ${saved.modeLabel}` : ""}
        </div>
      ) : null}

      {open ? (
        <div className="space-y-3 border-t border-slate-100 px-4 py-4 md:px-5">
          <p className="text-xs leading-6 text-slate-500">
            ابعاد بسته‌ها را وارد کنید تا حجم، وزن حجمی و پیشنهاد نوع حمل مشخص شود. نتیجه را می‌توانید روی پروژه ذخیره کنید.
          </p>
          <CbmFreightCalculator
            embedded
            initialOrigin={project?.originCity || project?.originCountry || ""}
            initialDestination={project?.destinationCity || project?.destinationCountry || ""}
            initialTransportMode={
              project?.transportMode && project.transportMode !== "unspecified"
                ? project.transportMode
                : "auto"
            }
            onResultChange={handleResult}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {canSave ? (
              <p className="text-xs text-teal-800">
                {Number(result.totalCbm).toLocaleString("fa-IR", { maximumFractionDigits: 3 })} CBM
                {" · "}
                {result.modeLabel || "—"}
              </p>
            ) : (
              <span />
            )}
            <button
              type="button"
              className={dash.btnPrimary}
              disabled={!canSave || saving}
              onClick={() =>
                onSave?.({
                  totalCbm: result.totalCbm,
                  totalWeightKg: result.totalWeightKg,
                  mode: result.mode,
                  modeLabel: result.modeLabel,
                  loadType: result.loadType,
                  chargeableKg: result.chargeableKg,
                  chargeableCbm: result.chargeableCbm,
                  densityKgPerCbm: result.densityKgPerCbm,
                })
              }
            >
              {saving ? (
                "در حال ذخیره…"
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <IconCheck className="h-3.5 w-3.5" />
                  ذخیره روی پروژه
                </span>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
