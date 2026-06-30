"use client";

import Link from "next/link";
import ProductCardMedia from "./ui/ProductCardMedia";
import { formatLocalizedNumber, getLocalizedText, localizeUnit } from "../utils/localize";

export default function AvailableProductCompactCard({
  product,
  lots,
  totalAvailable,
  language,
  productById,
  className = "",
  hideCategory = false,
  isRTL = true,
}) {
  const parentCategory = product?.parentId ? productById.get(product.parentId) : null;
  const title = getLocalizedText(product, language);
  const unit = lots[0]?.unit || "kg";
  const qtyLabel = `${formatLocalizedNumber(totalAvailable, language)} ${localizeUnit(unit, language)}`;

  return (
    <Link
      href={`/catalog/${product.id}`}
      className={`group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-green-300 hover:shadow-md ${className}`}
    >
      <figure className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
        <ProductCardMedia
          product={product}
          alt={title}
          width={148}
          height={111}
          className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
          showFlag={false}
        />
        {!hideCategory && parentCategory ? (
          <span
            className={`absolute bottom-1 z-10 max-w-[90%] truncate rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 shadow-sm ${
              isRTL ? "right-1" : "left-1"
            }`}
          >
            {getLocalizedText(parentCategory, language)}
          </span>
        ) : null}
      </figure>
      <div className="flex flex-1 flex-col gap-1 p-2">
        <h3 className="line-clamp-2 min-h-[2.25rem] text-xs font-semibold leading-tight text-slate-800">
          {title}
        </h3>
        <p className="text-[10px] font-medium text-green-700">{qtyLabel}</p>
      </div>
    </Link>
  );
}
