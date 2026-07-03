import { proxyTamin } from "../../_proxy";

export async function POST(request, { params }) {
  const { supplierId } = await params;
  return proxyTamin(request, `/review/${supplierId}`, { method: "POST" });
}
