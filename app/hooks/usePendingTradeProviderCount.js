"use client";

import { useCallback, useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";

export function usePendingTradeProviderCount(enabled = true) {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(enabled));

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await authFetch(API_ENDPOINTS.tradeServiceProviders.pendingCount, {
        cache: "no-store",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPendingCount(Number(json.data?.pending) || 0);
      }
    } catch {
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setPendingCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
  }, [enabled, refresh]);

  return { pendingCount, loading, refresh };
}
