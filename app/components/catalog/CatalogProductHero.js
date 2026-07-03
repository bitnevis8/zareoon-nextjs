"use client";

import { useMemo } from "react";
import Link from "next/link";
import ProductCardMedia from "../ui/ProductCardMedia";
import SupplyCountryFlag from "../ui/SupplyCountryFlag";
import { getLocalizedText, localizeUnit } from "../../utils/localize";
import CatalogMediaSlider, { buildMediaSlides } from "./CatalogMediaSlider";
import { catalogBadge, catalogSurface, catalogText } from "./catalogTheme";

export default function CatalogProductHero({
  item,
  language,
  t,
  productMedia = [],
  productIdNum,
  openMediaGallery,
  cartTotalQty = 0,
  cartUnit = "",
  hideMediaOnMobile = false,
}) {
  const title = getLocalizedText(item, language) || "";
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

  const desktopMeta = (
    <div className="flex min-w-0 flex-1 flex-col justify-center space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className={`flex-1 text-2xl font-bold leading-snug xl:text-3xl ${catalogText.heading}`}>{title}</h1>
          <SupplyCountryFlag
            countryCode={item?.supplyCountry || "IR"}
            city={item?.supplyCity || ""}
            className="shrink-0"
          />
        </div>
        {item?.slug ? <p className={`text-sm ${catalogText.subtle}`}>{item.slug}</p> : null}
        {item?.isOrderable ? (
          <span className={`inline-flex rounded-lg px-3 py-1.5 text-sm font-medium ${catalogBadge.success}`}>
            {t("orderable")} • {localizeUnit(item?.unit || "-", language)}
          </span>
        ) : (
          <span className={`inline-flex rounded-lg px-3 py-1.5 text-sm font-medium ${catalogBadge.neutral}`}>
            {t("nonOrderableCategoryRole")}
          </span>
        )}
      </div>

      {cartTotalQty > 0 ? (
        <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${catalogBadge.warning}`}>
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
      ) : null}
    </div>
  );

  return (
    <>
      {!hideMediaOnMobile ? (
        <section className="lg:hidden -mx-3 overflow-hidden border-y border-slate-200 bg-white">
          <CatalogMediaSlider
            slides={slides}
            aspectClass="aspect-[5/4]"
            onSlideTap={openAt}
            expandAriaLabel={t("viewGallery")}
            cornerTopStart={
              <SupplyCountryFlag
                countryCode={item?.supplyCountry || "IR"}
                city={item?.supplyCity || ""}
                className="shadow-lg"
              />
            }
            cornerBottomEnd={
              <div>
                <h1 className="text-base font-bold leading-tight text-white drop-shadow-sm sm:text-lg">{title}</h1>
              </div>
            }
          />

          {cartTotalQty > 0 ? (
            <div className={`mx-3 mt-3 flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm ${catalogBadge.warning}`}>
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
          ) : null}
        </section>
      ) : null}

      {!hideMediaOnMobile ? (
        <section className={`hidden overflow-hidden lg:block ${catalogSurface.card}`}>
          <div className="grid grid-cols-1 items-stretch gap-0 lg:grid-cols-[minmax(280px,360px)_1fr]">
            <div className="relative min-h-[280px] overflow-hidden bg-slate-900 lg:min-h-[320px]">
              {slides.length > 0 ? (
                <CatalogMediaSlider
                  slides={slides}
                  aspectClass="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[320px]"
                  onSlideTap={openAt}
                  expandAriaLabel={t("viewGallery")}
                  expandAtBottom
                  className="h-full"
                  cornerTopBar={
                    <div className="flex items-start justify-end gap-2 text-right">
                      <h1 className="min-w-0 flex-1 text-lg font-bold leading-tight text-white">{title}</h1>
                      <SupplyCountryFlag
                        countryCode={item?.supplyCountry || "IR"}
                        city={item?.supplyCity || ""}
                        className="shrink-0 shadow-lg"
                      />
                    </div>
                  }
                />
              ) : (
                <button
                  type="button"
                  className="block h-full w-full min-h-[320px]"
                  onClick={() => openAt(0)}
                  aria-label={t("viewGallery")}
                >
                  <ProductCardMedia
                    product={item}
                    alt={title}
                    width={360}
                    height={320}
                    className="h-full w-full object-cover"
                    figureClassName="h-full min-h-[320px]"
                    showFlag={false}
                  />
                </button>
              )}
            </div>
            <div className="flex border-t border-slate-100 p-6 lg:border-t-0 lg:border-e lg:border-slate-100">{desktopMeta}</div>
          </div>
        </section>
      ) : null}
    </>
  );
}
