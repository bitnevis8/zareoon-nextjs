import { proxyTamin } from "../_proxy";

export async function GET(request) {
  return proxyTamin(request, "/entity-schemas");
}
