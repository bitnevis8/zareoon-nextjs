import { proxyTamin } from "../../../_proxy";

export async function GET(request, { params }) {
  const { slug } = await params;
  return proxyTamin(request, `/public/${slug}/reviews`);
}
