/** مسیر عمومی محصول در کاتالوگ — ترجیح اسلاگ بر شناسهٔ عددی */
export function catalogProductPath(productOrId, slugHint) {
  if (productOrId != null && typeof productOrId === "object") {
    const slug = String(productOrId.slug || "").trim();
    if (slug && !/^\d+$/.test(slug)) {
      return `/catalog/${encodeURIComponent(slug)}`;
    }
    if (productOrId.id != null) return `/catalog/${productOrId.id}`;
    return "/catalog";
  }
  const slug = String(slugHint || "").trim();
  if (slug && !/^\d+$/.test(slug)) {
    return `/catalog/${encodeURIComponent(slug)}`;
  }
  if (productOrId != null && productOrId !== "") {
    return `/catalog/${productOrId}`;
  }
  return "/catalog";
}

export function isNumericCatalogParam(value) {
  return /^\d+$/.test(String(value || "").trim());
}
