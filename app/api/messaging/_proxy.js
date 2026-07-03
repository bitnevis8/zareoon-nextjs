import { API_ENDPOINTS } from "@/app/config/api";

export async function proxyMessaging(request, backendPath, { method } = {}) {
  const cookies = request.headers.get("cookie");
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  const headers = {};
  if (cookies) headers.Cookie = cookies;
  if (authorization) headers.Authorization = authorization;
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

  const url = `${API_ENDPOINTS.messaging.base}${backendPath}${request.nextUrl.search || ""}`;
  const backendResponse = await fetch(url, init);
  const responseContentType = backendResponse.headers.get("content-type") || "application/json";
  const body = await backendResponse.text();

  return new Response(body, {
    status: backendResponse.status,
    headers: { "Content-Type": responseContentType },
  });
}
