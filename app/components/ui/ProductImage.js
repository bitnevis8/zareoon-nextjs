"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const FALLBACK_SRC = "/images/product-placeholder.svg";

export default function ProductImage({
  slug,
  imageUrl,
  alt = "",
  width = 96,
  height = 96,
  className = "rounded-lg bg-slate-50 p-2 border",
}) {
  const candidates = useMemo(() => {
    const list = [];
    if (imageUrl) list.push(resolveMediaUrl(imageUrl));
    list.push(FALLBACK_SRC);
    return list;
  }, [imageUrl]);

  const [idx, setIdx] = useState(0);
  const src = candidates[idx] || FALLBACK_SRC;

  return (
    <Image
      src={src}
      alt={alt || slug || "product"}
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
