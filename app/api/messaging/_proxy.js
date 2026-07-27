import { proxyBackendRequest } from "@/app/config/serverApiBase";

export async function proxyMessaging(request, backendPath, { method } = {}) {
  return proxyBackendRequest(request, `/messaging${backendPath}`, { method });
}
