const DL_HOSTS = new Set(["dl.zareoon.ir", "2193182645.cloudydl.com"]);

/**
 * Rewrites http://dl.zareoon.ir/... to same-origin /dl-media/... so HTTPS pages
 * can load media without mixed-content blocking.
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("/dl-media/")) return url;

  try {
    const parsed = new URL(url);
    if (DL_HOSTS.has(parsed.hostname)) {
      return `/dl-media${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // keep original url
  }

  return url;
}
