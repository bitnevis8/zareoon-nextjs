import { proxyTamin } from "../_proxy";

export async function GET(request) {
  return proxyTamin(request, "/me");
}

export async function PATCH(request) {
  return proxyTamin(request, "/me", { method: "PATCH" });
}
