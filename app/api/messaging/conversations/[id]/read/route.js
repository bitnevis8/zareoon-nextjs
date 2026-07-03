import { proxyMessaging } from "../../../_proxy";

export async function PATCH(request, { params }) {
  const { id } = await params;
  return proxyMessaging(request, `/conversations/${id}/read`, { method: "PATCH" });
}
