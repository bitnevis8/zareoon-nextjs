import { getServerApiBaseUrl, fetchWithTimeout } from "@/app/config/serverApiBase";

function pickMeta(product, lang = "fa") {
  const tr = product?.translations?.[lang] || {};
  const title =
    tr.metaTitle ||
    product?.metaTitle ||
    tr.name ||
    product?.name ||
    product?.englishName ||
    "Zareoon";
  const description =
    tr.metaDescription ||
    product?.metaDescription ||
    product?.description ||
    "";
  return { title, description };
}

function productCanonicalPath(product, fallbackId) {
  const slug = String(product?.slug || "").trim();
  if (slug && !/^\d+$/.test(slug)) return `/catalog/${encodeURIComponent(slug)}`;
  return `/catalog/${product?.id || fallbackId}`;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zareoon.ir";
  try {
    const url = `${getServerApiBaseUrl()}/supplier/product/${encodeURIComponent(id)}`;
    const res = await fetchWithTimeout(url, { next: { revalidate: 300 } }, 10000);
    const json = await res.json();
    const product = json?.data;
    if (!product) {
      return { title: "Zareoon Catalog" };
    }

    const path = productCanonicalPath(product, id);
    const seo = product.seo || {};
    const { title, description } = pickMeta(product, seo.xDefaultLanguage || "fa");
    const indexable = seo.indexable !== false;
    const hreflang = Array.isArray(seo.hreflang) ? seo.hreflang : [];
    const languages = {};
    for (const lang of hreflang) {
      languages[lang] = `${siteUrl}${path}`;
    }
    if (seo.xDefaultLanguage) {
      languages["x-default"] = `${siteUrl}${path}`;
    }

    const imageUrl = product.imageUrl
      ? product.imageUrl.startsWith("http")
        ? product.imageUrl
        : `${siteUrl}${product.imageUrl}`
      : undefined;

    return {
      title,
      description: description || undefined,
      robots: indexable
        ? { index: true, follow: true }
        : { index: false, follow: false, googleBot: { index: false, follow: false } },
      alternates: Object.keys(languages).length
        ? { canonical: `${siteUrl}${path}`, languages }
        : { canonical: `${siteUrl}${path}` },
      openGraph: {
        title,
        description: description || undefined,
        url: `${siteUrl}${path}`,
        images: imageUrl ? [{ url: imageUrl }] : undefined,
      },
      other: seo.noindexReason && !indexable ? { "x-noindex-reason": seo.noindexReason } : undefined,
    };
  } catch {
    return { title: "Zareoon Catalog" };
  }
}

export default function CatalogItemLayout({ children }) {
  return children;
}
