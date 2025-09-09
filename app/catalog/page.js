"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import ProductImage from '../components/ui/ProductImage';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from '../config/api';
import { getProductStockClass, calculateAvailableStock } from '../utils/stockUtils';
import { useAuth } from '../context/AuthContext';

export default function CatalogPage() {
  const router = useRouter();
  const auth = useAuth();
  
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
        // Load root categories (non-orderable)
        const resCats = await fetch(`${API_ENDPOINTS.farmer.products.getAll}?isOrderable=false&parentId=`, { cache: 'no-store' });
        const dc = await resCats.json();
        const roots = dc.data || [];
        setCategories(roots);

        // Load children for each category
        const childPromises = roots.map(async (c) => {
          const res = await fetch(`${API_ENDPOINTS.farmer.products.getAll}?parentId=${c.id}`, { cache: 'no-store' });
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
        
        // Load inventory lots
        const resLots = await fetch(API_ENDPOINTS.farmer.inventoryLots.getAll, { cache: 'no-store' });
        const dl = await resLots.json();
        setInventoryLots(dl.data || []);
        
        setChildrenMap(map);
        setAllProducts(allProductsList);
        
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Search functionality
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) { 
        setSearchResults([]); 
        return; 
      }
      
      setSearching(true);
      try {
        const res = await fetch(`${API_ENDPOINTS.farmer.products.getAll}?q=${encodeURIComponent(query)}&limit=20`, { cache: 'no-store' });
        const d = await res.json();
        setSearchResults(d.data || []);
      } finally {
        setSearching(false);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <section className="text-center space-y-6">
        <div className="mb-4">
          <Image
            src="/images/logo.png"
            alt="لوگو"
            width={400}
            height={400}
            className="mx-auto object-contain w-48"
            priority
          />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          محصولات کشاورزی
        </h1>
        
        <p className="text-gray-600 max-w-2xl mx-auto">
          مجموعه کاملی از محصولات کشاورزی، نهاده‌ها و تجهیزات مورد نیاز شما
        </p>

        {/* Search Section */}
        <div className="relative max-w-md mx-auto">
          <input
            className="w-full border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="جست‌وجو در محصولات و دسته‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
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
              ) : searchResults.length ? (
                searchResults.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/catalog/${item.id}`} 
                    className={`flex items-center justify-between px-4 py-2 hover:bg-slate-50 ${getProductStockClass(item, allProducts, inventoryLots)}`}
                  >
                    <div className="text-sm font-medium text-slate-800">{item.name}</div>
                    <span className="text-xs text-slate-400">{item.isOrderable ? 'محصول' : 'دسته'}</span>
                  </Link>
                ))
              ) : (
                <div className="p-3 text-sm text-slate-500">چیزی یافت نشد</div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <h2 className="text-xl font-semibold mb-6 text-gray-800">دسته‌بندی محصولات</h2>
        
        {loading ? (
          // Skeleton loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
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
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md px-3 py-2 border bg-gray-50">
                          <div className="h-4 bg-gray-300 rounded w-20"></div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 bg-gray-300 rounded w-12"></div>
                            <div className="h-5 bg-gray-300 rounded w-12"></div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                <figure className="h-64 w-full max-h-64 bg-base-200 flex items-center justify-center">
                  <ProductImage 
                    slug={category.slug} 
                    imageUrl={category.imageUrl} 
                    alt={category.name} 
                    width={400} 
                    height={400} 
                    className="object-cover w-full h-full" 
                  />
                </figure>
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="card-title text-base">{category.name}</h3>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-slate-600 mb-2">زیردسته‌ها و محصولات</div>
                    <div className="space-y-2">
                      {(childrenMap[category.id] || []).slice(0, 4).map((child) => {
                        const availableStock = calculateAvailableStock(child, allProducts, inventoryLots);
                        return (
                          <Link 
                            key={child.id} 
                            href={`/catalog/${child.id}`} 
                            className={`flex items-center justify-between rounded-md px-3 py-2 border hover:bg-base-200 transition-colors ${getProductStockClass(child, allProducts, inventoryLots)}`}
                          >
                            <div className="text-sm">{child.name}</div>
                            <div className="flex items-center gap-2">
                              {availableStock > 0 && (
                                <span className="text-xs text-green-600 font-medium">
                                  {availableStock.toLocaleString()} کیلوگرم
                                </span>
                              )}
                              <span className="badge badge-ghost badge-sm">
                                {child.isOrderable ? 'محصول' : 'دسته'}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                      {(childrenMap[category.id] || []).length > 4 && (
                        <Link 
                          href={`/catalog/${category.id}`} 
                          className="flex items-center justify-center rounded-md px-3 py-2 border border-dashed border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <span className="text-sm font-medium">مشاهده همه ({childrenMap[category.id]?.length || 0})</span>
                        </Link>
                      )}
                      {(childrenMap[category.id] || []).length === 0 && !loading && (
                        <span className="text-slate-400 text-xs">موردی ثبت نشده</span>
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
            <div className="text-slate-500 text-lg">دسته‌بندی‌ای ثبت نشده است.</div>
            <p className="text-slate-400 text-sm mt-2">لطفاً بعداً مراجعه کنید.</p>
          </div>
        )}
      </section>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9999]">
        <div className="flex items-center justify-between px-1 py-2">
          {/* Home Button */}
          <button
            onClick={() => router.push('/')}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-blue-600 transition-colors min-w-0 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">خانه</span>
          </button>

          {/* Search Button */}
          <button
            onClick={() => {
              const searchElement = document.querySelector('input[placeholder*="جست"]');
              if (searchElement) {
                searchElement.focus();
              }
            }}
            className="flex flex-col items-center gap-1 p-2 text-blue-600 transition-colors min-w-0 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">جستجو</span>
          </button>

          {/* Catalog Button */}
          <button
            onClick={() => router.push('/catalog/1')}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-blue-600 transition-colors min-w-0 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs">محصولات</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={() => router.push('/cart')}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-blue-600 transition-colors relative min-w-0 flex-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <span className="text-xs">سفارشات</span>
          </button>

          {/* Login/Profile Button */}
          {auth?.user ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-blue-600 transition-colors min-w-0 flex-1 max-w-16"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs truncate max-w-12">
                {auth.user.firstName || 'پروفایل'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => router.push('/auth/login')}
              className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-blue-600 transition-colors min-w-0 flex-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs">ورود</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
