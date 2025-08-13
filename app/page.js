"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import ProductImage from './components/ui/ProductImage';
import Image from 'next/image';
import { API_ENDPOINTS } from './config/api';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [childrenMap, setChildrenMap] = useState({});
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
        return { parentId: c.id, items: d.data || [] };
      });
      const children = await Promise.all(childPromises);
      const map = {};
      for (const { parentId, items } of children) map[parentId] = items;
      setChildrenMap(map);
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
                  <Link key={it.id} href={`/catalog/${it.id}`} className="flex items-center justify-between px-4 py-2 hover:bg-slate-50">
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
            <div key={c.id} className="card bg-base-100 shadow-xl border">
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
                    {(childrenMap[c.id] || []).slice(0, 10).map((ch) => (
                      <Link key={ch.id} href={`/catalog/${ch.id}`} className="flex items-center justify-between rounded-md px-3 py-2 border hover:bg-base-200">
                        <div className="text-sm">{ch.name}</div>
                        <span className="badge badge-ghost badge-sm">{ch.isOrderable ? 'محصول' : 'دسته'}</span>
                      </Link>
                    ))}
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
