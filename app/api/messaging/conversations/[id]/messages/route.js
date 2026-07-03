import { proxyMessaging } from "../../../_proxy";

export async function GET(request, { params }) {
  const { id } = await params;
  return proxyMessaging(request, `/conversations/${id}/messages`);
}

export async function POST(request, { params }) {
  const { id } = await params;
  return proxyMessaging(request, `/conversations/${id}/messages`);
}
