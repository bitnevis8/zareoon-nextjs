"use client";
import { useEffect, useMemo, useState, use as usePromise } from "react";
import ProductImage from "@/app/components/ui/ProductImage";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";

export default function CatalogItemPage({ params }) {
  // Next.js 15: params is a Promise; unwrap with React.use()
  const { id } = usePromise(params);
  const [item, setItem] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lots, setLots] = useState([]);
  const [orderQty, setOrderQty] = useState("");
  const [orderGrade, setOrderGrade] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderMsg, setOrderMsg] = useState("");
  const [orderMsgType, setOrderMsgType] = useState("info"); // 'success' | 'error' | 'info'
  const statusToFa = {
    on_field: "در مزرعه",
    harvested: "برداشت‌شده",
    reserved: "رزرو شده",
    sold: "فروخته شده",
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [ri, rc, rl] = await Promise.all([
          fetch(API_ENDPOINTS.farmer.products.getById(id), { cache: "no-store" }),
          fetch(`${API_ENDPOINTS.farmer.products.getAll}?parentId=${id}`, { cache: "no-store" }),
          fetch(API_ENDPOINTS.farmer.inventoryLots.getAll, { cache: "no-store" }),
        ]);
        const di = await ri.json();
        const dc = await rc.json();
        const dl = await rl.json();
        setItem(di.data || null);
        setChildren(dc.data || []);
        setLots(dl.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Inventory summary for this product (no farmer names)
  const productIdNum = Number(id);
  const GRADE_COLUMNS = ["صادراتی", "درجه 1", "درجه 2", "درجه 3", "ضایعاتی", "سایر"];
  const normalizeGrade = (val) => {
    const v = (val || "").toString().trim();
    if (["صادراتی", "درجه 1", "درجه 2", "درجه 3", "ضایعاتی"].includes(v)) return v;
    if (v === "درجه یک") return "درجه 1";
    if (v === "درجه دو") return "درجه 2";
    if (v === "درجه سه") return "درجه 3";
    return "سایر";
  };
  const filteredLots = useMemo(() => (lots || []).filter(l => l.productId === productIdNum), [lots, productIdNum]);
  const summary = useMemo(() => {
    let total = 0, reserved = 0;
    for (const l of filteredLots) { total += parseFloat(l.totalQuantity || 0); reserved += parseFloat(l.reservedQuantity || 0); }
    return { totalQuantity: total, reservedQuantity: reserved, availableQuantity: total - reserved };
  }, [filteredLots]);
  const byGrade = useMemo(() => {
    const map = new Map();
    for (const l of filteredLots) {
      const key = normalizeGrade(l.qualityGrade);
      if (!map.has(key)) map.set(key, { grade: key, total: 0, reserved: 0, count: 0 });
      const row = map.get(key);
      row.total += parseFloat(l.totalQuantity || 0);
      row.reserved += parseFloat(l.reservedQuantity || 0);
      row.count += 1;
    }
    const arr = GRADE_COLUMNS.filter(g => map.has(g)).map(g => ({ ...map.get(g), available: map.get(g).total - map.get(g).reserved }));
    for (const [k, v] of map.entries()) if (!GRADE_COLUMNS.includes(k)) arr.push({ ...v, available: v.total - v.reserved });
    return arr;
  }, [filteredLots]);
  const availableGrades = useMemo(() => byGrade.map(g => g.grade), [byGrade]);
  // set default selected grade when list changes
  useEffect(() => {
    if (availableGrades.length && !orderGrade) setOrderGrade(availableGrades[0]);
  }, [availableGrades, orderGrade]);

  // Estimate price for selected quantity and grade by allocating from available lots sorted by price
  const priceEstimation = useMemo(() => {
    const reqQty = parseFloat(orderQty || 0);
    if (!orderGrade || !Number.isFinite(reqQty) || reqQty <= 0) return { total: null, unit: null, coverage: 0 };
    const lotsOfGrade = filteredLots
      .filter(l => l.qualityGrade && l.qualityGrade.toString() && l.qualityGrade === orderGrade)
      .map(l => ({
        price: l.price != null ? parseFloat(l.price) : null,
        available: Math.max(0, parseFloat(l.totalQuantity || 0) - parseFloat(l.reservedQuantity || 0)),
        unit: l.unit || item?.unit || ''
      }))
      .filter(x => x.available > 0 && x.price != null && Number.isFinite(x.price));
    if (lotsOfGrade.length === 0) return { total: null, unit: null, coverage: 0 };
    lotsOfGrade.sort((a,b) => a.price - b.price);
    let remaining = reqQty;
    let sum = 0;
    let taken = 0;
    for (const l of lotsOfGrade) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, l.available);
      sum += take * l.price;
      taken += take;
      remaining -= take;
    }
    if (taken <= 0) return { total: null, unit: lotsOfGrade[0]?.unit || item?.unit || '', coverage: 0 };
    return { total: sum, unit: lotsOfGrade[0]?.unit || item?.unit || '', coverage: Math.min(1, taken / reqQty), unitAvg: sum / taken };
  }, [filteredLots, orderGrade, orderQty, item]);

  return (
    <main className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-8">
      <div className="text-sm text-slate-500"><Link href="/">صفحه اصلی</Link> / {item?.name || "..."}</div>

      {/* Header: image on the right, title on the left of the image (RTL-friendly) */}
      <section className="bg-white rounded-xl shadow border p-4">
        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="shrink-0">
            <ProductImage slug={item?.slug} imageUrl={item?.imageUrl} alt={item?.name || "item"} width={96} height={96} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{item?.name || ""}</h1>
            {item?.slug ? <div className="text-slate-400 text-xs mt-1">{item.slug}</div> : null}
            {item?.isOrderable ? (
              <div className="text-emerald-700 text-xs mt-2">قابل سفارش • واحد: {item?.unit || '-'}</div>
            ) : (
              <div className="text-slate-500 text-xs mt-2">غیرقابل سفارش (نقش دسته)</div>
            )}
          </div>
        </div>
      </section>

      {/* Inventory summary (if any) */}
      {filteredLots.length > 0 && (
        <section className="bg-white rounded-xl shadow border p-4">
          <h2 className="text-lg font-semibold mb-3">وضعیت موجودی</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-50 rounded-md border p-3"><div className="text-xs text-slate-500">کل موجودی</div><div className="text-lg font-semibold">{summary.totalQuantity.toFixed(3)}</div></div>
            <div className="bg-slate-50 rounded-md border p-3"><div className="text-xs text-slate-500">رزرو شده</div><div className="text-lg font-semibold">{summary.reservedQuantity.toFixed(3)}</div></div>
            <div className="bg-slate-50 rounded-md border p-3"><div className="text-xs text-slate-500">قابل عرضه</div><div className="text-lg font-semibold">{summary.availableQuantity.toFixed(3)}</div></div>
          </div>
          {/* Quick order box */}
          <div className="border rounded-lg p-3 space-y-2">
            <div className="text-xs text-slate-600">
              {orderGrade ? (
                (()=>{
                  const row = byGrade.find(g => g.grade === orderGrade);
                  const a = row ? (row.total - row.reserved) : 0;
                  return <span>حداکثر قابل سفارش برای «{orderGrade}»: <span className="font-semibold">{a.toFixed(3)}</span> {item?.unit || ''}</span>;
                })()
              ) : (
                <span>لطفاً درجه و مقدار موردنظر را انتخاب کنید.</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <select
              className="border rounded px-3 py-2"
              value={orderGrade}
              onChange={(e)=>setOrderGrade(e.target.value)}
            >
              {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input
              type="number"
              min="0"
              step="0.001"
              className="border rounded px-3 py-2 flex-1"
              placeholder="مقدار درخواستی از درجه انتخاب‌شده"
              value={orderQty}
              onChange={(e)=>setOrderQty(e.target.value)}
            />
            <button
              disabled={placing}
              onClick={async ()=>{
                setOrderMsg("");
                const req = parseFloat(orderQty || 0);
                if (!orderGrade) { setOrderMsgType('error'); setOrderMsg("درجه انتخاب نشده است"); return; }
                if (!req || !Number.isFinite(req) || req <= 0) { setOrderMsgType('error'); setOrderMsg("مقدار نامعتبر است"); return; }
                const row = byGrade.find(g => g.grade === orderGrade);
                const available = row ? (row.total - row.reserved) : 0;
                if (req > available + 1e-9) { setOrderMsgType('error'); setOrderMsg(`مقدار درخواستی بیشتر از مقدار قابل عرضه است (${available.toFixed(3)} ${item?.unit||''}).`); return; }
                // افزودن به سبد: آیتم سطح محصول/درجه
                setPlacing(true);
                try {
                  const payload = { productId: productIdNum, qualityGrade: orderGrade, quantity: Number(req.toFixed(3)), unit: item?.unit || null };
                  const res = await fetch(`${API_ENDPOINTS.farmer.cart.base}/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                  const j = await res.json();
                  if (!res.ok || !j?.success) throw new Error(j?.message || 'خطا در افزودن به سبد');
                  setOrderMsgType('success'); setOrderMsg('به سبد خرید اضافه شد.');
                } catch (e) {
                  setOrderMsgType('error'); setOrderMsg(e.message || 'خطا در افزودن به سبد');
                } finally { setPlacing(false); }
              }}
              className="bg-blue-600 text-white rounded px-4 py-2"
            >{placing ? '...' : 'افزودن به سبد'}</button>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 border-t pt-2">
              {priceEstimation.total != null ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span>قیمت تقریبی: <span className="font-semibold">{priceEstimation.total.toLocaleString('fa-IR')}</span></span>
                  <span>میانگین واحد: {priceEstimation.unitAvg?.toLocaleString('fa-IR')} {item?.unit || ''}</span>
                  {priceEstimation.coverage < 1 ? (
                    <span className="text-amber-600">برای کل مقدار قیمت مشخص نیست (پوشش {Math.round(priceEstimation.coverage*100)}%)</span>
                  ) : null}
                </div>
              ) : (
                <div className="text-slate-400">قیمت نامشخص</div>
              )}
            </div>
          </div>
          {orderMsg ? (
            <div
              className={
                `mt-3 rounded-2xl border p-4 text-right flex items-start gap-3 ` +
                (orderMsgType === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : orderMsgType === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800')
              }
            >
              <div className="text-2xl leading-none">
                {orderMsgType === 'success' ? '✅' : orderMsgType === 'error' ? '⚠️' : 'ℹ️'}
              </div>
              <div className="text-base sm:text-lg font-medium">
                {orderMsg}
              </div>
            </div>
          ) : null}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-2">درجه</th>
                  <th className="p-2">کل</th>
                  <th className="p-2">رزرو</th>
                  <th className="p-2">قابل عرضه</th>
                  <th className="p-2">تعداد بچ</th>
                </tr>
              </thead>
              <tbody>
                {byGrade.map((g) => (
                  <tr key={g.grade} className="border-t">
                    <td className="p-2">{g.grade}</td>
                    <td className="p-2">{g.total.toFixed(3)}</td>
                    <td className="p-2">{g.reserved.toFixed(3)}</td>
                    <td className="p-2">{g.available.toFixed(3)}</td>
                    <td className="p-2">{g.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Available lots with attributes */}
      {filteredLots.length > 0 && (
        <section className="bg-white rounded-xl shadow border p-4">
          <h2 className="text-lg font-semibold mb-3">بچ‌های موجود</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-2">درجه</th>
                  <th className="p-2">واحد</th>
                  <th className="p-2">کل</th>
                  <th className="p-2">رزرو</th>
                  <th className="p-2">قیمت</th>
                  <th className="p-2">وضعیت</th>
                  <th className="p-2">ویژگی‌ها</th>
                </tr>
              </thead>
              <tbody>
                {filteredLots.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-2">{l.qualityGrade}</td>
                    <td className="p-2">{l.unit}</td>
                    <td className="p-2">{l.totalQuantity}</td>
                    <td className="p-2">{l.reservedQuantity}</td>
                    <td className="p-2">{l.price ?? '—'}</td>
                    <td className="p-2">{statusToFa[l.status] || l.status}</td>
                    <td className="p-2">
                      {Array.isArray(l.attributes) && l.attributes.length ? (
                        <div className="flex flex-col gap-1 min-w-[200px]">
                          {l.attributes.map((a) => (
                            <div key={a.id} className="text-xs text-gray-700">
                              <span className="text-gray-500">{a.definition?.name || `#${a.attributeDefinitionId}`}:</span> {a.value ?? '—'}
                            </div>
                          ))}
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Products list */}
      <section>
        <h2 className="text-lg font-semibold mb-3">محصولات</h2>
        {loading ? (
          <div className="text-slate-500 text-sm">در حال بارگذاری...</div>
        ) : children.length > 0 ? (
          <div className="space-y-2">
            {children.map((ch) => (
              <Link key={ch.id} href={`/catalog/${ch.id}`} className="flex items-center justify-between bg-white rounded-lg shadow p-3 border hover:bg-slate-50">
                <div className="font-medium text-slate-800">{ch.name}</div>
                <span className="text-xs text-slate-400">مشاهده</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-sm">محصولی برای نمایش وجود ندارد.</div>
        )}
      </section>
    </main>
  );
}

