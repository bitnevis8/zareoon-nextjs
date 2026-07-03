import { proxyTamin } from "../../_proxy";

export async function POST(request, { params }) {
  const { supplierId } = await params;
  return proxyTamin(request, `/follow/${supplierId}`, { method: "POST" });
}
