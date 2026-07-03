import { proxyTamin } from "../_proxy";

export async function POST(request) {
  return proxyTamin(request, "/posts", { method: "POST" });
}
