"use client";
import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import Link from "next/link";

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", parentId: "", unit: "", isOrderable: true });
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const idToName = useMemo(() => {
    const map = new Map();
    (items || []).forEach(p => map.set(p.id, p.name));
    return map;
  }, [items]);

  // Build hierarchical ordering: root, then its descendants (DFS)
  const displayRows = useMemo(() => {
    const childrenMap = new Map();
    const idSet = new Set();
    for (const it of items) {
      idSet.add(it.id);
      const pid = it.parentId == null ? null : it.parentId;
      if (!childrenMap.has(pid)) childrenMap.set(pid, []);
      childrenMap.get(pid).push(it);
    }
    // sort each children list by sortOrder if exists then name then id
    for (const [k, arr] of childrenMap.entries()) {
      arr.sort((a, b) => {
        const soA = Number.isFinite(a.sortOrder) ? a.sortOrder : 1e9;
        const soB = Number.isFinite(b.sortOrder) ? b.sortOrder : 1e9;
        if (soA !== soB) return soA - soB;
        if ((a.name || "") < (b.name || "")) return -1;
        if ((a.name || "") > (b.name || "")) return 1;
        return a.id - b.id;
      });
    }
    const result = [];
    const visited = new Set();
    const visit = (node, depth) => {
      if (visited.has(node.id)) return;
      visited.add(node.id);
      result.push({ ...node, __depth: depth });
      const ch = childrenMap.get(node.id) || [];
      for (const c of ch) visit(c, depth + 1);
    };
    // Roots are items with no parent OR parent not in current result set (when searching)
    const explicitRoots = childrenMap.get(null) || [];
    const virtualRoots = (childrenMap.get(undefined) || []).concat( // just in case
      (items || []).filter(it => it.parentId != null && !idSet.has(it.parentId))
    );
    const roots = [...explicitRoots, ...virtualRoots];
    // De-duplicate roots
    const rootSeen = new Set();
    for (const r of roots) {
      if (rootSeen.has(r.id)) continue;
      rootSeen.add(r.id);
      visit(r, 0);
    }
    // Also, include any remaining items not visited (fallback for isolated nodes)
    for (const it of items) if (!visited.has(it.id)) visit(it, it.parentId ? 1 : 0);
    return result;
  }, [items]);

  const load = async (query = "") => {
    const [r1, r2] = await Promise.all([
      fetch(`${API_ENDPOINTS.farmer.products.getAll}${query ? `?q=${encodeURIComponent(query)}` : ''}`, { cache: "no-store" }),
      // categories merged into products: fetch non-orderable nodes
      fetch(API_ENDPOINTS.farmer.products.getAll + '?isOrderable=false', { cache: "no-store" }),
    ]);
    const d1 = await r1.json();
    const d2 = await r2.json();
    setItems(d1.data || []);
    setCategories(d2.data || []);
  };
  useEffect(() => { load(); }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(async () => {
      setSearching(true);
      await load(q.trim());
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const create = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch(API_ENDPOINTS.farmer.products.create, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        name: form.name,
        unit: form.unit || null,
        parentId: form.parentId ? Number(form.parentId) : null,
        isOrderable: Boolean(form.isOrderable),
      }),
    });
    setForm({ name: "", parentId: "", unit: "", isOrderable: true });
    setLoading(false);
    load();
  };

  const remove = async (id) => {
    await fetch(API_ENDPOINTS.farmer.products.delete(id), { method: "DELETE" });
    load();
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg sm:text-xl font-bold">مدیریت محصولات</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <input
            className="border rounded px-3 py-2 text-sm w-full sm:w-80"
            placeholder="جست‌وجوی جامع در نام، نام انگلیسی یا اسلاگ..."
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
          <button onClick={()=>load(q.trim())} className="border rounded px-3 py-2 text-sm w-full sm:w-auto">{searching? '...' : 'جست‌وجو'}</button>
        </div>
      </div>
      <div className="mb-3">
        <a
          href={API_ENDPOINTS.farmer.products.exportEnglishCsvAll}
          className="inline-block text-sm text-blue-600 border px-3 py-1 rounded"
        >
          دانلود CSV نام انگلیسی محصولات/دسته‌ها
        </a>
      </div>
      <form id="productForm" onSubmit={create} className="bg-white p-3 sm:p-4 rounded-md shadow mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input className="border p-2 rounded text-sm" placeholder="نام" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
        <select className="border p-2 rounded text-sm" value={form.parentId} onChange={(e)=>setForm({...form, parentId:e.target.value})}>
          <option value="">بدون والد (دسته ریشه)</option>
          {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className="border p-2 rounded text-sm" placeholder="واحد (اختیاری)" value={form.unit} onChange={(e)=>setForm({...form, unit:e.target.value})} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isOrderable} onChange={(e)=>setForm({...form, isOrderable:e.target.checked})} />
          قابل سفارش
        </label>
        <div className="flex items-center justify-end sm:col-span-2 lg:col-span-1">
          <button disabled={loading} type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 sm:py-3 text-sm font-medium shadow-sm">
            {loading? '...' : 'افزودن'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2">ID</th>
                <th className="p-2">نام</th>
                <th className="p-2">نام انگلیسی</th>
                <th className="p-2">والد</th>
                <th className="p-2">قابل سفارش</th>
                <th className="p-2">واحد</th>
                <th className="p-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((x)=> (
                <tr key={x.id} className={`border-t ${!x.parentId ? 'bg-amber-300' : (!x.isOrderable ? 'bg-gray-100' : '')}`}>
                  <td className="p-2">{x.id}</td>
                  <td className="p-2">
                    {x.__depth ? <span className="text-slate-400">{Array(x.__depth).fill('— ').join('')}</span> : null}
                    {x.name}
                  </td>
                  <td className="p-2">{x.englishName || '-'}</td>
                  <td className="p-2">{x.parentId ? (idToName.get(x.parentId) || x.parentId) : '-'}</td>
                  <td className="p-2">
                    {x.isOrderable ? (
                      <span className="text-emerald-600" title="قابل سفارش">✓</span>
                    ) : (
                      <span className="text-rose-600" title="غیرقابل سفارش">✗</span>
                    )}
                  </td>
                  <td className="p-2">{x.unit || "-"}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2 rtl:space-x-reverse">
                      <Link href={`/catalog/${x.id}`} className="px-2 py-1 rounded border text-xs hover:bg-slate-50">مشاهده</Link>
                      <Link href={`/dashboard/farmer/products/${x.id}/edit`} className="px-2 py-1 rounded border text-xs hover:bg-slate-50">ویرایش</Link>
                      <Link href={`/dashboard/farmer/products/${x.id}/report`} className="px-2 py-1 rounded border text-xs hover:bg-slate-50 text-blue-700 border-blue-200">گزارش</Link>
                      <button onClick={()=>remove(x.id)} className="px-2 py-1 rounded border text-xs hover:bg-rose-50 text-rose-700 border-rose-200">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {displayRows.map((x)=> (
            <div key={x.id} className={`p-3 border-b border-gray-200 ${!x.parentId ? 'bg-amber-50' : (!x.isOrderable ? 'bg-gray-50' : '')}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {x.__depth ? <span className="text-slate-400">{Array(x.__depth).fill('— ').join('')}</span> : null}
                    {x.name}
                  </h3>
                  <p className="text-sm text-gray-600">ID: {x.id}</p>
                  {x.englishName && <p className="text-sm text-gray-600">انگلیسی: {x.englishName}</p>}
                  {x.parentId && <p className="text-sm text-gray-600">والد: {idToName.get(x.parentId) || x.parentId}</p>}
                  <p className="text-sm text-gray-600">
                    قابل سفارش: {x.isOrderable ? (
                      <span className="text-emerald-600">✓ بله</span>
                    ) : (
                      <span className="text-rose-600">✗ خیر</span>
                    )}
                  </p>
                  {x.unit && <p className="text-sm text-gray-600">واحد: {x.unit}</p>}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Link href={`/catalog/${x.id}`} className="px-3 py-1 rounded border text-xs hover:bg-slate-50 bg-white">مشاهده</Link>
                <Link href={`/dashboard/farmer/products/${x.id}/edit`} className="px-3 py-1 rounded border text-xs hover:bg-slate-50 bg-white">ویرایش</Link>
                <Link href={`/dashboard/farmer/products/${x.id}/report`} className="px-3 py-1 rounded border text-xs hover:bg-slate-50 text-blue-700 border-blue-200 bg-white">گزارش</Link>
                <button onClick={()=>remove(x.id)} className="px-3 py-1 rounded border text-xs hover:bg-rose-50 text-rose-700 border-rose-200 bg-white">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

