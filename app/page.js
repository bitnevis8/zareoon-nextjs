"use client";
import { Suspense, useEffect, useState, useMemo } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { API_ENDPOINTS } from './config/api';
import { useAuth } from './context/AuthContext';
import { useLanguage, siteIntroByLang } from './context/LanguageContext';
import { getLocalizedText } from './utils/localize';
import { sortCatalogItems } from './utils/productSort';
import { authFetch } from './utils/authHeaders';
import { shouldShowSupplierPanel } from './utils/roles';
import MainCategoryGrid from './components/MainCategoryGrid';
import LatestAvailableProductsSection from './components/LatestAvailableProductsSection';
import ZareoonExclusiveServices from './components/ZareoonExclusiveServices';
import BuyerSellerPortal from './components/BuyerSellerPortal';
import LanguageFlag from './components/ui/LanguageFlag';
import { SITE_LANGUAGES, SITE_INTRO_ORDER, isRtlLanguage } from './config/siteLanguages';

export default function Home() {
  return (
    <Suspense fallback={<main className="max-w-6xl mx-auto px-3 sm:px-6 py-8 animate-pulse min-h-[40vh]" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const auth = useAuth();
  const { language, setLanguage, t, isRTL, isHydrated } = useLanguage();
  
  const canAddProduct = shouldShowSupplierPanel(auth?.user);
  
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [inventoryLots, setInventoryLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [cartTotalQty, setCartTotalQty] = useState(0);

  useEffect(() => {
    (async () => {
      const [resCats, resLots, resAll] = await Promise.all([
        fetch(`${API_ENDPOINTS.supplier.products.getAll}?isOrderable=false&parentId=`, { cache: 'no-store' }),
        fetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: 'no-store' }),
        fetch(API_ENDPOINTS.supplier.products.getAll, { cache: 'no-store' }),
      ]);

      const dc = await resCats.json();
      const dl = await resLots.json();
      const dAll = await resAll.json();
      const allProductsList = dAll.data || [];
      const roots = sortCatalogItems(dc.data || [], language);

      setCategories(roots);
      setInventoryLots(dl.data || []);
      setAllProducts(allProductsList);
      setLoading(false);
    })();
  }, []);

  // simple debounced search across products/categories
  useEffect(() => {
    const t = setTimeout(async () => {
      const query = q.trim();
      if (!query) { setResults([]); return; }
      setSearching(true);
      try {
        const res = await fetch(`${API_ENDPOINTS.supplier.products.getAll}?q=${encodeURIComponent(query)}&limit=20`, { cache: 'no-store' });
        const d = await res.json();
        setResults(d.data || []);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // Load cart info
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const r = await authFetch(`${API_ENDPOINTS.supplier.cart.base}/me`, { cache: 'no-store' });
        const j = await r.json();
        const items = j?.data?.items || [];
        let sum = 0;
        for (const it of items) {
          const q = parseFloat(it.quantity || 0);
          if (Number.isFinite(q)) sum += q;
        }
        setCartTotalQty(sum);
      } catch {}
    };
    fetchCart();
  }, []);

  const sortedCategories = useMemo(
    () => sortCatalogItems(categories, language),
    [categories, language]
  );

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-4 pb-1 lg:pb-4 space-y-6 lg:space-y-8 overflow-x-hidden">
      <section className="text-center space-y-6 lg:space-y-10">
        <div className="flex justify-center px-1">
          <div className="w-full max-w-3xl overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="inline-flex min-w-min flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">
            {SITE_LANGUAGES.map((option) => {
              const isActive = language === option.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setLanguage(option.code)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm font-medium transition-all ${
                    isActive
                      ? "border-green-600 bg-green-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  aria-pressed={isActive}
                  aria-label={option.label}
                  title={option.label}
                >
                  <LanguageFlag countryCode={option.countryCode} />
                  <span className="tracking-wide">{option.shortLabel}</span>
                </button>
              );
            })}
            </div>
          </div>
        </div>
        <div className="mb-2">
        <Image
      src="/images/logo.png"
      alt={t("siteName")}
      width={800}   // w-96 = 384px
      height={800}
      className="mx-auto object-contain w-80"
      priority
    />
        </div>
        <div className="relative max-w-xl mx-auto w-full px-2">
          <input
            className="w-full border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("searchPlaceholder")}
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
          {q && (
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
              ) : results.length ? (
                results.map((it) => (
                  <Link key={it.id} href={`/catalog/${it.id}`} className="flex items-center justify-between px-4 py-2 hover:bg-slate-50">
                    <div className="text-sm font-medium text-slate-800">{getLocalizedText(it, language)}</div>
                    <span className="text-xs text-slate-400">{it.isOrderable ? t("product") : t("category")}</span>
                  </Link>
                ))
              ) : (
                <div className="p-3 text-sm text-slate-500">{t("nothingFound")}</div>
              )}
            </div>
          )}
        </div>
        <div className="mx-auto w-full max-w-4xl space-y-1.5 px-1" suppressHydrationWarning>
          {SITE_INTRO_ORDER.map((code) => {
            const isActive = language === code;
            const rtl = isRtlLanguage(code);
            return (
              <div
                key={code}
                className="flex w-full justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <p
                  dir={rtl ? "rtl" : "ltr"}
                  lang={code}
                  className={`whitespace-nowrap text-center ${
                    isActive
                      ? "text-sm sm:text-base font-medium text-slate-700"
                      : "text-xs sm:text-sm text-slate-500"
                  }`}
                  suppressHydrationWarning
                >
                  {siteIntroByLang[code]}
                </p>
              </div>
            );
          })}
        </div>

        <MainCategoryGrid
          categories={sortedCategories}
          loading={loading}
          className="w-full max-w-5xl mx-auto"
          id="product-categories"
        />

        <div id="latest-available" className="w-full max-w-5xl mx-auto mt-4">
          <LatestAvailableProductsSection
            inventoryLots={inventoryLots}
            allProducts={allProducts}
            loading={loading}
            variant="homepage"
          />
        </div>

        <BuyerSellerPortal className="w-full max-w-5xl mx-auto mt-5" />
        <ZareoonExclusiveServices className="w-full max-w-5xl mx-auto mt-5" />
      </section>


    </main>
  );
}
