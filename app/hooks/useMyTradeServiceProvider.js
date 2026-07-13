"use client";

import { useCallback, useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";

export function useMyTradeServiceProvider(enabled = true) {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const r = await authFetch(API_ENDPOINTS.tradeServiceProviders.mine, { cache: "no-store" });
      const json = await r.json();
      if (r.ok && json.success) {
        setProvider(json?.primary || json?.data?.[0] || null);
      } else {
        setProvider(null);
      }
    } catch {
      setProvider(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setProvider(null);
      setLoading(false);
      return undefined;
    }

    refresh();
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled) return undefined;

    const onUpdated = () => refresh();
    const onFocus = () => refresh();

    window.addEventListener("trade-provider-mine-updated", onUpdated);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      window.removeEventListener("trade-provider-mine-updated", onUpdated);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [enabled, refresh]);

  return {
    provider,
    loading,
    hasProvider: Boolean(provider),
    refresh,
  };
}
