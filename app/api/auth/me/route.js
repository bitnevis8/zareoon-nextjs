import { proxyBackendRequest } from "@/app/config/serverApiBase";

export async function GET(request) {
  return proxyBackendRequest(request, "/user/auth/me");
}
