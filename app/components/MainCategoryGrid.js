"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../config/api";
import { useLanguage } from "../context/LanguageContext";
import { sortCatalogItems } from "../utils/productSort";
import CategoryTile from "./CategoryTile";

export default function MainCategoryGrid({
  categories: categoriesProp,
  loading: loadingProp,
  className = "",
  id,
}) {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState(categoriesProp || []);
  const [loading, setLoading] = useState(loadingProp ?? !categoriesProp);

  useEffect(() => {
    if (categoriesProp) {
      setCategories(categoriesProp);
      setLoading(Boolean(loadingProp));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.farmer.products.getAll}?isOrderable=false&parentId=`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled) setCategories(sortCatalogItems(data.data || [], language));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [categoriesProp, loadingProp, language]);

  if (loading) {
    return (
      <div className={`grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 ${className}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-2xl border bg-white p-3 sm:p-4">
            <div className="aspect-square rounded-xl bg-slate-200" />
            <div className="mx-auto mt-2 h-3 w-3/4 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <section id={id} className={className}>
      <h2 className="mb-3 text-center text-base font-bold text-slate-800 sm:text-lg">{t("productCategories")}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {categories.map((category) => (
          <CategoryTile key={category.id} item={category} language={language} />
        ))}
      </div>
    </section>
  );
}
