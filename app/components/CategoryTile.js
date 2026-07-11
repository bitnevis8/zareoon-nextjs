"use client";

import Link from "next/link";
import ProductImage from "./ui/ProductImage";
import { getLocalizedText } from "../utils/localize";
import { getMainCategoryIcon, hasCategoryImage, isMainRootCategory } from "../utils/mainCategoryIcons";

function SubcategoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5v9A1.5 1.5 0 0119.5 18h-15A1.5 1.5 0 013 16.5v-9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4.5A1.5 1.5 0 019.5 3h5A1.5 1.5 0 0116 4.5V6" />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

export default function CategoryTile({
  item,
  href,
  language,
  stockClass = "",
  badge = null,
  meta = null,
  compact = false,
}) {
  if (!item) return null;

  const label = getLocalizedText(item, language);
  const showMainIcon = isMainRootCategory(item) && !hasCategoryImage(item);
  const showSubIcon = !showMainIcon && !hasCategoryImage(item);
  const icon = getMainCategoryIcon(item);

  return (
    <Link
      href={href || `/catalog/${item.id}`}
      className={`group flex min-h-[7.5rem] flex-col items-center rounded-xl border bg-white p-2.5 shadow-sm transition-all active:scale-[0.98] sm:min-h-0 sm:rounded-2xl sm:p-3 md:p-4 hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md ${stockClass}`}
    >
      <div
        className={`flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-100 ${
          compact ? "aspect-square max-h-20" : "aspect-square"
        }`}
      >
        {hasCategoryImage(item) ? (
          <ProductImage
            slug={item.slug}
            imageUrl={item.imageUrl}
            alt={label}
            width={120}
            height={120}
            className="h-full w-full object-cover"
          />
        ) : showMainIcon ? (
          <span className={`select-none ${compact ? "text-3xl" : "text-4xl sm:text-5xl"}`} aria-hidden>
            {icon}
          </span>
        ) : item.isOrderable ? (
          <ProductIcon />
        ) : (
          <SubcategoryIcon />
        )}
      </div>

      <div className="mt-2 w-full text-center">
        <div
          className={`line-clamp-2 font-semibold leading-snug text-slate-800 ${
            compact ? "text-[11px]" : "text-[11px] sm:text-xs md:text-sm"
          }`}
        >
          {label}
        </div>
        {badge ? <div className="mt-1 text-[10px] text-slate-500">{badge}</div> : null}
        {meta ? <div className="mt-1 text-[10px] font-medium text-green-700">{meta}</div> : null}
      </div>
    </Link>
  );
}
