"use client";

import Link from "next/link";
import ProductCardMedia from "./ui/ProductCardMedia";
import { formatLocalizedNumber, getLocalizedText, localizeUnit } from "../utils/localize";
import { formatCatalogAncestorBreadcrumb } from "../utils/mobileSearchUtils";

/**
 * کارت فشردهٔ محصول موجود — بردکرامب اجداد (تا ۳ سطح) روی تصویر، عنوان محصول پایین کارت
 */
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
  const ancestorPath =
    !hideCategory && product
      ? formatCatalogAncestorBreadcrumb(product, productById, language, { maxLevels: 3 })
      : "";
  const title = getLocalizedText(product, language);
  const unit = lots?.[0]?.unit || "kg";
  const qtyLabel = `${formatLocalizedNumber(totalAvailable, language)} ${localizeUnit(unit, language)}`;

  return (
    <Link
      href={`/catalog/${product.id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_18px_-10px_rgba(15,23,42,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_12px_28px_-14px_rgba(16,185,129,0.45)] ${className}`}
    >
      <figure className="relative aspect-[5/4] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        <ProductCardMedia
          product={product}
          alt={title}
          width={200}
          height={160}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          showFlag={false}
        />

        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/55 to-transparent"
          aria-hidden
        />

        {!hideCategory && ancestorPath ? (
          <p
            className={`absolute top-2 z-10 max-w-[92%] line-clamp-3 text-[9px] font-semibold leading-snug text-white/95 sm:text-[10px] ${
              isRTL ? "right-2" : "left-2"
            }`}
            title={ancestorPath}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {ancestorPath}
          </p>
        ) : null}
      </figure>

      <div className="flex flex-1 flex-col gap-1.5 px-2.5 py-2.5 sm:px-3 sm:py-3">
        <h3 className="line-clamp-2 min-h-[2.4rem] text-[12px] font-bold leading-snug text-slate-900 sm:min-h-[2.6rem] sm:text-[13px]">
          {title}
        </h3>
        <p className="mt-auto inline-flex w-fit items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-100 sm:text-[11px]">
          {qtyLabel}
        </p>
      </div>
    </Link>
  );
}
