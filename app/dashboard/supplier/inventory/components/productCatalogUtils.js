export function normalizeCatalogProduct(raw) {
  return {
    ...raw,
    id: raw.id,
    name: raw.name,
    parentId: raw.parentId ?? raw.parent_id ?? null,
    isOrderable: Boolean(raw.isOrderable ?? raw.is_orderable),
  };
}

export function isRootCatalogItem(item) {
  return item.parentId == null || item.parentId === "";
}

export function isCategoryNode(item, childrenByParent) {
  if (!item.isOrderable) return true;
  if (!childrenByParent) return false;
  return getChildren(item.id, childrenByParent).length > 0;
}

export function isSelectableProductNode(item, childrenByParent, { isAdmin = false } = {}) {
  if (!item.isOrderable) return false;
  if (!childrenByParent) {
    return canListByPolicy(item, isAdmin);
  }
  if (getChildren(item.id, childrenByParent).length > 0) return false;
  return canListByPolicy(item, isAdmin);
}

function canListByPolicy(item, isAdmin) {
  const policy = item.listingPolicy;
  if (policy === "category-navigation-only") return false;
  if ((policy === "pre-approval-required" || policy === "manual-review-only") && !isAdmin) {
    return false;
  }
  return true;
}

export function buildCatalogIndex(items) {
  const byId = new Map();
  const childrenByParent = new Map();

  for (const item of items) {
    byId.set(item.id, item);
    const key = item.parentId == null ? "root" : Number(item.parentId);
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(item);
  }

  for (const list of childrenByParent.values()) {
    list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "fa"));
  }

  return { byId, childrenByParent };
}

export function getChildren(parentId, childrenByParent) {
  const key = parentId == null ? "root" : Number(parentId);
  return childrenByParent.get(key) || [];
}

export function getProductBreadcrumb(productId, byId) {
  const crumbs = [];
  let current = byId.get(Number(productId));
  let safety = 0;
  while (current && safety < 40) {
    crumbs.unshift(current);
    current = current.parentId != null ? byId.get(Number(current.parentId)) : null;
    safety += 1;
  }
  return crumbs;
}

export function getProductLabel(productId, fallbackProducts, byId) {
  const fromCatalog = byId?.get(Number(productId))?.name;
  if (fromCatalog) return fromCatalog;
  const fromList = fallbackProducts?.find((p) => p.id === Number(productId))?.name;
  return fromList || `#${productId}`;
}
