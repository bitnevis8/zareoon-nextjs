import { localizePackaging } from "@/app/utils/localize";

const COUNTRY_KEYS = new Set(["originCountry", "countryOfOrigin"]);
const PROVINCE_KEYS = new Set(["originProvince", "originRegion", "province"]);
const CITY_KEYS = new Set(["originCity", "city"]);
const PACKAGING_KEYS = new Set(["packagingType", "packaging"]);
const SKIP_KEYS = new Set(["hsCode"]);

const VERIFICATION_LEVEL_FA = {
  full: "کامل",
  basic: "پایه",
  partial: "جزئی",
  none: "بدون تأیید",
  verified: "تأییدشده",
};

const VERIFICATION_LEVEL_EN = {
  full: "Full",
  basic: "Basic",
  partial: "Partial",
  none: "None",
  verified: "Verified",
};

/**
 * نام کشور از کد ISO (IR → ایران) با Intl و دیکشنری اختیاری
 */
export function formatCountryDisplayName(code, language = "fa", tShared = null) {
  const raw = String(code || "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();

  if (/^[A-Z]{2}$/.test(upper) && tShared) {
    try {
      const key = `supplyCountries.${upper}`;
      if (typeof tShared.has === "function" && tShared.has(key)) return tShared(key);
      const tr = tShared(key);
      if (tr && tr !== key) return tr;
    } catch {
      /* fall through */
    }
  }

  if (/^[A-Z]{2}$/.test(upper)) {
    try {
      const locale = language === "fa" ? "fa" : language === "ar" ? "ar" : language || "en";
      const name = new Intl.DisplayNames([locale], { type: "region" }).of(upper);
      if (name) return name;
    } catch {
      /* fall through */
    }
  }

  return raw;
}

function formatBool(value, language) {
  const truthy = value === true || value === "true" || value === 1 || value === "1";
  const falsy = value === false || value === "false" || value === 0 || value === "0";
  if (truthy) return language === "en" ? "Yes" : "بله";
  if (falsy) return language === "en" ? "No" : "خیر";
  return String(value);
}

function formatVerificationLevel(value, language) {
  const key = String(value || "").toLowerCase();
  const map = language === "en" ? VERIFICATION_LEVEL_EN : VERIFICATION_LEVEL_FA;
  return map[key] || String(value);
}

function filterKeyLabel(key, tCatalog) {
  try {
    const path = `filterKeys.${key}`;
    if (typeof tCatalog.has === "function" && !tCatalog.has(path)) {
      if (key === "originProvince") return languageFallbackProvince(tCatalog);
      if (key === "listingVerified") return languageFallbackListing(tCatalog);
      if (key === "verificationLevel") return languageFallbackVerification(tCatalog);
      return key;
    }
    const tr = tCatalog(path);
    return tr && tr !== path ? tr : key;
  } catch {
    return key;
  }
}

function languageFallbackProvince() {
  return "استان مبدأ";
}
function languageFallbackListing() {
  return "تأیید آگهی";
}
function languageFallbackVerification() {
  return "سطح تأیید";
}

function formatFilterValue(key, value, language, tShared) {
  if (value == null || value === "") return null;
  if (COUNTRY_KEYS.has(key)) return formatCountryDisplayName(value, language, tShared);
  if (PACKAGING_KEYS.has(key)) return localizePackaging(value, language);
  if (key === "listingVerified") return formatBool(value, language);
  if (key === "verificationLevel") return formatVerificationLevel(value, language);
  if (typeof value === "boolean") return formatBool(value, language);
  return String(value);
}

/**
 * ردیف‌های مشخصات تجاری مرتب‌شده: کشور → استان → شهر → بسته‌بندی → بقیه
 */
export function buildLotTradeDetailRows({
  lot,
  language = "fa",
  tCatalog,
  tShared = null,
}) {
  if (!lot) return [];
  const rows = [];
  const seen = new Set();
  const fv = lot.filterValues && typeof lot.filterValues === "object" ? lot.filterValues : {};

  const push = (key, rawValue, labelOverride = null) => {
    if (rawValue == null || rawValue === "" || seen.has(key)) return;
    const value = formatFilterValue(key, rawValue, language, tShared);
    if (value == null || value === "") return;
    seen.add(key);
    rows.push({
      key,
      label: labelOverride || filterKeyLabel(key, tCatalog),
      value,
    });
  };

  // کشور
  for (const k of ["originCountry", "countryOfOrigin"]) {
    if (fv[k]) {
      push(k, fv[k]);
      break;
    }
  }
  // استان
  for (const k of ["originProvince", "originRegion", "province"]) {
    if (fv[k]) {
      push(k, fv[k]);
      break;
    }
  }
  // شهر
  for (const k of ["originCity", "city"]) {
    if (fv[k]) {
      push(k, fv[k]);
      break;
    }
  }

  // بسته‌بندی از فیلد لات یا filterValues
  if (lot.packagingType) {
    push("packagingType", lot.packagingType, tCatalog("packagingType"));
  } else if (fv.packagingType) {
    push("packagingType", fv.packagingType, tCatalog("packagingType"));
  }

  if (lot.hsCode) {
    push("hsCode", lot.hsCode, tCatalog("hsCode"));
  }

  // بقیه کلیدها
  for (const [k, v] of Object.entries(fv)) {
    if (SKIP_KEYS.has(k)) continue;
    if (COUNTRY_KEYS.has(k) || PROVINCE_KEYS.has(k) || CITY_KEYS.has(k) || PACKAGING_KEYS.has(k)) continue;
    push(k, v);
  }

  return rows;
}
