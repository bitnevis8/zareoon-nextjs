"use client";
import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";

export default function EditProductPage({ params }) {
  const { id } = usePromise(params);
  const productId = Number(id);

  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    englishName: "",
    slug: "",
    parentId: "",
    unit: "",
    isOrderable: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const [rp, rc] = await Promise.all([
          fetch(API_ENDPOINTS.farmer.products.getById(productId), { cache: "no-store" }),
          fetch(API_ENDPOINTS.farmer.products.getAll + '?isOrderable=false', { cache: "no-store" }),
        ]);
        const dp = await rp.json();
        const dc = await rc.json();
        const it = dp?.data || null;
        setItem(it);
        setCategories(dc?.data || []);
        if (it) {
          setForm({
            name: it.name || "",
            englishName: it.englishName || "",
            slug: it.slug || "",
            parentId: it.parentId ? String(it.parentId) : "",
            unit: it.unit || "",
            isOrderable: Boolean(it.isOrderable),
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        name: form.name,
        englishName: form.englishName || null,
        slug: form.slug || null,
        unit: form.unit || null,
        parentId: form.parentId ? Number(form.parentId) : null,
        isOrderable: Boolean(form.isOrderable),
      };
      const res = await fetch(API_ENDPOINTS.farmer.products.update(productId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const dj = await res.json();
      if (!res.ok || !dj?.success) throw new Error(dj?.message || 'خطا در ذخیره تغییرات');
      setMsgType('success'); setMsg('تغییرات با موفقیت ذخیره شد.');
    } catch (e) {
      setMsgType('error'); setMsg(e.message || 'خطای غیرمنتظره رخ داد');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">ویرایش محصول #{productId}</h1>
        <Link href="/dashboard/farmer/products" className="text-blue-600">بازگشت</Link>
      </div>

      {loading ? (
        <div className="text-slate-500">در حال بارگذاری...</div>
      ) : (
        <form onSubmit={save} className="bg-white p-4 rounded-md shadow grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border p-2 rounded" placeholder="نام" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
          <input className="border p-2 rounded" placeholder="نام انگلیسی (اختیاری)" value={form.englishName} onChange={(e)=>setForm({...form, englishName:e.target.value})} />
          <input className="border p-2 rounded" placeholder="اسلاگ (اختیاری)" value={form.slug} onChange={(e)=>setForm({...form, slug:e.target.value})} />
          <input className="border p-2 rounded" placeholder="واحد (اختیاری)" value={form.unit} onChange={(e)=>setForm({...form, unit:e.target.value})} />
          <select className="border p-2 rounded" value={form.parentId} onChange={(e)=>setForm({...form, parentId:e.target.value})}>
            <option value="">بدون والد (دسته ریشه)</option>
            {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isOrderable} onChange={(e)=>setForm({...form, isOrderable:e.target.checked})} />
            قابل سفارش
          </label>
          <div className="md:col-span-2 flex items-center justify-end mt-2">
            <button disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {saving ? '...' : 'ذخیره تغییرات'}
            </button>
          </div>
          {msg ? (
            <div className={`md:col-span-2 rounded-2xl border p-3 ${msgType==='success'?'bg-emerald-50 border-emerald-200 text-emerald-800':'bg-rose-50 border-rose-200 text-rose-800'}`}>{msg}</div>
          ) : null}
        </form>
      )}
    </div>
  );
}

