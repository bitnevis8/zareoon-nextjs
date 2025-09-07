"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";

export default function CartPage() {
  const [cart, setCart] = useState({ id: null, items: [] });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [supportPhone, setSupportPhone] = useState("");
  const [showOrders, setShowOrders] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.farmer.cart.base}/me`, { cache: 'no-store', credentials: 'include' });
      const d = await res.json();
      setCart(d.data || { items: [] });
    } finally { setLoading(false); }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      console.log("Loading orders from:", API_ENDPOINTS.farmer.orders.getCustomerOrders);
      const res = await fetch(`${API_ENDPOINTS.farmer.orders.getCustomerOrders}`, { 
        cache: 'no-store', 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log("Orders response status:", res.status);
      console.log("Orders response headers:", res.headers);
      
      if (!res.ok) {
        console.error("Orders API error:", res.status, res.statusText);
        const errorText = await res.text();
        console.error("Orders API error response:", errorText);
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }
      
      const d = await res.json();
      console.log("Orders response data:", d);
      setOrders(d.data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally { 
      setOrdersLoading(false); 
    }
  };

  const loadUserInfo = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.auth.me}`, { 
        cache: 'no-store', 
        credentials: 'include' 
      });
      const d = await res.json();
      console.log("User info response:", d);
      setUserInfo(d.data?.user || null);
    } catch (error) {
      console.error("Error loading user info:", error);
      setUserInfo(null);
    }
  };
  useEffect(() => {
    load();
    loadUserInfo();
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
      if (!r.ok || !j?.success) throw new Error(j?.message || 'خطا در ثبت بار');
      setMsgType('success');
      setMsg(`بار شما ثبت شد. وضعیت: در انتظار تایید - با شما تماس گرفته می‌شود جهت رزرو شدن بار. شماره پشتیبانی: 09393387148`);
      load();
      loadOrders(); // بارگذاری سفارشات بعد از ثبت
      setShowOrders(true); // نمایش سفارشات
    } catch (e) {
      setMsgType('error'); setMsg(e.message || 'خطای غیرمنتظره در ثبت بار');
    }
  };

  return (
    <div className="p-2 sm:p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg sm:text-xl font-bold">بار</h1>
        {userInfo && (
          <div className="text-sm text-slate-600">
            <span className="font-medium">
              {userInfo.firstName && userInfo.lastName 
                ? `${userInfo.firstName} ${userInfo.lastName}`
                : userInfo.username || userInfo.email || 'کاربر'
              }
            </span>
            {userInfo.roles && userInfo.roles.length > 0 && (
              <span className="text-xs text-slate-500 block">
                نقش: {userInfo.roles.map(role => role.nameFa).join(', ')}
              </span>
            )}
          </div>
        )}
      </div>
      {loading ? <div className="text-slate-500">در حال بارگذاری...</div> : (
        <>
          {(cart.items||[]).length === 0 ? (
            <div className="text-slate-500">بار شما خالی است.</div>
          ) : (
            <div className="space-y-3">
              {(cart.items||[]).map(it => (
                <div key={it.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-lg p-3 bg-white space-y-2 sm:space-y-0">
                  <div className="text-sm flex-1">
                    <div className="font-medium">محصول #{it.productId}</div>
                    <div className="text-slate-600">درجه: {it.qualityGrade}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" step="0.001" className="border rounded px-2 py-1 w-24 sm:w-28 text-sm" value={it.quantity}
                      onChange={(e)=>updateQty(it.id, e.target.value)} />
                    <button className="text-rose-600 text-sm" onClick={()=>remove(it.id)}>حذف</button>
                  </div>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 space-y-2 sm:space-y-0">
                <div className="text-sm text-slate-600">تعداد آیتم: {totalItems}</div>
                <button className="w-full sm:w-auto bg-emerald-600 text-white rounded px-4 py-2 text-sm" onClick={checkout}>ثبت بار</button>
              </div>
            </div>
          )}
          {msg ? (
            <div className={`mt-4 rounded-2xl border p-4 ${msgType==='success'?'bg-emerald-50 border-emerald-200 text-emerald-800':'bg-rose-50 border-rose-200 text-rose-800'}`}>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className={`w-3 h-3 rounded-full ${msgType==='success'?'bg-emerald-500':'bg-rose-500'}`}></div>
                <span className="font-medium">{msg}</span>
              </div>
            </div>
          ) : null}
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">راهنمای ثبت بار</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• با زدن &quot;ثبت بار&quot;، بار شما ثبت می‌شود اما رزرو نمی‌شود</li>
                <li>• تیم پشتیبانی با شما تماس می‌گیرد جهت رزرو شدن بار</li>
                <li>• وضعیت بار: در انتظار تایید</li>
                <li>• تماس پشتیبانی: 09393387148</li>
              </ul>
            </div>
            
            {/* دکمه نمایش سفارشات */}
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => {
                  setShowOrders(!showOrders);
                  if (!showOrders) loadOrders();
                }}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {showOrders ? 'مخفی کردن سفارشات' : 'مشاهده سفارشات ثبت شده'}
              </button>
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_ENDPOINTS.farmer.orders.base}/test`, { 
                      cache: 'no-store', 
                      credentials: 'include' 
                    });
                    const d = await res.json();
                    console.log("Test endpoint response:", d);
                    alert(`Test: ${d.message}, User: ${d.user?.id || 'No user'}`);
                  } catch (error) {
                    console.error("Test error:", error);
                    alert(`Test error: ${error.message}`);
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                تست API
              </button>
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_ENDPOINTS.auth.me}`, { 
                      cache: 'no-store', 
                      credentials: 'include' 
                    });
                    const d = await res.json();
                    console.log("Auth me response:", d);
                    alert(`Auth: ${d.success ? 'Success' : 'Failed'}, User: ${d.data?.user?.userId || 'No user'}`);
                  } catch (error) {
                    console.error("Auth error:", error);
                    alert(`Auth error: ${error.message}`);
                  }
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                تست Auth
              </button>
            </div>

            {/* نمایش سفارشات */}
            {showOrders && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">سفارشات ثبت شده</h2>
                {ordersLoading ? (
                  <div className="text-slate-500">در حال بارگذاری سفارشات...</div>
                ) : orders.length === 0 ? (
                  <div className="text-slate-500 bg-slate-50 p-4 rounded-lg">
                    هیچ سفارشی ثبت نشده است.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="mb-3">
                          <h3 className="font-medium">سفارش #{order.id}</h3>
                          <p className="text-sm text-slate-600">
                            تاریخ: {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">آیتم‌های سفارش:</h4>
                          {/* نمایش OrderItems (اگر وجود داشته باشد) */}
                          {order.items?.map((item, index) => (
                            <div key={`item-${index}`} className="text-sm bg-slate-50 p-3 rounded border">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-medium text-blue-600">آیتم #{index + 1}</span>
                                  <span className="text-slate-600 mr-2">- {item.inventoryLot?.product?.name || `محصول #${item.inventoryLotId}`}</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  item.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  item.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  item.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                  item.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                  item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.status === 'pending' ? 'در انتظار' :
                                   item.status === 'approved' ? 'تایید شده' :
                                   item.status === 'processing' ? 'در حال پردازش' :
                                   item.status === 'shipped' ? 'ارسال شده' :
                                   item.status === 'delivered' ? 'تحویل داده شده' :
                                   item.status === 'cancelled' ? 'لغو شده' :
                                   item.status === 'rejected' ? 'رد شده' :
                                   item.status}
                                </span>
                              </div>
                              <div className="text-slate-600">
                                <span>درجه: {item.inventoryLot?.qualityGrade}</span>
                                <span className="mr-4"> - مقدار: {item.quantity} {item.inventoryLot?.unit || 'کیلوگرم'}</span>
                              </div>
                            </div>
                          ))}
                          {/* نمایش OrderRequestItems (درخواست‌های در انتظار) */}
                          {order.requestItems?.map((item, index) => (
                            <div key={`request-${index}`} className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-medium text-orange-600">درخواست #{index + 1}</span>
                                  <span className="text-slate-600 mr-2">- محصول #{item.productId}</span>
                                </div>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  در انتظار تخصیص
                                </span>
                              </div>
                              <div className="text-slate-600">
                                <span>درجه: {item.qualityGrade}</span>
                                <span className="mr-4"> - مقدار: {item.quantity} {item.unit || 'کیلوگرم'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center">
              <Link href="/" className="text-blue-600 hover:underline">بازگشت به صفحه اصلی</Link>
              <Link href="/dashboard" className="text-green-600 hover:underline">داشبورد</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

