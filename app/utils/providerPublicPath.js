/** Public storefront path: zareoon.ir/{english-slug} — never numeric ids */
export const PROVIDER_PUBLIC_BASE = "";

/**
 * @param {string | number | null | undefined} slugOrId
 * @returns {string | null}
 */
export function providerPublicPath(slugOrId) {
  if (slugOrId == null || slugOrId === "") return null;
  const raw = String(slugOrId).trim().replace(/^\/+|\/+$/g, "");
  if (!raw) return null;
  // شناسه عددی فروشگاه عمومی نیست
  if (/^\d+$/.test(raw)) return null;
  return `/${encodeURIComponent(raw)}`;
}

/**
 * Display host + path for marketing (no protocol).
 * @param {string} [slugExample]
 */
export function providerPublicDisplayUrl(slugExample = "your-shop") {
  const host = (process.env.NEXT_PUBLIC_SITE_HOST || "zareoon.ir").replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `${host}/${slugExample}`;
}
