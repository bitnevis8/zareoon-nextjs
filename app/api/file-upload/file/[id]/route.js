import { proxyToBackend } from "../../_proxy";

export async function DELETE(request, { params }) {
  const { id } = await params;
  return proxyToBackend(request, `/file/${id}`);
}
