import { redirect } from "next/navigation";
import { providerPublicPath } from "@/app/utils/providerPublicPath";

/** Legacy `/tamin/:slug` → `/:slug` */
export default async function TaminLegacyRedirect({ params }) {
  const { slug } = await params;
  redirect(providerPublicPath(slug) || "/");
}
