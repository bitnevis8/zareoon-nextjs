"use client";

import { LEVEL_ORDER, LEVEL_STEP_NUMBER, VERIFICATION_LEVEL_LABELS_FA } from "@/app/utils/verification";
import { VerificationLevelIcon } from "@/app/components/verification/VerificationLevelIcon";

/**
 * استپر ۴ مرحله‌ای احراز — همه مراحل دیده می‌شوند
 */
export default function VerificationLevelStepper({
  kind = "person",
  levels = LEVEL_ORDER,
  requirements = {},
  verifiedLevel = "none",
  overallStatus = "none",
  activeLevel,
  onSelectLevel,
  pendingRequestedLevel = null,
}) {
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {levels.map((lv) => {
        const req = requirements[lv] || {};
        const step = LEVEL_STEP_NUMBER[lv] || req.step;
        const done =
          LEVEL_ORDER.indexOf(lv) >= 0 &&
          LEVEL_ORDER.indexOf(String(verifiedLevel)) >= LEVEL_ORDER.indexOf(lv) &&
          overallStatus === "verified"
            ? LEVEL_ORDER.indexOf(String(verifiedLevel)) >= LEVEL_ORDER.indexOf(lv)
            : LEVEL_ORDER.indexOf(String(verifiedLevel || "none")) >= LEVEL_ORDER.indexOf(lv) &&
              String(verifiedLevel) !== "none" &&
              LEVEL_ORDER.indexOf(String(verifiedLevel)) >= LEVEL_ORDER.indexOf(lv);

        const verifiedIdx = LEVEL_ORDER.indexOf(String(verifiedLevel || "none"));
        const thisIdx = LEVEL_ORDER.indexOf(lv);
        const isDone = verifiedIdx >= 0 && thisIdx <= verifiedIdx && String(verifiedLevel) !== "none";
        const isPendingHere = overallStatus === "pending" && pendingRequestedLevel === lv;
        const nextIdx = verifiedIdx < 0 || String(verifiedLevel) === "none" ? 0 : verifiedIdx + 1;
        const isActive = !isDone && !isPendingHere && thisIdx === nextIdx && overallStatus !== "pending";
        const isLocked = !isDone && !isActive && !isPendingHere;
        const selected = activeLevel === lv;

        let ring = "border-slate-200 bg-white text-slate-600";
        if (isDone) ring = "border-emerald-300 bg-emerald-50 text-emerald-900";
        else if (isPendingHere) ring = "border-amber-300 bg-amber-50 text-amber-950";
        else if (isActive) ring = "border-sky-400 bg-sky-50 text-sky-950";
        else if (isLocked) ring = "border-slate-100 bg-slate-50 text-slate-400";
        if (selected) ring += " ring-2 ring-offset-1 ring-sky-400";

        return (
          <li key={lv}>
            <button
              type="button"
              onClick={() => onSelectLevel?.(lv)}
              className={`flex w-full flex-col items-start gap-1.5 rounded-2xl border px-3 py-3 text-start transition ${ring}`}
            >
              <span className="flex w-full items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                  <VerificationLevelIcon kind={kind} level={lv} className="h-4 w-4" />
                  <span>
                    {step}. {VERIFICATION_LEVEL_LABELS_FA[lv] || lv}
                  </span>
                </span>
                {isDone ? (
                  <span className="text-[10px] font-bold text-emerald-700">✓</span>
                ) : isPendingHere ? (
                  <span className="text-[10px] font-bold text-amber-700">…</span>
                ) : isLocked ? (
                  <span className="text-[10px]">🔒</span>
                ) : null}
              </span>
              <span className="line-clamp-2 text-[10px] leading-4 opacity-80">
                {req.summaryFa || req.titleFa || ""}
              </span>
              {isLocked ? (
                <span className="text-[10px] font-semibold text-slate-400">بعد از تأیید پله قبل</span>
              ) : null}
              {isActive ? (
                <span className="text-[10px] font-semibold text-sky-700">قابل ارسال</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
