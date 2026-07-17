/** Helpers for seederData5 catalog schema fields on Product rows. */

const DEDICATED_FILTER_KEYS = new Set([
  "grade",
  "packagingType",
  "minimumOrderQuantity",
]);

const RESTRICTED_LISTING_POLICIES = new Set([
  "pre-approval-required",
  "manual-review-only",
]);

const BLOCKED_LISTING_POLICIES = new Set(["category-navigation-only"]);

export function getAllowedMeasurementUnits(product) {
  if (!product) return [];
  const fromAllowed = Array.isArray(product.allowedMeasurementUnits)
    ? product.allowedMeasurementUnits
    : null;
  const fromValid = Array.isArray(product.validUnits) ? product.validUnits : null;
  const list = (fromAllowed || fromValid || []).map((u) => String(u).trim()).filter(Boolean);
  if (list.length) return [...new Set(list)];
  const fallback = product.defaultMeasurementUnit || product.unit;
  return fallback ? [String(fallback)] : ["kg"];
}

export function getDefaultMeasurementUnit(product) {
  if (!product) return "kg";
  const allowed = getAllowedMeasurementUnits(product);
  const preferred =
    product.defaultMeasurementUnit || product.unit || (allowed.length ? allowed[0] : "kg");
  if (allowed.includes(preferred)) return preferred;
  return allowed[0] || preferred || "kg";
}

export function getAllowedPackagingTypes(product) {
  if (!product) return [];
  const list = Array.isArray(product.allowedPackagingTypes) ? product.allowedPackagingTypes : [];
  return [...new Set(list.map((p) => String(p).trim()).filter(Boolean))];
}

export function getProductFilterKeys(product) {
  if (!product) return [];
  const list = Array.isArray(product.filters) ? product.filters : [];
  return [...new Set(list.map((k) => String(k).trim()).filter(Boolean))];
}

/** Filter keys that need free-form values on the inventory lot (not dedicated columns). */
export function getLotFilterFieldKeys(product) {
  return getProductFilterKeys(product).filter((k) => !DEDICATED_FILTER_KEYS.has(k));
}

export function getListingPolicy(product) {
  return product?.listingPolicy || (product?.isOrderable || product?.isLeaf ? "conditional" : "category-navigation-only");
}

export function canSellerListProduct(product, { isAdmin = false } = {}) {
  if (!product) return { ok: false, reason: "missing" };
  if (!product.isOrderable && !product.isLeaf) {
    return { ok: false, reason: "category-navigation-only" };
  }
  const policy = getListingPolicy(product);
  if (BLOCKED_LISTING_POLICIES.has(policy)) {
    return { ok: false, reason: policy };
  }
  if (RESTRICTED_LISTING_POLICIES.has(policy) && !isAdmin) {
    return { ok: false, reason: policy };
  }
  return { ok: true, reason: policy, warning: policy === "moderated" };
}

export function humanizeFilterKey(key) {
  if (!key) return "";
  return String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getLotFilterValue(lot, key) {
  if (!lot || !key) return "";
  if (key === "grade") return lot.qualityGrade || "";
  if (key === "packagingType") return lot.packagingType || "";
  if (key === "minimumOrderQuantity") {
    return lot.minimumOrderQuantity != null ? String(lot.minimumOrderQuantity) : "";
  }
  const fv = lot.filterValues && typeof lot.filterValues === "object" ? lot.filterValues : {};
  if (fv[key] != null && String(fv[key]).trim() !== "") return String(fv[key]);
  if (key === "hsCode" && lot.hsCode) return String(lot.hsCode);
  const attr = (lot.attributes || []).find((a) => {
    const name = (a.definition?.name || "").toLowerCase();
    return name === key.toLowerCase() || name.includes(key.toLowerCase());
  });
  return attr?.value != null ? String(attr.value) : "";
}

export function lotMatchesFilterValues(lot, activeFilters = {}) {
  const entries = Object.entries(activeFilters || {}).filter(
    ([, v]) => v != null && String(v).trim() !== ""
  );
  if (!entries.length) return true;
  return entries.every(([key, wanted]) => {
    const actual = getLotFilterValue(lot, key);
    return String(actual).toLowerCase().includes(String(wanted).trim().toLowerCase());
  });
}

export function collectFilterOptions(lots, keys) {
  const out = {};
  for (const key of keys || []) {
    const set = new Set();
    for (const lot of lots || []) {
      const v = getLotFilterValue(lot, key);
      if (v) set.add(v);
    }
    out[key] = [...set].sort((a, b) => String(a).localeCompare(String(b), "fa"));
  }
  return out;
}

export { DEDICATED_FILTER_KEYS, RESTRICTED_LISTING_POLICIES, BLOCKED_LISTING_POLICIES };
