import { catalogProductPath } from "./catalogProductPath";

/**
 * Absolute public URL helper (catalog / landing / any path).
 */
export function publicAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  const raw = String(pathOrUrl).trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (fromEnv) return `${fromEnv}${path}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return `https://zareoon.ir${path}`;
}

/** Display host+path without protocol */
export function publicDisplayUrl(pathOrUrl) {
  const abs = publicAbsoluteUrl(pathOrUrl);
  if (!abs) return "";
  return abs.replace(/^https?:\/\//i, "");
}

export function catalogProductAbsoluteUrl(product) {
  return publicAbsoluteUrl(catalogProductPath(product));
}

export function landingPageAbsoluteUrl(shopSlug, landingSlug) {
  if (!shopSlug || !landingSlug) return null;
  return publicAbsoluteUrl(`/${encodeURIComponent(String(shopSlug).trim())}/p/${encodeURIComponent(String(landingSlug).trim())}`);
}
