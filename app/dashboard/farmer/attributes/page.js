"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AsyncSelect from "react-select/async";
import { API_ENDPOINTS } from "@/app/config/api";

export default function AttributesPage() {
  const [defs, setDefs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ scope: "category", categoryId: "", productId: "", name: "", type: "text", options: [], optionsInput: "" });

  const load = async () => {
    const [rd, rc, rp] = await Promise.all([
      fetch(API_ENDPOINTS.farmer.attributeDefinitions.getAll, { cache: "no-store" }),
      // categories merged into products: fetch non-orderable nodes to attach attributes to them
      fetch(API_ENDPOINTS.farmer.products.getAll + '?isOrderable=false', { cache: "no-store" }),
      fetch(API_ENDPOINTS.farmer.products.getAll + '?isOrderable=true', { cache: "no-store" }),
    ]);
    const dd = await rd.json();
    const dc = await rc.json();
    const dp = await rp.json();
    setDefs(dd.data || []);
    setCategories(dc.data || []);
    setProducts(dp.data || []);
  };
  useEffect(()=>{ load(); }, []);

  const categoryIdToName = useMemo(() => {
    const map = new Map();
    (categories || []).forEach(c => map.set(c.id, c.name));
    return map;
  }, [categories]);
  const productIdToName = useMemo(() => {
    const map = new Map();
    (products || []).forEach(p => map.set(p.id, p.name));
    return map;
  }, [products]);

  // Async loaders for searchable selects
  const loadCategoryOptions = async (inputValue) => {
    const q = (inputValue || "").trim();
    const url = `${API_ENDPOINTS.farmer.products.getAll}?isOrderable=false${q ? `&q=${encodeURIComponent(q)}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const d = await res.json();
    const list = d?.data || [];
    return list.map((c) => ({ value: c.id, label: c.name }));
  };
  const loadProductOptions = async (inputValue) => {
    const q = (inputValue || "").trim();
    const url = `${API_ENDPOINTS.farmer.products.getAll}?isOrderable=true${q ? `&q=${encodeURIComponent(q)}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const d = await res.json();
    const list = d?.data || [];
    return list.map((p) => ({ value: p.id, label: p.name }));
  };

  const create = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, type: form.type };
    if (form.scope === 'product') payload.productId = Number(form.productId);
    else payload.categoryId = Number(form.categoryId);
    if (form.type === 'select') payload.options = form.options;
    await fetch(API_ENDPOINTS.farmer.attributeDefinitions.create, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setForm({ scope: "category", categoryId: "", productId: "", name: "", type: "text", options: [], optionsInput: "" });
    load();
  };

  const remove = async (id) => {
    await fetch(API_ENDPOINTS.farmer.attributeDefinitions.delete(id), { method: "DELETE" });
    load();
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">ویژگی‌های سفارشی</h1>
      <form onSubmit={create} className="bg-white p-4 rounded-md shadow mb-6 grid grid-cols-1 md:grid-cols-6 gap-2">
        <select className="border p-2 rounded" value={form.scope} onChange={(e)=>setForm({...form, scope:e.target.value, categoryId:"", productId:""})}>
          <option value="category">برای دسته‌بندی</option>
          <option value="product">برای محصول</option>
        </select>
        {form.scope === 'category' ? (
          <AsyncSelect
            cacheOptions
            isClearable
            defaultOptions={categories.map(c => ({ value: c.id, label: c.name }))}
            loadOptions={loadCategoryOptions}
            placeholder="انتخاب دسته‌بندی"
            noOptionsMessage={() => "موردی یافت نشد"}
            onChange={(opt)=> setForm({ ...form, categoryId: opt?.value || "" })}
            value={form.categoryId ? { value: form.categoryId, label: categories.find(c=>c.id===Number(form.categoryId))?.name || `#${form.categoryId}` } : null}
          />
        ) : (
          <AsyncSelect
            cacheOptions
            isClearable
            defaultOptions={products.map(p => ({ value: p.id, label: p.name }))}
            loadOptions={loadProductOptions}
            placeholder="انتخاب محصول"
            noOptionsMessage={() => "موردی یافت نشد"}
            onChange={(opt)=> setForm({ ...form, productId: opt?.value || "" })}
            value={form.productId ? { value: form.productId, label: products.find(p=>p.id===Number(form.productId))?.name || `#${form.productId}` } : null}
          />
        )}
        <input className="border p-2 rounded" placeholder="نام ویژگی" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
        <select className="border p-2 rounded" value={form.type} onChange={(e)=>setForm({...form, type:e.target.value, options: [], optionsInput: ""})}>
          <option value="text">متن</option>
          <option value="number">عدد</option>
          <option value="boolean">بولین</option>
          <option value="date">تاریخ</option>
          <option value="select">انتخابی</option>
        </select>
        <div />
        {form.type === 'select' && (
          <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-6 gap-2 border-t pt-2">
            <div className="md:col-span-3 flex gap-2">
              <input
                className="border p-2 rounded flex-1"
                placeholder="گزینه جدید را بنویسید و اضافه کنید"
                value={form.optionsInput}
                onChange={(e)=>setForm({...form, optionsInput: e.target.value})}
                onKeyDown={(e)=>{
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (form.optionsInput || '').trim();
                    if (!val) return;
                    if (!form.options.includes(val)) setForm({...form, options: [...form.options, val], optionsInput: ''});
                  }
                }}
              />
              <button type="button" className="bg-gray-200 rounded px-3" onClick={()=>{
                const val = (form.optionsInput || '').trim();
                if (!val) return;
                if (!form.options.includes(val)) setForm({...form, options: [...form.options, val], optionsInput: ''});
              }}>افزودن گزینه</button>
            </div>
            {form.options.length > 0 && (
              <div className="md:col-span-6 flex flex-wrap gap-2">
                {form.options.map((opt, idx)=> (
                  <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 border rounded px-2 py-1 text-xs">
                    {String(opt)}
                    <button type="button" className="text-red-600" onClick={()=>{
                      const next = form.options.filter((_, i)=> i!==idx);
                      setForm({...form, options: next});
                    }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <button className="bg-blue-600 text-white rounded px-4">افزودن</button>
      </form>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2">ID</th>
              <th className="p-2">دسته/محصول</th>
              <th className="p-2">نام</th>
              <th className="p-2">نوع</th>
              <th className="p-2">گزینه‌ها</th>
              <th className="p-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {defs.map(d=> (
              <tr key={d.id} className="border-t">
                <td className="p-2">{d.id}</td>
                <td className="p-2">{
                  d.productId
                    ? (productIdToName.get(d.productId) || `محصول #${d.productId}`)
                    : d.categoryId
                      ? (categoryIdToName.get(d.categoryId) || `دسته #${d.categoryId}`)
                      : '—'
                }</td>
                <td className="p-2">{d.name}</td>
                <td className="p-2">{d.type}</td>
                <td className="p-2">{Array.isArray(d.options) && d.options.length ? d.options.map(o => (typeof o === 'object' ? (o.label ?? o.value) : String(o))).join('، ') : '—'}</td>
                <td className="p-2 flex gap-3">
                  <Link href={`/dashboard/farmer/attributes/${d.id}/view`} className="text-blue-600">مشاهده</Link>
                  <Link href={`/dashboard/farmer/attributes/${d.id}/edit`} className="text-amber-600">ویرایش</Link>
                  <button onClick={()=>remove(d.id)} className="text-red-600">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

