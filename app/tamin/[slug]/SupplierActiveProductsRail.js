"use client";

import Image from "next/image";
import Link from "next/link";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";

function availableQty(item) {
  return Math.max(0, parseFloat(item.totalQuantity || 0) - parseFloat(item.reservedQuantity || 0));
}

function formatPrice(item) {
  if (item.price != null && item.price !== "") {
    return `${Number(item.price).toLocaleString("fa-IR")} تومان`;
  }
  if (item.tieredPricing?.length) return "قیمت پلکانی";
  return null;
}

function ProductCard({ item }) {
  const image = resolveMediaUrl(item.coverImageUrl || item.imageUrl);
  const qty = availableQty(item);
  const priceLabel = formatPrice(item);
  const href = `/catalog/${item.productId}`;

  return (
    <Link
      href={href}
      className="group flex w-[11.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:w-[13rem]"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {image ? (
          <Image src={image} alt="" fill unoptimized className="object-cover transition group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-slate-300">📦</div>
        )}
        {item.qualityGrade ? (
          <span className="absolute right-2 top-2 rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm">
            {item.qualityGrade}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{item.name || "محصول"}</h3>
        {priceLabel ? <p className="text-xs font-semibold text-emerald-700">{priceLabel}</p> : null}
        <p className="text-[11px] text-slate-500">
          موجودی: {qty.toLocaleString("fa-IR")} {item.unit || ""}
        </p>
        {Array.isArray(item.hashtags) && item.hashtags.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-1 pt-1">
            {item.hashtags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export default function SupplierActiveProductsRail({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="mt-5 w-full border-y border-slate-200 bg-white py-4 shadow-sm sm:py-5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-800 sm:text-base">محصولات فعال</h2>
          <span className="text-xs text-slate-500">{products.length.toLocaleString("fa-IR")} مورد</span>
        </div>
        <div
          className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:auto] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
          dir="rtl"
        >
          {products.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
