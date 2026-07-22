import { proxyTamin } from "../../_proxy";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return proxyTamin(request, `/posts/public${qs ? `?${qs}` : ""}`);
}
