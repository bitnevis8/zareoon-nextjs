import { proxyMessaging } from "../../_proxy";

export async function GET(request) {
  return proxyMessaging(request, "/users/search");
}
