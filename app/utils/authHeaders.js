const ACTIVE_WORKSPACE_KEY = "zareoon_active_workspace_id";

export function getActiveWorkspaceId() {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
  return v || null;
}

export function setActiveWorkspaceId(id) {
  if (typeof window === "undefined") return;
  if (id != null && id !== "") {
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, String(id));
  } else {
    localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
  }
}

export function getAuthHeaders(extra = {}) {
  const headers = { ...extra };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
    const wsId = getActiveWorkspaceId();
    if (wsId) headers["X-Workspace-Id"] = wsId;
  }
  return headers;
}

export async function authFetch(url, options = {}) {
  const headers = getAuthHeaders(options.headers || {});
  try {
    return await fetch(url, {
      ...options,
      credentials: options.credentials ?? "include",
      headers,
    });
  } catch (err) {
    const message =
      err?.message === "Failed to fetch"
        ? "ارتباط با سرور برقرار نشد. مطمئن شوید API روشن است و دوباره وارد شوید."
        : err?.message || "خطای شبکه";
    const error = new Error(message);
    error.cause = err;
    error.isNetworkError = true;
    throw error;
  }
}
