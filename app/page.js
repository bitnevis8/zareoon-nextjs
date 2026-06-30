"use client";
import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import Link from 'next/link';
import ProductCardMedia from './components/ui/ProductCardMedia';
import Image from 'next/image';
import { useRouter, useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from './config/api';
import { getProductStockClass, calculateAvailableStock } from './utils/stockUtils';
import { useAuth } from './context/AuthContext';
import { useLanguage, siteIntroByLang } from './context/LanguageContext';
import CatalogGuidePanel from './components/CatalogGuidePanel';
import AryaFouladAd from './components/AryaFouladAd';
import ZareoonLcAd from './components/ZareoonLcAd';
import { formatLocalizedPrice, formatLocalizedNumber, getLocalizedLotLabel, getLocalizedText, localizeUnit } from './utils/localize';

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
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [childrenMap, setChildrenMap] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [inventoryLots, setInventoryLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [cartTotalQty, setCartTotalQty] = useState(0);
  const [viewMode, setViewMode] = useState('available'); // 'available' | 'all'

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'all' || view === 'available') {
      setViewMode(view);
    }
  }, [searchParams]);

  const changeViewMode = useCallback(
    (mode) => {
      setViewMode(mode);
      const query = mode === 'all' ? '/?view=all' : '/?view=available';
      router.replace(query, { scroll: false });
    },
    [router]
  );

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
      const roots = dc.data || [];
      const allProductsList = dAll.data || [];

      setCategories(roots);

      const childPromises = roots.map(async (c) => {
        const res = await fetch(`${API_ENDPOINTS.farmer.products.getAll}?parentId=${c.id}`, { cache: 'no-store' });
        const d = await res.json();
        return { parentId: c.id, items: d.data || [] };
      });
      const children = await Promise.all(childPromises);
      const map = {};
      for (const { parentId, items } of children) {
        map[parentId] = items;
      }

      setInventoryLots(dl.data || []);
      setChildrenMap(map);
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

  const productById = useMemo(() => {
    const map = new Map();
    for (const p of allProducts) map.set(p.id, p);
    return map;
  }, [allProducts]);

  const getProductPath = (product) => {
    if (!product) return '';
    const parts = [getLocalizedText(product, language)];
    let current = product;
    while (current?.parentId) {
      const parent = productById.get(current.parentId);
      if (!parent) break;
      parts.unshift(getLocalizedText(parent, language));
      current = parent;
    }
    return parts.join(' › ');
  };

  const availableProducts = useMemo(() => {
    const grouped = new Map();

    for (const lot of inventoryLots) {
      const total = parseFloat(lot.totalQuantity || 0);
      const reserved = parseFloat(lot.reservedQuantity || 0);
      const availableQty = total - reserved;
      if (!Number.isFinite(availableQty) || availableQty <= 0) continue;

      const product = productById.get(lot.productId);
      if (!product) continue;

      if (!grouped.has(product.id)) {
        grouped.set(product.id, { product, lots: [], totalAvailable: 0 });
      }
      const entry = grouped.get(product.id);
      entry.lots.push({
        id: lot.id,
        englishName: lot.englishName || null,
        russianName: lot.russianName || null,
        arabicName: lot.arabicName || null,
        qualityGrade: lot.qualityGrade || 'بدون درجه',
        availableQty,
        unit: lot.unit || 'kg',
        price: lot.price,
      });
      entry.totalAvailable += availableQty;
    }

    return Array.from(grouped.values())
      .sort((a, b) => getLocalizedText(a.product, language).localeCompare(getLocalizedText(b.product, language), language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'fa'));
  }, [inventoryLots, productById, language]);

  const availableProductsByCategory = useMemo(() => {
    const groups = new Map();

    for (const entry of availableProducts) {
      const parentId = entry.product?.parentId;
      const category = parentId ? productById.get(parentId) : null;
      const key = parentId ?? "other";

      if (!groups.has(key)) {
        groups.set(key, { id: key, category, products: [] });
      }
      groups.get(key).products.push(entry);
    }

    return Array.from(groups.values()).sort((a, b) => {
      const nameA = a.category ? getLocalizedText(a.category, language) : "";
      const nameB = b.category ? getLocalizedText(b.category, language) : "";
      return nameA.localeCompare(nameB, language === "ru" ? "ru" : language === "en" ? "en" : "fa");
    });
  }, [availableProducts, productById, language]);

  const renderAvailableProductCard = ({ product, lots, totalAvailable }, className = "", compact = false) => (
    <Link
      key={product.id}
      href={`/catalog/${product.id}`}
      className={`card bg-base-100 shadow-xl border hover:shadow-2xl transition-shadow ${getProductStockClass(product, allProducts, inventoryLots)} ${className}`}
    >
      <figure className="h-40 sm:h-48 w-full bg-base-200 flex items-center justify-center overflow-hidden">
        <ProductCardMedia
          product={product}
          alt={product.name}
          width={400}
          height={300}
          className="object-cover w-full h-full"
        />
      </figure>
      <div className="card-body p-4">
        {!compact && (
          <div className="text-xs text-slate-500 mb-1">{getProductPath(product)}</div>
        )}
        <h3 className="card-title text-base">{getLocalizedText(product, language)}</h3>
        <div className="text-sm font-medium text-green-700 mt-1">
          {t("totalAvailableStock")}: {formatQty(totalAvailable, lots[0]?.unit || "kg")}
        </div>
        <div className="mt-3 space-y-2">
          {lots.map((lot) => (
            <div
              key={lot.id}
              className="stock-info-row flex items-center justify-between rounded-lg border border-green-100 bg-green-50/60 px-3 py-2"
            >
              <span className="text-sm text-slate-800">{getLocalizedLotLabel(lot, language, t)}</span>
              <div className="text-left">
                <div className="text-xs font-medium text-green-700">{formatQty(lot.availableQty, lot.unit)}</div>
                {lot.price > 0 && (
                  <div className="text-xs text-slate-500">{formatLocalizedPrice(lot.price, language, t)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );

  const formatQty = (qty, unit) => {
    const label = localizeUnit(unit, language);
    return `${formatLocalizedNumber(qty, language)} ${label}`;
  };

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
                  <Link key={it.id} href={`/catalog/${it.id}`} className={`flex items-center justify-between px-4 py-2 hover:bg-slate-50 ${it ? getProductStockClass(it, allProducts, inventoryLots) : ''}`}>
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

        <div className="w-full max-w-5xl mx-auto space-y-2.5">
          <ZareoonLcAd />
          <AryaFouladAd />
        </div>

        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => changeViewMode('available')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                viewMode === 'available'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t("productsAvailable")}
            </button>
            <button
              type="button"
              onClick={() => changeViewMode('all')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                viewMode === 'all'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t("showAllCategories")}
            </button>
          </div>
        </div>

        <CatalogGuidePanel showCategoryGuide={viewMode === 'all'} className="w-full" />
     
        {viewMode === 'available' ? (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="card bg-base-100 shadow-xl border animate-pulse">
                  <figure className="h-48 bg-gray-200" />
                  <div className="card-body p-4 space-y-3">
                    <div className="h-5 bg-gray-300 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : availableProducts.length > 0 ? (
            <>
              <div className="lg:hidden mt-4 space-y-4 -mx-3 px-3 mb-0">
                {availableProductsByCategory.map((group) => (
                  <section key={group.id}>
                    <h2 className={`text-lg font-extrabold text-slate-900 mb-2 px-1 ${isRTL ? "text-right" : "text-left"}`}>
                      {group.category ? getLocalizedText(group.category, language) : t("productCategories")}
                    </h2>
                    <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory product-scroll-row">
                      {group.products.map((entry) =>
                        renderAvailableProductCard(entry, "shrink-0 w-[min(88vw,300px)] snap-start", true)
                      )}
                    </div>
                  </section>
                ))}
              </div>

              <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {availableProducts.map((entry) => renderAvailableProductCard(entry))}
              </div>
            </>
          ) : (
            <div className="col-span-full text-center py-12 text-slate-500 mt-4">
              <p className="text-base mb-2">{t("noProductsWithStock")}</p>
              <button
                type="button"
                onClick={() => changeViewMode('all')}
                className="text-sm text-green-700 hover:underline"
              >
                {t("showAllCategories")}
              </button>
            </div>
          )
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {loading ? (
            // Skeleton loading cards
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card bg-base-100 shadow-xl border animate-pulse">
                <figure className="h-64 w-full max-h-64 bg-gray-200 flex items-center justify-center">
                  <Image
                    src="/images/image-loader.webp"
                    alt="در حال بارگذاری..."
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain opacity-50"
                  />
                </figure>
                <div className="card-body p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-5 bg-gray-300 rounded w-24"></div>
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-gray-300 rounded w-20 mb-4"></div>
                  <div className="mt-3">
                    <div className="h-3 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md px-3 py-2 border bg-gray-50">
                          <div className="h-4 bg-gray-300 rounded w-20"></div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 bg-gray-300 rounded w-12"></div>
                            <div className="h-5 bg-gray-300 rounded w-12"></div>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-center rounded-md px-3 py-2 border border-dashed border-gray-300 bg-gray-50">
                        <span className="text-sm text-gray-500">مشاهده همه</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            categories.map((c) => (
              <div key={c.id} className={`card bg-base-100 shadow-xl border ${c ? getProductStockClass(c, allProducts, inventoryLots) : ''}`}>
                <figure className="h-64 w-full max-h-64 bg-base-200 flex items-center justify-center overflow-hidden">
                  <ProductCardMedia product={c} alt={c.name} width={400} height={400} className="object-cover w-full h-full" />
                </figure>
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="card-title text-base">{getLocalizedText(c, language)}</h3>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-slate-600 mb-2">{t("subcategoriesAndProducts")}</div>
                    <div className="space-y-2">
                      {(childrenMap[c.id] || []).slice(0, 5).map((ch) => {
                        const availableStock = calculateAvailableStock(ch, allProducts, inventoryLots);
                        
                        return (
                          <Link key={ch.id} href={`/catalog/${ch.id}`} className="stock-info-row flex items-center justify-between rounded-md px-3 py-2 border">
                            <div className="text-sm">{getLocalizedText(ch, language)}</div>
                            <div className="flex items-center gap-2">
                              {availableStock > 0 && (
                                <span className="text-xs text-green-600 font-medium">
                                  {formatLocalizedNumber(availableStock, language)} {localizeUnit('kg', language)}
                                </span>
                              )}
                              <span className="stock-type-label">{ch.isOrderable ? t('product') : t('category')}</span>
                            </div>
                          </Link>
                        );
                      })}
                      {(childrenMap[c.id] || []).length > 0 && (
                        <Link href={`/catalog/${c.id}`} className="stock-view-all flex items-center justify-center rounded-md px-3 py-2 border border-dashed border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors">
                          <span className="text-sm font-medium">{t("viewAll")}</span>
                        </Link>
                      )}
                      {(childrenMap[c.id] || []).length === 0 && !loading && (
                        <span className="text-slate-400 text-xs">{t("noItemsRegistered")}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        )}
        {viewMode === 'all' && categories.length === 0 && !loading && (
          <div className="text-slate-500 text-sm">{t("noCategoryRegistered")}</div>
        )}
      </section>


    </main>
  );
}
