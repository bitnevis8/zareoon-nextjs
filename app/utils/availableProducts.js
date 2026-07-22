import { compareCatalogItems, getRootCategory } from "./productSort";
import i18nData from "./i18nFaData";

export function buildProductByIdMap(allProducts) {
  const map = new Map();
  for (const product of allProducts) map.set(product.id, product);
  return map;
}

export function isInCategorySubtree(product, categoryId, productById) {
  if (!product || categoryId == null) return true;
  let current = product;
  let safety = 0;
  while (current && safety < 40) {
    if (current.id === categoryId) return true;
    if (current.parentId == null) return false;
    current = productById.get(current.parentId);
    safety += 1;
  }
  return false;
}

/** Direct child of ancestor on the path from product up (for scoped grouping). */
export function getDirectChildUnderAncestor(product, ancestorId, productById) {
  if (!product || ancestorId == null) return null;
  let current = product;
  let safety = 0;
  while (current && safety < 40) {
    if (current.parentId === ancestorId) return current;
    if (current.id === ancestorId) return null;
    if (current.parentId == null) return null;
    current = productById.get(current.parentId);
    safety += 1;
  }
  return null;
}

/** @deprecated use getDirectChildUnderAncestor */
export function getSubgroupUnderRoot(product, rootId, productById) {
  return getDirectChildUnderAncestor(product, rootId, productById);
}

export function buildAvailableProducts(inventoryLots, productById, { scopeCategoryId = null } = {}) {
  const grouped = new Map();

  for (const lot of inventoryLots) {
    const total = parseFloat(lot.totalQuantity || 0);
    const reserved = parseFloat(lot.reservedQuantity || 0);
    const availableQty = total - reserved;
    const isInquiryOnly =
      (lot.price == null || lot.price === "") &&
      !(Array.isArray(lot.tieredPricing) && lot.tieredPricing.length);
    // استعلامی‌ها حتی با موجودی صفر در ویترین می‌مانند
    if ((!Number.isFinite(availableQty) || availableQty <= 0) && !isInquiryOnly) continue;

    const product = productById.get(lot.productId);
    if (!product || !product.isOrderable) continue;
    if (scopeCategoryId != null && !isInCategorySubtree(product, scopeCategoryId, productById)) continue;

    if (!grouped.has(product.id)) {
      grouped.set(product.id, { product, lots: [], totalAvailable: 0 });
    }
    const entry = grouped.get(product.id);
    entry.lots.push({
      id: lot.id,
      englishName: lot.englishName || null,
      russianName: lot.russianName || null,
      arabicName: lot.arabicName || null,
      qualityGrade: lot.qualityGrade || i18nData.noGrade,
      availableQty: Math.max(0, availableQty),
      unit: lot.unit || "kg",
      price: lot.price,
      updatedAt: lot.updatedAt || null,
      createdAt: lot.createdAt || null,
      inquiryOnly: isInquiryOnly,
    });
    entry.totalAvailable += Math.max(0, availableQty);
    const lotTs = lot.updatedAt || lot.createdAt;
    if (lotTs) {
      const t = new Date(lotTs).getTime();
      if (!entry._newestLotAt || t > entry._newestLotAt) entry._newestLotAt = t;
    }
  }

  return Array.from(grouped.values());
}

export function sortAvailableByCreatedDesc(entries) {
  return [...entries].sort((a, b) => {
    const dateA = a.product?.createdAt ? new Date(a.product.createdAt).getTime() : null;
    const dateB = b.product?.createdAt ? new Date(b.product.createdAt).getTime() : null;
    if (dateA != null && dateB != null && dateA !== dateB) return dateB - dateA;
    if (dateA != null && dateB == null) return -1;
    if (dateA == null && dateB != null) return 1;
    return (b.product?.id || 0) - (a.product?.id || 0);
  });
}

export function getLatestAvailableProducts(entries, limit = 20) {
  return [...entries]
    .sort((a, b) => {
      const dateA =
        a._newestLotAt ||
        (a.product?.createdAt ? new Date(a.product.createdAt).getTime() : 0) ||
        0;
      const dateB =
        b._newestLotAt ||
        (b.product?.createdAt ? new Date(b.product.createdAt).getTime() : 0) ||
        0;
      if (dateA !== dateB) return dateB - dateA;
      return (b.product?.id || 0) - (a.product?.id || 0);
    })
    .slice(0, limit);
}

export function groupAvailableProducts(entries, productById, language, { scopeCategoryId = null } = {}) {
  const groups = new Map();

  for (const entry of entries) {
    const groupNode =
      scopeCategoryId != null
        ? getDirectChildUnderAncestor(entry.product, scopeCategoryId, productById)
        : getRootCategory(entry.product, productById);

    if (scopeCategoryId != null && !groupNode) continue;

    const key = groupNode?.id ?? "other";

    if (!groups.has(key)) {
      groups.set(key, { id: key, category: groupNode, products: [] });
    }
    groups.get(key).products.push(entry);
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      products: sortAvailableByCreatedDesc(group.products),
    }))
    .sort((a, b) => compareCatalogItems(a.category, b.category, language));
}
