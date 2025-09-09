"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import AsyncSelect from "react-select/async";
import { API_ENDPOINTS } from "@/app/config/api";
import { useAuth } from "@/app/context/AuthContext";
import MediaUpload from "@/app/components/ui/MediaUpload";
import TieredPricingDisplay from "@/app/components/ui/TieredPricingDisplay";

export default function InventoryLotsPage() {
  const { user, loading: authLoading } = useAuth() || {};
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ 
    productId: "", 
    farmerId: "", 
    farmerLabel: "", 
    unit: "kg", 
    qualityGrade: "درجه 1", 
    totalQuantity: "", 
    price: "", 
    minimumOrderQuantity: "",
    tieredPricing: [],
    status: "harvested" 
  });
  const [attributeDefs, setAttributeDefs] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [farmerNameMap, setFarmerNameMap] = useState(new Map());
  const [editOpen, setEditOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [editForm, setEditForm] = useState({ 
    unit: "", 
    qualityGrade: "", 
    totalQuantity: "", 
    price: "", 
    minimumOrderQuantity: "",
    tieredPricing: [],
    status: "harvested" 
  });
  const [showTieredPricing, setShowTieredPricing] = useState(false);

  const statusToFa = {
    on_field: "در مزرعه",
    harvested: "برداشت‌شده",
    reserved: "رزرو شده",
    sold: "فروخته شده",
  };

  const load = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch(API_ENDPOINTS.farmer.inventoryLots.getAll, { cache: "no-store" }),
      // Only orderable products should be listed for inventory creation
      fetch(API_ENDPOINTS.farmer.products.getAll + '?isOrderable=true', { cache: "no-store" }),
    ]);
    const d1 = await r1.json();
    const d2 = await r2.json();
    const lots = (d1.data || []).map(l => ({
      ...l,
      attributes: Array.isArray(l.attributes) ? l.attributes : []
    }));
    const roles = (user?.roles || []).map(r => (r.name || r.nameEn || '').toLowerCase());
    const isFarmer = roles.includes('farmer') || roles.includes('loader');
    const currentUserId = user?.userId;
    setItems(isFarmer && currentUserId ? lots.filter(l => Number(l.farmerId) === Number(currentUserId)) : lots);
    const prods = d2.data || [];
    setProducts(prods);
    // Load supplier names for display
    const ids = [...new Set(lots.map(x => x.farmerId).filter(Boolean))];
    if (ids.length) {
      const results = await Promise.all(ids.map(async (uid) => {
        try {
          const res = await fetch(API_ENDPOINTS.users.getById(uid), { cache: "no-store" });
          const d = await res.json();
          const u = d?.data || d; // compatibility
          const name = (`${u.firstName || ""} ${u.lastName || ""}`.trim()) || u.username || u.mobile || `#${uid}`;
          return [uid, name];
        } catch {
          return [uid, `#${uid}`];
        }
      }));
      const map = new Map(results);
      setFarmerNameMap(map);
    } else {
      setFarmerNameMap(new Map());
    }
  }, [user]);
  useEffect(() => { load(); }, [user, load]);

  // Load attribute definitions when product changes (merge product-level + category-level)
  useEffect(() => {
    const selected = products.find(p => p.id === Number(form.productId));
    const categoryId = selected?.parentId ?? selected?.categoryId;
    if (!selected) {
      setAttributeDefs([]);
      setAttributeValues({});
      return;
    }
    (async () => {
      try {
        const [rCat, rProd] = await Promise.all([
          categoryId ? fetch(API_ENDPOINTS.farmer.attributeDefinitions.getByCategoryId(categoryId), { cache: "no-store" }) : null,
          fetch(API_ENDPOINTS.farmer.attributeDefinitions.getByProductId(selected.id), { cache: "no-store" })
        ]);
        const dCat = rCat ? await rCat.json() : { data: [] };
        const dProd = rProd ? await rProd.json() : { data: [] };
        const rawDefs = [...(dCat.data || []), ...(dProd.data || [])];
        // Client-side guard: only include defs exactly matching this productId or its direct categoryId
        const filtered = rawDefs.filter(def => {
          if (def.productId && Number(def.productId) === Number(selected.id)) return true;
          if (def.categoryId && Number(def.categoryId) === Number(categoryId)) return true;
          return false;
        });
        // Dedupe by id
        const unique = Array.from(new Map(filtered.map(d => [d.id, d])).values());
        setAttributeDefs(unique);
        // Initialize values for new defs if not present
        setAttributeValues(prev => {
          const next = { ...prev };
          unique.forEach(def => {
            if (!(def.id in next)) next[def.id] = "";
          });
          // remove values for defs that no longer exist
          Object.keys(next).forEach(k => {
            if (!unique.some(d => String(d.id) === String(k))) delete next[k];
          });
          return next;
        });
      } catch {}
    })();
  }, [form.productId, products]);

  // Async loaders for react-select
  const loadProductOptions = async (inputValue) => {
    const q = (inputValue || "").trim();
    const url = `${API_ENDPOINTS.farmer.products.getAll}?isOrderable=true${q ? `&q=${encodeURIComponent(q)}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const d = await res.json();
    const list = d?.data || [];
    return list.map(p => ({ value: p.id, label: p.name }));
  };
  const loadFarmerOptions = async (inputValue) => {
    const q = (inputValue || "").trim();
    const url = `${API_ENDPOINTS.users.search}?limit=20&offset=0${q ? `&q=${encodeURIComponent(q)}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    const rows = (data?.data?.rows || data?.data || []).filter(
      (u) => Array.isArray(u.userRoles) && u.userRoles.some((r) => r.name === "farmer")
    );
    return rows.map(u => ({
      value: u.id,
      label: (`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || u.mobile || `#${u.id}`)
    }));
  };

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    // 1) Create inventory lot
    const lotRes = await fetch(API_ENDPOINTS.farmer.inventoryLots.create, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: Number(form.productId),
        farmerId: (()=>{
          const roles = (user?.roles || []).map(r => (r.name || r.nameEn || '').toLowerCase());
          const isFarmer = roles.includes('farmer') || roles.includes('loader');
          return isFarmer ? Number(user?.userId) : (Number(form.farmerId) || 1);
        })(),
        unit: form.unit,
        qualityGrade: form.qualityGrade,
        totalQuantity: Number(form.totalQuantity),
        price: form.price ? Number(form.price) : null,
        minimumOrderQuantity: form.minimumOrderQuantity ? Number(form.minimumOrderQuantity) : null,
        tieredPricing: form.tieredPricing.length > 0 ? form.tieredPricing : null,
        reservedQuantity: 0,
        status: form.status || "harvested",
      }),
    });
    const lotData = await lotRes.json();
    const lotId = lotData?.data?.id;
    // 2) Save custom attribute values if any
    if (lotId && attributeDefs.length > 0) {
      const entries = Object.entries(attributeValues).filter(([k, v]) => v !== undefined && v !== null && String(v).trim() !== "");
      for (const [defId, val] of entries) {
        await fetch(API_ENDPOINTS.farmer.attributeValues.create, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inventoryLotId: lotId,
            attributeDefinitionId: Number(defId),
            value: String(val),
          })
        });
      }
    }
    setForm({ 
      productId: "", 
      farmerId: "", 
      farmerLabel: "", 
      unit: "kg", 
      qualityGrade: "درجه 1", 
      totalQuantity: "", 
      price: "", 
      minimumOrderQuantity: "",
      tieredPricing: [],
      status: "harvested" 
    });
    setAttributeDefs([]);
    setAttributeValues({});
    setSaving(false);
    load();
  };

  const remove = async (id) => {
    await fetch(API_ENDPOINTS.farmer.inventoryLots.delete(id), { method: "DELETE" });
    load();
  };

  const openEdit = (lot) => {
    setSelectedLot(lot);
    setEditForm({
      unit: lot.unit || "",
      qualityGrade: lot.qualityGrade || "",
      totalQuantity: String(lot.totalQuantity ?? ""),
      price: lot.price == null ? "" : String(lot.price),
      minimumOrderQuantity: lot.minimumOrderQuantity ? String(lot.minimumOrderQuantity) : "",
      tieredPricing: lot.tieredPricing || [],
      status: lot.status || "harvested",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!selectedLot) return;
    const payload = {
      unit: editForm.unit || null,
      qualityGrade: editForm.qualityGrade || null,
      totalQuantity: editForm.totalQuantity !== "" ? Number(editForm.totalQuantity) : null,
      price: editForm.price !== "" ? Number(editForm.price) : null,
      minimumOrderQuantity: editForm.minimumOrderQuantity ? Number(editForm.minimumOrderQuantity) : null,
      tieredPricing: editForm.tieredPricing.length > 0 ? editForm.tieredPricing : null,
      status: editForm.status || null,
    };
    await fetch(API_ENDPOINTS.farmer.inventoryLots.update(selectedLot.id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    });
    setEditOpen(false);
    setSelectedLot(null);
    load();
  };

  const openMedia = (lot) => {
    setSelectedLot(lot);
    setMediaOpen(true);
  };

  // مدیریت قیمت‌گذاری پلکانی
  const addPricingTier = () => {
    setForm({
      ...form,
      tieredPricing: [...form.tieredPricing, {
        minQuantity: '',
        maxQuantity: '',
        pricePerUnit: '',
        description: ''
      }]
    });
  };

  const removePricingTier = (index) => {
    const newTiers = form.tieredPricing.filter((_, i) => i !== index);
    setForm({ ...form, tieredPricing: newTiers });
  };

  const updatePricingTier = (index, field, value) => {
    const newTiers = [...form.tieredPricing];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setForm({ ...form, tieredPricing: newTiers });
  };

  // مدیریت قیمت‌گذاری پلکانی برای فرم ویرایش
  const addEditPricingTier = () => {
    setEditForm({
      ...editForm,
      tieredPricing: [...editForm.tieredPricing, {
        minQuantity: '',
        maxQuantity: '',
        pricePerUnit: '',
        description: ''
      }]
    });
  };

  const removeEditPricingTier = (index) => {
    const newTiers = editForm.tieredPricing.filter((_, i) => i !== index);
    setEditForm({ ...editForm, tieredPricing: newTiers });
  };

  const updateEditPricingTier = (index, field, value) => {
    const newTiers = [...editForm.tieredPricing];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setEditForm({ ...editForm, tieredPricing: newTiers });
  };

  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-lg sm:text-xl font-bold mb-4">موجودی‌ها</h1>
      <form onSubmit={create} className="bg-white p-3 sm:p-4 rounded-md shadow mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="sm:col-span-2 lg:col-span-2">
          <AsyncSelect
            cacheOptions
            defaultOptions={products.map(p => ({ value: p.id, label: p.name }))}
            loadOptions={loadProductOptions}
            placeholder="انتخاب محصول"
            noOptionsMessage={()=>"موردی یافت نشد"}
            onChange={(opt)=> setForm({ ...form, productId: opt?.value || "" })}
            value={form.productId ? { value: form.productId, label: products.find(p=>p.id===Number(form.productId))?.name || `#${form.productId}` } : null}
          />
        </div>
        {(() => {
          const roles = (user?.roles || []).map(r => (r.name || r.nameEn || '').toLowerCase());
          const isFarmer = roles.includes('farmer') || roles.includes('loader');
          if (isFarmer) return null;
          return (
            <div className="sm:col-span-2 lg:col-span-2">
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadFarmerOptions}
                placeholder="انتخاب تامین‌کننده"
                noOptionsMessage={()=>"موردی یافت نشد"}
                onChange={(opt)=> setForm({ ...form, farmerId: opt?.value || "", farmerLabel: opt?.label || "" })}
                value={form.farmerId ? { value: form.farmerId, label: form.farmerLabel || farmerNameMap.get(Number(form.farmerId)) || `#${form.farmerId}` } : null}
              />
            </div>
          );
        })()}
        <input className="border p-2 rounded text-sm" placeholder="واحد" value={form.unit} onChange={(e)=>setForm({...form, unit:e.target.value})} />
        <select
          className="border p-2 rounded text-sm"
          value={form.qualityGrade}
          onChange={(e)=>setForm({...form, qualityGrade:e.target.value})}
        >
          <option value="صادراتی">صادراتی</option>
          <option value="درجه 1">درجه 1</option>
          <option value="درجه 2">درجه 2</option>
          <option value="درجه 3">درجه 3</option>
          <option value="ضایعاتی">ضایعاتی</option>
        </select>
        <input className="border p-2 rounded text-sm" placeholder="مقدار کل" value={form.totalQuantity} onChange={(e)=>setForm({...form, totalQuantity:e.target.value})} />
        <input className="border p-2 rounded text-sm" placeholder="قیمت (اختیاری)" value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} />
        <input className="border p-2 rounded text-sm" placeholder="حداقل سفارش" value={form.minimumOrderQuantity} onChange={(e)=>setForm({...form, minimumOrderQuantity:e.target.value})} />
        <select
          className="border p-2 rounded text-sm"
          value={form.status}
          onChange={(e)=>setForm({...form, status:e.target.value})}
          title="وضعیت"
        >
          <option value="harvested">برداشت‌شده</option>
          <option value="on_field">در مزرعه</option>
        </select>
        {/* Custom attributes dynamic fields */}
        {attributeDefs.length > 0 && (
          <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-3 gap-2 border-t pt-2">
            {attributeDefs.map(def => (
              <div key={def.id} className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">{def.name}</label>
                {def.type === 'number' ? (
                  <input type="number" className="border p-2 rounded" value={attributeValues[def.id] ?? ''} onChange={(e)=> setAttributeValues(v=>({ ...v, [def.id]: e.target.value }))} />
                ) : def.type === 'boolean' ? (
                  <select className="border p-2 rounded" value={attributeValues[def.id] ?? ''} onChange={(e)=> setAttributeValues(v=>({ ...v, [def.id]: e.target.value }))}>
                    <option value="">—</option>
                    <option value="true">بلی</option>
                    <option value="false">خیر</option>
                  </select>
                ) : def.type === 'date' ? (
                  <input type="date" className="border p-2 rounded" value={attributeValues[def.id] ?? ''} onChange={(e)=> setAttributeValues(v=>({ ...v, [def.id]: e.target.value }))} />
                ) : def.type === 'select' && Array.isArray(def.options) ? (
                  <select className="border p-2 rounded" value={attributeValues[def.id] ?? ''} onChange={(e)=> setAttributeValues(v=>({ ...v, [def.id]: e.target.value }))}>
                    <option value="">—</option>
                    {def.options.map(opt => (
                      <option key={String(opt?.value ?? opt)} value={String(opt?.value ?? opt)}>{String(opt?.label ?? opt)}</option>
                    ))}
                  </select>
                ) : (
                  <input className="border p-2 rounded" value={attributeValues[def.id] ?? ''} onChange={(e)=> setAttributeValues(v=>({ ...v, [def.id]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* قیمت‌گذاری پلکانی */}
        <div className="md:col-span-6 border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">قیمت‌گذاری پلکانی (اختیاری)</h4>
            <button
              type="button"
              onClick={() => setShowTieredPricing(!showTieredPricing)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showTieredPricing ? 'مخفی کردن' : 'نمایش'}
            </button>
          </div>
          
          {showTieredPricing && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addPricingTier}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  + اضافه کردن سطح قیمت
                </button>
              </div>
              
              {form.tieredPricing.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  هنوز سطح قیمتی تعریف نشده است
                </div>
              ) : (
                <div className="space-y-2">
                  {form.tieredPricing.map((tier, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">سطح {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removePricingTier(index)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          حذف
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">حداقل مقدار</label>
                          <input
                            type="number"
                            value={tier.minQuantity}
                            onChange={(e) => updatePricingTier(index, 'minQuantity', e.target.value)}
                            min="0"
                            step="0.1"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">حداکثر مقدار</label>
                          <input
                            type="number"
                            value={tier.maxQuantity}
                            onChange={(e) => updatePricingTier(index, 'maxQuantity', e.target.value)}
                            min="0"
                            step="0.1"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="خالی = نامحدود"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">قیمت هر {form.unit}</label>
                          <input
                            type="number"
                            value={tier.pricePerUnit}
                            onChange={(e) => updatePricingTier(index, 'pricePerUnit', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">توضیحات</label>
                          <input
                            type="text"
                            value={tier.description}
                            onChange={(e) => updatePricingTier(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="توضیحات اختیاری"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button disabled={saving} className="w-full sm:w-auto bg-blue-600 text-white rounded px-4 py-2 text-sm">{saving?"...":"افزودن"}</button>
      </form>

      <div className="bg-white rounded-md shadow">
        {/* Desktop Table */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b">
                <th className="px-4 py-3 text-right font-medium">ID</th>
                <th className="px-4 py-3 text-right font-medium">محصول</th>
                <th className="px-4 py-3 text-right font-medium">نام محصول</th>
                <th className="px-4 py-3 text-right font-medium">تامین‌کننده</th>
                <th className="px-4 py-3 text-right font-medium">کیفیت</th>
                <th className="px-4 py-3 text-right font-medium">واحد</th>
                <th className="px-4 py-3 text-right font-medium">کل</th>
                <th className="px-4 py-3 text-right font-medium">رزرو</th>
                <th className="px-4 py-3 text-right font-medium">قیمت</th>
                <th className="px-4 py-3 text-right font-medium">حداقل سفارش</th>
                <th className="px-4 py-3 text-right font-medium">قیمت‌گذاری پلکانی</th>
                <th className="px-4 py-3 text-right font-medium">وضعیت</th>
                <th className="px-4 py-3 text-right font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((x)=> (
                <tr key={x.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{x.id}</td>
                  <td className="px-4 py-3 font-mono text-xs">{x.productId}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={products.find(p => p.id === x.productId)?.name || "—"}>
                    {products.find(p => p.id === x.productId)?.name || "—"}
                  </td>
                  <td className="px-4 py-3">{farmerNameMap.get(x.farmerId) || `#${x.farmerId}`}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {x.qualityGrade}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{x.unit}</td>
                  <td className="px-4 py-3 font-mono text-xs">{x.totalQuantity?.toLocaleString('fa-IR')}</td>
                  <td className="px-4 py-3 font-mono text-xs">{x.reservedQuantity?.toLocaleString('fa-IR')}</td>
                  <td className="px-4 py-3">
                    {x.tieredPricing && x.tieredPricing.length > 0 ? (
                      <span className="text-xs text-gray-500">قیمت پلکانی</span>
                    ) : x.price ? (
                      <span className="font-medium text-green-600">{x.price.toLocaleString('fa-IR')} تومان</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {x.tieredPricing && x.tieredPricing.length > 0 ? (
                      <span className="text-xs text-gray-500">قیمت پلکانی</span>
                    ) : x.minimumOrderQuantity ? (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {x.minimumOrderQuantity} {x.unit}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <TieredPricingDisplay tieredPricing={x.tieredPricing} unit={x.unit} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      x.status === 'harvested' ? 'bg-green-100 text-green-800' :
                      x.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                      x.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {statusToFa[x.status] || x.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors" 
                        onClick={()=>openEdit(x)}
                      >
                        ویرایش
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors" 
                        onClick={()=>remove(x.id)}
                      >
                        حذف
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded hover:bg-green-50 transition-colors" 
                        onClick={()=>openMedia(x)}
                      >
                        رسانه
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Cards */}
        <div className="xl:hidden">
          {items.map((x) => (
            <div key={x.id} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-500">#{x.id}</span>
                  <span className="text-sm font-medium">{products.find(p => p.id === x.productId)?.name || "—"}</span>
                </div>
                <div className="flex gap-1">
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50" 
                    onClick={()=>openEdit(x)}
                  >
                    ویرایش
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50" 
                    onClick={()=>remove(x.id)}
                  >
                    حذف
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">تامین‌کننده:</span>
                  <div className="font-medium">{farmerNameMap.get(x.farmerId) || `#${x.farmerId}`}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">کیفیت:</span>
                  <div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {x.qualityGrade}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">مقدار کل:</span>
                  <div className="font-mono">{x.totalQuantity?.toLocaleString('fa-IR')} {x.unit}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">رزرو شده:</span>
                  <div className="font-mono">{x.reservedQuantity?.toLocaleString('fa-IR')} {x.unit}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">قیمت:</span>
                  <div>
                    {x.tieredPricing && x.tieredPricing.length > 0 ? (
                      <span className="text-xs text-gray-500">قیمت پلکانی</span>
                    ) : x.price ? (
                      <span className="font-medium text-green-600">{x.price.toLocaleString('fa-IR')} تومان</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">حداقل سفارش:</span>
                  <div>
                    {x.tieredPricing && x.tieredPricing.length > 0 ? (
                      <span className="text-xs text-gray-500">قیمت پلکانی</span>
                    ) : x.minimumOrderQuantity ? (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {x.minimumOrderQuantity} {x.unit}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">قیمت‌گذاری پلکانی:</span>
                  <div>
                    <TieredPricingDisplay tieredPricing={x.tieredPricing} unit={x.unit} />
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">وضعیت:</span>
                  <div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      x.status === 'harvested' ? 'bg-green-100 text-green-800' :
                      x.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                      x.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {statusToFa[x.status] || x.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {x.attributes && x.attributes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-500 text-xs">ویژگی‌ها:</span>
                  <div className="mt-1 space-y-1">
                    {x.attributes.map((a) => (
                      <div key={a.id} className="text-xs text-gray-700">
                        <span className="font-medium">{a.definition?.name}:</span> {a.value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button 
                  className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded hover:bg-green-50" 
                  onClick={()=>openMedia(x)}
                >
                  مدیریت رسانه
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && selectedLot ? (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-md shadow p-4 w-full max-w-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">ویرایش موجودی #{selectedLot.id}</div>
              <button className="text-slate-500" onClick={()=>{setEditOpen(false); setSelectedLot(null);}}>✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <input className="border p-2 rounded" placeholder="واحد" value={editForm.unit} onChange={(e)=>setEditForm({...editForm, unit:e.target.value})} />
              <input className="border p-2 rounded" placeholder="کیفیت" value={editForm.qualityGrade} onChange={(e)=>setEditForm({...editForm, qualityGrade:e.target.value})} />
              <input className="border p-2 rounded" placeholder="مقدار کل" value={editForm.totalQuantity} onChange={(e)=>setEditForm({...editForm, totalQuantity:e.target.value})} />
              <input className="border p-2 rounded" placeholder="قیمت (اختیاری)" value={editForm.price} onChange={(e)=>setEditForm({...editForm, price:e.target.value})} />
              <input className="border p-2 rounded" placeholder="حداقل سفارش" value={editForm.minimumOrderQuantity} onChange={(e)=>setEditForm({...editForm, minimumOrderQuantity:e.target.value})} />
              <select className="border p-2 rounded" value={editForm.status} onChange={(e)=>setEditForm({...editForm, status:e.target.value})}>
                <option value="harvested">برداشت‌شده</option>
                <option value="on_field">در مزرعه</option>
                <option value="reserved">رزرو شده</option>
                <option value="sold">فروخته شده</option>
              </select>
            </div>

            {/* قیمت‌گذاری پلکانی در فرم ویرایش */}
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">قیمت‌گذاری پلکانی</h4>
                <button
                  type="button"
                  onClick={addEditPricingTier}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  + اضافه کردن سطح قیمت
                </button>
              </div>
              
              {editForm.tieredPricing.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  هنوز سطح قیمتی تعریف نشده است
                </div>
              ) : (
                <div className="space-y-2">
                  {editForm.tieredPricing.map((tier, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">سطح {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeEditPricingTier(index)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          حذف
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">حداقل مقدار</label>
                          <input
                            type="number"
                            value={tier.minQuantity}
                            onChange={(e) => updateEditPricingTier(index, 'minQuantity', e.target.value)}
                            min="0"
                            step="0.1"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">حداکثر مقدار</label>
                          <input
                            type="number"
                            value={tier.maxQuantity}
                            onChange={(e) => updateEditPricingTier(index, 'maxQuantity', e.target.value)}
                            min="0"
                            step="0.1"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="خالی = نامحدود"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">قیمت هر {editForm.unit}</label>
                          <input
                            type="number"
                            value={tier.pricePerUnit}
                            onChange={(e) => updateEditPricingTier(index, 'pricePerUnit', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">توضیحات</label>
                          <input
                            type="text"
                            value={tier.description}
                            onChange={(e) => updateEditPricingTier(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="توضیحات اختیاری"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 mt-3">
              <button className="border rounded px-3 py-1" onClick={()=>{setEditOpen(false); setSelectedLot(null);}}>انصراف</button>
              <button className="bg-emerald-600 text-white rounded px-3 py-1" onClick={saveEdit}>ذخیره</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Media modal */}
      {mediaOpen && selectedLot ? (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-md shadow p-4 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">رسانه‌های موجودی #{selectedLot.id}</div>
              <button className="text-slate-500" onClick={()=>{setMediaOpen(false); setSelectedLot(null);}}>✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-600 mb-1">تصاویر</div>
                <MediaUpload module="inventory" entityId={selectedLot.id} fileType="images" accept="image/*" buttonLabel="آپلود تصویر" />
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">ویدیوها</div>
                <MediaUpload module="inventory" entityId={selectedLot.id} fileType="videos" accept="video/*" buttonLabel="آپلود ویدیو" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

