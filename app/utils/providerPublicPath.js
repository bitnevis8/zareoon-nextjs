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
export function providerPublicDisplayUrl(slugExample = "example") {
  const host = (process.env.NEXT_PUBLIC_SITE_HOST || "zareoon.ir").replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `${host}/${slugExample}`;
}

/**
 * Absolute public storefront URL for QR / share links.
 * Prefers NEXT_PUBLIC_SITE_URL, then browser origin, then https://zareoon.ir
 * @param {string | number | null | undefined} slugOrId
 * @returns {string | null}
 */
export function providerPublicAbsoluteUrl(slugOrId) {
  const path = providerPublicPath(slugOrId);
  if (!path) return null;
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (fromEnv) return `${fromEnv}${path}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return `https://zareoon.ir${path}`;
}
