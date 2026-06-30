"use client";
import { Suspense, useEffect, useState, useMemo } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { API_ENDPOINTS } from './config/api';
import { useAuth } from './context/AuthContext';
import { useLanguage, siteIntroByLang } from './context/LanguageContext';
import { getLocalizedText } from './utils/localize';
import { sortCatalogItems } from './utils/productSort';
import MainCategoryGrid from './components/MainCategoryGrid';
import LatestAvailableProductsSection from './components/LatestAvailableProductsSection';
import ZareoonExclusiveServices from './components/ZareoonExclusiveServices';

const languageOptions = [
  { code: "fa", label: "فارسی", shortLabel: "FA", icon: "IR" },
  { code: "en", label: "English", shortLabel: "EN", icon: "EN" },
  { code: "ru", label: "Русский", shortLabel: "RU", icon: "RU" },
];

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
  
  // Check user roles for bottom bar
  const userRoles = auth?.user?.roles?.map(role => role.nameEn) || [];
  const isFarmer = userRoles.includes('Farmer') || userRoles.includes('farmer');
  const isSupplier = userRoles.includes('Supplier') || userRoles.includes('supplier');
  const isBargeCollector = userRoles.includes('BargeCollector') || userRoles.includes('bargeCollector');
  const isSupervisor = userRoles.includes('Supervisor') || userRoles.includes('supervisor');
  const isAdmin = userRoles.includes('Administrator') || userRoles.includes('administrator');
  const canAddProduct = isAdmin || isFarmer || isSupplier || isBargeCollector || isSupervisor;
  
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
        fetch(`${API_ENDPOINTS.farmer.products.getAll}?isOrderable=false&parentId=`, { cache: 'no-store' }),
        fetch(API_ENDPOINTS.farmer.inventoryLots.getAll, { cache: 'no-store' }),
        fetch(API_ENDPOINTS.farmer.products.getAll, { cache: 'no-store' }),
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
        const res = await fetch(`${API_ENDPOINTS.farmer.products.getAll}?q=${encodeURIComponent(query)}&limit=20`, { cache: 'no-store' });
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
        const r = await fetch(`${API_ENDPOINTS.farmer.cart.base}/me`, { cache: 'no-store', credentials: 'include' });
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
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">
            {languageOptions.map((option) => {
              const isActive = language === option.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setLanguage(option.code)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "border-green-600 bg-green-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  aria-pressed={isActive}
                  title={option.label}
                >
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    {option.icon}
                  </span>
                  <span>{option.shortLabel}</span>
                </button>
              );
            })}
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
        <div className="mx-auto max-w-[46.2rem] space-y-1.5 px-2" suppressHydrationWarning>
          <p
            className={`text-sm sm:text-base leading-7 ${
              !isHydrated || language === "fa"
                ? "font-medium text-slate-700"
                : "text-slate-500"
            }`}
          >
            {siteIntroByLang.fa}
          </p>
          <p
            className={`text-xs sm:text-sm leading-6 ${
              isHydrated && language === "en"
                ? "font-medium text-slate-700"
                : "text-slate-500"
            }`}
            dir="ltr"
            suppressHydrationWarning
          >
            {siteIntroByLang.en}
          </p>
          <p
            className={`text-xs sm:text-sm leading-6 ${
              isHydrated && language === "ru"
                ? "font-medium text-slate-700"
                : "text-slate-500"
            }`}
            dir="ltr"
            suppressHydrationWarning
          >
            {siteIntroByLang.ru}
          </p>
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

        <div className="w-full max-w-5xl mx-auto mt-5">
          <ZareoonExclusiveServices />
        </div>
      </section>


    </main>
  );
}
