/**
 * Client-side helper — always uses the public API URL (browser → Cloudflare OK).
 * Server code should use getServerApiBaseUrl / serverBackendFetch instead.
 *
 * روی گوشی (Capacitor Dev): هرگز localhost نزن — همان IP فرانت با پورت API.
 */

function resolveClientApiBaseUrl() {
  if (typeof window === "undefined") {
    return (
      process.env.INTERNAL_API_URL ||
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production" ? "https://api.zareoon.ir" : "http://127.0.0.1:3000")
    ).replace(/\/$/, "");
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return String(process.env.NEXT_PUBLIC_API_URL).replace(/\/$/, "");
  }

  const host = window.location?.hostname || "localhost";
  const protocol = window.location?.protocol || "http:";

  // سایت زنده
  if (host === "zareoon.ir" || host === "www.zareoon.ir") {
    return "https://api.zareoon.ir";
  }

  // لوکال / LAN / emulator — API روی پورت 3000 همان هاست
  if (host === "localhost" || host === "127.0.0.1") {
    return `${protocol}//${host}:3000`;
  }

  return `${protocol}//${host}:3000`;
}

export const fetchWithCredentials = async (endpoint, options = {}) => {
  const API_BASE_URL = resolveClientApiBaseUrl();

  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const fullUrl = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(fullUrl, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let error = {};
    try {
      error = await response.json();
    } catch {
      /* ignore */
    }
    throw new Error(error.message || "خطا در ارتباط با سرور");
  }

  return response.json();
};
