import { proxyBackendRequest } from "@/app/config/serverApiBase";

export async function POST(request) {
  return proxyBackendRequest(request, "/user/auth/register/email");
}
