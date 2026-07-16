"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR, { preload, mutate } from "swr";
import { API_ENDPOINTS } from "@/app/config/api";
import { STATIC_ROOT_CATEGORIES, getStaticRootById } from "@/app/data/staticRootCategories";

const DEDUPE_MS = 60_000;

function catalogUrl({ parentId, isOrderable, lite = true } = {}) {
  const params = new URLSearchParams();
  if (parentId !== undefined) {
    params.set("parentId", parentId === null || parentId === "" ? "" : String(parentId));
  }
  if (isOrderable !== undefined) {
    params.set("isOrderable", String(isOrderable));
  }
  if (lite) params.set("lite", "1");
  const qs = params.toString();
  return qs ? `${API_ENDPOINTS.supplier.products.getAll}?${qs}` : API_ENDPOINTS.supplier.products.getAll;
}

function productByIdUrl(id) {
  return API_ENDPOINTS.supplier.products.getById(id);
}

async function jsonFetcher(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

async function productFetcher(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json?.data || null;
}

const swrDefaults = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: DEDUPE_MS,
  refreshInterval: 0,
  keepPreviousData: true,
};

const FULL_LITE_KEY = catalogUrl({ lite: true });
const LOTS_KEY = API_ENDPOINTS.supplier.inventoryLots.getAll;

function childrenKey(parentId) {
  return catalogUrl({ parentId, lite: true });
}

/** Homepage roots are static — never block on network. */
export function useRootCategories() {
  return {
    categories: STATIC_ROOT_CATEGORIES,
    error: null,
    loading: false,
    isValidating: false,
    mutate: async () => STATIC_ROOT_CATEGORIES,
  };
}

/** Direct children of a category (warmed on site entry). */
export function useCatalogChildren(parentId, { enabled = true, ...options } = {}) {
  const key = enabled && parentId != null && parentId !== "" ? childrenKey(parentId) : null;
  const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR(key, jsonFetcher, {
    ...swrDefaults,
    revalidateIfStale: false,
    ...options,
  });
  return {
    children: data || [],
    error,
    loading: Boolean(key && isLoading && !data),
    isValidating,
    mutate: revalidate,
    hasCache: Array.isArray(data),
  };
}

export function useCatalogProduct(id, { enabled = true, ...options } = {}) {
  const key = enabled && id != null ? productByIdUrl(id) : null;
  const staticFallback = id != null ? getStaticRootById(id) : null;
  const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR(key, productFetcher, {
    ...swrDefaults,
    revalidateIfStale: false,
    fallbackData: staticFallback || undefined,
    ...options,
  });
  return {
    product: data || staticFallback || null,
    error,
    loading: Boolean(key && isLoading && data === undefined && !staticFallback),
    isValidating,
    mutate: revalidate,
  };
}

export function useFullCatalog({ enabled = true, ...options } = {}) {
  const key = enabled ? FULL_LITE_KEY : null;
  const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR(key, jsonFetcher, {
    ...swrDefaults,
    revalidateIfStale: false,
    ...options,
  });
  return {
    products: data || [],
    error,
    loading: Boolean(enabled && isLoading && !data),
    isValidating,
    mutate: revalidate,
  };
}

export function useInventoryLots({ enabled = true, ...options } = {}) {
  const key = enabled ? LOTS_KEY : null;
  const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR(key, jsonFetcher, {
    ...swrDefaults,
    revalidateIfStale: false,
    ...options,
  });
  return {
    lots: data || [],
    error,
    loading: Boolean(enabled && isLoading && !data),
    isValidating,
    mutate: revalidate,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function prefetchCatalogChildren(parentId) {
  if (parentId == null || parentId === "") return Promise.resolve([]);
  return preload(childrenKey(parentId), jsonFetcher);
}

export function prefetchCatalogProduct(id) {
  if (id == null) return Promise.resolve(null);
  return preload(productByIdUrl(id), productFetcher);
}

export function prefetchFullCatalogLite() {
  return preload(FULL_LITE_KEY, jsonFetcher);
}

export function prefetchInventoryLots() {
  return preload(LOTS_KEY, jsonFetcher);
}

export async function seedProductCache(product) {
  if (!product?.id) return;
  await mutate(productByIdUrl(product.id), product, { revalidate: false });
}

async function prefetchPool(ids, worker, concurrency = 4) {
  const queue = [...ids];
  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const id = queue.shift();
      try {
        await worker(id);
      } catch {
        // ignore individual failures
      }
    }
  });
  await Promise.all(runners);
}

/**
 * Site-wide warmup: starts as soon as the app mounts.
 * 1) All root children + root product rows (parallel)
 * 2) Grandchildren of those children (so میوه etc. are ready)
 * 3) Full lite catalog + inventory lots
 */
let siteWarmupStarted = false;

export async function runSiteCatalogWarmup({ cancelled } = {}) {
  const isCancelled = () => Boolean(cancelled?.current);

  // Seed static roots into product cache immediately
  await Promise.all(STATIC_ROOT_CATEGORIES.map((root) => seedProductCache(root)));
  if (isCancelled()) return;

  const rootIds = STATIC_ROOT_CATEGORIES.map((r) => r.id);

  // Priority: agriculture first, then the rest in parallel batches
  const prioritized = [10000, ...rootIds.filter((id) => id !== 10000)];

  await prefetchPool(
    prioritized,
    async (id) => {
      if (isCancelled()) return;
      await Promise.all([prefetchCatalogChildren(id), prefetchCatalogProduct(id)]);
    },
    6
  );
  if (isCancelled()) return;

  // Grandchildren: for each root, take its children and prefetch their children
  const allL2Ids = [];
  for (const rootId of prioritized) {
    if (isCancelled()) return;
    try {
      const kids = await prefetchCatalogChildren(rootId);
      for (const kid of kids || []) {
        if (kid?.id != null && !kid.isOrderable) {
          allL2Ids.push(kid.id);
          seedProductCache(kid);
        } else if (kid?.id != null) {
          seedProductCache(kid);
        }
      }
    } catch {
      // continue
    }
  }
  if (isCancelled()) return;

  // Agriculture L2 first (میوه و …), then others
  const uniqueL2 = [...new Set(allL2Ids)];
  await prefetchPool(
    uniqueL2,
    async (id) => {
      if (isCancelled()) return;
      await Promise.all([prefetchCatalogChildren(id), prefetchCatalogProduct(id)]);
    },
    5
  );
  if (isCancelled()) return;

  await Promise.allSettled([prefetchFullCatalogLite(), prefetchInventoryLots()]);
}

export function useSiteCatalogWarmup() {
  const cancelled = useRef(false);
  const router = useRouter();

  useEffect(() => {
    cancelled.current = false;
    if (siteWarmupStarted) return undefined;
    siteWarmupStarted = true;

    // Prefetch Next.js route shells for root catalog pages
    for (const root of STATIC_ROOT_CATEGORIES) {
      try {
        router.prefetch(`/catalog/${root.id}`);
      } catch {
        // ignore
      }
    }

    runSiteCatalogWarmup({ cancelled }).catch(() => {});

    return () => {
      cancelled.current = true;
    };
  }, [router]);
}

/** @deprecated use useSiteCatalogWarmup — kept for callers that pass a list */
export function useBackgroundCatalogWarmup(roots = []) {
  useSiteCatalogWarmup();
  // Still seed any extra nodes passed in
  useEffect(() => {
    for (const item of roots || []) {
      if (item?.id) seedProductCache(item);
    }
  }, [roots]);
}

export { catalogUrl, childrenKey, FULL_LITE_KEY, jsonFetcher, productFetcher, STATIC_ROOT_CATEGORIES };
