"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import HorizontalScrollRow from "./HorizontalScrollRow";
import AvailableProductCompactCard from "./AvailableProductCompactCard";
import { getLocalizedText } from "../utils/localize";
import {
  buildAvailableProducts,
  buildProductByIdMap,
  buildSellerVerificationMap,
  getLatestAvailableProducts,
  groupAvailableProducts,
} from "../utils/availableProducts";
import { useInventoryLots, HOMEPAGE_LOTS_PARAMS } from "../hooks/useCatalogProducts";
import { STATIC_ROOT_CATEGORIES } from "../data/staticRootCategories";
import { ProductScrollSkeleton } from "./ui/Skeleton";
import { useProductLandingLinks } from "@/app/hooks/useProductLandingLinks";
import { productPublicHref } from "@/app/utils/productPublicHref";

const CARD_CLASS =
  "shrink-0 w-[9.75rem] min-[380px]:w-[10.5rem] sm:w-[11.5rem] md:w-[12.25rem] lg:w-[12.75rem] snap-start";

/** Product map from lot.product embeds (+ static roots). Avoids the full-catalog dump on homepage. */
function productMapFromLots(inventoryLots) {
  const map = buildProductByIdMap(STATIC_ROOT_CATEGORIES);
  for (const lot of inventoryLots || []) {
    const p = lot?.product;
    if (p?.id != null) map.set(p.id, p);
  }
  return map;
}

export default function LatestAvailableProductsSection({
  inventoryLots: inventoryLotsProp,
  allProducts: allProductsProp,
  loading: loadingProp = false,
  autoFetch = false,
  scopeCategoryId = null,
  scopeCategoryName = null,
  title,
  showGroupToggle = true,
  className = "",
  variant = "plain",
}) {
  const { language, t, isRTL } = useLanguage();
  const [groupByCategory, setGroupByCategory] = useState(false);

  // Homepage autoFetch: only bounded public lots — product rows come on lot.product (lite).
  const { lots: fetchedLots, loading: lotsLoading } = useInventoryLots({
    enabled: autoFetch && !inventoryLotsProp,
    params: autoFetch ? HOMEPAGE_LOTS_PARAMS : undefined,
  });

  const inventoryLots = autoFetch ? fetchedLots : inventoryLotsProp || [];
  const allProducts = allProductsProp || [];
  const loading = autoFetch ? lotsLoading : loadingProp;

  const productById = useMemo(() => {
    if (allProducts.length) {
      const map = buildProductByIdMap(allProducts);
      for (const root of STATIC_ROOT_CATEGORIES) map.set(root.id, root);
      return map;
    }
    return productMapFromLots(inventoryLots);
  }, [allProducts, inventoryLots]);

  const canGroupByCategory = Boolean(showGroupToggle && allProducts.length > 0);

  const sellerVerificationMap = useMemo(
    () => buildSellerVerificationMap(inventoryLots),
    [inventoryLots]
  );

  const availableProducts = useMemo(
    () => buildAvailableProducts(inventoryLots, productById, { scopeCategoryId }),
    [inventoryLots, productById, scopeCategoryId]
  );

  const availableProductsByCategory = useMemo(
    () =>
      groupAvailableProducts(availableProducts, productById, language, {
        scopeCategoryId,
      }),
    [availableProducts, productById, language, scopeCategoryId]
  );

  const latestAvailableProducts = useMemo(
    () => getLatestAvailableProducts(availableProducts, 20),
    [availableProducts]
  );

  const landingProductIds = useMemo(
    () => availableProducts.map((e) => e.product?.id).filter(Boolean),
    [availableProducts]
  );
  const landingLinks = useProductLandingLinks(landingProductIds);

  const sectionTitle =
    title ||
    (scopeCategoryName
      ? t("latestAvailableInParent", { name: scopeCategoryName })
      : t("latestAvailableOnZareoon"));
  const scrollRowProps = {
    isRTL,
    showArrows: true,
    showDots: false,
    arrowPlacement: scopeCategoryId != null ? "bottom" : "center",
  };

  return (
    <section className={`${className}`.trim()} dir={isRTL ? "rtl" : "ltr"}>
      <div className="relative">
      <div className="mb-3 flex flex-col gap-3 px-0.5 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2 className="max-w-full text-start text-base font-bold leading-snug tracking-tight text-slate-900 sm:text-lg">
          {sectionTitle}
        </h2>
        {canGroupByCategory ? (
          <label className="inline-flex w-full cursor-pointer items-center justify-between gap-3 select-none sm:w-auto sm:justify-start">
            <span className="text-xs text-slate-600 sm:text-sm">{t("groupByCategory")}</span>
            <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={groupByCategory}
                onChange={(e) => setGroupByCategory(e.target.checked)}
              />
              <span className="absolute inset-0 rounded-full bg-slate-200 transition-colors peer-checked:bg-green-600" />
              <span className="absolute start-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
            </span>
          </label>
        ) : null}
      </div>

      {loading ? (
        <div aria-busy="true" aria-label="Loading">
          <ProductScrollSkeleton count={6} />
        </div>
      ) : availableProducts.length > 0 ? (
        groupByCategory && canGroupByCategory ? (
          <div className="space-y-4 lg:space-y-5">
            {availableProductsByCategory.map((group) => (
              <section key={group.id}>
                <h3 className="mb-2 px-1 text-start text-sm font-bold text-slate-800 sm:text-base">
                  {group.category ? getLocalizedText(group.category, language) : t("productCategories")}
                </h3>
                <HorizontalScrollRow {...scrollRowProps}>
                  {group.products.map((entry) => (
                    <AvailableProductCompactCard
                      key={entry.product.id}
                      {...entry}
                      language={language}
                      productById={productById}
                      className={CARD_CLASS}
                      hideCategory
                      isRTL={isRTL}
                      sellerVerificationMap={sellerVerificationMap}
                      href={productPublicHref(
                        entry.product,
                        landingLinks[String(entry.product.id)] || landingLinks[entry.product.id]
                      )}
                    />
                  ))}
                </HorizontalScrollRow>
              </section>
            ))}
          </div>
        ) : (
          <HorizontalScrollRow {...scrollRowProps}>
            {latestAvailableProducts.map((entry) => (
              <AvailableProductCompactCard
                key={entry.product.id}
                {...entry}
                language={language}
                productById={productById}
                sellerVerificationMap={sellerVerificationMap}
                className={CARD_CLASS}
                hideCategory={false}
                isRTL={isRTL}
                href={productPublicHref(
                  entry.product,
                  landingLinks[String(entry.product.id)] || landingLinks[entry.product.id]
                )}
              />
            ))}
          </HorizontalScrollRow>
        )
      ) : (
        <div className="py-8 text-center text-slate-500">
          <p className="text-sm text-slate-600 sm:text-base">{t("noProductsWithStock")}</p>
        </div>
      )}
      </div>
    </section>
  );
}
