import { NextResponse } from "next/server";

export function proxy(request) {
  const pathname = request?.nextUrl?.pathname || "";

  if (
    process.env.NODE_ENV === "production" &&
    (pathname.startsWith("/test-") || pathname.startsWith("/test/"))
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const response = NextResponse.next();

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
