"use client";
import { useEffect, useMemo, useState, Fragment } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
// Supplier view does not need selects

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [lots, setLots] = useState([]);
  const [products, setProducts] = useState([]);
  const statusToFa = { pending: 'در انتظار', reserved: 'رزرو شده', completed: 'تکمیل‌شده', cancelled: 'لغو شده' };
  const itemStatusToFa = {
    assigned: 'محول‌شده',
    reviewing: 'در حال بررسی',
    preparing: 'در حال آماده‌سازی',
    ready: 'آماده تحویل',
    shipped: 'ارسال شد',
    delivered: 'تحویل شد',
    cancelled: 'لغو'
  };
  const [cart, setCart] = useState(null);

  const load = async () => {
    const [ro, rl, rp] = await Promise.all([
      fetch(API_ENDPOINTS.farmer.orders.getMine, { cache: "no-store", credentials: 'include' }),
      fetch(API_ENDPOINTS.farmer.inventoryLots.getAll, { cache: "no-store", credentials: 'include' }),
      fetch(API_ENDPOINTS.farmer.products.getAll + '?isOrderable=true', { cache: "no-store", credentials: 'include' }),
    ]);
    const doo = await ro.json();
    const dll = await rl.json();
    const dpp = await rp.json();
    setOrders(Array.isArray(doo?.data) ? doo.data : (doo?.data?.rows || []));
    setLots(dll.data || []);
    setProducts(dpp.data || []);
  };
  useEffect(() => { load(); }, []);

  // Supplier should not access customer cart; disable cart section
  const loadCart = async () => setCart(null);
  useEffect(() => { setCart(null); }, []);

  const productIdToName = useMemo(() => {
    const map = new Map();
    (products || []).forEach(p => map.set(p.id, p.name));
    return map;
  }, [products]);

  const create = async (e) => { e.preventDefault(); };

  // Supplier cannot cancel/complete whole orders; uses per-item status instead
  const cancel = async () => {};
  const complete = async () => {};

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const loadOrderItems = async (orderId) => {
    setLoadingItems(true);
    try {
      const r = await fetch(API_ENDPOINTS.farmer.orders.getItems(orderId), { cache: 'no-store', credentials: 'include' });
      const j = await r.json();
      setOrderItems(Array.isArray(j?.data) ? j.data : []);
    } finally { setLoadingItems(false); }
  };

  const updateItemStatus = async (itemId, status, notes) => {
    await fetch(API_ENDPOINTS.farmer.orders.updateItemStatus(itemId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
      credentials: 'include'
    });
    if (expandedOrderId) await loadOrderItems(expandedOrderId);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">سفارش‌ها (تامین‌کننده)</h1>

      {/* Supplier cannot access customer cart; section removed */}

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <h2 className="text-lg font-semibold p-4 pb-0">گزارش سفارشات</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2">ID</th>
              <th className="p-2">جزئیات سفارش</th>
              <th className="p-2">وضعیت</th>
              <th className="p-2">تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o=> (
              <Fragment key={o.id}>
                <tr className="border-t">
                  <td className="p-2">
                    <button className="text-blue-600 underline" onClick={async ()=>{
                      if (expandedOrderId === o.id) { setExpandedOrderId(null); setOrderItems([]); return; }
                      setExpandedOrderId(o.id);
                      await loadOrderItems(o.id);
                    }}>{o.id}</button>
                  </td>
                  <td className="p-2 text-xs text-slate-700">
                    {(o.items||[]).map(it => {
                      const prod = it.inventoryLot?.product?.name || `#${it.inventoryLot?.productId||''}`;
                      const grade = it.inventoryLot?.qualityGrade || '';
                      return `${prod}${grade?` - درجه ${grade}`:''}: ${it.quantity}`;
                    }).join(' | ')}
                  </td>
                  <td className="p-2">{statusToFa[o.status] || o.status}</td>
                  <td className="p-2">{o.createdAt ? new Date(o.createdAt).toLocaleString('fa-IR') : '—'}</td>
                </tr>
                {expandedOrderId === o.id ? (
                  <tr>
                    <td colSpan={4} className="bg-slate-50 p-3">
                      {loadingItems ? (
                        <div className="text-sm text-slate-500">در حال بارگذاری آیتم‌ها...</div>
                      ) : orderItems.length === 0 ? (
                        <div className="text-sm text-slate-500">آیتمی یافت نشد.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="p-2">آیتم</th>
                                <th className="p-2">کالا</th>
                                <th className="p-2">مقدار</th>
                                <th className="p-2">وضعیت تامین‌کننده</th>
                                <th className="p-2">یادداشت</th>
                                <th className="p-2">بروزرسانی</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderItems.map(it => (
                                <tr key={it.id} className="border-t">
                                  <td className="p-2">#{it.id}</td>
                                  <td className="p-2">{it.inventoryLot?.product?.name || `#${it.inventoryLot?.productId||''}`} {it.inventoryLot?.qualityGrade ? `- درجه ${it.inventoryLot.qualityGrade}` : ''}</td>
                                  <td className="p-2">{it.quantity}</td>
                                  <td className="p-2">{itemStatusToFa[it.status] || it.status}</td>
                                  <td className="p-2">{it.statusNotes || '—'}</td>
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      <select className="border rounded px-2 py-1"
                                        defaultValue={it.status}
                                        onChange={async (e)=>{
                                          const next = e.target.value;
                                          await updateItemStatus(it.id, next, it.statusNotes || '');
                                        }}
                                      >
                                        {Object.keys(itemStatusToFa).map(k => (
                                          <option key={k} value={k}>{itemStatusToFa[k]}</option>
                                        ))}
                                      </select>
                                      <button className="text-blue-600" onClick={async ()=>{
                                        const txt = prompt('یادداشت وضعیت', it.statusNotes || '');
                                        await updateItemStatus(it.id, it.status, txt || '');
                                      }}>یادداشت</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

