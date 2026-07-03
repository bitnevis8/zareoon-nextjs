import { proxyToBackend } from "../../_proxy";

export async function POST(request) {
  return proxyToBackend(request, "/upload/avatar");
}
