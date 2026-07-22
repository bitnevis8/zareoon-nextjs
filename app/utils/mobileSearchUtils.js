import { getLocalizedText, getLocalizedLotLabel } from "./localize";
import { getLotDisplayForLanguage } from "@/app/dashboard/supplier/inventory/utils/inventoryDisplayLocales";
import { buildAvailableProducts, buildProductByIdMap } from "./availableProducts";

export const SEARCH_FILTERS = ["all", "products", "services", "posts", "hashtag"];

/** سازگاری با فیلترهای قدیمی URL */
export function normalizeSearchFilter(raw) {
  if (raw === "types" || raw === "listings") return "products";
  if (SEARCH_FILTERS.includes(raw)) return raw;
  return "all";
}

export function parseSearchQuery(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return { mode: "explore", term: "", raw: "" };
  if (trimmed.startsWith("#")) {
    return { mode: "hashtag", term: trimmed.slice(1).trim(), raw: trimmed };
  }
  return { mode: "text", term: trimmed, raw: trimmed };
}

export function normalizeSearchTerm(term) {
  return String(term || "")
    .trim()
    .toLowerCase()
    .replace(/^#+/, "");
}

/** لینک صفحه جستجو برای یک هشتگ */
export function buildHashtagSearchHref(tag) {
  const clean = String(tag || "")
    .trim()
    .replace(/^#+/, "");
  if (!clean) return "/search?mode=explore&filter=hashtag";
  const params = new URLSearchParams();
  params.set("mode", "explore");
  params.set("q", `#${clean}`);
  params.set("filter", "hashtag");
  return `/search?${params.toString()}`;
}

function isWordChar(c) {
  return Boolean(c) && /[\p{L}\p{N}]/u.test(c);
}

/** Match at word start (prefix/whole word) — avoids «اوره» matching inside «مشاوره». */
function matchesText(haystack, needle) {
  if (!needle) return true;
  const h = String(haystack || "").toLowerCase();
  const n = String(needle || "").toLowerCase();
  if (!n || !h) return false;

  let from = 0;
  while (from <= h.length) {
    const idx = h.indexOf(n, from);
    if (idx === -1) return false;
    const before = idx > 0 ? h[idx - 1] : "";
    if (!isWordChar(before)) return true;
    from = idx + 1;
  }
  return false;
}

export function matchesLocalizedCatalogItem(item, term, language) {
  const q = normalizeSearchTerm(term);
  if (!q) return true;
  const name = getLocalizedText(item, language);
  return (
    matchesText(name, q) ||
    matchesText(item.slug, q) ||
    matchesText(item.name, q) ||
    matchesText(item.englishName, q)
  );
}

function lotAvailableQty(lot) {
  const total = parseFloat(lot.totalQuantity || 0);
  const reserved = parseFloat(lot.reservedQuantity || 0);
  const available = total - reserved;
  return Number.isFinite(available) && available > 0 ? available : 0;
}

export function flattenAvailableLots(inventoryLots, productById) {
  const grouped = buildAvailableProducts(inventoryLots, productById);
  const rows = [];

  for (const entry of grouped) {
    for (const lot of entry.lots) {
      const availableQty = lot.availableQty ?? lotAvailableQty(lot);
      const isInquiry = Boolean(lot.inquiryOnly);
      if (availableQty <= 0 && !isInquiry) continue;
      rows.push({
        lot,
        product: entry.product,
        availableQty: Math.max(0, availableQty),
      });
    }
  }

  return rows.sort((a, b) => {
    const dateA = a.lot?.createdAt ? new Date(a.lot.createdAt).getTime() : 0;
    const dateB = b.lot?.createdAt ? new Date(b.lot.createdAt).getTime() : 0;
    return dateB - dateA;
  });
}

export function getListingDisplayTitle(lot, product, language, t) {
  const display = getLotDisplayForLanguage(lot, language);
  const customTitle = display.title?.trim();
  if (customTitle) return customTitle;
  const productName = getLocalizedText(product, language);
  const grade = getLocalizedLotLabel(lot, language, t);
  if (productName && grade && grade !== productName) return `${productName} — ${grade}`;
  return productName || grade || (t ? t("product") : "");
}

function lotHashtagValues(lot, language) {
  const display = getLotDisplayForLanguage(lot, language);
  return (display.hashtags || []).map((tag) => normalizeSearchTerm(tag));
}

export function lotMatchesSearch(lot, product, term, language, t, { hashtagOnly = false } = {}) {
  const q = normalizeSearchTerm(term);
  if (!q) return true;

  const display = getLotDisplayForLanguage(lot, language);
  const title = getListingDisplayTitle(lot, product, language, t);
  const productName = getLocalizedText(product, language);
  const hashtags = lotHashtagValues(lot, language);

  if (hashtagOnly) {
    return hashtags.some((tag) => tag.includes(q));
  }

  if (matchesText(title, q)) return true;
  if (matchesText(productName, q)) return true;
  if (matchesText(display.description, q)) return true;
  if (hashtags.some((tag) => tag.includes(q))) return true;
  if (matchesText(getLocalizedLotLabel(lot, language, t), q)) return true;
  if (matchesText(lot.englishName, q)) return true;
  if (matchesText(lot.arabicName, q)) return true;
  if (matchesText(lot.russianName, q)) return true;
  return false;
}

export function searchCatalogTypes(allProducts, term, language, availableLotsByProductId) {
  const q = normalizeSearchTerm(term);
  if (!q) return [];

  const merged = new Map();

  for (const product of allProducts) {
    if (!matchesLocalizedCatalogItem(product, q, language)) continue;
    const listingCount = availableLotsByProductId.get(product.id) || 0;
    merged.set(product.id, {
      product,
      listingCount,
      isCategory: !product.isOrderable,
      isOrderableType: Boolean(product.isOrderable),
    });
  }

  return Array.from(merged.values()).sort((a, b) => {
    if (a.isCategory !== b.isCategory) return a.isCategory ? -1 : 1;
    if (b.listingCount !== a.listingCount) return b.listingCount - a.listingCount;
    return getLocalizedText(a.product, language).localeCompare(getLocalizedText(b.product, language), "fa");
  });
}

export function searchAvailableListings(flatLots, term, language, t, { hashtagOnly = false } = {}) {
  const q = normalizeSearchTerm(term);
  if (!q) return flatLots;

  return flatLots.filter(({ lot, product }) =>
    lotMatchesSearch(lot, product, q, language, t, { hashtagOnly })
  );
}

export function searchHashtagMatches({ allProducts, flatLots, term, language, t }) {
  const q = normalizeSearchTerm(term);
  if (!q) return { tags: [], types: [], listings: [] };

  const tagSet = new Set();
  const listings = searchAvailableListings(flatLots, q, language, t, { hashtagOnly: true });
  const listingCountByProductId = buildListingCountMap(listings);
  const productById = buildProductByIdMap(allProducts);

  // کارت‌های محصولی که حداقل یک بار با این هشتگ دارند
  const typedProducts = new Map();
  for (const { lot, product } of listings) {
    const p = product || productById.get(lot?.productId);
    if (!p?.id || typedProducts.has(p.id)) continue;
    typedProducts.set(p.id, {
      product: p,
      listingCount: listingCountByProductId.get(p.id) || 0,
      isCategory: !p.isOrderable,
      isOrderableType: Boolean(p.isOrderable),
    });
  }

  for (const { lot } of flatLots) {
    for (const tag of getLotDisplayForLanguage(lot, language).hashtags || []) {
      if (normalizeSearchTerm(tag).includes(q)) tagSet.add(tag.startsWith("#") ? tag : `#${tag}`);
    }
  }

  const types = Array.from(typedProducts.values()).sort((a, b) => {
    if (b.listingCount !== a.listingCount) return b.listingCount - a.listingCount;
    return getLocalizedText(a.product, language).localeCompare(getLocalizedText(b.product, language), "fa");
  });

  for (const row of types) {
    const label = getLocalizedText(row.product, language);
    if (label) tagSet.add(`#${label}`);
  }

  return {
    tags: Array.from(tagSet).slice(0, 12),
    types,
    listings,
  };
}

export function buildListingCountMap(flatLots) {
  const map = new Map();
  for (const { lot, product } of flatLots) {
    if (!product?.id) continue;
    map.set(product.id, (map.get(product.id) || 0) + 1);
  }
  return map;
}

export function searchServiceProviders(providers, term) {
  const q = normalizeSearchTerm(term);
  const list = Array.isArray(providers) ? providers : [];
  if (!q) return list.slice(0, 40);

  return list
    .filter((p) => {
      const fields = [
        p.displayName,
        p.companyName,
        p.contactName,
        p.profileSlug,
        p.notes,
        ...(Array.isArray(p.selectedServices) ? p.selectedServices.map((s) => s.title).filter(Boolean) : []),
      ];
      return fields.some((field) => matchesText(field, q));
    })
    .slice(0, 40);
}

export function searchServiceCategories(categories, term) {
  const q = normalizeSearchTerm(term);
  const list = Array.isArray(categories) ? categories : [];
  if (!q) return list;

  return list.filter((c) => {
    const titles = [c.title, ...(c.children || []).map((ch) => ch.title)];
    return titles.some((x) => matchesText(x, q));
  });
}

export function searchPublicPosts(posts, term) {
  const q = normalizeSearchTerm(term);
  const list = Array.isArray(posts) ? posts : [];
  if (!q) return list.slice(0, 40);

  return list
    .filter((p) => {
      const tags = Array.isArray(p.hashtags) ? p.hashtags.join(" ") : "";
      return matchesText(p.body, q) || matchesText(tags, q) || matchesText(p.authorName, q);
    })
    .slice(0, 40);
}

export function runMobileSearch({
  allProducts,
  inventoryLots,
  term,
  language,
  t,
  filter = "all",
  serviceProviders = [],
  serviceCategories = [],
  publicPosts = [],
}) {
  const parsed = parseSearchQuery(term);
  const productById = buildProductByIdMap(allProducts);
  const flatLots = flattenAvailableLots(inventoryLots, productById);
  const listingCountByProductId = buildListingCountMap(flatLots);
  const q = parsed.term;
  const normalizedFilter = normalizeSearchFilter(filter);

  const emptyExtra = {
    services: [],
    serviceCategories: [],
    posts: [],
  };

  if (!q) {
    return {
      parsed,
      flatLots,
      types: [],
      listings: flatLots,
      hashtagTags: [],
      services: searchServiceProviders(serviceProviders, ""),
      serviceCategories: serviceCategories.slice(0, 24),
      posts: searchPublicPosts(publicPosts, ""),
    };
  }

  const hashtagOnly = normalizedFilter === "hashtag";
  const types = searchCatalogTypes(allProducts, q, language, listingCountByProductId);
  const listings = searchAvailableListings(flatLots, q, language, t, { hashtagOnly });
  const hashtag = searchHashtagMatches({ allProducts, flatLots, term: q, language, t });
  const services = searchServiceProviders(serviceProviders, q);
  const matchedServiceCategories = searchServiceCategories(serviceCategories, q);
  const posts = searchPublicPosts(publicPosts, q);

  if (normalizedFilter === "hashtag") {
    return {
      parsed,
      flatLots,
      types: hashtag.types,
      listings: hashtag.listings,
      hashtagTags: hashtag.tags,
      ...emptyExtra,
      posts: posts.filter((p) =>
        (p.hashtags || []).some((tag) => normalizeSearchTerm(tag).includes(normalizeSearchTerm(q)))
      ),
    };
  }
  if (normalizedFilter === "products") {
    return { parsed, flatLots, types, listings, hashtagTags: [], ...emptyExtra };
  }
  if (normalizedFilter === "services") {
    return {
      parsed,
      flatLots,
      types: [],
      listings: [],
      hashtagTags: [],
      services,
      serviceCategories: matchedServiceCategories,
      posts: [],
    };
  }
  if (normalizedFilter === "posts") {
    return {
      parsed,
      flatLots,
      types: [],
      listings: [],
      hashtagTags: [],
      services: [],
      serviceCategories: [],
      posts,
    };
  }

  return {
    parsed,
    flatLots,
    types,
    listings,
    hashtagTags: hashtag.tags,
    services,
    serviceCategories: matchedServiceCategories,
    posts,
  };
}
