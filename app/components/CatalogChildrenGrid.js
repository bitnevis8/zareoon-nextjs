"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import CategoryTile from "./CategoryTile";
import ProductImage from "./ui/ProductImage";
import CardsPerRowSelect from "./ui/CardsPerRowSelect";
import { useLanguage } from "../context/LanguageContext";
import { sortCatalogItems } from "../utils/productSort";
import { getLocalizedText } from "../utils/localize";
import { getProductStockClass, calculateAvailableStock } from "../utils/stockUtils";
import { formatLocalizedNumber, localizeUnit } from "../utils/localize";
import { hasCategoryImage } from "../utils/mainCategoryIcons";
import {
  DEFAULT_CARDS_PER_ROW,
  getCardsPerRowGridClass,
  readStoredCardsPerRow,
  writeStoredCardsPerRow,
} from "../utils/cardsPerRow";

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "default", labelKey: "catalogSortDefault" },
  { value: "name_asc", labelKey: "catalogSortNameAsc" },
  { value: "name_desc", labelKey: "catalogSortNameDesc" },
  { value: "stock_desc", labelKey: "catalogSortStockDesc" },
  { value: "stock_asc", labelKey: "catalogSortStockAsc" },
];

function AvailabilitySwitch({ value, onChange, availableLabel, unavailableLabel }) {
  return (
    <div className="inline-flex h-9 overflow-hidden rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("available")}
        className={`rounded-lg px-2.5 text-[11px] font-bold transition sm:px-3 sm:text-xs ${
          value === "available" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        {availableLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("unavailable")}
        className={`rounded-lg px-2.5 text-[11px] font-bold transition sm:px-3 sm:text-xs ${
          value === "unavailable" ? "bg-slate-700 text-white" : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        {unavailableLabel}
      </button>
    </div>
  );
}

function ViewModeSwitch({ value, onChange, cardsLabel, listLabel }) {
  return (
    <div className="inline-flex h-9 overflow-hidden rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("cards")}
        aria-pressed={value === "cards"}
        className={`rounded-lg px-2.5 text-[11px] font-bold transition sm:text-xs ${
          value === "cards" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        {cardsLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-pressed={value === "list"}
        className={`rounded-lg px-2.5 text-[11px] font-bold transition sm:text-xs ${
          value === "list" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        {listLabel}
      </button>
    </div>
  );
}

function sortLeafItems(items, sort, language, allProducts, inventoryLots) {
  const list = [...items];
  const nameOf = (item) => getLocalizedText(item, language) || "";
  const stockOf = (item) => calculateAvailableStock(item, allProducts, inventoryLots);

  if (sort === "name_asc") return list.sort((a, b) => nameOf(a).localeCompare(nameOf(b), "fa"));
  if (sort === "name_desc") return list.sort((a, b) => nameOf(b).localeCompare(nameOf(a), "fa"));
  if (sort === "stock_desc") return list.sort((a, b) => stockOf(b) - stockOf(a));
  if (sort === "stock_asc") return list.sort((a, b) => stockOf(a) - stockOf(b));
  return sortCatalogItems(list, language);
}

function LeafProductListRow({ item, language, stock, stockClass }) {
  const label = getLocalizedText(item, language);
  return (
    <li className={`border-b border-slate-100 last:border-0 ${stockClass}`}>
      <Link
        href={`/catalog/${item.id}`}
        className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-emerald-50/50 active:bg-emerald-50"
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
          {hasCategoryImage(item) ? (
            <ProductImage
              slug={item.slug}
              imageUrl={item.imageUrl}
              alt={label}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">—</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{label}</p>
          <p className="mt-0.5 text-[11px] font-medium text-emerald-700">
            {stock > 0
              ? `${formatLocalizedNumber(stock, language)} ${localizeUnit("kg", language)}`
              : "—"}
          </p>
        </div>
        <span className="shrink-0 text-slate-300" aria-hidden>
          ‹
        </span>
      </Link>
    </li>
  );
}

/** بخش نهایی: فقط محصولات برگ (مثل انواع خرما) */
function LeafVarietiesSection({
  products,
  parentItem,
  allProducts,
  inventoryLots,
  language,
  t,
}) {
  const parentName = parentItem ? getLocalizedText(parentItem, language) : "";
  const [availability, setAvailability] = useState("available");
  const [viewMode, setViewMode] = useState("cards");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [cardsPerRow, setCardsPerRow] = useState(DEFAULT_CARDS_PER_ROW);

  useEffect(() => {
    setCardsPerRow(readStoredCardsPerRow());
  }, []);

  useEffect(() => {
    setPage(1);
  }, [availability, sort, products]);

  const handleCardsPerRowChange = (n) => {
    setCardsPerRow(writeStoredCardsPerRow(n));
  };

  const filtered = useMemo(() => {
    const base = products.filter((item) => {
      const stock = calculateAvailableStock(item, allProducts, inventoryLots);
      return availability === "available" ? stock > 0 : stock <= 0;
    });
    return sortLeafItems(base, sort, language, allProducts, inventoryLots);
  }, [products, availability, sort, language, allProducts, inventoryLots]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const title = parentName
    ? t("varietiesOfParent", { name: parentName }) || `انواع ${parentName}`
    : t("productLabelPlural");

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-slate-800 sm:text-lg">{title}</h2>
          <AvailabilitySwitch
            value={availability}
            onChange={setAvailability}
            availableLabel={t("stockAvailable") || "موجود"}
            unavailableLabel={t("stockUnavailable") || "ناموجود"}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm outline-none focus:border-emerald-400"
            aria-label={t("catalogSortLabel") || "ترتیب نمایش"}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.labelKey) || o.value}
              </option>
            ))}
          </select>
          <ViewModeSwitch
            value={viewMode}
            onChange={setViewMode}
            cardsLabel={t("viewModeCards") || "کارتی"}
            listLabel={t("viewModeList") || "سطری"}
          />
          {viewMode === "cards" ? (
            <CardsPerRowSelect
              value={cardsPerRow}
              onChange={handleCardsPerRowChange}
              label={t("cardsPerRowLabel") || "در هر سطر"}
            />
          ) : null}
        </div>
      </div>

      <p className="text-[11px] font-medium text-slate-500">
        {t("catalogShowingCount", { count: formatLocalizedNumber(filtered.length, language) })}
      </p>

      {pageItems.length === 0 ? (
        <p className="rounded-xl border bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          {availability === "available"
            ? t("noProductsWithStock")
            : t("noUnavailableProducts") || "مورد ناموجودی یافت نشد."}
        </p>
      ) : viewMode === "cards" ? (
        <div className={getCardsPerRowGridClass(cardsPerRow)}>
          {pageItems.map((item) => {
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
          })}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {pageItems.map((item) => (
            <LeafProductListRow
              key={item.id}
              item={item}
              language={language}
              stock={calculateAvailableStock(item, allProducts, inventoryLots)}
              stockClass={getProductStockClass(item, allProducts, inventoryLots)}
            />
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 disabled:opacity-40"
          >
            {t("catalogPrevPage") || "قبلی"}
          </button>
          <span className="text-xs font-semibold tabular-nums text-slate-600">
            {formatLocalizedNumber(safePage, language)} / {formatLocalizedNumber(totalPages, language)}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 disabled:opacity-40"
          >
            {t("catalogNextPage") || "بعدی"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function SubcategoriesSection({
  subcategories,
  parentItem,
  allProducts,
  inventoryLots,
  language,
  t,
  isRTL,
}) {
  const [availability, setAvailability] = useState("available");
  const [cardsPerRow, setCardsPerRow] = useState(DEFAULT_CARDS_PER_ROW);

  useEffect(() => {
    setCardsPerRow(readStoredCardsPerRow());
  }, []);

  const handleCardsPerRowChange = (n) => {
    setCardsPerRow(writeStoredCardsPerRow(n));
  };

  const visible = useMemo(() => {
    return subcategories.filter((item) => {
      const stock = calculateAvailableStock(item, allProducts, inventoryLots);
      return availability === "available" ? stock > 0 : stock <= 0;
    });
  }, [availability, subcategories, allProducts, inventoryLots]);

  const title = parentItem
    ? t("subcategoriesOfParent", { name: getLocalizedText(parentItem, language) })
    : t("subcategories");

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className={`text-base font-semibold text-slate-800 sm:text-lg ${isRTL ? "order-1" : "order-2"}`}>
          {title}
        </h2>
        <div className={`flex flex-wrap items-center gap-2 ${isRTL ? "order-2" : "order-1"}`}>
          <AvailabilitySwitch
            value={availability}
            onChange={setAvailability}
            availableLabel={t("stockAvailable") || "موجود"}
            unavailableLabel={t("stockUnavailable") || "ناموجود"}
          />
          <CardsPerRowSelect
            value={cardsPerRow}
            onChange={handleCardsPerRowChange}
            label={t("cardsPerRowLabel") || "در هر سطر"}
          />
        </div>
      </div>

      {visible.length > 0 ? (
        <div className={getCardsPerRowGridClass(cardsPerRow)}>
          {visible.map((item) => {
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
          })}
        </div>
      ) : (
        <p className="rounded-xl border bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
          {availability === "available"
            ? t("noProductsWithStock")
            : t("noUnavailableProducts") || "مورد ناموجودی یافت نشد."}
        </p>
      )}
    </section>
  );
}

/**
 * برای صفحهٔ میوه: زیردسته‌ها
 * برای صفحهٔ نهایی مثل خرما (فقط برگ‌ها): انواع + کارتی/سطری + صفحه‌بندی
 * اگر هم زیردسته و هم برگ بود: زیردسته‌ها جدا، برگ‌ها با عنوان انواع
 */
export default function CatalogChildrenGrid({
  items = [],
  allProducts = [],
  inventoryLots = [],
  parentItem = null,
}) {
  const { language, t, isRTL } = useLanguage();

  const { subcategories, products } = useMemo(() => {
    const subs = sortCatalogItems(items.filter((c) => !c.isOrderable), language);
    const prods = sortCatalogItems(items.filter((c) => c.isOrderable), language);
    return { subcategories: subs, products: prods };
  }, [items, language]);

  if (!subcategories.length && !products.length) return null;

  return (
    <div className="space-y-6">
      {subcategories.length > 0 ? (
        <SubcategoriesSection
          subcategories={subcategories}
          parentItem={parentItem}
          allProducts={allProducts}
          inventoryLots={inventoryLots}
          language={language}
          t={t}
          isRTL={isRTL}
        />
      ) : null}

      {products.length > 0 ? (
        <LeafVarietiesSection
          products={products}
          parentItem={parentItem}
          allProducts={allProducts}
          inventoryLots={inventoryLots}
          language={language}
          t={t}
        />
      ) : null}
    </div>
  );
}

/** آیا این صفحهٔ دسته فقط محصول برگ دارد؟ (مثل خرما) — برای مخفی کردن باکس جدیدترین‌ها */
export function isFinalCatalogCategory(children = []) {
  if (!children.length) return false;
  return children.every((c) => c.isOrderable);
}
