"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ProductCardMedia from "../ui/ProductCardMedia";
import ProductPageQrCode from "../ui/ProductPageQrCode";
import { getLocalizedText, localizeUnit } from "../../utils/localize";
import CatalogMediaSlider, { buildMediaSlides } from "./CatalogMediaSlider";
import { catalogBadge, catalogSurface, catalogText } from "./catalogTheme";

export default function CatalogProductHero({
  item,
  language,
  productMedia = [],
  productIdNum,
  openMediaGallery,
  cartTotalQty = 0,
  cartUnit = "",
  hideMediaOnMobile = false,
  hideMedia = false,
  productSharePath = "",
}) {
  const t = useTranslations("catalog");
  const title = getLocalizedText(item, language) || "";
  const hideAllMedia = hideMedia || hideMediaOnMobile;
  const slides = useMemo(
    () => buildMediaSlides({ product: item, media: productMedia, title }),
    [item, productMedia, title]
  );

  const openAt = (index) => {
    openMediaGallery({
      module: "products",
      entityId: productIdNum,
      startIndex: index,
      productItem: item,
    });
  };

  const unitLabel = localizeUnit(item?.unit || item?.defaultMeasurementUnit || "-", language);
  const orderableBadge = item?.isOrderable ? (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${catalogBadge.success}`}>
      {t("orderable")} · {unitLabel}
    </span>
  ) : (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${catalogBadge.neutral}`}>
      {t("nonOrderableCategoryRole")}
    </span>
  );

  const listingBadge =
    item?.listingPolicy && item.listingPolicy !== "category-navigation-only" ? (
      <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${catalogBadge.info}`}>
        {(() => {
          try {
            return t(`listingPolicies.${item.listingPolicy}`);
          } catch {
            return item.listingPolicy;
          }
        })()}
      </span>
    ) : null;

  const cartNotice =
    cartTotalQty > 0 ? (
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${catalogBadge.warning}`}
      >
        <span className="leading-snug">
          {t("youHaveInCart", {
            quantity: cartTotalQty.toFixed(3),
            unit: localizeUnit(cartUnit || "", language),
          })}
        </span>
        <Link href="/cart" className={`shrink-0 font-semibold underline underline-offset-2 ${catalogText.accentStrong}`}>
          {t("viewCart")}
        </Link>
      </div>
    ) : null;

  const qrBlock =
    item?.isOrderable && productSharePath ? (
      <ProductPageQrCode
        pathOrUrl={productSharePath}
        title={title || t("product")}
        heading="کیو آر کد"
        scanHint="اسکن کنید تا صفحه محصول در زارعون باز شود"
        slugHint={item.slug || item.id || "product"}
        compact
        className="w-full max-w-[9.5rem] shrink-0"
      />
    ) : null;

  const titleBlock = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1 space-y-3">
        <h1 className={`text-xl font-bold leading-snug tracking-tight sm:text-2xl ${catalogText.heading}`}>{title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {orderableBadge}
          {listingBadge}
        </div>
        {cartNotice}
      </div>
      {qrBlock ? <div className="mx-auto sm:mx-0">{qrBlock}</div> : null}
    </div>
  );

  if (hideAllMedia) {
    return <section className={`${catalogSurface.card} px-4 py-4 sm:px-5 sm:py-5`}>{titleBlock}</section>;
  }

  return (
    <>
      <section className="space-y-3 lg:hidden">
        <div className="-mx-3 overflow-hidden border-y border-slate-200 bg-slate-100 sm:mx-0 sm:rounded-2xl sm:border">
          <CatalogMediaSlider
            slides={slides}
            aspectClass="aspect-[4/3]"
            onSlideTap={openAt}
            expandAriaLabel={t("viewGallery")}
          />
        </div>
        <div className="px-0.5">{titleBlock}</div>
      </section>

      <section className={`hidden overflow-hidden lg:block ${catalogSurface.card}`}>
        <div className="grid grid-cols-[minmax(280px,40%)_1fr] items-stretch">
          <div className="relative min-h-[300px] overflow-hidden bg-slate-100">
            {slides.length > 0 ? (
              <CatalogMediaSlider
                slides={slides}
                aspectClass="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[300px]"
                onSlideTap={openAt}
                expandAriaLabel={t("viewGallery")}
                expandAtBottom
                className="h-full"
              />
            ) : (
              <button
                type="button"
                className="block h-full min-h-[300px] w-full"
                onClick={() => openAt(0)}
                aria-label={t("viewGallery")}
              >
                <ProductCardMedia
                  product={item}
                  alt={title}
                  width={420}
                  height={320}
                  className="h-full w-full object-cover"
                  figureClassName="h-full min-h-[300px]"
                  showFlag={false}
                />
              </button>
            )}
          </div>
          <div className="flex flex-col justify-center border-s border-slate-100 p-6 xl:p-8">{titleBlock}</div>
        </div>
      </section>
    </>
  );
}
