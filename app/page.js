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
import MainCategoryGrid from './components/MainCategoryGrid';
import LatestAvailableProductsSection from './components/LatestAvailableProductsSection';
import ZareoonExclusiveServices from './components/ZareoonExclusiveServices';
import BuyerSellerPortal from './components/BuyerSellerPortal';
import LanguageFlag from './components/ui/LanguageFlag';
import { SITE_LANGUAGES, SITE_INTRO_ORDER, isRtlLanguage } from './config/siteLanguages';

export default function Home() {
  return (
    <Suspense fallback={<main className="page-shell py-8 animate-pulse min-h-[40vh]" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const auth = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [inventoryLots, setInventoryLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

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
  }, [language]);

  useEffect(() => {
    const timer = setTimeout(async () => {
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
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const r = await authFetch(`${API_ENDPOINTS.supplier.cart.base}/me`, { cache: 'no-store' });
        const j = await r.json();
        const items = j?.data?.items || [];
        let sum = 0;
        for (const it of items) {
          const qty = parseFloat(it.quantity || 0);
          if (Number.isFinite(qty)) sum += qty;
        }
      } catch {}
    };
    fetchCart();
  }, [auth?.user]);

  const sortedCategories = useMemo(
    () => sortCatalogItems(categories, language),
    [categories, language]
  );

  return (
    <main className="page-shell pb-6 sm:pt-4 sm:pb-8 lg:pb-10 lg:pt-4 section-stack">
      <section className="text-center space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="flex justify-center max-lg:mt-1">
          <div
            className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-2 py-2 shadow-sm sm:gap-2 sm:rounded-full sm:px-3"
            role="group"
            aria-label="Language"
          >
            {SITE_LANGUAGES.map((option) => {
              const isActive = language === option.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setLanguage(option.code)}
                  className={`inline-flex min-h-[3.25rem] min-w-[3.25rem] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-1.5 text-[10px] font-semibold leading-none transition-all sm:min-h-0 sm:min-w-0 sm:flex-row sm:gap-1.5 sm:rounded-full sm:px-3 sm:py-2 sm:text-sm ${
                    isActive
                      ? "border-green-600 bg-green-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  aria-pressed={isActive}
                  aria-label={option.label}
                  title={option.label}
                >
                  <LanguageFlag countryCode={option.countryCode} className="h-5 w-7 sm:h-4 sm:w-6" />
                  <span className="tracking-wide">{option.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-2">
          <Image
            src="/images/logo.png"
            alt={t("siteName")}
            width={800}
            height={800}
            className="mx-auto h-auto w-40 object-contain sm:w-56 md:w-64 lg:w-72"
            priority
          />
        </div>

        <div className="relative mx-auto w-full max-w-xl px-1 sm:px-2">
          <input
            className="w-full min-h-11 rounded-full border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:px-5 sm:text-sm"
            placeholder={t("searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            enterKeyHint="search"
            autoComplete="off"
          />
          {q ? (
            <div
              className={`absolute z-20 inset-x-0 mt-2 max-h-[min(20rem,55vh)] overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {searching ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between px-3 py-2.5 animate-pulse">
                      <div className="h-4 w-32 rounded bg-slate-200" />
                      <div className="h-4 w-12 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : results.length ? (
                results.map((it) => (
                  <Link
                    key={it.id}
                    href={`/catalog/${it.id}`}
                    className="flex min-h-11 items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50 active:bg-slate-100"
                  >
                    <div className="min-w-0 flex-1 text-sm font-medium leading-snug text-slate-800 break-words">
                      {getLocalizedText(it, language)}
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {it.isOrderable ? t("product") : t("category")}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-sm text-slate-500">{t("nothingFound")}</div>
              )}
            </div>
          ) : null}
        </div>

        <div className="mx-auto w-full max-w-3xl space-y-1 px-2" suppressHydrationWarning>
          {SITE_INTRO_ORDER.map((code) => {
            const isActive = language === code;
            const rtl = isRtlLanguage(code);
            return (
              <p
                key={code}
                dir={rtl ? "rtl" : "ltr"}
                lang={code}
                className={`text-pretty text-center leading-relaxed ${
                  isActive
                    ? "text-sm font-medium text-slate-700 sm:text-base"
                    : "text-xs text-slate-500 sm:text-sm"
                }`}
                suppressHydrationWarning
              >
                {siteIntroByLang[code]}
              </p>
            );
          })}
        </div>

        <MainCategoryGrid
          categories={sortedCategories}
          loading={loading}
          className="w-full"
          id="product-categories"
        />

        <div id="latest-available" className="w-full scroll-mt-20">
          <LatestAvailableProductsSection
            inventoryLots={inventoryLots}
            allProducts={allProducts}
            loading={loading}
            variant="homepage"
          />
        </div>

        <BuyerSellerPortal className="w-full" />
        <ZareoonExclusiveServices className="w-full" />
      </section>
    </main>
  );
}
