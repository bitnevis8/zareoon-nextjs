import { proxyTamin } from "../../_proxy";

export async function DELETE(request, { params }) {
  const { postId } = await params;
  return proxyTamin(request, `/posts/${postId}`, { method: "DELETE" });
}
