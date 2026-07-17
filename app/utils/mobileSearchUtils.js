import { getLocalizedText, getLocalizedLotLabel } from "./localize";
import { getLotDisplayForLanguage } from "@/app/dashboard/supplier/inventory/utils/inventoryDisplayLocales";
import { buildAvailableProducts, buildProductByIdMap } from "./availableProducts";

export const SEARCH_FILTERS = ["all", "types", "listings", "hashtag"];

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

function matchesText(haystack, needle) {
  if (!needle) return true;
  return String(haystack || "").toLowerCase().includes(needle);
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
      if (availableQty <= 0) continue;
      rows.push({
        lot,
        product: entry.product,
        availableQty,
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
  const types = searchCatalogTypes(allProducts, q, language, buildListingCountMap(flatLots));
  const listings = searchAvailableListings(flatLots, q, language, t, { hashtagOnly: true });

  for (const { lot } of flatLots) {
    for (const tag of getLotDisplayForLanguage(lot, language).hashtags || []) {
      if (normalizeSearchTerm(tag).includes(q)) tagSet.add(tag.startsWith("#") ? tag : `#${tag}`);
    }
  }

  for (const row of types) {
    const label = getLocalizedText(row.product, language);
    if (normalizeSearchTerm(label).includes(q)) tagSet.add(`#${label}`);
  }

  return {
    tags: Array.from(tagSet).slice(0, 12),
    types: types.filter((row) => row.isCategory || normalizeSearchTerm(getLocalizedText(row.product, language)).includes(q)),
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

export function runMobileSearch({
  allProducts,
  inventoryLots,
  term,
  language,
  t,
  filter = "all",
}) {
  const parsed = parseSearchQuery(term);
  const productById = buildProductByIdMap(allProducts);
  const flatLots = flattenAvailableLots(inventoryLots, productById);
  const listingCountByProductId = buildListingCountMap(flatLots);
  const q = parsed.term;

  if (!q) {
    return {
      parsed,
      flatLots,
      types: [],
      listings: flatLots,
      hashtagTags: [],
    };
  }

  const hashtagOnly = filter === "hashtag";
  const types = searchCatalogTypes(allProducts, q, language, listingCountByProductId);
  const listings = searchAvailableListings(flatLots, q, language, t, { hashtagOnly });
  const hashtag = searchHashtagMatches({ allProducts, flatLots, term: q, language, t });

  if (filter === "hashtag") {
    return { parsed, flatLots, types: hashtag.types, listings: hashtag.listings, hashtagTags: hashtag.tags };
  }
  if (filter === "types") {
    return { parsed, flatLots, types, listings: [], hashtagTags: [] };
  }
  if (filter === "listings") {
    return { parsed, flatLots, types: [], listings, hashtagTags: [] };
  }

  return {
    parsed,
    flatLots,
    types,
    listings,
    hashtagTags: hashtag.tags,
  };
}
