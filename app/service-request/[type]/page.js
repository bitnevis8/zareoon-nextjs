import { redirect } from "next/navigation";
import { isValidL1CategoryId, LEGACY_SERVICE_TYPE_MAP } from "@/app/data/tradeServicesCatalog";

export default async function ServiceRequestRedirectPage({ params }) {
  const { type } = await params;
  const normalized = LEGACY_SERVICE_TYPE_MAP[type] || type;
  if (isValidL1CategoryId(normalized)) {
    redirect(`/trade-services/${normalized}`);
  }
  redirect("/trade-services");
}
