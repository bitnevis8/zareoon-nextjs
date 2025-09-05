"use client";
import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import AsyncSelect from "react-select/async";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const auth = useAuth();
  const router = useRouter();
  const roles = (auth?.user?.roles || []).map(r => (r.name || r.nameEn || '')).map(n => (n||'').toLowerCase());
  const isAdmin = roles.includes('admin');
  useEffect(() => {
    if (auth && !auth.loading && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [auth, isAdmin, router]);
  const [orders, setOrders] = useState([]);
  const [lots, setLots] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ orderId: "", items: [{ inventoryLotId: "", lotLabel: "", quantity: "" }] });
  const statusToFa = { pending: 'در انتظار', reserved: 'رزرو شده', completed: 'تکمیل‌شده', cancelled: 'لغو شده' };

  const load = async () => {
    const [ro, rl, rp] = await Promise.all([
      fetch(API_ENDPOINTS.farmer.orders.getAll, { cache: "no-store", credentials: 'include' }),
      fetch(API_ENDPOINTS.farmer.inventoryLots.getAll, { cache: "no-store", credentials: 'include' }),
      fetch(API_ENDPOINTS.farmer.products.getAll + '?isOrderable=true', { cache: "no-store", credentials: 'include' }),
    ]);
    const doo = await ro.json();
    const dll = await rl.json();
    const dpp = await rp.json();
    setOrders(doo.data || []);
    setLots(dll.data || []);
    setProducts(dpp.data || []);
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const productIdToName = useMemo(() => {
    const map = new Map();
    (products || []).forEach(p => map.set(p.id, p.name));
    return map;
  }, [products]);

  const addItem = () => setForm({ ...form, items: [...form.items, { inventoryLotId: "", lotLabel: "", quantity: "" }] });
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const allocate = async (e) => {
    e.preventDefault();
    if (!form.orderId) { alert('ابتدا سفارش را انتخاب کنید'); return; }
    const payload = { items: form.items.filter(i => i.inventoryLotId && Number(i.quantity) > 0).map(i => ({ inventoryLotId: Number(i.inventoryLotId), quantity: Number(i.quantity) })) };
    if (payload.items.length === 0) { alert('حداقل یک آیتم معتبر وارد کنید'); return; }
    const res = await fetch(API_ENDPOINTS.farmer.orders.allocate(Number(form.orderId)), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
    const j = await res.json();
    if (j?.success) { alert('تخصیص ثبت شد'); setForm({ orderId: form.orderId, items: [{ inventoryLotId: "", lotLabel: "", quantity: "" }] }); load(); }
    else alert(j?.message || 'خطا در تخصیص');
  };

  if (auth?.loading) return <div className="p-6">در حال بررسی دسترسی...</div>;
  if (!isAdmin) return null;
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">سفارش‌ها (مدیریت)</h1>

      <form onSubmit={allocate} className="bg-white p-4 rounded-md shadow mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
          <AsyncSelect
            cacheOptions
            defaultOptions={(orders||[]).map(o => ({ value: o.id, label: `#${o.id} - ${(o.items||[]).length} آیتم` }))}
            loadOptions={async (inputValue)=>{
              const q = (inputValue||"").trim();
              const data = (orders||[]).map(o => ({ value: o.id, label: `#${o.id} - ${(o.items||[]).length} آیتم` }));
              if (!q) return data;
              return data.filter(opt => String(opt.value).includes(q));
            }}
            placeholder="انتخاب سفارش برای تخصیص"
            noOptionsMessage={()=>"موردی یافت نشد"}
            onChange={(opt)=> setForm({ ...form, orderId: opt?.value || "" })}
            value={form.orderId ? { value: form.orderId, label: `#${form.orderId}` } : null}
          />
          <div />
          <button className="bg-blue-600 text-white rounded px-4">ثبت تخصیص</button>
        </div>
        <div className="space-y-2">
          {form.items.map((it, idx)=> (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
              <AsyncSelect
                cacheOptions
                defaultOptions={(lots||[]).map(l => {
                  const productTitle = productIdToName.get(l.productId) || l.productId;
                  const grade = l.qualityGrade ? `درجه ${l.qualityGrade}` : '';
                  const supplierName = l.farmer ? ((`${l.farmer.firstName||''} ${l.farmer.lastName||''}`).trim() || l.farmer.username || l.farmer.mobile || `#${l.farmer.id}`) : `#${l.farmerId}`;
                  const label = [productTitle, grade, supplierName].filter(Boolean).join(' - ');
                  return { value: l.id, label };
                })}
                loadOptions={async (inputValue)=>{
                  const q = (inputValue||"").toLowerCase().trim();
                  const data = (lots||[]).map(l => {
                    const productTitle = productIdToName.get(l.productId) || l.productId;
                    const grade = l.qualityGrade ? `درجه ${l.qualityGrade}` : '';
                    const supplierName = l.farmer ? ((`${l.farmer.firstName||''} ${l.farmer.lastName||''}`).trim() || l.farmer.username || l.farmer.mobile || `#${l.farmer.id}`) : `#${l.farmerId}`;
                    const label = [productTitle, grade, supplierName].filter(Boolean).join(' - ');
                    return { value: l.id, label };
                  });
                  if (!q) return data;
                  return data.filter(opt => String(opt.value).includes(q) || String(opt.label).toLowerCase().includes(q));
                }}
                placeholder="انتخاب موجودی"
                noOptionsMessage={()=>"موردی یافت نشد"}
                onChange={(opt)=> {
                  const value = opt?.value || "";
                  const label = opt?.label || "";
                  setForm(prev => {
                    const items = [...prev.items];
                    items[idx] = { ...items[idx], inventoryLotId: value, lotLabel: label };
                    return { ...prev, items };
                  });
                }}
                value={it.inventoryLotId ? { value: it.inventoryLotId, label: it.lotLabel || `${it.inventoryLotId}` } : null}
              />
              <input className="border p-2 rounded" placeholder="مقدار" value={it.quantity} onChange={(e)=>updateItem(idx, 'quantity', e.target.value)} />
              <div className="flex items-center">
                <button type="button" className="border rounded px-3" onClick={addItem}>+</button>
              </div>
            </div>
          ))}
        </div>
      </form>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <h2 className="text-lg font-semibold p-4 pb-0">گزارش سفارشات</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2">ID</th>
              <th className="p-2">جزئیات سفارش</th>
              <th className="p-2">مشتری</th>
              <th className="p-2">تامین‌کنندگان تخصیص‌یافته</th>
              <th className="p-2">وضعیت</th>
              <th className="p-2">تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o=> (
              <tr key={o.id} className="border-t">
                <td className="p-2">{o.id}</td>
                <td className="p-2 text-xs text-slate-700">
                  {(o.items||[]).map(it => {
                    const prod = it.inventoryLot?.product?.name || `#${it.inventoryLot?.productId||''}`;
                    const grade = it.inventoryLot?.qualityGrade || '';
                    return `${prod}${grade?` - درجه ${grade}`:''}: ${it.quantity}`;
                  }).join(' | ')}
                </td>
                <td className="p-2">{o.customer ? ((`${o.customer.firstName||''} ${o.customer.lastName||''}`).trim() || o.customer.username || o.customer.mobile || `#${o.customer.id}`) : `#${o.customerId}`}</td>
                <td className="p-2 text-xs">
                  {Array.from(new Map((o.items||[]).map(it => {
                    const f = it.inventoryLot?.farmer;
                    const name = f ? ((`${f.firstName||''} ${f.lastName||''}`).trim() || f.username || f.mobile || `#${f.id}`) : `#${it.inventoryLot?.farmerId||''}`;
                    return [name, true];
                  })).keys()).join(' ، ')}
                </td>
                <td className="p-2">{statusToFa[o.status] || o.status}</td>
                <td className="p-2">{o.createdAt ? new Date(o.createdAt).toLocaleString('fa-IR') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
