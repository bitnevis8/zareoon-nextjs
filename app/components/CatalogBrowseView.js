"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_ENDPOINTS } from "../config/api";
import { useLanguage } from "../context/LanguageContext";
import { getLocalizedText } from "../utils/localize";
import CatalogGuidePanel from "./CatalogGuidePanel";
import MainCategoryGrid from "./MainCategoryGrid";
import CatalogPdfDownload from "./catalog/CatalogPdfDownload";
import { sortCatalogItems } from "../utils/productSort";
import { getProductStockClass } from "../utils/stockUtils";

export default function CatalogBrowseView() {
  const { t, language, isRTL } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [inventoryLots, setInventoryLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [resCats, resAll, resLots] = await Promise.all([
          fetch(`${API_ENDPOINTS.supplier.products.getAll}?isOrderable=false&parentId=`, { cache: "no-store" }),
          fetch(API_ENDPOINTS.supplier.products.getAll, { cache: "no-store" }),
          fetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" }),
        ]);
        const dc = await resCats.json();
        const dall = await resAll.json();
        const dl = await resLots.json();
        setCategories(sortCatalogItems(dc.data || [], language));
        setAllProducts(dall.data || []);
        setInventoryLots(dl.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [language]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const res = await fetch(`${API_ENDPOINTS.supplier.products.getAll}?q=${encodeURIComponent(query)}&limit=20`, { cache: "no-store" });
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

        <div className="flex justify-center">
          <CatalogPdfDownload scope="full" label={t("downloadCatalogPdf")} />
        </div>

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
        <MainCategoryGrid categories={categories} loading={loading} />
        <p className="mt-4 text-center text-sm text-slate-500">{t("browseByCategoryHint")}</p>
      </section>

      {categories.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-slate-500 text-lg">{t("noCategoryRegistered")}</div>
          <p className="text-slate-400 text-sm mt-2">{t("pleaseVisitLater")}</p>
        </div>
      )}
    </main>
  );
}
