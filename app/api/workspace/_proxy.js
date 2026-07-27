import { proxyBackendRequest } from "@/app/config/serverApiBase";

export async function proxyWorkspace(request, backendPath, { method } = {}) {
  return proxyBackendRequest(request, `/workspace${backendPath}`, { method });
}
