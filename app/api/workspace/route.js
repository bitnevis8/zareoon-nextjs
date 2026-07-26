import { proxyWorkspace } from "./_proxy";

/** POST /api/workspace → POST /workspace */
export async function POST(request) {
  return proxyWorkspace(request, "", { method: "POST" });
}
