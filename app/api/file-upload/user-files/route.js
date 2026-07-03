import { proxyToBackend } from "../_proxy";

export async function GET(request) {
  return proxyToBackend(request, "/user-files");
}
