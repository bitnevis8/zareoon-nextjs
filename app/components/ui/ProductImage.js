"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const DEFAULT_EXTS = [".webp", ".jpg", ".jpeg", ".png", ".svg"];

export default function ProductImage({ slug, imageUrl, alt = "", width = 96, height = 96, className = "rounded-lg bg-slate-50 p-2 border" }) {
  const candidates = useMemo(() => {
    const list = [];
    if (imageUrl) list.push(resolveMediaUrl(imageUrl));
    if (slug) {
      for (const ext of DEFAULT_EXTS) list.push(`/images/products/${slug}${ext}`);
    }
    list.push("/images/image-loader.webp");
    return list;
  }, [slug, imageUrl]);

  const [idx, setIdx] = useState(0);
  const src = candidates[idx] || "/images/image-loader.webp";

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => {
        if (idx < candidates.length - 1) setIdx(idx + 1);
      }}
      unoptimized
    />
  );
}

