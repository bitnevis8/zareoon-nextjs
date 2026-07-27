import { getLocale } from "next-intl/server";
import ProductLandingPublicClient from "./ProductLandingPublicClient";
import { getServerApiBaseUrl, fetchWithTimeout } from "@/app/config/serverApiBase";

async function fetchPublicLanding(shopSlug, landingSlug) {
  try {
    const res = await fetchWithTimeout(
      `${getServerApiBaseUrl()}/product-landing/public/${encodeURIComponent(shopSlug)}/${encodeURIComponent(landingSlug)}`,
      { next: { revalidate: 60 } },
      15000
    );
    const json = await res.json();
    if (!json?.success || !json.data?.landing) return null;
    return json.data;
  } catch {
    return null;
  }
}

function pickTitle(landing, shop) {
  const blocks = landing?.content?.blocks || [];
  const hero = blocks.find((b) => b.type === "hero");
  const t = hero?.props?.fa?.title || landing?.content?.meta?.titleFa || landing?.slug;
  const shopName = shop?.name || shop?.slug || "";
  return t ? `${t}${shopName ? ` | ${shopName}` : ""}` : `${landing?.slug || "لندینگ"} | Zareoon`;
}

function pickDescription(landing) {
  const blocks = landing?.content?.blocks || [];
  const hero = blocks.find((b) => b.type === "hero");
  return (
    hero?.props?.fa?.subtitle ||
    hero?.props?.fa?.body ||
    landing?.content?.meta?.descriptionFa ||
    "صفحه محصول در بازارگاه زارعون"
  );
}

function pickOgImage(landing) {
  const blocks = landing?.content?.blocks || [];
  for (const b of blocks) {
    const p = b.props || {};
    const url = p.bgImageUrl || p.imageUrl || (p.galleryUrls && p.galleryUrls[0]);
    if (url) return url;
  }
  return undefined;
}

export async function generateMetadata({ params }) {
  const { slug, landingSlug } = await params;
  const shopSlug = String(slug || "").toLowerCase();
  const ls = String(landingSlug || "").toLowerCase();
  const data = await fetchPublicLanding(shopSlug, ls);
  if (!data?.landing) {
    return {
      title: `${ls} | ${shopSlug}`,
      robots: { index: false, follow: false },
    };
  }
  const title = pickTitle(data.landing, data.shop);
  const description = pickDescription(data.landing);
  const image = pickOgImage(data.landing);
  return {
    title,
    description,
    alternates: { canonical: `/${shopSlug}/p/${ls}` },
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductLandingPublicPage({ params }) {
  const { slug, landingSlug } = await params;
  const locale = await getLocale();
  const shopSlug = String(slug || "").toLowerCase();
  const ls = String(landingSlug || "").toLowerCase();
  const initialData = await fetchPublicLanding(shopSlug, ls);

  const jsonLd =
    initialData?.landing && initialData?.shop
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: pickTitle(initialData.landing, initialData.shop),
          description: pickDescription(initialData.landing),
          image: pickOgImage(initialData.landing),
          brand: { "@type": "Brand", name: initialData.shop.name || initialData.shop.slug },
          url: `https://zareoon.ir/${shopSlug}/p/${ls}`,
        }
      : null;

  return (
    <>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      <ProductLandingPublicClient
        shopSlug={shopSlug}
        landingSlug={ls}
        locale={locale}
        initialData={initialData}
      />
    </>
  );
}
