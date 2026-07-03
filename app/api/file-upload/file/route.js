import { proxyToBackend } from "../_proxy";

export async function DELETE(request) {
  return proxyToBackend(request, "/file");
}
