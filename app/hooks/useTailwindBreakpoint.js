"use client";

import { useEffect, useState } from "react";

/** Tailwind breakpoints (min-width), largest first — includes project `3xl`. */
const BREAKPOINTS = [
  { name: "3xl", min: 1920 },
  { name: "2xl", min: 1536 },
  { name: "xl", min: 1280 },
  { name: "lg", min: 1024 },
  { name: "md", min: 768 },
  { name: "sm", min: 640 },
];

function resolveBreakpoint(width) {
  for (const bp of BREAKPOINTS) {
    if (width >= bp.min) return bp.name;
  }
  return "base";
}

export function useTailwindBreakpoint() {
  const [breakpoint, setBreakpoint] = useState("base");

  useEffect(() => {
    const update = () => setBreakpoint(resolveBreakpoint(window.innerWidth));
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return breakpoint;
}
