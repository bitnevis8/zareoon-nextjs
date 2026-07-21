/**
 * Trade services catalog — structure + sample data.
 * UI strings live in messages/{locale}/trade-services.json
 */
import faTradeServices from "../../messages/fa/tradeServices.json";
import enTradeServices from "../../messages/en/tradeServices.json";
import esTradeServices from "../../messages/es/tradeServices.json";
import nlTradeServices from "../../messages/nl/tradeServices.json";
import ruTradeServices from "../../messages/ru/tradeServices.json";
import arTradeServices from "../../messages/ar/tradeServices.json";
import urTradeServices from "../../messages/ur/tradeServices.json";
import fiTradeServices from "../../messages/fi/tradeServices.json";
import trTradeServices from "../../messages/tr/tradeServices.json";
import sampleTradeServiceProviders from "../../messages/fa/tradeServiceSamples.json";
import {
  SHARED_CATEGORY_IDS,
  LEGACY_SERVICE_TYPE_MAP,
  L1_CATEGORY_IDS,
  isValidL1CategoryId,
} from "./tradeServicesCatalog.structure";
import {
  resolveTradeServicesContent,
  getL1CategoriesFromContent,
  getCategoryByIdFromContent,
  buildFlatServiceCatalogFromContent,
  findCatalogServiceFromContent,
} from "../utils/tradeServicesContent";

export { SHARED_CATEGORY_IDS, LEGACY_SERVICE_TYPE_MAP, L1_CATEGORY_IDS, isValidL1CategoryId };

const TRADE_SERVICES_BY_LOCALE = {
  fa: faTradeServices,
  en: enTradeServices,
  es: esTradeServices,
  nl: nlTradeServices,
  ru: ruTradeServices,
  ar: arTradeServices,
  ur: urTradeServices,
  fi: fiTradeServices,
  tr: trTradeServices,
};

function localeTradeData(language) {
  const raw = TRADE_SERVICES_BY_LOCALE[language] || faTradeServices;
  const hasTitles = Array.isArray(raw?.categories) && raw.categories.some((c) => c?.title);
  return hasTitles ? raw : faTradeServices;
}

/** @deprecated Prefer useTradeServicesContent() in client components */
export function getTradeServicesContent(language) {
  return resolveTradeServicesContent(localeTradeData(language));
}

export function getL1Categories(language) {
  return getL1CategoriesFromContent(getTradeServicesContent(language));
}

export function getCategoryById(language, categoryId) {
  return getCategoryByIdFromContent(getTradeServicesContent(language), categoryId);
}

/** Illustrative sample providers until a backend catalog exists. */
export { sampleTradeServiceProviders };

export function getSampleProviders(categoryId) {
  const normalized = LEGACY_SERVICE_TYPE_MAP[categoryId] || categoryId;
  if (!sampleTradeServiceProviders || typeof sampleTradeServiceProviders !== "object") return [];
  return sampleTradeServiceProviders[normalized] || [];
}

export function getSampleMemberCount(categoryId) {
  return getSampleProviders(categoryId).length;
}

export function countProvidersByCategory(providers) {
  const counts = {};
  if (!Array.isArray(providers)) return counts;

  providers.forEach((provider) => {
    const categoryIds = new Set();
    if (Array.isArray(provider.selectedServices) && provider.selectedServices.length) {
      provider.selectedServices.forEach((s) => {
        if (s?.categoryId) categoryIds.add(s.categoryId);
      });
    } else if (provider.categoryId) {
      categoryIds.add(provider.categoryId);
    }
    categoryIds.forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    });
  });

  return counts;
}

export function resolveLocalizedField(field, language) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[language] || field.fa || field.en || "";
}

export function buildFlatServiceCatalog(language) {
  return buildFlatServiceCatalogFromContent(getTradeServicesContent(language));
}

export function findCatalogService(language, categoryId, subcategoryId) {
  return findCatalogServiceFromContent(getTradeServicesContent(language), categoryId, subcategoryId);
}
