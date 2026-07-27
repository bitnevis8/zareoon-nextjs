import { redirect } from "next/navigation";
import { getServerApiBaseUrl, fetchWithTimeout } from "@/app/config/serverApiBase";
import { providerPublicPath } from "@/app/utils/providerPublicPath";

/** آدرس قدیمی خدمات → هدایت به صفحه یکپارچه /{slug} */
export default async function TradeProviderProfilePage({ params }) {
  const { providerId } = await params;
  const key = decodeURIComponent(String(providerId || "").trim());

  let slug = key;
  try {
    const url = `${getServerApiBaseUrl()}/trade-service-provider/public/${encodeURIComponent(key)}`;
    const res = await fetchWithTimeout(url, { cache: "no-store" }, 10000);
    const json = await res.json();
    if (json?.success && json.data) {
      slug = json.data.profileSlug || json.data.id || key;
    }
  } catch {
    // keep key
  }

  redirect(providerPublicPath(slug) || "/");
}
