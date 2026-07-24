import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import UnifiedProviderPageClient from "./UnifiedProviderPageClient";
import { API_ENDPOINTS } from "@/app/config/api";

/** مسیرهای سطح‌اول که نباید به‌عنوان نام فروشگاه تفسیر شوند (هم‌تراز RESERVED در API) */
const STATIC_ROOT_SEGMENTS = new Set([
  "about",
  "account-not-found",
  "api",
  "auth",
  "buyer-terms",
  "cancellation-policy",
  "cart",
  "catalog",
  "dashboard",
  "dispute-resolution",
  "exchange-rates",
  "help",
  "incoterms",
  "unit-converter",
  "hs-code",
  "cbm",
  "lc-request",
  "location",
  "pricing",
  "privacy",
  "providers",
  "refund-policy",
  "search",
  "seller-terms",
  "service-request",
  "tamin",
  "terms",
  "trade-services",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

async function resolvePublicSlug(slug) {
  try {
    const res = await fetch(API_ENDPOINTS.publicSlug.resolve(slug), {
      cache: "no-store",
    });
    const json = await res.json();
    if (json.success) return json.data;
  } catch {
    // نادیده
  }
  return { type: "current", slug };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (STATIC_ROOT_SEGMENTS.has(String(slug || "").toLowerCase())) {
    return {};
  }
  const t = await getTranslations("supplier.metadata");
  return {
    title: t("pageTitle"),
  };
}

export default async function PublicShopPage({ params }) {
  const { slug } = await params;
  const key = String(slug || "").trim();
  if (!key || STATIC_ROOT_SEGMENTS.has(key.toLowerCase()) || /^\d+$/.test(key)) {
    notFound();
  }

  const resolved = await resolvePublicSlug(key);
  if (resolved?.type === "redirect" && resolved.to && resolved.to !== key.toLowerCase()) {
    redirect(`/${resolved.to}`);
  }

  return <UnifiedProviderPageClient slug={key} />;
}
