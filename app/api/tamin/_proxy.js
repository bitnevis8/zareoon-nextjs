import { API_ENDPOINTS } from "@/app/config/api";

const PROXY_TIMEOUT_MS = 12_000;

export async function proxyTamin(request, backendPath, { method } = {}) {
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
    signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
  };

  if (init.method !== "GET" && init.method !== "HEAD" && contentType?.includes("application/json")) {
    init.body = await request.text();
  }

  const url = `${API_ENDPOINTS.tamin.base}${backendPath}${request.nextUrl.search || ""}`;

  try {
    const backendResponse = await fetch(url, init);
    const responseContentType = backendResponse.headers.get("content-type") || "application/json";
    const body = await backendResponse.text();

    return new Response(body, {
      status: backendResponse.status,
      headers: { "Content-Type": responseContentType },
    });
  } catch (error) {
    const timedOut =
      error?.name === "TimeoutError" ||
      error?.name === "AbortError" ||
      /aborted|timeout/i.test(String(error?.message || ""));
    if (timedOut) {
      return Response.json(
        { success: false, message: "پاسخ سرور تأمین بیش از حد طول کشید" },
        { status: 504 }
      );
    }
    const refused = error?.cause?.code === "ECONNREFUSED" || error?.message?.includes("fetch failed");
    return Response.json(
      {
        success: false,
        message: refused ? "سرور API در دسترس نیست (پورت 3000)" : "خطا در ارتباط با سرور تأمین",
      },
      { status: 503 }
    );
  }
}
