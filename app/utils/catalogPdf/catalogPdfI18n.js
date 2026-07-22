import faCatalog from "@/messages/fa/catalog.json";
import enCatalog from "@/messages/en/catalog.json";
import arCatalog from "@/messages/ar/catalog.json";
import ruCatalog from "@/messages/ru/catalog.json";
import trCatalog from "@/messages/tr/catalog.json";
import esCatalog from "@/messages/es/catalog.json";
import nlCatalog from "@/messages/nl/catalog.json";
import urCatalog from "@/messages/ur/catalog.json";
import fiCatalog from "@/messages/fi/catalog.json";
import languageLabels from "@/messages/fa/languages.json";
import { SITE_LANGUAGES, isRtlLanguage } from "@/app/config/siteLanguages";
import { getLocalizedText } from "@/app/utils/localize";
import {
  DISPLAY_LOCALE_CODES,
  hydrateDisplayContent,
} from "@/app/dashboard/supplier/inventory/utils/inventoryDisplayLocales";

const CATALOG_BY_LANG = {
  fa: faCatalog,
  en: enCatalog,
  ar: arCatalog,
  ru: ruCatalog,
  tr: trCatalog,
  es: esCatalog,
  nl: nlCatalog,
  ur: urCatalog,
  fi: fiCatalog,
};

function lookupNested(obj, key) {
  if (!obj || !key) return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === "string") {
    return obj[key];
  }
  const parts = String(key).split(".");
  let cur = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

function interpolate(str, values) {
  if (!values || typeof str !== "string") return str;
  return Object.entries(values).reduce(
    (out, [k, v]) => out.replaceAll(`{${k}}`, String(v ?? "")),
    str
  );
}

/** مترجم پیام‌های کاتالوگ برای زبان انتخابی PDF */
export function createCatalogPdfTranslator(language = "fa") {
  const code = CATALOG_BY_LANG[language] ? language : "fa";
  const primary = CATALOG_BY_LANG[code] || faCatalog;
  const fallback = faCatalog;

  return (key, values) => {
    const raw = lookupNested(primary, key) || lookupNested(fallback, key) || key;
    return interpolate(raw, values);
  };
}

export function getCatalogPdfLanguageMeta(code) {
  const site = SITE_LANGUAGES.find((l) => l.code === code);
  return {
    code,
    label: languageLabels[code] || site?.label || code,
    shortLabel: site?.shortLabel || String(code).toUpperCase(),
    dir: isRtlLanguage(code) ? "rtl" : "ltr",
    rtl: isRtlLanguage(code),
  };
}

function lotHasContentInLanguage(lot, code) {
  const content = hydrateDisplayContent(lot);
  const row = content[code];
  if (!row) return false;
  return Boolean(
    (typeof row.title === "string" && row.title.trim()) ||
      (typeof row.description === "string" && row.description.trim()) ||
      (Array.isArray(row.hashtags) && row.hashtags.length)
  );
}

function productHasContentInLanguage(product, code) {
  if (!product) return false;
  if (code === "fa") {
    return Boolean(product.name || product.description || product.translations?.fa?.name);
  }
  if (getLocalizedText(product, code)) return true;
  if (product.translations?.[code]?.name || product.translations?.[code]?.description) return true;
  return false;
}

/**
 * زبان‌های موجود برای ساخت PDF — اگر هیچ‌کدام پر نباشد فقط fa
 */
export function resolveCatalogPdfLanguages({ lot = null, lots = [], product = null, products = [] } = {}) {
  const set = new Set();
  const lotList = lot ? [lot, ...lots] : lots;
  const productList = product ? [product, ...products] : products;

  for (const item of lotList) {
    for (const code of DISPLAY_LOCALE_CODES) {
      if (lotHasContentInLanguage(item, code)) set.add(code);
    }
  }

  for (const p of productList) {
    for (const code of DISPLAY_LOCALE_CODES) {
      if (productHasContentInLanguage(p, code)) set.add(code);
    }
  }

  if (set.size === 0) set.add("fa");

  const ordered = SITE_LANGUAGES.map((l) => l.code).filter((c) => set.has(c));
  return ordered.map(getCatalogPdfLanguageMeta);
}
