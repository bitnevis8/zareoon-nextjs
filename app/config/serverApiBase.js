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

export function serverApiUrl(path = "") {
  const base = getServerApiBaseUrl();
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** fetch با مهلت — جلوی گیر کردن بی‌نهایت پشت Cloudflare / شبکه */
export async function fetchWithTimeout(url, init = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const parentSignal = init.signal;
  if (parentSignal) {
    if (parentSignal.aborted) controller.abort();
    else parentSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function serverBackendFetch(pathOrUrl, init = {}, timeoutMs = 15000) {
  return fetchWithTimeout(serverApiUrl(pathOrUrl), init, timeoutMs);
}

/**
 * پروکسی عمومی درخواست Next → API داخلی (با timeout و فوروارد هدرهای مهم)
 */
export async function proxyBackendRequest(request, backendPath, { method, timeoutMs = 15000 } = {}) {
  const cookies = request.headers.get("cookie");
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");
  const workspaceId = request.headers.get("x-workspace-id");

  const headers = {};
  if (cookies) headers.Cookie = cookies;
  if (authorization) headers.Authorization = authorization;
  if (workspaceId) headers["X-Workspace-Id"] = workspaceId;
  if (contentType?.includes("application/json")) {
    headers["Content-Type"] = "application/json";
  }

  const init = {
    method: method || request.method,
    headers,
  };

  if (init.method !== "GET" && init.method !== "HEAD") {
    if (contentType?.includes("multipart/form-data")) {
      init.body = await request.formData();
    } else if (contentType?.includes("application/json")) {
      init.body = await request.text();
    }
  }

  const search = request.nextUrl?.search || "";
  const url = serverApiUrl(`${backendPath}${search}`);

  try {
    const backendResponse = await fetchWithTimeout(url, init, timeoutMs);
    const responseContentType = backendResponse.headers.get("content-type") || "application/json";
    const body = await backendResponse.text();
    const response = new Response(body, {
      status: backendResponse.status,
      headers: { "Content-Type": responseContentType },
    });
    const setCookie = backendResponse.headers.get("set-cookie");
    if (setCookie) response.headers.append("Set-Cookie", setCookie);
    return response;
  } catch (error) {
    const refused =
      error?.name === "AbortError" ||
      error?.cause?.code === "ECONNREFUSED" ||
      error?.message?.includes("fetch failed");
    return Response.json(
      {
        success: false,
        message: refused ? "ارتباط با API برقرار نشد یا زمان‌پر شد" : "خطا در ارتباط با سرور",
      },
      { status: 503 }
    );
  }
}
