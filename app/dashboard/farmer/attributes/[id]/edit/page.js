"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AsyncSelect from "react-select/async";
import { API_ENDPOINTS } from "@/app/config/api";

export default function AttributeEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ scope: "category", categoryId: "", productId: "", name: "", type: "text", options: [], optionsInput: "" });

  const load = useCallback(async () => {
    const [ri, rc, rp] = await Promise.all([
      fetch(API_ENDPOINTS.farmer.attributeDefinitions.getById(id), { cache: "no-store" }),
      fetch(API_ENDPOINTS.farmer.products.getAll + '?isOrderable=false', { cache: "no-store" }),
      fetch(API_ENDPOINTS.farmer.products.getAll + '?isOrderable=true', { cache: "no-store" }),
    ]);
    const di = await ri.json();
    const dc = await rc.json();
    const dp = await rp.json();
    const it = di?.data || null;
    setItem(it);
    setCategories(dc?.data || []);
    setProducts(dp?.data || []);
    if (it) {
      setForm({
        scope: it.productId ? 'product' : 'category',
        categoryId: it.categoryId || "",
        productId: it.productId || "",
        name: it.name || "",
        type: it.type || 'text',
        options: Array.isArray(it.options) ? it.options : [],
        optionsInput: "",
      });
    }
  }, [id]);

  useEffect(() => { if (Number.isFinite(id)) load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, type: form.type, options: form.type === 'select' ? form.options : null };
    if (form.scope === 'product') {
      payload.productId = Number(form.productId) || null;
      payload.categoryId = null;
    } else {
      payload.categoryId = Number(form.categoryId) || null;
      payload.productId = null;
    }
    await fetch(API_ENDPOINTS.farmer.attributeDefinitions.update(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    router.push('/dashboard/farmer/attributes');
  };

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

  if (!item) return <div className="p-4">در حال بارگذاری...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">ویرایش ویژگی #{id}</h1>
      <form onSubmit={save} className="bg-white p-4 rounded-md shadow grid grid-cols-1 md:grid-cols-6 gap-2">
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
        <div className="md:col-span-6 flex gap-2">
          <button className="bg-blue-600 text-white rounded px-4">ذخیره</button>
          <button type="button" className="bg-gray-200 rounded px-4" onClick={()=>router.push('/dashboard/farmer/attributes')}>انصراف</button>
        </div>
      </form>
    </div>
  );
}

