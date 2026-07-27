import { getServerApiBaseUrl, fetchWithTimeout } from "@/app/config/serverApiBase";

export async function proxyWorkspace(request, backendPath, { method } = {}) {
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

  if (init.method !== "GET" && init.method !== "HEAD" && contentType?.includes("application/json")) {
    init.body = await request.text();
  }

  const url = `${getServerApiBaseUrl()}/workspace${backendPath}${request.nextUrl.search || ""}`;

  try {
    const backendResponse = await fetchWithTimeout(url, init, 15000);
    const responseContentType = backendResponse.headers.get("content-type") || "application/json";
    const body = await backendResponse.text();
    return new Response(body, {
      status: backendResponse.status,
      headers: { "Content-Type": responseContentType },
    });
  } catch (error) {
    const refused =
      error?.name === "AbortError" ||
      error?.cause?.code === "ECONNREFUSED" ||
      error?.message?.includes("fetch failed");
    return Response.json(
      {
        success: false,
        message: refused
          ? "سرور API در دسترس نیست یا زمان‌پر شد"
          : "خطا در ارتباط با سرور کسب‌وکار",
      },
      { status: 503 }
    );
  }
}
