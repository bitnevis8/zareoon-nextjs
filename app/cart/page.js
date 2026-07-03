"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { authFetch } from "@/app/utils/authHeaders";
import { inv } from "@/app/dashboard/supplier/inventory/inventoryTheme";
import { CartPageNav, CartGuide, SUPPORT_PHONE } from "./components/CartLayout";

const ORDER_STATUS_FA = {
  pending: "در انتظار تأیید",
  reserved: "رزرو شده",
  completed: "تکمیل‌شده",
  cancelled: "لغو شده",
};

const ITEM_STATUS_FA = {
  pending: "در انتظار",
  approved: "تأیید شده",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
  rejected: "رد شده",
};

function CartItemRow({ item, productName, onUpdateQty, onRemove }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              درجه {item.qualityGrade}
            </span>
          </div>
          <h3 className="truncate text-base font-bold text-slate-900">{productName}</h3>
          <p className="mt-0.5 text-xs text-slate-500">شناسه محصول: {item.productId}</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-400">مقدار</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                step="0.001"
                className={`${inv.input} w-28 py-2 text-center font-mono`}
                value={item.quantity}
                onChange={(e) => onUpdateQty(item.id, e.target.value)}
              />
              <span className="text-xs text-slate-500">{item.unit || "کیلوگرم"}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="mt-5 rounded-lg px-2 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            حذف
          </button>
        </div>
      </div>
    </article>
  );
}

function OrderHistory({ orders, loading, expanded, onToggle }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3.5 text-right sm:px-5"
      >
        <span className="text-sm font-bold text-slate-800">سفارش‌های من</span>
        <span className="text-xs text-slate-500">{expanded ? "بستن ▲" : "مشاهده ▼"}</span>
      </button>
      {expanded ? (
        <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">هنوز سفارشی ثبت نکرده‌اید.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">سفارش #{order.id}</span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      {ORDER_STATUS_FA[order.status] || order.status}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-slate-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("fa-IR") : "—"}
                  </p>
                  <ul className="space-y-2">
                    {order.items?.map((item, i) => (
                      <li key={`i-${i}`} className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="font-medium text-slate-800">
                            {item.inventoryLot?.product?.name || `محصول #${item.inventoryLotId}`}
                          </span>
                          <span className="text-slate-500">{ITEM_STATUS_FA[item.status] || item.status}</span>
                        </div>
                        <p className="mt-1 text-slate-500">
                          درجه {item.inventoryLot?.qualityGrade} — {item.quantity}{" "}
                          {item.inventoryLot?.unit || "کیلوگرم"}
                        </p>
                      </li>
                    ))}
                    {order.requestItems?.map((item, i) => (
                      <li key={`r-${i}`} className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5 text-xs">
                        <span className="font-medium text-amber-900">در انتظار تخصیص — محصول #{item.productId}</span>
                        <p className="mt-1 text-amber-800/80">
                          درجه {item.qualityGrade} — {item.quantity} {item.unit || "کیلوگرم"}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function CartPageContent() {
  const [cart, setCart] = useState({ id: null, items: [] });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [showOrders, setShowOrders] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  const productName = useCallback(
    (id) => products.find((p) => p.id === Number(id))?.name || `محصول #${id}`,
    [products]
  );

  const load = async () => {
    setLoading(true);
    try {
      const [cartRes, prodRes] = await Promise.all([
        authFetch(`${API_ENDPOINTS.supplier.cart.base}/me`, { cache: "no-store" }),
        fetch(API_ENDPOINTS.supplier.products.getAll + "?isOrderable=true", { cache: "no-store" }),
      ]);
      const cartData = await cartRes.json();
      const prodData = await prodRes.json();
      setCart(cartData.data || { items: [] });
      setProducts(prodData.data || []);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await authFetch(API_ENDPOINTS.supplier.orders.getCustomerOrders, { cache: "no-store" });
      if (!res.ok) throw new Error("orders fetch failed");
      const d = await res.json();
      setOrders(d.data || []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadOrders();
    authFetch(API_ENDPOINTS.auth.me, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUserInfo(d.data?.user || d.data || null))
      .catch(() => setUserInfo(null));
  }, []);

  const items = cart.items || [];
  const totalItems = items.length;
  const totalQty = useMemo(
    () => items.reduce((s, it) => s + parseFloat(it.quantity || 0), 0),
    [items]
  );

  const remove = async (id) => {
    await authFetch(`${API_ENDPOINTS.supplier.cart.base}/item/${id}`, { method: "DELETE" });
    load();
  };

  const updateQty = async (id, quantity) => {
    await authFetch(`${API_ENDPOINTS.supplier.cart.base}/item/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: Number(quantity) }),
    });
    load();
  };

  const checkout = async () => {
    setMsg("");
    setCheckingOut(true);
    try {
      const r = await authFetch(`${API_ENDPOINTS.supplier.cart.base}/checkout`, { method: "POST" });
      const j = await r.json();
      if (!r.ok || !j?.success) throw new Error(j?.message || "خطا در ثبت سفارش");
      setMsgType("success");
      setMsg(
        `سفارش شما با موفقیت ثبت شد (شماره ${j.data?.orderId || "—"}). وضعیت: در انتظار تأیید. تیم زارعون برای هماهنگی با شما تماس می‌گیرد. پشتیبانی: ${SUPPORT_PHONE}`
      );
      await load();
      await loadOrders();
      setShowOrders(true);
    } catch (e) {
      setMsgType("error");
      setMsg(e.message || "خطای غیرمنتظره در ثبت سفارش");
    } finally {
      setCheckingOut(false);
    }
  };

  const userLabel =
    userInfo?.firstName && userInfo?.lastName
      ? `${userInfo.firstName} ${userInfo.lastName}`
      : userInfo?.username || userInfo?.email || null;

  return (
    <div className="mx-auto min-h-screen max-w-6xl bg-slate-50 px-3 py-4 sm:px-6 sm:py-6">
      <CartPageNav />

      <div className="mb-6">
        <h1 className="text-lg font-bold text-slate-900 sm:text-xl">سبد خرید</h1>
        <p className="mt-1 text-sm text-slate-500">
          {userLabel ? `${userLabel}، ` : ""}
          اقلام انتخاب‌شده را بررسی کنید و سفارش را نهایی کنید.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className={inv.empty}>
                <svg className="mb-3 h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="font-semibold text-slate-700">سبد خرید شما خالی است</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map((it) => (
                    <CartItemRow
                      key={it.id}
                      item={it}
                      productName={productName(it.productId)}
                      onUpdateQty={updateQty}
                      onRemove={remove}
                    />
                  ))}
                </div>

                {msg ? (
                  <div
                    className={`rounded-xl border p-4 text-sm ${
                      msgType === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-rose-200 bg-rose-50 text-rose-900"
                    }`}
                    role="status"
                  >
                    {msg}
                  </div>
                ) : null}
              </>
            )}

            <OrderHistory
              orders={orders}
              loading={ordersLoading}
              expanded={showOrders}
              onToggle={() => {
                const next = !showOrders;
                setShowOrders(next);
                if (next && orders.length === 0 && !ordersLoading) loadOrders();
              }}
            />
          </div>

          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            {items.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="mb-4 text-sm font-bold text-slate-800">خلاصه سفارش</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <dt>تعداد اقلام</dt>
                    <dd className="font-semibold tabular-nums text-slate-900">{totalItems.toLocaleString("fa-IR")}</dd>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <dt>مجموع مقدار</dt>
                    <dd className="font-semibold tabular-nums text-slate-900">
                      {totalQty.toLocaleString("fa-IR")}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={checkout}
                  disabled={checkingOut}
                  className={`${inv.btnPrimary} mt-5 w-full py-3`}
                >
                  {checkingOut ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      در حال ثبت…
                    </span>
                  ) : (
                    "نهایی کردن سفارش"
                  )}
                </button>
                <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
                  با نهایی کردن، درخواست شما ثبت می‌شود و برای هماهنگی تماس گرفته می‌شود.
                </p>
              </div>
            ) : null}

            <CartGuide />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartPageContent />
    </ProtectedRoute>
  );
}
