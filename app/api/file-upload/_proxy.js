import { proxyBackendRequest } from "@/app/config/serverApiBase";

export async function proxyToBackend(request, backendPath, { method } = {}) {
  return proxyBackendRequest(request, `/file-upload${backendPath}`, { method });
}
