"use client";

import { badgeToneClass, PUBLIC_BADGE_KINDS } from "@/app/utils/workspace";

/**
 * نشان‌های عمومی — اشتراک ≠ احراز هویت ≠ احراز کسب‌وکار
 */
export default function PublicTrustBadges({ badges = [], className = "" }) {
  if (!Array.isArray(badges) || badges.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-1.5 ${className}`} aria-label="نشان‌ها">
      {badges.map((b) => (
          <li key={`${b.kind}-${b.planId || b.level || b.tone || "x"}`}>
          <span
            title={b.meaningFa || b.labelFa}
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${badgeToneClass(
              b.kind,
              b.tone
            )} ${b.kind === PUBLIC_BADGE_KINDS.PLAN_MEMBER ? "tracking-wide" : ""}`}
          >
            {b.labelFa}
          </span>
        </li>
      ))}
    </ul>
  );
}
