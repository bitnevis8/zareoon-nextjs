"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCardMedia from "./ui/ProductCardMedia";
import Image from "next/image";
import { API_ENDPOINTS } from "../config/api";
import { getProductStockClass, calculateAvailableStock } from "../utils/stockUtils";
import { useLanguage } from "../context/LanguageContext";
import { getLocalizedText, localizeUnit } from "../utils/localize";
import CatalogGuidePanel from "./CatalogGuidePanel";

export default function CatalogBrowseView() {
  const { t, language, isRTL } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [childrenMap, setChildrenMap] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [inventoryLots, setInventoryLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resCats = await fetch(`${API_ENDPOINTS.farmer.products.getAll}?isOrderable=false&parentId=`, { cache: "no-store" });
        const dc = await resCats.json();
        const roots = dc.data || [];
        setCategories(roots);

        const childPromises = roots.map(async (c) => {
          const res = await fetch(`${API_ENDPOINTS.farmer.products.getAll}?parentId=${c.id}`, { cache: "no-store" });
          const d = await res.json();
          return { parentId: c.id, items: d.data || [] };
        });
        const children = await Promise.all(childPromises);
        const map = {};
        let allProductsList = [...roots];

        for (const { parentId, items } of children) {
          map[parentId] = items;
          allProductsList = [...allProductsList, ...items];
        }

        const resLots = await fetch(API_ENDPOINTS.farmer.inventoryLots.getAll, { cache: "no-store" });
        const dl = await resLots.json();
        setInventoryLots(dl.data || []);

        setChildrenMap(map);
        setAllProducts(allProductsList);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const res = await fetch(`${API_ENDPOINTS.farmer.products.getAll}?q=${encodeURIComponent(query)}&limit=20`, { cache: "no-store" });
        const d = await res.json();
        setSearchResults(d.data || []);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-6 py-10 pb-24 lg:pb-10 space-y-8">
      <section className="text-center space-y-6">
        <div className="mb-4">
          <Image
            src="/images/logo.png"
            alt={t("siteName")}
            width={400}
            height={400}
            className="mx-auto object-contain w-48"
            priority
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{t("agriculturalProducts")}</h1>

        <p className="text-gray-600 max-w-2xl mx-auto">{t("agriculturalProductsDesc")}</p>

        <div className="relative max-w-md mx-auto">
          <input
            className="w-full border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <div className={`absolute z-10 left-0 right-0 mt-2 bg-white border rounded-xl shadow max-h-80 overflow-auto ${isRTL ? "text-right" : "text-left"}`}>
              {searching ? (
                <div className="p-4">
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between px-4 py-2 animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                        <div className="h-5 bg-gray-300 rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchResults.length ? (
                searchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/catalog/${item.id}`}
                    className={`flex items-center justify-between px-4 py-2 hover:bg-slate-50 ${getProductStockClass(item, allProducts, inventoryLots)}`}
                  >
                    <div className="text-sm font-medium text-slate-800">{getLocalizedText(item, language)}</div>
                    <span className="text-xs text-slate-400">{item.isOrderable ? t("product") : t("category")}</span>
                  </Link>
                ))
              ) : (
                <div className="p-3 text-sm text-slate-500">{t("nothingFound")}</div>
              )}
            </div>
          )}
        </div>
      </section>

      <section>
        <CatalogGuidePanel className="mb-4" />
        <h2 className="text-xl font-semibold mb-6 text-gray-800">{t("productCategories")}</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card bg-base-100 shadow-xl border animate-pulse">
                <figure className="h-64 w-full max-h-64 bg-gray-200 flex items-center justify-center">
                  <Image
                    src="/images/image-loader.webp"
                    alt={t("loading")}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain opacity-50"
                  />
                </figure>
                <div className="card-body p-4">
                  <div className="h-5 bg-gray-300 rounded w-24 mb-4"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded border"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`card bg-base-100 shadow-xl border hover:shadow-2xl transition-shadow ${getProductStockClass(category, allProducts, inventoryLots)}`}
              >
                <figure className="h-64 w-full max-h-64 bg-base-200 flex items-center justify-center overflow-hidden">
                  <ProductCardMedia
                    product={category}
                    alt={category.name}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </figure>
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="card-title text-base">{getLocalizedText(category, language)}</h3>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-slate-600 mb-2">{t("subcategoriesAndProducts")}</div>
                    <div className="space-y-2">
                      {(childrenMap[category.id] || []).slice(0, 4).map((child) => {
                        const availableStock = calculateAvailableStock(child, allProducts, inventoryLots);
                        return (
                          <Link
                            key={child.id}
                            href={`/catalog/${child.id}`}
                            className="stock-info-row flex items-center justify-between rounded-md px-3 py-2 border transition-colors"
                          >
                            <div className="text-sm">{getLocalizedText(child, language)}</div>
                            <div className="flex items-center gap-2">
                              {availableStock > 0 && (
                                <span className="text-xs text-green-600 font-medium">
                                  {availableStock.toLocaleString()} {localizeUnit("kg", language)}
                                </span>
                              )}
                              <span className="stock-type-label">{child.isOrderable ? t("product") : t("category")}</span>
                            </div>
                          </Link>
                        );
                      })}
                      {(childrenMap[category.id] || []).length > 4 && (
                        <Link
                          href={`/catalog/${category.id}`}
                          className="stock-view-all flex items-center justify-center rounded-md px-3 py-2 border border-dashed border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <span className="text-sm font-medium">
                            {t("viewAll")} ({childrenMap[category.id]?.length || 0})
                          </span>
                        </Link>
                      )}
                      {(childrenMap[category.id] || []).length === 0 && !loading && (
                        <span className="text-slate-400 text-xs">{t("noItemsRegistered")}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {categories.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-slate-500 text-lg">{t("noCategoryRegistered")}</div>
            <p className="text-slate-400 text-sm mt-2">{t("pleaseVisitLater")}</p>
          </div>
        )}
      </section>
    </main>
  );
}
