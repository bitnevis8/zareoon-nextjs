const ALLOWED_TAGS = "p|br|b|strong|i|em|u|ul|ol|li|a|span|h2|h3|div|blockquote";

function isSafeHref(href) {
  if (!href) return false;
  const v = String(href).trim().toLowerCase();
  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("mailto:") || v.startsWith("tel:") || v.startsWith("/");
}

/** Sanitize landing rich-text HTML (deterministic for SSR + client). */
export function sanitizeLandingHtml(html) {
  if (!html) return "";
  let raw = String(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?(?!\/?(?:p|br|b|strong|i|em|u|ul|ol|li|a|span|h2|h3|div|blockquote)\b)[a-z][^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");

  raw = raw.replace(/<a\b([^>]*)>/gi, (full, attrs) => {
    const hrefMatch = attrs.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = hrefMatch ? hrefMatch[2] || hrefMatch[3] || hrefMatch[4] || "" : "";
    if (!isSafeHref(href)) return "<a>";
    const safe = href.replace(/"/g, "&quot;");
    const blank = safe.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ' rel="noopener noreferrer"';
    return `<a href="${safe}"${blank}>`;
  });

  raw = raw.replace(/\sstyle\s*=\s*("([^"]*)"|'([^']*)')/gi, (full, _q, d, s) => {
    const style = String(d || s || "").toLowerCase();
    if (/expression|url\s*\(|javascript|@import/.test(style)) return "";
    if (!/^(?:\s*(?:text-align|font-weight|font-style|text-decoration)\s*:\s*[^;]+;?\s*)+$/.test(style)) return "";
    return ` style="${style}"`;
  });

  return raw;
}

export function looksLikeHtml(value) {
  return new RegExp(`<(?:${ALLOWED_TAGS})\\b`, "i").test(String(value || ""));
}
