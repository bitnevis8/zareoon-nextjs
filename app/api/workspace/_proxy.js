import { API_ENDPOINTS } from "@/app/config/api";

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

  const base = API_ENDPOINTS.workspace.backendBase || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/workspace`;
  const url = `${base}${backendPath}${request.nextUrl.search || ""}`;

  try {
    const backendResponse = await fetch(url, init);
    const responseContentType = backendResponse.headers.get("content-type") || "application/json";
    const body = await backendResponse.text();
    return new Response(body, {
      status: backendResponse.status,
      headers: { "Content-Type": responseContentType },
    });
  } catch (error) {
    const refused = error?.cause?.code === "ECONNREFUSED" || error?.message?.includes("fetch failed");
    return Response.json(
      {
        success: false,
        message: refused
          ? "سرور API در دسترس نیست (پورت 3000 را چک کنید)"
          : "خطا در ارتباط با سرور کسب‌وکار",
      },
      { status: 503 }
    );
  }
}
