export function getAuthHeaders(extra = {}) {
  const headers = { ...extra };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function authFetch(url, options = {}) {
  const headers = getAuthHeaders(options.headers || {});
  return fetch(url, {
    ...options,
    credentials: options.credentials ?? "include",
    headers,
  });
}
