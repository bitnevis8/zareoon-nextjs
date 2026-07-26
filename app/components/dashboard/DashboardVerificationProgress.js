"use client";

import Link from "next/link";
import {
  PERSON_PATH,
  BUSINESS_PATH,
  resolvePersonPathReached,
  resolveBusinessPathReached,
} from "@/app/utils/verification";

function TickIcon({ on, className = "h-4 w-4" }) {
  if (on) {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * مسیر احراز با تیک‌های کنارهم — خاکستری تا نرسیده، سبز وقتی رسیده
 * شخص: U0→U1→U2→U3 | کسب‌وکار: B0→B1→B2
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
    <div
      className={className}
      role="img"
      aria-label={`سطح ${reached} از ${path.length}`}
    >
      <div className="flex items-start justify-between gap-1 sm:gap-1.5">
        {path.map((step, i) => {
          const on = i < reached;
          const pendingHere = pendingId === step.id && !on;
          return (
            <div key={step.id} className="flex min-w-0 flex-1 flex-col items-center">
              <span
                title={`${step.code} — ${step.titleFa}${
                  on ? " ✓" : pendingHere ? " (در بررسی)" : ""
                }`}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition sm:h-8 sm:w-8 ${
                  on
                    ? "bg-emerald-100 text-emerald-600"
                    : pendingHere
                      ? "animate-pulse bg-amber-100 text-amber-600"
                      : "bg-slate-100 text-slate-300"
                }`}
              >
                <TickIcon on={on || pendingHere} className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" />
              </span>
              {showLabels ? (
                <p
                  className={`mt-1 truncate text-center text-[9px] font-bold sm:text-[10px] ${
                    on
                      ? "text-emerald-700"
                      : pendingHere
                        ? "text-amber-700"
                        : "text-slate-400"
                  }`}
                >
                  {step.code}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
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
