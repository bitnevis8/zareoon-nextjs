"use client";
import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import MediaUpload from "@/app/components/ui/MediaUpload";
import { getSupplyCountryOptions } from "@/app/utils/supplySource";

export default function EditProductPage({ params }) {
  const t = useTranslations("product");
  const tShared = useTranslations("shared");
  const supplyCountries = getSupplyCountryOptions(tShared);
  const { id } = usePromise(params);
  const productId = Number(id);

  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    englishName: "",
    arabicName: "",
    russianName: "",
    slug: "",
    parentId: "",
    unit: "",
    isOrderable: true,
    supplyCountry: "IR",
    supplyCity: "",
    description: "",
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
            arabicName: it.arabicName || "",
            russianName: it.russianName || "",
            slug: it.slug || "",
            parentId: it.parentId ? String(it.parentId) : "",
            unit: it.unit || "",
            isOrderable: Boolean(it.isOrderable),
            supplyCountry: it.supplyCountry || "IR",
            supplyCity: it.supplyCity || "",
            description: it.description || "",
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
        arabicName: form.arabicName || null,
        russianName: form.russianName || null,
        slug: form.slug || null,
        unit: form.unit || null,
        parentId: form.parentId ? Number(form.parentId) : null,
        isOrderable: Boolean(form.isOrderable),
        supplyCountry: form.supplyCountry || "IR",
        supplyCity: form.supplyCity?.trim() || null,
        description: form.description?.trim() || null,
      };
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(API_ENDPOINTS.farmer.products.update(productId), {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const dj = await res.json();
      if (!res.ok || !dj?.success) throw new Error(dj?.message || t('edit.saveError'));
      setMsgType('success'); setMsg(t('edit.saveSuccess'));
    } catch (e) {
      setMsgType('error'); setMsg(e.message || t('edit.unexpectedError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('edit.title', { id: productId })}</h1>
        <Link href="/dashboard/supplier/products" className="text-blue-600">{t('edit.backToProducts')}</Link>
      </div>

      {loading ? (
        <div className="text-slate-500">{t('loading')}</div>
      ) : (
        <form onSubmit={save} className="bg-white p-4 rounded-md shadow grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border p-2 rounded" placeholder={t('list.namePlaceholder')} value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
          <input className="border p-2 rounded" placeholder={t('list.englishNamePlaceholder')} value={form.englishName} onChange={(e)=>setForm({...form, englishName:e.target.value})} />
          <input className="border p-2 rounded" placeholder={t('list.arabicNamePlaceholder')} value={form.arabicName} onChange={(e)=>setForm({...form, arabicName:e.target.value})} />
          <input className="border p-2 rounded" placeholder={t('list.russianNamePlaceholder')} value={form.russianName} onChange={(e)=>setForm({...form, russianName:e.target.value})} />
          <input className="border p-2 rounded" placeholder={t('edit.slugPlaceholder')} value={form.slug} onChange={(e)=>setForm({...form, slug:e.target.value})} />
          <input className="border p-2 rounded" placeholder={t('list.unitPlaceholder')} value={form.unit} onChange={(e)=>setForm({...form, unit:e.target.value})} />
          <select className="border p-2 rounded" value={form.supplyCountry} onChange={(e)=>setForm({...form, supplyCountry:e.target.value})} required>
            {supplyCountries.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <input className="border p-2 rounded" placeholder={t('list.supplyCityPlaceholder')} value={form.supplyCity} onChange={(e)=>setForm({...form, supplyCity:e.target.value})} />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('edit.descriptionLabel')}</label>
            <textarea
              className="w-full rounded border p-2 text-sm"
              rows={4}
              placeholder={t('edit.descriptionPlaceholder')}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <select className="border p-2 rounded" value={form.parentId} onChange={(e)=>setForm({...form, parentId:e.target.value})}>
            <option value="">{t('list.noParent')}</option>
            {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isOrderable} onChange={(e)=>setForm({...form, isOrderable:e.target.checked})} />
            {t('orderable')}
          </label>

          <div className="md:col-span-2 border-t pt-3 mt-2">
            <h2 className="font-semibold text-sm mb-1">{t('edit.mediaTitle')}</h2>
            <p className="text-xs text-slate-500 mb-3">
              {t('edit.mediaHint')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-600 mb-1">{t('edit.imagesLabel')}</div>
                <MediaUpload module="products" entityId={productId} fileType="images" accept="image/*" buttonLabel={t('edit.uploadImage')} />
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">{t('edit.videosLabel')}</div>
                <MediaUpload module="products" entityId={productId} fileType="videos" accept="video/*" buttonLabel={t('edit.uploadVideo')} />
              </div>
            </div>
          </div>
          <div className="md:col-span-2 flex items-center justify-end mt-2">
            <button disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {saving ? t('ellipsis') : t('edit.saveChanges')}
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
