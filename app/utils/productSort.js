export function compareCatalogItems(a, b, language = "fa") {
  const hoA = Number.isFinite(a?.homepageSortOrder) ? a.homepageSortOrder : null;
  const hoB = Number.isFinite(b?.homepageSortOrder) ? b.homepageSortOrder : null;
  if (hoA != null && hoB != null && hoA !== hoB) return hoA - hoB;
  if (hoA != null && hoB == null) return -1;
  if (hoA == null && hoB != null) return 1;

  const soA = Number.isFinite(a?.sortOrder) ? a.sortOrder : 1e9;
  const soB = Number.isFinite(b?.sortOrder) ? b.sortOrder : 1e9;
  if (soA !== soB) return soA - soB;

  const locale = language === "ru" ? "ru" : language === "en" ? "en" : "fa";
  const nameA = a?.name || a?.englishName || "";
  const nameB = b?.name || b?.englishName || "";
  const byName = nameA.localeCompare(nameB, locale);
  if (byName !== 0) return byName;

  return (a?.id || 0) - (b?.id || 0);
}

export function sortCatalogItems(items, language = "fa") {
  return [...items].sort((a, b) => compareCatalogItems(a, b, language));
}

/** Walk up the tree to the top-level category (parentId is null). */
export function getRootCategory(product, productById) {
  if (!product) return null;
  let current = product;
  let safety = 0;
  while (current?.parentId != null && safety < 30) {
    const parent = productById.get(current.parentId);
    if (!parent) break;
    current = parent;
    safety += 1;
  }
  return current?.parentId == null ? current : product;
}
