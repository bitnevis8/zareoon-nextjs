import { proxyBackendRequest } from "@/app/config/serverApiBase";

export async function proxyTamin(request, backendPath, { method } = {}) {
  return proxyBackendRequest(request, `/tamin${backendPath}`, { method });
}
