"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import ProductImage from './components/ui/ProductImage';
import Image from 'next/image';
import { API_ENDPOINTS } from './config/api';
import { getProductStockClass, calculateAvailableStock, calculateParentStockQuantity } from './utils/stockUtils';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [childrenMap, setChildrenMap] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [inventoryLots, setInventoryLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    (async () => {
      // دسته‌های ریشه (غیرقابل سفارش)
      const resCats = await fetch(`${API_ENDPOINTS.farmer.products.getAll}?isOrderable=false&parentId=`, { cache: 'no-store' });
      const dc = await resCats.json();
      const roots = dc.data || [];
      setCategories(roots);

      // فرزندان هر دسته 
      const childPromises = roots.map(async (c) => {
        const res = await fetch(`${API_ENDPOINTS.farmer.products.getAll}?parentId=${c.id}`, { cache: 'no-store' });
        const d = await res.json();
        console.log(`API Response for parentId ${c.id}:`, d.data?.length || 0, 'items');
        if (c.id === 1) { // غلات
          console.log('Cereals API response:', d.data);
        }
        return { parentId: c.id, items: d.data || [] };
      });
      const children = await Promise.all(childPromises);
      const map = {};
      let allProductsList = [...roots]; // شامل دسته‌های اصلی
      
      for (const { parentId, items } of children) {
        map[parentId] = items;
        allProductsList = [...allProductsList, ...items]; // اضافه کردن زیردسته‌ها
        console.log(`Added ${items.length} items for parentId ${parentId}`);
        if (parentId === 1) { // غلات
          console.log('Cereals items added:', items.map(item => `${item.name} (${item.id})`));
        }
      }
      
      // دریافت InventoryLot ها
      const resLots = await fetch(API_ENDPOINTS.farmer.inventoryLots.getAll, { cache: 'no-store' });
      const dl = await resLots.json();
      setInventoryLots(dl.data || []);
      
      setChildrenMap(map);
      setAllProducts(allProductsList);
      
      // Debug: Check wheat products
      const wheatProducts = allProductsList.filter(p => p.parentId === 1001);
      console.log('Home page - Wheat products:', wheatProducts.map(p => `${p.name} (${p.id}, orderable: ${p.isOrderable})`));
      
      // Debug: Check all products with parentId 1 (cereals)
      const cerealsProducts = allProductsList.filter(p => p.parentId === 1);
      console.log('Home page - Cereals products:', cerealsProducts.map(p => `${p.name} (${p.id}, orderable: ${p.isOrderable})`));
      
      // Debug: Check inventory lots
      console.log('Home page - Inventory lots loaded:', dl.data?.length || 0);
      const wheatLots = dl.data?.filter(lot => lot.productId === 1101) || [];
      console.log('Home page - Wheat bread lots:', wheatLots.map(lot => `${lot.qualityGrade}: ${lot.totalQuantity}kg`));
      
      // Debug: Check wheat category
      const wheatCategory = allProductsList.find(p => p.id === 1001);
      if (wheatCategory) {
        console.log('Home page - Wheat category:', wheatCategory);
        const wheatStock = calculateAvailableStock(wheatCategory, allProductsList, dl.data || []);
        console.log('Home page - Wheat category stock:', wheatStock);
        
        // Debug: Check if wheat is in childrenMap
        console.log('Home page - ChildrenMap for cereals (1):', map[1]);
        const wheatInChildren = map[1]?.find(ch => ch.id === 1001);
        console.log('Home page - Wheat in children:', wheatInChildren);
        
        // Debug: Test calculateParentStockQuantity directly
        const directStock = calculateParentStockQuantity(allProductsList, 1001, dl.data || []);
        console.log('Home page - Direct wheat stock calculation:', directStock);
        
        // Debug: Check if wheat has children
        const wheatChildren = allProductsList.filter(p => p.parentId === 1001);
        console.log('Home page - Wheat children in allProducts:', wheatChildren.map(p => `${p.name} (${p.id})`));
      }
      
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

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-6 py-10 space-y-8">
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
                <div className="p-3 text-sm text-slate-500">در حال جست‌وجو...</div>
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
     
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {categories.map((c) => (
            <div key={c.id} className={`card bg-base-100 shadow-xl border ${c ? getProductStockClass(c, allProducts, inventoryLots) : ''}`}>
              <figure className="h-64 w-full max-h-64 bg-base-200 flex items-center justify-center ">
                <ProductImage slug={c.slug} imageUrl={c.imageUrl} alt={c.name} width={400} height={400} className=" object-cover w-full h-full" />
              </figure>
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <h3 className="card-title text-base">{c.name}</h3>
                  <Link href={`/catalog/${c.id}`} className="btn btn-ghost btn-xs text-primary">مشاهده همه</Link>
                </div>
                {c.slug ? <div className="text-gray-400 text-xs mt-0.5">{c.slug}</div> : null}
                <div className="mt-3">
                  <div className="text-xs text-slate-600 mb-2">زیردسته‌ها و محصولات</div>
                  <div className="space-y-2">
                    {(childrenMap[c.id] || []).slice(0, 10).map((ch) => {
                      // محاسبه موجودی برای هر محصول/دسته
                      const availableStock = calculateAvailableStock(ch, allProducts, inventoryLots);
                      console.log(`Home page - ${ch.name} (${ch.id}): availableStock = ${availableStock}, isOrderable = ${ch.isOrderable}`);
                      
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
                    {(childrenMap[c.id] || []).length === 0 && !loading && (
                      <span className="text-slate-400 text-xs">موردی ثبت نشده</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {categories.length === 0 && !loading && (
          <div className="text-slate-500 text-sm">دسته‌بندی‌ای ثبت نشده است.</div>
        )}
      </section>
    </main>
  );
}
