"use client";

import { useMemo, useState } from "react";
import CategoryTile from "./CategoryTile";
import { useLanguage } from "../context/LanguageContext";
import { sortCatalogItems } from "../utils/productSort";
import { getLocalizedText } from "../utils/localize";
import { getProductStockClass, calculateAvailableStock } from "../utils/stockUtils";
import { formatLocalizedNumber, localizeUnit } from "../utils/localize";

function StockFilterToggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 select-none">
      <span className="text-xs sm:text-sm text-slate-600">{label}</span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="absolute inset-0 rounded-full bg-slate-200 transition-colors peer-checked:bg-green-600" />
        <span className="absolute start-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
      </span>
    </label>
  );
}

export default function CatalogChildrenGrid({
  items = [],
  allProducts = [],
  inventoryLots = [],
  parentItem = null,
}) {
  const { language, t, isRTL } = useLanguage();
  const [onlyWithStock, setOnlyWithStock] = useState(false);

  const { subcategories, products } = useMemo(() => {
    const subs = sortCatalogItems(items.filter((c) => !c.isOrderable), language);
    const prods = sortCatalogItems(items.filter((c) => c.isOrderable), language);
    return { subcategories: subs, products: prods };
  }, [items, language]);

  const visibleSubcategories = useMemo(() => {
    if (!onlyWithStock) return subcategories;
    return subcategories.filter(
      (item) => calculateAvailableStock(item, allProducts, inventoryLots) > 0
    );
  }, [onlyWithStock, subcategories, allProducts, inventoryLots]);

  const visibleProducts = useMemo(() => {
    if (!onlyWithStock) return products;
    return products.filter(
      (item) => calculateAvailableStock(item, allProducts, inventoryLots) > 0
    );
  }, [onlyWithStock, products, allProducts, inventoryLots]);

  const renderTile = (item) => {
    const availableStock = calculateAvailableStock(item, allProducts, inventoryLots);
    const stockClass = getProductStockClass(item, allProducts, inventoryLots);
    const meta =
      availableStock > 0
        ? `${formatLocalizedNumber(availableStock, language)} ${localizeUnit("kg", language)}`
        : null;

    return (
      <CategoryTile
        key={item.id}
        item={item}
        language={language}
        stockClass={stockClass}
        meta={meta}
      />
    );
  };

  if (!subcategories.length && !products.length) return null;

  const sectionHeader = (title) => (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <h2
        className={`text-base font-semibold text-slate-800 sm:text-lg ${isRTL ? "order-1" : "order-2"}`}
      >
        {title}
      </h2>
      <div className={isRTL ? "order-2" : "order-1"}>
        <StockFilterToggle
          checked={onlyWithStock}
          onChange={setOnlyWithStock}
          label={t("showOnlyWithStock")}
        />
      </div>
    </div>
  );

  const subcategoriesTitle = parentItem
    ? t("subcategoriesOfParent", { name: getLocalizedText(parentItem, language) })
    : t("subcategories");

  return (
    <div className="space-y-6">
      {subcategories.length > 0 ? (
        <section>
          {sectionHeader(subcategoriesTitle)}
          {visibleSubcategories.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleSubcategories.map((item) => renderTile(item))}
            </div>
          ) : onlyWithStock ? (
            <p className="rounded-xl border bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
              {t("noProductsWithStock")}
            </p>
          ) : null}
        </section>
      ) : null}

      {products.length > 0 ? (
        <section>
          {subcategories.length === 0
            ? sectionHeader(t("productLabelPlural"))
            : (
              <h2 className="mb-3 text-base font-semibold text-slate-800 sm:text-lg">
                {t("productLabelPlural")}
              </h2>
            )}
          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleProducts.map((item) => renderTile(item))}
            </div>
          ) : onlyWithStock && subcategories.length === 0 ? (
            <p className="rounded-xl border bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              {t("noProductsWithStock")}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
