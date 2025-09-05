"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";

export default function CartPage() {
  const [cart, setCart] = useState({ id: null, items: [] });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [supportPhone, setSupportPhone] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.farmer.cart.base}/me`, { cache: 'no-store', credentials: 'include' });
      const d = await res.json();
      setCart(d.data || { items: [] });
    } finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    (async () => {
      try {
        const r = await fetch(API_ENDPOINTS.users.getById(2), { cache: 'no-store', credentials: 'include' });
        const j = await r.json();
        const u = j?.data || j;
        if (u && (u.mobile || u.phone)) setSupportPhone(u.mobile || u.phone);
      } catch {}
    })();
  }, []);

  const totalItems = useMemo(() => (cart.items||[]).length, [cart]);

  const remove = async (id) => {
    await fetch(`${API_ENDPOINTS.farmer.cart.base}/item/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };
  const updateQty = async (id, quantity) => {
    await fetch(`${API_ENDPOINTS.farmer.cart.base}/item/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ quantity: Number(quantity) })
    });
    load();
  };

  const checkout = async () => {
    setMsg("");
    try {
      const r = await fetch(`${API_ENDPOINTS.farmer.cart.base}/checkout`, { method: 'POST', credentials: 'include' });
      const j = await r.json();
      if (!r.ok || !j?.success) throw new Error(j?.message || 'خطا در ثبت سفارش');
      setMsgType('success');
      setMsg(`سفارش شما ثبت شد. برای تایید نهایی با شما تماس می‌گیریم.${supportPhone?` شماره پشتیبانی: ${supportPhone}`:''}`);
      load();
    } catch (e) {
      setMsgType('error'); setMsg(e.message || 'خطای غیرمنتظره در ثبت سفارش');
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">سبد خرید</h1>
      {loading ? <div className="text-slate-500">در حال بارگذاری...</div> : (
        <>
          {(cart.items||[]).length === 0 ? (
            <div className="text-slate-500">سبد شما خالی است.</div>
          ) : (
            <div className="space-y-3">
              {(cart.items||[]).map(it => (
                <div key={it.id} className="flex items-center justify-between border rounded-lg p-3 bg-white">
                  <div className="text-sm">
                    <div className="font-medium">محصول #{it.productId}</div>
                    <div className="text-slate-600">درجه: {it.qualityGrade}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" step="0.001" className="border rounded px-2 py-1 w-28" value={it.quantity}
                      onChange={(e)=>updateQty(it.id, e.target.value)} />
                    <button className="text-rose-600" onClick={()=>remove(it.id)}>حذف</button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-slate-600">تعداد آیتم: {totalItems}</div>
                <button className="bg-emerald-600 text-white rounded px-4 py-2" onClick={checkout}>ثبت سفارش</button>
              </div>
            </div>
          )}
          {msg ? (
            <div className={`mt-4 rounded-2xl border p-4 ${msgType==='success'?'bg-emerald-50 border-emerald-200 text-emerald-800':'bg-rose-50 border-rose-200 text-rose-800'}`}>{msg}</div>
          ) : null}
          <div className="mt-6">
            <Link href="/" className="text-blue-600">بازگشت به صفحه اصلی</Link>
          </div>
        </>
      )}
    </div>
  );
}

