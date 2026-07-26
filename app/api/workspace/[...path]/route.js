import { proxyWorkspace } from "../_proxy";

async function handle(request, context) {
  const { path } = await context.params;
  const backendPath = `/${(path || []).join("/")}`;
  return proxyWorkspace(request, backendPath);
}

export async function GET(request, context) {
  return handle(request, context);
}

export async function POST(request, context) {
  return handle(request, context);
}

export async function PATCH(request, context) {
  return handle(request, context);
}

export async function DELETE(request, context) {
  return handle(request, context);
}
