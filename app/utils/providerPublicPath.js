/** Public storefront / service-provider page path (user-facing). */
export const PROVIDER_PUBLIC_BASE = "/providers";

/**
 * @param {string | number | null | undefined} slugOrId
 * @returns {string | null}
 */
export function providerPublicPath(slugOrId) {
  if (slugOrId == null || slugOrId === "") return null;
  const raw = String(slugOrId).trim().replace(/^\/+|\/+$/g, "");
  if (!raw) return null;
  return `${PROVIDER_PUBLIC_BASE}/${encodeURIComponent(raw)}`;
}

/**
 * Display host + path for marketing (no protocol).
 * @param {string} [slugExample]
 */
export function providerPublicDisplayUrl(slugExample = "your-username") {
  const host = (process.env.NEXT_PUBLIC_SITE_HOST || "zareoon.ir").replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `${host}${PROVIDER_PUBLIC_BASE}/${slugExample}`;
}
