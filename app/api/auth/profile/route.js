import { proxyBackendRequest } from "@/app/config/serverApiBase";

export async function PUT(request) {
  return proxyBackendRequest(request, "/user/auth/profile", { method: "PUT" });
}
