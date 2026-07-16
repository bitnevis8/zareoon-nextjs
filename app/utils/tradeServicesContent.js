import faTradeServices from "../../messages/fa/tradeServices.json";
import { SHARED_CATEGORY_IDS, LEGACY_SERVICE_TYPE_MAP } from "../data/tradeServicesCatalog.structure";

export { SHARED_CATEGORY_IDS, LEGACY_SERVICE_TYPE_MAP };

/**
 * Build trade services catalog from messages/tradeServices namespace (or fa fallback).
 */
export function resolveTradeServicesContent(data) {
  const source = data?.categories?.length ? data : faTradeServices;
  const order = new Map(SHARED_CATEGORY_IDS.map((id, index) => [id, index]));
  const categories = [...(source.categories || [])].sort(
    (a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999)
  );
  return { ...source, categories };
}

export function getL1CategoriesFromContent(content) {
  return content?.categories || [];
}

export function getCategoryByIdFromContent(content, categoryId) {
  const normalized = LEGACY_SERVICE_TYPE_MAP[categoryId] || categoryId;
  return getL1CategoriesFromContent(content).find((c) => c.id === normalized) || null;
}

export function buildFlatServiceCatalogFromContent(content) {
  return getL1CategoriesFromContent(content).flatMap((category) =>
    (category.children || []).map((sub) => ({
      key: `${category.id}:${sub.id}`,
      categoryId: category.id,
      subcategoryId: sub.id,
      categoryTitle: category.title,
      subcategoryTitle: sub.title,
    }))
  );
}

export function findCatalogServiceFromContent(content, categoryId, subcategoryId) {
  return buildFlatServiceCatalogFromContent(content).find(
    (item) => item.categoryId === categoryId && item.subcategoryId === subcategoryId
  );
}
