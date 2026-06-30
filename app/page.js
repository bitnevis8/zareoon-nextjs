"use client";
import { useEffect, useState, useMemo } from "react";
import Link from 'next/link';
import ProductImage from './components/ui/ProductImage';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from './config/api';
import { getProductStockClass, calculateAvailableStock } from './utils/stockUtils';
import { useAuth } from './context/AuthContext';
import StockLegend from './components/StockLegend';

export default function Home() {
  const router = useRouter();
  const auth = useAuth();
  
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
    const parts = [product.name];
    let current = product;
    while (current?.parentId) {
      const parent = productById.get(current.parentId);
      if (!parent) break;
      parts.unshift(parent.name);
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
        qualityGrade: lot.qualityGrade || 'بدون درجه',
        availableQty,
        unit: lot.unit || 'kg',
        price: lot.price,
      });
      entry.totalAvailable += availableQty;
    }

    return Array.from(grouped.values())
      .sort((a, b) => a.product.name.localeCompare(b.product.name, 'fa'));
  }, [inventoryLots, productById]);

  const formatQty = (qty, unit) => {
    const label = unit === 'kg' ? 'کیلوگرم' : unit === 'ton' ? 'تن' : unit;
    return `${qty.toLocaleString('fa-IR')} ${label}`;
  };

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-8 overflow-x-hidden">
      <section className="text-center space-y-10">
        <div className="mb-4">
        <Image
      src="/images/logo.png"
      alt="لوگو"
      width={800}   // w-96 = 384px
      height={800}
      className="mx-auto object-contain w-80"
      priority
    />
        </div>
        <div className="relative">
          <input
            className="w-full border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="جست‌وجو در محصولات و دسته‌ها..."
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
          {q && (
            <div className="absolute z-10 left-0 right-0 mt-2 bg-white border rounded-xl shadow max-h-80 overflow-auto text-right">
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
                    <div className="text-sm font-medium text-slate-800">{it.name}</div>
                    <span className="text-xs text-slate-400">{it.isOrderable ? 'محصول' : 'دسته'}</span>
                  </Link>
                ))
              ) : (
                <div className="p-3 text-sm text-slate-500">چیزی یافت نشد</div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('available')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                viewMode === 'available'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              محصولات موجود
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                viewMode === 'all'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              نمایش همه دسته‌ها
            </button>
          </div>
        </div>

        <StockLegend className="max-w-3xl mx-auto" />
     
        {viewMode === 'available' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="card bg-base-100 shadow-xl border animate-pulse">
                  <figure className="h-48 bg-gray-200" />
                  <div className="card-body p-4 space-y-3">
                    <div className="h-5 bg-gray-300 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
              ))
            ) : availableProducts.length > 0 ? (
              availableProducts.map(({ product, lots, totalAvailable }) => (
                <Link
                  key={product.id}
                  href={`/catalog/${product.id}`}
                  className={`card bg-base-100 shadow-xl border hover:shadow-2xl transition-shadow ${getProductStockClass(product, allProducts, inventoryLots)}`}
                >
                  <figure className="h-48 w-full bg-base-200 flex items-center justify-center overflow-hidden">
                    <ProductImage
                      slug={product.slug}
                      imageUrl={product.imageUrl}
                      alt={product.name}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  </figure>
                  <div className="card-body p-4">
                    <div className="text-xs text-slate-500 mb-1">{getProductPath(product)}</div>
                    <h3 className="card-title text-base">{product.name}</h3>
                    <div className="text-sm font-medium text-green-700 mt-1">
                      مجموع موجودی: {formatQty(totalAvailable, lots[0]?.unit || 'kg')}
                    </div>
                    <div className="mt-3 space-y-2">
                      {lots.map((lot) => (
                        <div
                          key={lot.id}
                          className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50/60 px-3 py-2"
                        >
                          <span className="text-sm text-slate-800">{lot.qualityGrade}</span>
                          <div className="text-left">
                            <div className="text-xs font-medium text-green-700">
                              {formatQty(lot.availableQty, lot.unit)}
                            </div>
                            {lot.price > 0 && (
                              <div className="text-xs text-slate-500">
                                {Number(lot.price).toLocaleString('fa-IR')} تومان
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500">
                <p className="text-base mb-2">محصولی با موجودی ثبت نشده است.</p>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className="text-sm text-green-700 hover:underline"
                >
                  مشاهده همه دسته‌ها
                </button>
              </div>
            )}
          </div>
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
                <figure className="h-64 w-full max-h-64 bg-base-200 flex items-center justify-center ">
                  <ProductImage slug={c.slug} imageUrl={c.imageUrl} alt={c.name} width={400} height={400} className=" object-cover w-full h-full" />
                </figure>
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="card-title text-base">{c.name}</h3>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-slate-600 mb-2">زیردسته‌ها و محصولات</div>
                    <div className="space-y-2">
                      {(childrenMap[c.id] || []).slice(0, 5).map((ch) => {
                        const availableStock = calculateAvailableStock(ch, allProducts, inventoryLots);
                        
                        return (
                          <Link key={ch.id} href={`/catalog/${ch.id}`} className={`flex items-center justify-between rounded-md px-3 py-2 border hover:bg-base-200 ${ch ? getProductStockClass(ch, allProducts, inventoryLots) : ''}`}>
                            <div className="text-sm">{ch.name}</div>
                            <div className="flex items-center gap-2">
                              {availableStock > 0 && (
                                <span className="text-xs text-green-600 font-medium">
                                  {availableStock.toLocaleString()} کیلوگرم
                                </span>
                              )}
                              <span className="badge badge-ghost badge-sm">{ch.isOrderable ? 'محصول' : 'دسته'}</span>
                            </div>
                          </Link>
                        );
                      })}
                      {(childrenMap[c.id] || []).length > 0 && (
                        <Link href={`/catalog/${c.id}`} className="flex items-center justify-center rounded-md px-3 py-2 border border-dashed border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors">
                          <span className="text-sm font-medium">مشاهده همه</span>
                        </Link>
                      )}
                      {(childrenMap[c.id] || []).length === 0 && !loading && (
                        <span className="text-slate-400 text-xs">موردی ثبت نشده</span>
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
          <div className="text-slate-500 text-sm">دسته‌بندی‌ای ثبت نشده است.</div>
        )}
      </section>


    </main>
  );
}
