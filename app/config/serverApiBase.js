/**
 * آدرس API برای فراخوانی‌های سمت سرور (SSR / Route Handlers).
 * وقتی Cloudflare Proxy روشن است، زدن به https://api.zareoon.ir از خود سرور
 * از لبه CF رد می‌شود و ممکن است هنگ / چالش / بلاک شود.
 * بنابراین روی همان ماشین باید مستقیم به origin وصل شویم.
 */
export function getServerApiBaseUrl() {
  const internal = String(process.env.INTERNAL_API_URL || process.env.API_INTERNAL_URL || "").trim();
  if (internal) return internal.replace(/\/$/, "");

  if (process.env.NODE_ENV === "production") {
    return "http://127.0.0.1:3060";
  }
  return "http://localhost:3000";
}

/** fetch با مهلت — جلوی گیر کردن بی‌نهایت پشت Cloudflare / شبکه */
export async function fetchWithTimeout(url, init = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
