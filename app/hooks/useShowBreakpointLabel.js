"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";

/**
 * Admin toggle (site settings → showFooterBreakpoint).
 * Default ON until the public API says otherwise, so the badge is visible
 * right after deploy / before the first save.
 */
export function useShowBreakpointLabel() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.siteSettings.getUiPublic, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json?.success && typeof json.data?.showFooterBreakpoint === "boolean") {
          setEnabled(json.data.showFooterBreakpoint);
        }
      } catch {
        /* keep default visible */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return enabled;
}
