"use client";

import { useEffect, useState } from "react";

/** Returns map of currency code → price in Iranian Rial (from TGJU). */
export function useExchangeRatesMap() {
  const [rates, setRates] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/exchange-rates", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        const map = {};
        for (const row of json?.data || []) {
          if (row.code && row.price != null) map[row.code] = Number(row.price);
        }
        setRates(map);
      } catch {
        if (!cancelled) setRates({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return rates;
}
