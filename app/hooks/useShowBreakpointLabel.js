"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";

/**
 * Admin toggle (site settings → showFooterBreakpoint).
 * Default OFF for client delivery — only show when explicitly enabled.
 */
export function useShowBreakpointLabel() {
  const [enabled, setEnabled] = useState(false);

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
        /* keep default off */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return enabled;
}
