"use client";

import Link from "next/link";
import {
  PERSON_PATH,
  BUSINESS_PATH,
  resolvePersonPathReached,
  resolveBusinessPathReached,
} from "@/app/utils/verification";

/**
 * مسیر احراز با daisyUI Steps
 * شخص: U0→U1→U2→U3 | کسب‌وکار: B0→B1→B2
 * @see https://daisyui.com/components/steps/
 */
export function VerificationLevelBars({
  kind = "person",
  overall = "none",
  level = "none",
  requestedLevel = null,
  contactVerified = false,
  hasWorkspace = false,
  className = "",
  showLabels = true,
}) {
  const path = kind === "business" ? BUSINESS_PATH : PERSON_PATH;
  const reached =
    kind === "business"
      ? resolveBusinessPathReached({ overall, level, hasWorkspace })
      : resolvePersonPathReached({ overall, level, contactVerified });

  const pendingId =
    overall === "pending"
      ? (() => {
          const req = String(requestedLevel || "").toLowerCase();
          if (kind === "person") {
            if (req === "basic" || req === "standard" || req === "u2") return "u2";
            if (req === "enhanced" || req === "full" || req === "u3") return "u3";
          } else {
            if (req === "basic" || req === "standard" || req === "b1") return "b1";
            if (req === "enhanced" || req === "full" || req === "b2") return "b2";
          }
          return null;
        })()
      : null;

  return (
    <div className={`w-full overflow-x-auto ${className}`} role="img" aria-label={`سطح ${reached} از ${path.length}`}>
      <ul className="steps steps-horizontal w-full min-w-[14rem]">
        {path.map((step, i) => {
          const on = i < reached;
          const pendingHere = pendingId === step.id && !on;
          const stepClass = on
            ? "step step-success"
            : pendingHere
              ? "step step-warning"
              : "step";
          const dataContent = on ? "✓" : pendingHere ? "…" : String(i + 1);
          return (
            <li
              key={step.id}
              className={stepClass}
              data-content={dataContent}
              title={`${step.code} — ${step.titleFa}${on ? " ✓" : pendingHere ? " (در بررسی)" : ""}`}
            >
              {showLabels ? (
                <span
                  className={`text-[10px] font-bold leading-tight sm:text-[11px] ${
                    on ? "text-success" : pendingHere ? "text-warning" : "text-base-content/45"
                  }`}
                >
                  {step.code}
                  <span className="mt-0.5 block font-semibold opacity-80">{step.titleFa}</span>
                </span>
              ) : (
                step.code
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DashboardVerificationProgress({
  kind = "person",
  overall,
  level,
  href = "/dashboard/verification",
  contactVerified = false,
  hasWorkspace = true,
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 transition hover:border-emerald-200 hover:bg-emerald-50/40"
    >
      <VerificationLevelBars
        kind={kind}
        overall={overall}
        level={level}
        contactVerified={contactVerified}
        hasWorkspace={hasWorkspace}
      />
    </Link>
  );
}

export default DashboardVerificationProgress;
