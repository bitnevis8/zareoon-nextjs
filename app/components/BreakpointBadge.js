"use client";

import { useTailwindBreakpoint } from "@/app/hooks/useTailwindBreakpoint";
import { useShowBreakpointLabel } from "@/app/hooks/useShowBreakpointLabel";

export default function BreakpointBadge({ className = "" }) {
  const enabled = useShowBreakpointLabel();
  const breakpoint = useTailwindBreakpoint();

  if (!enabled) return null;

  return (
    <span
      className={`shrink-0 font-mono tabular-nums text-slate-400 ${className}`}
      dir="ltr"
      title="Tailwind breakpoint"
      aria-label={`Tailwind breakpoint ${breakpoint}`}
    >
      {breakpoint}
    </span>
  );
}
