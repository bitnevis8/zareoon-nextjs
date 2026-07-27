"use client";

import useSWR from "swr";
import { API_ENDPOINTS } from "@/app/config/api";

const fetcher = async (url) => {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  if (!json?.success) return {};
  return json.data?.items || {};
};

/**
 * @param {Array<number|string|null|undefined>} productIds
 * @returns {Record<string, { displayMode: string, path: string|null }>}
 */
export function useProductLandingLinks(productIds = []) {
  const ids = [...new Set((productIds || []).map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0))]
    .sort((a, b) => a - b)
    .slice(0, 80);
  const key = ids.length ? API_ENDPOINTS.productLanding.resolveProducts(ids) : null;
  const { data } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });
  return data || {};
}
