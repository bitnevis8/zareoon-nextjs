"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";

const ADD_PRODUCT_HREF = "/dashboard/supplier/inventory/create?scope=own";
const MANAGE_PRODUCTS_HREF = "/dashboard/supplier/inventory?scope=own";

function availableQty(item) {
  if (item.availableQuantity != null) return Math.max(0, parseFloat(item.availableQuantity || 0));
  return Math.max(0, parseFloat(item.totalQuantity || 0) - parseFloat(item.reservedQuantity || 0));
}

function ProductCard({ item }) {
  const t = useTranslations("supplier.activeProducts");
  const image = resolveMediaUrl(item.coverImageUrl || item.imageUrl);
  const qty = availableQty(item);
  const priceLabel =
    item.price != null && item.price !== ""
      ? `${Number(item.price).toLocaleString("fa-IR")} ${t("currencyToman")}`
      : item.tieredPricing?.length
        ? t("tieredPrice")
        : null;
  const href = `/catalog/${item.productId}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            unoptimized
            className="object-cover transition group-hover:scale-[1.02]"
          />
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
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">
          {item.name || t("defaultProductName")}
        </h3>
        {priceLabel ? <p className="text-xs font-semibold text-emerald-700">{priceLabel}</p> : null}
        <p className="text-[11px] text-slate-500">
          {t("stock", { qty: qty.toLocaleString("fa-IR"), unit: item.unit || "" })}
        </p>
      </div>
    </Link>
  );
}

/**
 * ویترین محصولات فروشگاه — همیشه نمایش داده می‌شود؛ صاحب صفحه دکمه افزودن دارد.
 */
export default function SupplierActiveProductsRail({
  products = [],
  compact = false,
  isOwner = false,
}) {
  const t = useTranslations("supplier.activeProducts");
  const list = Array.isArray(products) ? products : [];

  return (
    <section
      className={`w-full border-b border-slate-200 bg-white py-4 sm:py-5 ${compact ? "mt-0" : "mt-5"}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 sm:text-base">{t("title")}</h2>
            {list.length > 0 ? (
              <span className="text-xs text-slate-500">
                {t("count", { count: list.length.toLocaleString("fa-IR") })}
              </span>
            ) : null}
          </div>
          {isOwner ? (
            <div className="flex items-center gap-2">
              {list.length > 0 ? (
                <Link
                  href={MANAGE_PRODUCTS_HREF}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t("manage")}
                </Link>
              ) : null}
              <Link
                href={ADD_PRODUCT_HREF}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 sm:text-sm"
              >
                {t("addProduct")}
              </Link>
            </div>
          ) : null}
        </div>

        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
            <p className="text-sm text-slate-600">{isOwner ? t("emptyOwner") : t("emptyPublic")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {list.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
            {isOwner ? (
              <Link
                href={ADD_PRODUCT_HREF}
                className="flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
                  +
                </span>
                <span className="text-sm font-bold text-emerald-900">{t("addProduct")}</span>
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
