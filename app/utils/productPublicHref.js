import { catalogProductPath } from "./catalogProductPath";

/**
 * مسیر عمومی محصول بر اساس حالت نمایش لندینگ
 * @param {object} product
 * @param {{ displayMode?: string, path?: string|null }|null} landingLink
 */
export function productPublicHref(product, landingLink = null) {
  const mode = landingLink?.displayMode || "catalog";
  if (mode === "landing" && landingLink?.path) return landingLink.path;
  return catalogProductPath(product);
}

export function shouldShowProLandingBanner(landingLink) {
  if (!landingLink?.path) return false;
  const mode = landingLink.displayMode || "catalog";
  return mode === "catalog";
}
