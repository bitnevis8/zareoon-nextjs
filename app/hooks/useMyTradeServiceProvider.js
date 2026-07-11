"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";

export function useMyTradeServiceProvider(enabled = true) {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));

  useEffect(() => {
    if (!enabled) {
      setProvider(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    authFetch(API_ENDPOINTS.tradeServiceProviders.mine, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setProvider(json?.primary || json?.data?.[0] || null);
        }
      })
      .catch(() => {
        if (!cancelled) setProvider(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    provider,
    loading,
    hasProvider: Boolean(provider),
  };
}
