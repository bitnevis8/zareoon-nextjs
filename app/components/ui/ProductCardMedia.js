"use client";

import { useMemo, useState } from "react";
import ProductImage from "./ProductImage";
import SupplyCountryFlag from "./SupplyCountryFlag";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const FALLBACK_SRC = "/images/product-placeholder.svg";
const CARD_GALLERY_MAX = 3;

/**
 * جمع‌آوری حداکثر ۳ تصویر برای Hover Gallery کارت
 */
export function collectCardImageUrls({ product, lots, imageUrls, imageUrl, max = CARD_GALLERY_MAX } = {}) {
  const out = [];
  const seen = new Set();

  const push = (raw) => {
    if (out.length >= max) return;
    const url = resolveMediaUrl(raw);
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };

  if (Array.isArray(imageUrls)) {
    for (const u of imageUrls) push(u);
  }

  for (const lot of lots || []) {
    if (Array.isArray(lot?.previewImageUrls)) {
      for (const u of lot.previewImageUrls) push(u);
    }
    push(lot?.coverImageUrl);
  }

  push(imageUrl);
  push(product?.imageUrl);
  push(product?.image);

  return out;
}

/**
 * رسانه کارت محصول — با چند عکس از daisyUI Hover Gallery استفاده می‌کند (حداکثر ۳)
 * @see https://daisyui.com/components/hover-gallery/
 */
export default function ProductCardMedia({
  product,
  slug,
  imageUrl,
  imageUrls,
  lots,
  alt = "",
  width = 400,
  height = 400,
  className = "object-cover w-full h-full",
  figureClassName = "",
  showFlag = true,
  maxImages = CARD_GALLERY_MAX,
}) {
  const supplyCountry = product?.supplyCountry || "IR";
  const supplyCity = product?.supplyCity || "";

  const urls = useMemo(() => {
    const list = collectCardImageUrls({
      product,
      lots,
      imageUrls,
      imageUrl: imageUrl ?? product?.imageUrl,
      max: maxImages,
    });
    return list.length ? list : [FALLBACK_SRC];
  }, [product, lots, imageUrls, imageUrl, maxImages]);

  const [broken, setBroken] = useState(() => new Set());
  const visible = urls.filter((u) => !broken.has(u));
  const gallery = visible.length ? visible : [FALLBACK_SRC];

  const markBroken = (src) => {
    setBroken((prev) => {
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  };

  return (
    <div className={`relative h-full w-full overflow-hidden ${figureClassName}`}>
      {gallery.length > 1 ? (
        <figure className="hover-gallery h-full w-full">
          {gallery.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={alt || slug || product?.slug || ""}
              className={className}
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={() => markBroken(src)}
            />
          ))}
        </figure>
      ) : (
        <ProductImage
          slug={slug || product?.slug}
          imageUrl={gallery[0] === FALLBACK_SRC ? null : gallery[0]}
          alt={alt}
          width={width}
          height={height}
          className={className}
        />
      )}
      {showFlag ? (
        <div className="pointer-events-none absolute top-2 right-2 z-[1]">
          <SupplyCountryFlag countryCode={supplyCountry} city={supplyCity} />
        </div>
      ) : null}
    </div>
  );
}
