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

const CARD_CLASS = "shrink-0 w-[128px] sm:w-[148px] snap-start";

export default function LatestAvailableProductsSection({
  inventoryLots,
  allProducts,
  loading = false,
  scopeCategoryId = null,
  scopeCategoryName = null,
  title,
  showGroupToggle = true,
  className = "",
  variant = "plain",
}) {
  const { language, t, isRTL } = useLanguage();
  const [groupByCategory, setGroupByCategory] = useState(false);

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
    ? "relative overflow-hidden rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/55 via-white/40 to-slate-50/35 p-4 shadow-[0_8px_30px_rgba(16,185,129,0.08)] backdrop-blur-md sm:p-5"
    : "";

  return (
    <section className={`${sectionShellClass} ${className}`.trim()}>
      {isGlassVariant ? (
        <div
          className="pointer-events-none absolute -left-8 -top-10 h-28 w-28 rounded-full bg-emerald-300/20 blur-2xl"
          aria-hidden
        />
      ) : null}
      {isGlassVariant ? (
        <div
          className="pointer-events-none absolute -bottom-10 -right-6 h-32 w-32 rounded-full bg-green-200/25 blur-2xl"
          aria-hidden
        />
      ) : null}

      <div className="relative">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
        <h2 className={`text-lg lg:text-xl font-extrabold text-slate-900 ${isRTL ? "text-right" : "text-left"}`}>
          {sectionTitle}
        </h2>
        {showGroupToggle ? (
          <label className="inline-flex cursor-pointer items-center gap-2.5 select-none">
            <span className="text-xs sm:text-sm text-slate-600">{t("groupByCategory")}</span>
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
        <div className="flex gap-3 overflow-x-auto pb-1 product-scroll-row">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={`${CARD_CLASS} overflow-hidden rounded-xl border border-slate-200 bg-white animate-pulse`}
            >
              <div className="aspect-[4/3] bg-slate-200" />
              <div className="space-y-2 p-2">
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-2.5 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : availableProducts.length > 0 ? (
        groupByCategory && showGroupToggle ? (
          <div className="space-y-4 lg:space-y-5">
            {availableProductsByCategory.map((group) => (
              <section key={group.id}>
                <h3 className={`mb-2 px-1 text-base font-bold text-slate-800 ${isRTL ? "text-right" : "text-left"}`}>
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
          <p className="text-base">{t("noProductsWithStock")}</p>
        </div>
      )}
      </div>
    </section>
  );
}
