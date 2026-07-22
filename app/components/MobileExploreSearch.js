"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { useLanguage } from "@/app/context/LanguageContext";
import { getLocalizedText, formatLocalizedNumber, localizeUnit } from "@/app/utils/localize";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { sortCatalogItems } from "@/app/utils/productSort";
import { getLotSupplierDisplayName } from "@/app/utils/catalogLotSupplier";
import {
  normalizeSearchFilter,
  parseSearchQuery,
  runMobileSearch,
  buildListingCountMap,
  getListingDisplayTitle,
} from "@/app/utils/mobileSearchUtils";
import { useTradeServicesContent } from "@/app/hooks/useTradeServicesContent";
import { providerPublicPath } from "@/app/utils/providerPublicPath";

const RECENT_KEY = "recentSearches";
const EXPLORE_LIMIT = 48;

function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ListingExploreTile({ row, language, t, tall = false }) {
  const { lot, product, availableQty } = row;
  const title = getListingDisplayTitle(lot, product, language, t);
  const typeName = getLocalizedText(product, language);
  const image =
    resolveMediaUrl(lot.coverImageUrl) ||
    resolveMediaUrl(product?.imageUrl) ||
    "/images/product-placeholder.svg";
  const supplier = getLotSupplierDisplayName(lot);
  const unit = lot.unit || product?.unit || "kg";
  const tallClass = tall ? "max-lg:row-span-2 max-lg:aspect-[3/4]" : "";

  return (
    <Link
      href={`/catalog/${product.id}`}
      className={`group relative block aspect-square overflow-hidden rounded-lg bg-slate-200 lg:rounded-xl ${tallClass}`}
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 space-y-0.5 p-2">
        <p className="line-clamp-2 text-[11px] font-bold leading-tight text-white">{title}</p>
        {title !== typeName ? (
          <p className="truncate text-[10px] text-white/80">{typeName}</p>
        ) : null}
        <p className="truncate text-[10px] font-medium text-emerald-200">
          {formatLocalizedNumber(availableQty, language)} {localizeUnit(unit, language)}
          {supplier ? ` · ${supplier}` : ""}
        </p>
      </div>
    </Link>
  );
}

function TypeResultCard({ row, language, t, onNavigate }) {
  const { product, listingCount, isCategory } = row;
  const title = getLocalizedText(product, language);
  const image = resolveMediaUrl(product.imageUrl) || "/images/product-placeholder.svg";

  return (
    <button
      type="button"
      onClick={() => onNavigate(`/catalog/${product.id}`, isCategory ? `#${title}` : title)}
      className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-start shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <Image src={image} alt={title} fill sizes="48px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-[11px] text-slate-500">
          {isCategory ? t("category") : t("mobileSearchProductType")}
          {listingCount > 0
            ? ` · ${t("mobileSearchListingCount", { count: listingCount })}`
            : ` · ${t("mobileSearchNoListings")}`}
        </p>
      </div>
      <span className="shrink-0 text-slate-300">‹</span>
    </button>
  );
}

function ListingResultCard({ row, language, t, onNavigate }) {
  const { lot, product, availableQty } = row;
  const title = getListingDisplayTitle(lot, product, language, t);
  const typeName = getLocalizedText(product, language);
  const image =
    resolveMediaUrl(lot.coverImageUrl) ||
    resolveMediaUrl(product?.imageUrl) ||
    "/images/product-placeholder.svg";
  const supplier = getLotSupplierDisplayName(lot);
  const unit = lot.unit || product?.unit || "kg";

  return (
    <button
      type="button"
      onClick={() => onNavigate(`/catalog/${product.id}`, title)}
      className="overflow-hidden rounded-xl border border-slate-100 bg-white text-start shadow-sm transition hover:border-emerald-200"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        <Image src={image} alt={title} fill sizes="50vw" className="object-cover" />
      </div>
      <div className="space-y-1 p-2.5">
        <p className="line-clamp-2 text-xs font-bold text-slate-900">{title}</p>
        {title !== typeName ? (
          <p className="truncate text-[11px] text-slate-500">{typeName}</p>
        ) : null}
        <p className="text-[10px] font-semibold text-emerald-700">
          {formatLocalizedNumber(availableQty, language)} {localizeUnit(unit, language)}
        </p>
        {supplier ? <p className="truncate text-[10px] text-slate-400">{supplier}</p> : null}
      </div>
    </button>
  );
}

function ServiceCategoryCard({ category, t, onNavigate }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(`/trade-services/${category.id}`, category.title)}
      className="flex w-full items-center gap-3 rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-start shadow-sm transition hover:border-violet-200 hover:bg-violet-50/40"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-8 8h10a2 2 0 002-2V8l-4-4H8L4 8v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{category.title}</p>
        <p className="text-[11px] text-slate-500">{t("mobileSearchServicesSection")}</p>
      </div>
      <span className="shrink-0 text-slate-300">‹</span>
    </button>
  );
}

function ServiceProviderCard({ provider, onNavigate }) {
  const name = provider.displayName || provider.companyName || provider.profileSlug || "";
  const href =
    providerPublicPath(provider.profileSlug) ||
    (provider.id ? `/trade-services/provider/${provider.id}` : "/trade-services");
  return (
    <button
      type="button"
      onClick={() => onNavigate(href, name)}
      className="flex w-full items-center gap-3 rounded-xl border border-emerald-100 bg-white px-3 py-2.5 text-start shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-800">
        {(name[0] || "س").toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
        {provider.profileSlug ? (
          <p className="truncate text-[11px] text-slate-500" dir="ltr">
            /{provider.profileSlug}
          </p>
        ) : null}
      </div>
      <span className="shrink-0 text-slate-300">‹</span>
    </button>
  );
}

function PostResultCard({ post, onNavigate }) {
  const href = post.href || (post.profileSlug ? `/${post.profileSlug}?tab=posts` : "/search");
  const image = resolveMediaUrl(post.imageUrl) || resolveMediaUrl(post.authorAvatar);
  return (
    <button
      type="button"
      onClick={() => onNavigate(href, post.authorName || post.body?.slice(0, 40))}
      className="flex w-full gap-3 rounded-xl border border-slate-100 bg-white p-2.5 text-start shadow-sm transition hover:border-emerald-200"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {image ? (
          <Image src={image} alt="" fill sizes="64px" className="object-cover" unoptimized />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg text-slate-400">✎</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-800">{post.authorName || post.profileSlug}</p>
        <p className="mt-0.5 line-clamp-2 text-[12px] leading-5 text-slate-600">{post.body}</p>
      </div>
    </button>
  );
}

export default function MobileExploreSearch({
  variant = "page",
  initialQuery = "",
  initialFilter = "",
  onRequestClose,
}) {
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef(null);
  const isModal = variant === "modal";
  const tradeServices = useTradeServicesContent();

  const [query, setQuery] = useState(() => initialQuery || searchParams.get("q") || "");
  const [filter, setFilter] = useState(() =>
    normalizeSearchFilter(initialFilter || searchParams.get("filter"))
  );
  const [allProducts, setAllProducts] = useState([]);
  const [inventoryLots, setInventoryLots] = useState([]);
  const [rootCategories, setRootCategories] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [publicPosts, setPublicPosts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);

  const parsed = useMemo(() => parseSearchQuery(query), [query]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [productsRes, inventoryRes, catsRes, providersRes, postsRes] = await Promise.all([
          fetch(API_ENDPOINTS.supplier.products.getAll, { cache: "no-store" }),
          fetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" }),
          fetch(`${API_ENDPOINTS.supplier.products.getAll}?isOrderable=false&parentId=`, { cache: "no-store" }),
          fetch(`${API_ENDPOINTS.tradeServiceProviders.getPublic}?limit=200`, { cache: "no-store" }).catch(() => null),
          fetch(`${API_ENDPOINTS.tamin.publicPosts}?limit=40`, { cache: "no-store" }).catch(() => null),
        ]);
        const [productsJson, inventoryJson, catsJson, providersJson, postsJson] = await Promise.all([
          productsRes.json(),
          inventoryRes.json(),
          catsRes.json(),
          providersRes?.ok ? providersRes.json() : Promise.resolve(null),
          postsRes?.ok ? postsRes.json() : Promise.resolve(null),
        ]);
        if (!cancelled) {
          setAllProducts(productsJson?.data || []);
          setInventoryLots(inventoryJson?.data || []);
          setRootCategories(sortCatalogItems(catsJson?.data || [], language));
          setServiceProviders(Array.isArray(providersJson?.data) ? providersJson.data : []);
          setPublicPosts(Array.isArray(postsJson?.data) ? postsJson.data : []);
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    if (isModal) return;
    const q = searchParams.get("q") || "";
    const urlFilter = normalizeSearchFilter(searchParams.get("filter"));
    setQuery((prev) => (prev !== q ? q : prev));
    setFilter((prev) => (prev !== urlFilter ? urlFilter : prev));
  }, [searchParams, isModal]);

  useEffect(() => {
    if (isModal && initialQuery != null) {
      setQuery(initialQuery);
    }
  }, [isModal, initialQuery]);

  useEffect(() => {
    if (isModal && initialFilter) {
      setFilter(normalizeSearchFilter(initialFilter));
    }
  }, [isModal, initialFilter]);

  useEffect(() => {
    let cancelled = false;
    const q = query.trim();
    if (!q && filter !== "posts" && filter !== "all" && filter !== "hashtag") return undefined;
    (async () => {
      try {
        const url = `${API_ENDPOINTS.tamin.publicPosts}?limit=40${q ? `&q=${encodeURIComponent(q)}` : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json?.success) setPublicPosts(Array.isArray(json.data) ? json.data : []);
      } catch {
        /* keep previous */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, filter]);

  useEffect(() => {
    if (parsed.term) return;
    const timeout = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(timeout);
  }, [parsed.term]);

  const searchResult = useMemo(
    () =>
      runMobileSearch({
        allProducts,
        inventoryLots,
        term: query,
        language,
        t,
        filter,
        serviceProviders,
        serviceCategories: tradeServices.categories || [],
        publicPosts,
      }),
    [allProducts, inventoryLots, query, language, t, filter, serviceProviders, tradeServices.categories, publicPosts]
  );

  const listingCountByProductId = useMemo(
    () => buildListingCountMap(searchResult.flatLots),
    [searchResult.flatLots]
  );

  const exploreTypes = useMemo(() => {
    const seen = new Set();
    const rows = [];
    for (const row of searchResult.flatLots) {
      if (seen.has(row.product.id)) continue;
      seen.add(row.product.id);
      rows.push({
        product: row.product,
        listingCount: listingCountByProductId.get(row.product.id) || 0,
        isCategory: !row.product.isOrderable,
        isOrderableType: Boolean(row.product.isOrderable),
      });
    }
    return rows.slice(0, EXPLORE_LIMIT);
  }, [searchResult.flatLots, listingCountByProductId]);

  const exploreListings = useMemo(() => searchResult.flatLots.slice(0, EXPLORE_LIMIT), [searchResult.flatLots]);

  const saveRecent = useCallback((value) => {
    const v = value.trim();
    if (!v) return;
    setRecentSearches((prev) => {
      const next = [v, ...prev.filter((x) => x !== v)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const syncUrl = useCallback(
    (nextQuery, nextFilter = filter) => {
      if (isModal) return;
      const params = new URLSearchParams();
      params.set("mode", "explore");
      const trimmed = nextQuery.trim();
      if (trimmed) params.set("q", trimmed);
      if (nextFilter && nextFilter !== "all") params.set("filter", nextFilter);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    },
    [filter, router, isModal]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parsed.term) saveRecent(query.trim());
    syncUrl(query, filter);
  };

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter);
    syncUrl(query, nextFilter);
  };

  const handleResultNavigate = (href, label) => {
    if (label) saveRecent(label.startsWith("#") ? label : label);
    onRequestClose?.();
    router.push(href);
  };

  const filterChips = [
    { id: "all", label: t("mobileSearchFilterAll"), descKey: "mobileSearchFilterAllDesc" },
    { id: "products", label: t("mobileSearchFilterProducts"), descKey: "mobileSearchFilterProductsDesc" },
    { id: "services", label: t("mobileSearchFilterServices"), descKey: "mobileSearchFilterServicesDesc" },
    { id: "posts", label: t("mobileSearchFilterPosts"), descKey: "mobileSearchFilterPostsDesc" },
    { id: "hashtag", label: t("mobileSearchFilterHashtag"), descKey: "mobileSearchFilterHashtagDesc" },
  ];

  const activeFilterChip = filterChips.find((chip) => chip.id === filter) || filterChips[0];

  const popularTags = useMemo(
    () => rootCategories.slice(0, 10).map((c) => ({ id: c.id, label: `#${getLocalizedText(c, language)}` })),
    [rootCategories, language]
  );

  const showProducts = filter === "all" || filter === "products" || filter === "hashtag";
  const showServices = filter === "all" || filter === "services";
  const showPosts = filter === "all" || filter === "posts" || filter === "hashtag";
  const hasSearch = Boolean(parsed.term);
  const { types, listings, hashtagTags, services, serviceCategories, posts } = searchResult;

  const renderExplore = () => {
    if (loadingData) {
      return (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`animate-pulse rounded-lg bg-slate-200 ${
                !isModal && i % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
              }`}
            />
          ))}
        </div>
      );
    }

    if (filter === "products") {
      if (!exploreTypes.length) {
        return <p className="py-8 text-center text-sm text-slate-500">{t("mobileSearchNoExplore")}</p>;
      }
      return (
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {exploreTypes.map((row) => (
            <TypeResultCard
              key={row.product.id}
              row={row}
              language={language}
              t={t}
              onNavigate={handleResultNavigate}
            />
          ))}
        </div>
      );
    }

    if (filter === "services") {
      const cats = tradeServices.categories || [];
      if (!cats.length && !serviceProviders.length) {
        return <p className="py-8 text-center text-sm text-slate-500">{t("mobileSearchNoExplore")}</p>;
      }
      return (
        <div className="space-y-4">
          {cats.length ? (
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {cats.slice(0, 12).map((category) => (
                <ServiceCategoryCard
                  key={category.id}
                  category={category}
                  t={t}
                  onNavigate={handleResultNavigate}
                />
              ))}
            </div>
          ) : null}
          {serviceProviders.length ? (
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {serviceProviders.slice(0, 12).map((provider) => (
                <ServiceProviderCard
                  key={provider.id || provider.profileSlug}
                  provider={provider}
                  onNavigate={handleResultNavigate}
                />
              ))}
            </div>
          ) : null}
        </div>
      );
    }

    if (filter === "posts") {
      if (!publicPosts.length) {
        return <p className="py-8 text-center text-sm text-slate-500">{t("mobileSearchNoExplore")}</p>;
      }
      return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {publicPosts.slice(0, EXPLORE_LIMIT).map((post) => (
            <PostResultCard key={post.id} post={post} onNavigate={handleResultNavigate} />
          ))}
        </div>
      );
    }

    if (!exploreListings.length) {
      return <p className="py-8 text-center text-sm text-slate-500">{t("mobileSearchNoExplore")}</p>;
    }

    return (
      <div
        className={`grid grid-cols-2 gap-1.5 auto-rows-min sm:grid-cols-3 lg:gap-2.5 ${
          isModal ? "lg:grid-cols-4 xl:grid-cols-5" : "lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        }`}
      >
        {exploreListings.map((row, index) => (
          <ListingExploreTile
            key={row.lot.id}
            row={row}
            language={language}
            t={t}
            tall={!isModal && index % 5 === 0}
          />
        ))}
      </div>
    );
  };

  const splitResultsOnDesktop = !isModal && hasSearch && filter === "all" && types.length > 0 && listings.length > 0;

  return (
    <div
      className={
        isModal
          ? "flex h-full min-h-0 w-full flex-col"
          : "mx-auto flex w-full max-w-3xl flex-col max-lg:min-h-[calc(100dvh-var(--site-mobile-top-chrome)-4.25rem-env(safe-area-inset-bottom))] lg:max-w-7xl lg:px-6 lg:py-6"
      }
    >
      {!isModal ? (
        <header className="mb-4 hidden lg:block">
          <h1 className="text-2xl font-bold text-slate-900">{t("searchAdvanced")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("mobileSearchHint")}</p>
        </header>
      ) : null}

      <div
        className={`shrink-0 border-b border-slate-100 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-4 ${
          isModal
            ? "sticky top-0 z-10"
            : "sticky top-0 z-20 lg:static lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:px-5 lg:py-4 lg:shadow-sm"
        }`}
      >
        <form onSubmit={handleSubmit} className="relative">
          <span
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${
              isRTL ? "right-3" : "left-3"
            }`}
          >
            <SearchIcon className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" />
          </span>
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("mobileSearchPlaceholder")}
            className={`w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 text-[13px] outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 sm:py-2.5 sm:text-sm ${
              isRTL
                ? "pe-9 ps-9 text-right placeholder:text-right"
                : "ps-9 pe-9 text-left placeholder:text-left"
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                syncUrl("", filter);
              }}
              className={`absolute top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 ${
                isRTL ? "left-2" : "right-2"
              }`}
              aria-label={t("close")}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </form>

        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 lg:flex-wrap lg:overflow-visible lg:gap-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleFilterChange(chip.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition lg:px-4 lg:py-1.5 lg:text-sm ${
                filter === chip.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <p className="mt-2 text-[11px] leading-5 text-slate-500 lg:text-xs">
          {t(activeFilterChip.descKey)}
        </p>
      </div>
      <div
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 ${
          isModal ? "pb-6" : "lg:px-0 lg:py-5"
        }`}
      >
        {!hasSearch ? (
          <div className="space-y-5">
            {recentSearches.length > 0 ? (
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-700">{t("mobileSearchRecent")}</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem(RECENT_KEY);
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                  >
                    {t("mobileSearchClearRecent")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setQuery(item);
                        syncUrl(item, item.startsWith("#") ? "hashtag" : filter);
                        if (item.startsWith("#")) setFilter("hashtag");
                      }}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {(filter === "all" || filter === "hashtag") && popularTags.length > 0 ? (
              <section>
                <h2 className="mb-2 text-xs font-bold text-slate-700">{t("mobileSearchPopularTags")}</h2>
                <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {popularTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setQuery(tag.label);
                        setFilter("hashtag");
                        saveRecent(tag.label);
                        syncUrl(tag.label, "hashtag");
                      }}
                      className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-100"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <h2 className="mb-2 text-xs font-bold text-slate-700">
                {filter === "products"
                  ? t("mobileSearchTypesSection")
                  : filter === "services"
                    ? t("mobileSearchServicesSection")
                    : filter === "posts"
                      ? t("mobileSearchPostsSection")
                      : t("mobileSearchExploreTitle")}
              </h2>
              {renderExplore()}
            </section>
          </div>
        ) : loadingData ? (
          <div className="space-y-2 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="h-12 w-12 rounded-lg bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-slate-200" />
                  <div className="h-2.5 w-1/3 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={
              splitResultsOnDesktop
                ? "space-y-5 xl:grid xl:grid-cols-12 xl:items-start xl:gap-6 xl:space-y-0"
                : "space-y-5"
            }
          >
            {filter === "hashtag" && hashtagTags.length > 0 ? (
              <section className={splitResultsOnDesktop ? "xl:col-span-12" : ""}>
                <h2 className="mb-2 text-xs font-bold text-slate-700">{t("mobileSearchMatchingTags")}</h2>
                <div className="flex flex-wrap gap-2">
                  {hashtagTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setQuery(tag);
                        syncUrl(tag, "hashtag");
                      }}
                      className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-800 ring-1 ring-violet-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {showProducts && types.length > 0 ? (
              <section className={splitResultsOnDesktop ? "xl:col-span-4" : ""}>
                <h2 className="mb-2 text-xs font-bold text-slate-700 lg:text-sm">{t("mobileSearchTypesSection")}</h2>
                <div className="grid grid-cols-1 gap-1.5 lg:gap-2">
                  {types.map((row) => (
                    <TypeResultCard
                      key={row.product.id}
                      row={row}
                      language={language}
                      t={t}
                      onNavigate={handleResultNavigate}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {showProducts && listings.length > 0 ? (
              <section className={splitResultsOnDesktop ? "xl:col-span-8" : ""}>
                <h2 className="mb-2 text-xs font-bold text-slate-700 lg:text-sm">{t("mobileSearchListingsSection")}</h2>
                <div
                  className={`grid grid-cols-2 gap-2 sm:grid-cols-3 ${
                    isModal ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                  }`}
                >
                  {listings.map((row) => (
                    <ListingResultCard
                      key={row.lot.id}
                      row={row}
                      language={language}
                      t={t}
                      onNavigate={handleResultNavigate}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {showServices && serviceCategories?.length > 0 ? (
              <section>
                <h2 className="mb-2 text-xs font-bold text-slate-700">{t("mobileSearchServicesSection")}</h2>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {serviceCategories.map((category) => (
                    <ServiceCategoryCard
                      key={category.id}
                      category={category}
                      t={t}
                      onNavigate={handleResultNavigate}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {showServices && services?.length > 0 ? (
              <section>
                <h2 className="mb-2 text-xs font-bold text-slate-700">{t("mobileSearchServiceProvidersSection")}</h2>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {services.map((provider) => (
                    <ServiceProviderCard
                      key={provider.id || provider.profileSlug}
                      provider={provider}
                      onNavigate={handleResultNavigate}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {showPosts && posts?.length > 0 ? (
              <section>
                <h2 className="mb-2 text-xs font-bold text-slate-700">{t("mobileSearchPostsSection")}</h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {posts.map((post) => (
                    <PostResultCard key={post.id} post={post} onNavigate={handleResultNavigate} />
                  ))}
                </div>
              </section>
            ) : null}

            {!types.length &&
            !listings.length &&
            !hashtagTags.length &&
            !(services || []).length &&
            !(serviceCategories || []).length &&
            !(posts || []).length ? (
              <div className="py-12 text-center">
                <SearchIcon className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">{t("mobileSearchNoResults")}</p>
                <p className="mt-1 text-xs text-slate-500">{t("mobileSearchNoResultsHint")}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
