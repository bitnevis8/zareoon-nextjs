"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import HorizontalScrollRow from "./HorizontalScrollRow";
import AvailableProductCompactCard from "./AvailableProductCompactCard";
import { getLocalizedText } from "../utils/localize";
import {
  buildAvailableProducts,
  buildProductByIdMap,
  getLatestAvailableProducts,
  groupAvailableProducts,
} from "../utils/availableProducts";
import { useFullCatalog, useInventoryLots, HOMEPAGE_LOTS_PARAMS } from "../hooks/useCatalogProducts";
import { ProductScrollSkeleton } from "./ui/Skeleton";

const CARD_CLASS =
  "shrink-0 w-[9.75rem] min-[380px]:w-[10.5rem] sm:w-[11.5rem] md:w-[12.25rem] lg:w-[12.75rem] snap-start";

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

  const { products: fetchedProducts, loading: productsLoading } = useFullCatalog({
    // Homepage: wait until section is shown; do not compete with root tiles.
    enabled: autoFetch && !allProductsProp,
  });
  const { lots: fetchedLots, loading: lotsLoading } = useInventoryLots({
    enabled: autoFetch && !inventoryLotsProp,
    params: autoFetch ? HOMEPAGE_LOTS_PARAMS : undefined,
  });

  const inventoryLots = autoFetch ? fetchedLots : inventoryLotsProp || [];
  const allProducts = autoFetch ? fetchedProducts : allProductsProp || [];
  const loading = autoFetch ? productsLoading || lotsLoading : loadingProp;

  const productById = useMemo(() => buildProductByIdMap(allProducts), [allProducts]);

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

  const isGlassVariant = variant === "homepage" || variant === "catalog";
  const sectionShellClass = isGlassVariant
    ? "relative overflow-hidden rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/55 via-white/40 to-slate-50/35 p-3 shadow-[0_8px_30px_rgba(16,185,129,0.08)] backdrop-blur-md sm:rounded-2xl sm:p-5"
    : "";

  return (
    <section className={`${sectionShellClass} ${className}`.trim()} dir={isRTL ? "rtl" : "ltr"}>
      {isGlassVariant ? (
        <div
          className="pointer-events-none absolute -start-8 -top-10 h-28 w-28 rounded-full bg-emerald-300/20 blur-2xl"
          aria-hidden
        />
      ) : null}
      {isGlassVariant ? (
        <div
          className="pointer-events-none absolute -bottom-10 -end-6 h-32 w-32 rounded-full bg-green-200/25 blur-2xl"
          aria-hidden
        />
      ) : null}

      <div className="relative">
      <div className="mb-3 flex flex-col gap-3 px-0.5 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2 className="text-start text-base font-bold leading-snug text-slate-900 sm:text-lg">
          {sectionTitle}
        </h2>
        {showGroupToggle ? (
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
        groupByCategory && showGroupToggle ? (
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
                className={CARD_CLASS}
                hideCategory={false}
                isRTL={isRTL}
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
