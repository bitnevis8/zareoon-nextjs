import { redirect } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { providerPublicPath } from "@/app/utils/providerPublicPath";

/** آدرس قدیمی خدمات → هدایت به صفحه یکپارچه /{slug} */
export default async function TradeProviderProfilePage({ params }) {
  const { providerId } = await params;
  const key = decodeURIComponent(String(providerId || "").trim());

  let slug = key;
  try {
    const url = API_ENDPOINTS.tradeServiceProviders.getPublicById(encodeURIComponent(key));
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    if (json?.success && json.data) {
      slug = json.data.profileSlug || json.data.id || key;
    }
  } catch {
    // keep key
  }

  redirect(providerPublicPath(slug) || "/");
}
