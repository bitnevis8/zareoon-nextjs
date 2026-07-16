"use client";

import { useMemo } from "react";
import { useLanguage } from "../context/LanguageContext";
import { sortCatalogItems } from "../utils/productSort";
import { STATIC_ROOT_CATEGORIES } from "../data/staticRootCategories";
import CategoryTile from "./CategoryTile";

/**
 * Homepage root grid — static data only (no API / no skeleton).
 * Children are warmed in the background by useSiteCatalogWarmup in SiteChrome.
 */
export default function MainCategoryGrid({
  categories: categoriesProp,
  className = "",
  id,
}) {
  const { language, t } = useLanguage();

  const categories = useMemo(() => {
    const raw = categoriesProp?.length ? categoriesProp : STATIC_ROOT_CATEGORIES;
    return sortCatalogItems(raw, language);
  }, [categoriesProp, language]);

  if (!categories.length) return null;

  return (
    <section id={id} className={className}>
      <h2 className="mb-3 px-1 text-center text-base font-bold text-slate-800 sm:mb-4 sm:text-lg">
        {t("productCategories")}
      </h2>
      <div className="grid grid-cols-2 gap-2.5 min-[380px]:grid-cols-3 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6">
        {categories.map((category) => (
          <CategoryTile key={category.id} item={category} language={language} />
        ))}
      </div>
    </section>
  );
}
