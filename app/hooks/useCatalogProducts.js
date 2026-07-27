"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR, { preload, mutate } from "swr";
import { API_ENDPOINTS } from "@/app/config/api";
import { STATIC_ROOT_CATEGORIES, getStaticRootById } from "@/app/data/staticRootCategories";

const DEDUPE_MS = 60_000;

/**
 * Evidence (prod probe 2026-07-27):
 * - GET ?parentId=1057&lite=1 alone ≈ 0.8–2s / tiny body → not MySQL-bound for that key
 * - GET ?lite=1 (full tree) ≈ 10.6MB / multi-second → saturates browser connections to api.zareoon.ir
 * - Old warmup: mount-immediate, concurrency 5–6, all L2, full lite + 2 lot feeds
 *   → provisional-header hangs (~60s) on unrelated requests (e.g. near «آخرین فروشگاه‌ها»)
 *
 * Policy: keep warmup, never remove; make it idle/post-paint, tiny, concurrency-capped.
 * Kill-switch: set enabled=false if RUM still shows contention after this.
 */
export const CATALOG_WARMUP_CONFIG = {
  enabled: true,
  /** Max parallel API prefetches (browser + origin friendly) */
  concurrency: 2,
  /** requestIdleCallback / fallback timeout after first paint */
  idleTimeoutMs: 3500,
  /** Extra settle after window load before idle wait */
  postLoadDelayMs: 400,
  /** Prefetch /catalog/{id} shells for roots (queued, same concurrency) */
  prefetchRouteShells: true,
  /** Network: skip warmup on Save-Data / 2g */
  skipOnSlowNetwork: true,
};

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

/** URL موجودی با فیلتر/صفحه — برای جلوگیری از dump کامل جدول */
export function inventoryLotsUrl(params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s
    ? `${API_ENDPOINTS.supplier.inventoryLots.getAll}?${s}`
    : API_ENDPOINTS.supplier.inventoryLots.getAll;
}

/** پیش‌فرض مرور عمومی: فقط موجودی فعال، سبک */
const DEFAULT_PUBLIC_LOTS_PARAMS = {
  status: "harvested,reserved",
  lite: "1",
  withSupplier: "1",
};

/** فید صفحه اصلی — کم‌حجم و مرتب‌شده */
export const HOMEPAGE_LOTS_PARAMS = {
  public: "1",
  lite: "1",
  limit: "100",
  order: "updated_at",
  withSupplier: "1",
};

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

/** Direct children of a category (optionally warmed after idle). */
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

export function useInventoryLots({ enabled = true, params, ...options } = {}) {
  const resolved = params === undefined ? DEFAULT_PUBLIC_LOTS_PARAMS : params;
  const key = enabled ? inventoryLotsUrl(resolved) : null;
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

export function prefetchCatalogChildren(parentId) {
  if (parentId == null || parentId === "") return Promise.resolve([]);
  return preload(childrenKey(parentId), jsonFetcher);
}

export function prefetchCatalogProduct(id) {
  if (id == null) return Promise.resolve(null);
  return preload(productByIdUrl(id), productFetcher);
}

/** @deprecated Prefer on-demand useFullCatalog (mega menu / catalog page). Never call from warmup. */
export function prefetchFullCatalogLite() {
  return preload(FULL_LITE_KEY, jsonFetcher);
}

export function prefetchInventoryLots(params) {
  return preload(inventoryLotsUrl(params === undefined ? DEFAULT_PUBLIC_LOTS_PARAMS : params), jsonFetcher);
}

export async function seedProductCache(product) {
  if (!product?.id) return;
  await mutate(productByIdUrl(product.id), product, { revalidate: false });
}

async function prefetchPool(ids, worker, concurrency = CATALOG_WARMUP_CONFIG.concurrency) {
  const queue = [...ids];
  const limit = Math.max(1, Math.min(concurrency, 3, queue.length || 1));
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
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

function isSlowNetwork() {
  if (typeof navigator === "undefined") return false;
  if (navigator.connection?.saveData) return true;
  const type = String(navigator.connection?.effectiveType || "").toLowerCase();
  return type === "slow-2g" || type === "2g";
}

function waitForWindowLoad() {
  if (typeof window === "undefined") return Promise.resolve();
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

/** First paint (double rAF) → optional load → requestIdleCallback. */
function whenBrowserIdle({ timeoutMs = CATALOG_WARMUP_CONFIG.idleTimeoutMs, cancelled } = {}) {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    let idleId = null;
    let timerId = null;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      if (idleId != null && typeof cancelIdleCallback === "function") {
        try {
          cancelIdleCallback(idleId);
        } catch {
          /* ignore */
        }
      }
      if (timerId != null) clearTimeout(timerId);
      resolve();
    };

    const armIdle = () => {
      if (cancelled?.current) {
        finish();
        return;
      }
      if (typeof requestIdleCallback === "function") {
        idleId = requestIdleCallback(() => finish(), { timeout: timeoutMs });
      } else {
        timerId = setTimeout(finish, Math.min(timeoutMs, 2000));
      }
    };

    // After first paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        waitForWindowLoad().then(() => {
          if (cancelled?.current) {
            finish();
            return;
          }
          const delay = CATALOG_WARMUP_CONFIG.postLoadDelayMs || 0;
          if (delay > 0) {
            timerId = setTimeout(armIdle, delay);
          } else {
            armIdle();
          }
        });
      });
    });
  });
}

let siteWarmupStarted = false;

/**
 * Light site warmup — essential root children only.
 * Does NOT fetch full catalog (~10MB), L2 trees, or inventory feeds (those stay lazy).
 */
export async function runSiteCatalogWarmup({ cancelled } = {}) {
  const cfg = CATALOG_WARMUP_CONFIG;
  if (!cfg.enabled) {
    return { skipped: true, reason: "CATALOG_WARMUP_CONFIG.enabled=false" };
  }
  if (cfg.skipOnSlowNetwork && isSlowNetwork()) {
    return { skipped: true, reason: "slow-network-or-save-data" };
  }

  await whenBrowserIdle({ timeoutMs: cfg.idleTimeoutMs, cancelled });
  if (cancelled?.current) return { skipped: true, reason: "cancelled" };

  // Local only — no network
  await Promise.all(STATIC_ROOT_CATEGORIES.map((root) => seedProductCache(root)));
  if (cancelled?.current) return { skipped: true, reason: "cancelled" };

  const rootIds = STATIC_ROOT_CATEGORIES.map((r) => r.id);
  // Agriculture first for homepage intent, then remaining roots
  const prioritized = [10000, ...rootIds.filter((id) => id !== 10000)];

  await prefetchPool(
    prioritized,
    async (id) => {
      if (cancelled?.current) return;
      // Children only — root product rows are already seeded from static JSON
      const kids = await prefetchCatalogChildren(id);
      for (const kid of kids || []) {
        if (kid?.id != null) seedProductCache(kid);
      }
    },
    cfg.concurrency
  );

  return { skipped: false, warmedRoots: prioritized.length };
}

/**
 * Boot hook: after first render + idle. Skipped on dashboard via SiteChrome.
 */
export function useSiteCatalogWarmup({ enabled = true } = {}) {
  const cancelled = useRef(false);
  const router = useRouter();

  useEffect(() => {
    cancelled.current = false;
    if (!enabled || !CATALOG_WARMUP_CONFIG.enabled) return undefined;
    if (siteWarmupStarted) return undefined;
    siteWarmupStarted = true;

    let alive = true;

    (async () => {
      const result = await runSiteCatalogWarmup({ cancelled });
      if (!alive || cancelled.current || result?.skipped) return;

      if (!CATALOG_WARMUP_CONFIG.prefetchRouteShells) return;

      // Route shells after API warm — same low concurrency, idle-yielded
      await whenBrowserIdle({ timeoutMs: 2000, cancelled });
      if (cancelled.current) return;

      const routes = STATIC_ROOT_CATEGORIES.map((r) => `/catalog/${r.id}`);
      await prefetchPool(
        routes,
        async (href) => {
          if (cancelled.current) return;
          try {
            router.prefetch(href);
          } catch {
            /* ignore */
          }
          // tiny yield so we don't burst the Next router
          await new Promise((r) => setTimeout(r, 50));
        },
        CATALOG_WARMUP_CONFIG.concurrency
      );
    })().catch(() => {});

    return () => {
      alive = false;
      cancelled.current = true;
    };
  }, [enabled, router]);
}

/**
 * Page-local lazy warm: only children of the nodes currently on screen.
 * Must NOT start the global site warmup (that was a previous bug).
 */
export function useBackgroundCatalogWarmup(nodes = []) {
  const idsKey = useMemo(() => {
    const ids = (nodes || [])
      .filter((n) => n?.id != null && !n.isOrderable)
      .map((n) => Number(n.id))
      .filter((n) => Number.isFinite(n))
      .slice(0, 12);
    return ids.join(",");
  }, [nodes]);

  useEffect(() => {
    if (!idsKey || !CATALOG_WARMUP_CONFIG.enabled) return undefined;
    if (CATALOG_WARMUP_CONFIG.skipOnSlowNetwork && isSlowNetwork()) return undefined;

    const cancelled = { current: false };
    const ids = idsKey.split(",").map(Number);

    (async () => {
      for (const item of nodes || []) {
        if (item?.id) seedProductCache(item);
      }
      await whenBrowserIdle({ timeoutMs: 2000, cancelled });
      if (cancelled.current) return;
      await prefetchPool(
        ids,
        async (id) => {
          if (cancelled.current) return;
          await prefetchCatalogChildren(id);
        },
        CATALOG_WARMUP_CONFIG.concurrency
      );
    })().catch(() => {});

    return () => {
      cancelled.current = true;
    };
    // nodes content is summarized by idsKey; seed uses latest nodes from closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);
}

export {
  catalogUrl,
  childrenKey,
  FULL_LITE_KEY,
  inventoryLotsUrl,
  jsonFetcher,
  productFetcher,
  STATIC_ROOT_CATEGORIES,
};
