import { proxyMessaging } from "../_proxy";

export async function GET(request) {
  return proxyMessaging(request, "/conversations");
}

export async function POST(request) {
  return proxyMessaging(request, "/conversations");
}
