import { redirect } from "next/navigation";
import { providerPublicPath } from "@/app/utils/providerPublicPath";

/** Legacy `/providers/:slug` → `/:slug` */
export default async function ProvidersLegacyRedirect({ params }) {
  const { slug } = await params;
  redirect(providerPublicPath(slug) || "/");
}
