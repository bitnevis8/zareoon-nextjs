/**
 * Client-side helper — always uses the public API URL (browser → Cloudflare OK).
 * Server code should use getServerApiBaseUrl / serverBackendFetch instead.
 */
const API_BASE_URL =
  (typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.INTERNAL_API_URL || process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL) ||
  (process.env.NODE_ENV === "production" ? "https://api.zareoon.ir" : "http://localhost:3000");

export const fetchWithCredentials = async (endpoint, options = {}) => {
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const fullUrl = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL.replace(/\/$/, "")}${endpoint}`;

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
