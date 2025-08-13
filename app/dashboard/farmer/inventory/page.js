"use client";
import { useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import { API_ENDPOINTS } from "@/app/config/api";

export default function InventoryLotsPage() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productId: "", farmerId: "", farmerLabel: "", unit: "kg", qualityGrade: "درجه 1", totalQuantity: "", price: "", status: "harvested" });
  const [attributeDefs, setAttributeDefs] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [farmerNameMap, setFarmerNameMap] = useState(new Map());

  const statusToFa = {
    on_field: "در مزرعه",
    harvested: "برداشت‌شده",
    reserved: "رزرو شده",
    sold: "فروخته شده",
  };

  const load = async () => {
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
    setItems(lots);
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
  };
  useEffect(() => { load(); }, []);

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
    setLoading(true);
    // 1) Create inventory lot
    const lotRes = await fetch(API_ENDPOINTS.farmer.inventoryLots.create, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: Number(form.productId),
        farmerId: Number(form.farmerId) || 1,
        unit: form.unit,
        qualityGrade: form.qualityGrade,
        totalQuantity: Number(form.totalQuantity),
        price: form.price ? Number(form.price) : null,
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
    setForm({ productId: "", farmerId: "", farmerLabel: "", unit: "kg", qualityGrade: "درجه 1", totalQuantity: "", price: "", status: "harvested" });
    setAttributeDefs([]);
    setAttributeValues({});
    setLoading(false);
    load();
  };

  const remove = async (id) => {
    await fetch(API_ENDPOINTS.farmer.inventoryLots.delete(id), { method: "DELETE" });
    load();
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">موجودی‌ها</h1>
      <form onSubmit={create} className="bg-white p-4 rounded-md shadow mb-6 grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="md:col-span-2">
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
        <div className="md:col-span-2">
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
        <input className="border p-2 rounded" placeholder="واحد" value={form.unit} onChange={(e)=>setForm({...form, unit:e.target.value})} />
        <select
          className="border p-2 rounded"
          value={form.qualityGrade}
          onChange={(e)=>setForm({...form, qualityGrade:e.target.value})}
        >
          <option value="صادراتی">صادراتی</option>
          <option value="درجه 1">درجه 1</option>
          <option value="درجه 2">درجه 2</option>
          <option value="درجه 3">درجه 3</option>
          <option value="ضایعاتی">ضایعاتی</option>
        </select>
        <input className="border p-2 rounded" placeholder="مقدار کل" value={form.totalQuantity} onChange={(e)=>setForm({...form, totalQuantity:e.target.value})} />
        <input className="border p-2 rounded" placeholder="قیمت (اختیاری)" value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} />
        <select
          className="border p-2 rounded"
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

        <button disabled={loading} className="bg-blue-600 text-white rounded px-4">{loading?"...":"افزودن"}</button>
      </form>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2">ID</th>
              <th className="p-2">محصول</th>
              <th className="p-2">نام محصول</th>
              <th className="p-2">تامین‌کننده</th>
              <th className="p-2">کیفیت</th>
              <th className="p-2">واحد</th>
              <th className="p-2">کل</th>
              <th className="p-2">رزرو</th>
              <th className="p-2">قیمت</th>
              <th className="p-2">وضعیت</th>
              <th className="p-2">ویژگی‌ها</th>
              <th className="p-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x)=> (
              <tr key={x.id} className="border-t">
                <td className="p-2">{x.id}</td>
                <td className="p-2">{x.productId}</td>
                <td className="p-2">{products.find(p => p.id === x.productId)?.name || "—"}</td>
                <td className="p-2">{farmerNameMap.get(x.farmerId) || `#${x.farmerId}`}</td>
                <td className="p-2">{x.qualityGrade}</td>
                <td className="p-2">{x.unit}</td>
                <td className="p-2">{x.totalQuantity}</td>
                <td className="p-2">{x.reservedQuantity}</td>
                <td className="p-2">{x.price ?? '-'}</td>
                <td className="p-2">{statusToFa[x.status] || x.status}</td>
                <td className="p-2">
                  {x.attributes && x.attributes.length ? (
                    <div className="flex flex-col gap-1 min-w-[200px]">
                      {x.attributes.map((a) => (
                        <div key={a.id} className="text-xs text-gray-700">
                          <span className="text-gray-500">{a.definition?.name || `#${a.attributeDefinitionId}`}:</span> {a.value ?? '—'}
                        </div>
                      ))}
                    </div>
                  ) : '—'}
                </td>
                <td className="p-2">
                  <button onClick={()=>remove(x.id)} className="text-red-600">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

