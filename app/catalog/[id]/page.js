"use client";
import { useEffect, useMemo, useState, use as usePromise } from "react";
import ProductImage from "@/app/components/ui/ProductImage";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";
import { useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function CatalogItemPage({ params }) {
  // Next.js 15: params is a Promise; unwrap with React.use()
  const { id } = usePromise(params);
  const auth = useAuth();
  const userPhone = auth?.user?.mobile || auth?.user?.phone || null;
  const [item, setItem] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lots, setLots] = useState([]);
  // سفارش‌دهی به‌ازای هر بار در ردیف‌ها انجام می‌شود
  const [lotQtyById, setLotQtyById] = useState({});
  const [placingLotId, setPlacingLotId] = useState(null);
  const [orderMsg, setOrderMsg] = useState("");
  const [orderMsgType, setOrderMsgType] = useState("info"); // 'success' | 'error' | 'info'
  const statusToFa = {
    on_field: "در مزرعه",
    harvested: "برداشت‌شده",
    reserved: "رزرو شده",
    sold: "فروخته شده",
  };

  // Media state for lots
  const [lotMediaCounts, setLotMediaCounts] = useState(new Map()); // lotId -> { images, videos }
  const [productMediaCounts, setProductMediaCounts] = useState({ images: 0, videos: 0 });
  const [productMediaPreview, setProductMediaPreview] = useState([]); // first two media items
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaLot, setMediaLot] = useState(null); // if null and context is product
  const [mediaTab, setMediaTab] = useState('images'); // 'images' | 'videos'
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaContext, setMediaContext] = useState({ module: 'inventory', entityId: null });
  const [lotMediaPreview, setLotMediaPreview] = useState(new Map()); // lotId -> first two media items

  // Cart info for this product
  const [cartTotalQty, setCartTotalQty] = useState(0);
  const [cartUnit, setCartUnit] = useState('');
  const fetchCart = useCallback(async () => {
    try {
      const r = await fetch(`${API_ENDPOINTS.farmer.cart.base}/me`, { cache: 'no-store', credentials: 'include' });
      const j = await r.json();
      const items = j?.data?.items || [];
      let sum = 0; let unit = cartUnit;
      for (const it of items) {
        if (Number(it.productId) === Number(id)) {
          const q = parseFloat(it.quantity || 0);
          if (Number.isFinite(q)) sum += q;
          if (!unit && it.unit) unit = it.unit;
        }
      }
      setCartTotalQty(sum);
      setCartUnit(unit || item?.unit || '');
    } catch {}
  }, [API_ENDPOINTS?.farmer?.cart?.base, id, cartUnit, item?.unit]);

  const loadLotMediaCounts = useCallback(async (lotId) => {
    try {
      const r = await fetch(`${API_ENDPOINTS.fileUpload.getFilesByModule('inventory')}?entityId=${encodeURIComponent(lotId)}`, { cache: 'no-store' });
      const j = await r.json();
      if (j?.success) {
        const arr = Array.isArray(j.data) ? j.data : [];
        const images = arr.filter(it => String(it.mimeType||'').startsWith('image/')).length;
        const videos = arr.filter(it => String(it.mimeType||'').startsWith('video/')).length;
        setLotMediaCounts(prev => new Map(prev).set(lotId, { images, videos }));
        // pick first two for preview (prefer images first)
        const sorted = [...arr].sort((a,b)=>{
          const ai = String(a.mimeType||'').startsWith('image/') ? 0 : 1;
          const bi = String(b.mimeType||'').startsWith('image/') ? 0 : 1;
          return ai - bi;
        }).slice(0,2);
        setLotMediaPreview(prev => new Map(prev).set(lotId, sorted));
      }
    } catch {}
  }, []);

  const openMediaModal = async ({ module, entityId, lot = null, tab }) => {
    setMediaLot(lot);
    setMediaContext({ module, entityId });
    setMediaTab(tab);
    setMediaItems([]);
    setMediaLoading(true);
    setMediaOpen(true);
    try {
      const r = await fetch(`${API_ENDPOINTS.fileUpload.getFilesByModule(module)}?entityId=${encodeURIComponent(entityId)}`, { cache: 'no-store', credentials: 'include' });
      const j = await r.json();
      const all = (j?.success && Array.isArray(j.data)) ? j.data : [];
      const list = all.filter(it => tab === 'images' ? String(it.mimeType||'').startsWith('image/') : String(it.mimeType||'').startsWith('video/'));
      setMediaItems(list);
      // refresh counts cache
      const images = all.filter(it => String(it.mimeType||'').startsWith('image/')).length;
      const videos = all.filter(it => String(it.mimeType||'').startsWith('video/')).length;
      if (module === 'inventory' && lot) {
        setLotMediaCounts(prev => new Map(prev).set(lot.id, { images, videos }));
      } else if (module === 'products') {
        setProductMediaCounts({ images, videos });
      }
    } catch {
      setMediaItems([]);
    } finally {
      setMediaLoading(false);
    }
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
        // After loading product data, fetch cart info to display user's existing amount for this product
        fetchCart();
      } finally {
        setLoading(false);
      }
    })();
  }, [id, fetchCart]);

  // Inventory summary for this product (no farmer names)
  const productIdNum = Number(id);
  const GRADE_COLUMNS = useMemo(() => ["صادراتی", "درجه 1", "درجه 2", "درجه 3", "ضایعاتی", "سایر"], []);
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
  }, [filteredLots, GRADE_COLUMNS]);
  // نمایش خلاصه بر اساس درجه حفظ می‌شود

  // Prefetch media counts for the visible lots
  useEffect(() => {
    (async () => {
      const ids = filteredLots.map(l => l.id);
      for (const id of ids) {
        if (!lotMediaCounts.has(id)) {
          loadLotMediaCounts(id);
        }
      }
    })();
  }, [filteredLots, lotMediaCounts, loadLotMediaCounts]);

  // Load product-level media counts
  useEffect(() => {
    if (!productIdNum) return;
    (async () => {
      try {
        const r = await fetch(`${API_ENDPOINTS.fileUpload.getFilesByModule('products')}?entityId=${encodeURIComponent(productIdNum)}`, { cache: 'no-store', credentials: 'include' });
        const j = await r.json();
        if (j?.success) {
          const arr = Array.isArray(j.data) ? j.data : [];
          const images = arr.filter(it => String(it.mimeType||'').startsWith('image/')).length;
          const videos = arr.filter(it => String(it.mimeType||'').startsWith('video/')).length;
          setProductMediaCounts({ images, videos });
          const sorted = [...arr].sort((a,b)=>{
            const ai = String(a.mimeType||'').startsWith('image/') ? 0 : 1;
            const bi = String(b.mimeType||'').startsWith('image/') ? 0 : 1;
            return ai - bi;
          }).slice(0,2);
          setProductMediaPreview(sorted);
        }
      } catch {}
    })();
  }, [productIdNum]);

  // محاسبه قیمت تقریبی حذف شد چون سفارش در سطح بار انجام می‌شود

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-8">
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
            <div className="flex items-center gap-3 mt-3">
              {productMediaPreview && productMediaPreview.length > 0 ? (
                <div className="flex items-center gap-2">
                  {productMediaPreview.map(m => (
                    <div
                      key={m.id}
                      className="w-24 h-16 rounded overflow-hidden bg-slate-100 cursor-pointer"
                      onClick={() => openMediaModal({ module: 'products', entityId: productIdNum, lot: null, tab: String(m.mimeType||'').startsWith('video/') ? 'videos' : 'images' })}
                      title="مشاهده در اندازه بزرگ"
                    >
                      {String(m.mimeType||'').startsWith('video/') ? (
                        <video src={m.downloadUrl} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={m.downloadUrl} alt={m.originalName||''} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                  {(productMediaCounts.images + productMediaCounts.videos) > productMediaPreview.length ? (
                    <button className="text-indigo-600 text-sm" onClick={()=> openMediaModal({ module: 'products', entityId: productIdNum, lot: null, tab: 'images' })}>
                      مشاهده سایر رسانه‌ها ({(productMediaCounts.images + productMediaCounts.videos) - productMediaPreview.length})
                    </button>
                  ) : null}
                </div>
              ) : null}
              {cartTotalQty > 0 ? (
                <div className="text-[13px] sm:text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded px-3 py-2">
                  شما هم‌اکنون <span className="font-semibold">{cartTotalQty.toFixed(3)} {cartUnit || ''}</span> از این محصول را در سبد دارید.
                  <Link href="/cart" className="underline mx-1 text-amber-800">مشاهده سبد خرید</Link>
                </div>
              ) : null}
            </div>
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
          {/* جعبه سفارش سریع حذف شد؛ سفارش در ردیف هر بار انجام می‌شود */}
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
                  <th className="p-2">تعداد بار</th>
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
          <h2 className="text-lg font-semibold mb-3">محصولات موجود</h2>
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
                  <th className="p-2">رسانه</th>
                  <th className="p-2">درخواست</th>
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
                    <td className="p-2">
                      {(() => {
                        const c = lotMediaCounts.get(l.id);
                        const preview = lotMediaPreview.get(l.id) || [];
                        if (!c || (c.images + c.videos) === 0) return '—';
                        return (
                          <div className="flex items-center gap-2">
                            {preview.map(m => (
                              <div
                                key={m.id}
                                className="w-16 h-12 rounded overflow-hidden bg-slate-100 cursor-pointer"
                                onClick={() => openMediaModal({ module: 'inventory', entityId: l.id, lot: l, tab: String(m.mimeType||'').startsWith('video/') ? 'videos' : 'images' })}
                                title="مشاهده در اندازه بزرگ"
                              >
                                {String(m.mimeType||'').startsWith('video/') ? (
                                  <video src={m.downloadUrl} className="w-full h-full object-cover" muted />
                                ) : (
                                  <img src={m.downloadUrl} alt={m.originalName||''} className="w-full h-full object-cover" />
                                )}
                              </div>
                            ))}
                            {(c.images + c.videos) > preview.length ? (
                              <button className="text-indigo-600 text-xs" onClick={() => openMediaModal({ module: 'inventory', entityId: l.id, lot: l, tab: 'images' })}>
                                مشاهده سایر رسانه‌ها ({(c.images + c.videos) - preview.length})
                              </button>
                            ) : null}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          className="border rounded px-2 py-1 w-44 sm:w-56 md:w-64"
                          placeholder={`حداکثر ${(Math.max(0, (parseFloat(l.totalQuantity||0) - parseFloat(l.reservedQuantity||0)))||0).toFixed(3)}`}
                          value={lotQtyById[l.id] ?? ''}
                          onChange={(e)=> setLotQtyById(prev => ({ ...prev, [l.id]: e.target.value }))}
                        />
                        <button
                          className="bg-blue-600 text-white rounded px-3 py-1"
                          disabled={placingLotId === l.id}
                          onClick={async ()=>{
                            setOrderMsg('');
                            const v = parseFloat(lotQtyById[l.id] || 0);
                            if (!Number.isFinite(v) || v <= 0) { setOrderMsgType('error'); setOrderMsg('مقدار نامعتبر است'); return; }
                            const available = Math.max(0, parseFloat(l.totalQuantity||0) - parseFloat(l.reservedQuantity||0));
                            if (v > available + 1e-9) { setOrderMsgType('error'); setOrderMsg(`حداکثر قابل سفارش از این بار: ${available.toFixed(3)} ${l.unit||''}`); return; }
                            setPlacingLotId(l.id);
                            try {
                              const payload = { productId: productIdNum, qualityGrade: l.qualityGrade, quantity: Number(v.toFixed(3)), unit: l.unit || item?.unit || null };
                              const res = await fetch(`${API_ENDPOINTS.farmer.cart.base}/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
                              const j = await res.json();
                              if (!res.ok || !j?.success) throw new Error(j?.message || 'خطا در افزودن به سبد');
                              setOrderMsgType('success');
                              const contactNote = userPhone ? ` (${userPhone})` : '';
                              setOrderMsg(`به سبد خرید اضافه شد. رزرو توسط مدیریت انجام می‌شود و برای تایید نهایی با شما تماس می‌گیریم${contactNote}.`);
                              // refresh cart badge for this product
                              fetchCart();
                            } catch (e) {
                              setOrderMsgType('error'); setOrderMsg(e.message || 'خطا در افزودن به سبد');
                            } finally {
                              setPlacingLotId(null);
                            }
                          }}
                        >{placingLotId === l.id ? '...' : 'افزودن به سبد'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Media modal */}
      {mediaOpen ? (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow border p-4 w-full max-w-4xl">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">{mediaContext.module === 'inventory' && mediaLot ? `رسانه‌های محصول #${mediaLot.id}` : 'رسانه‌های محصول'}</div>
              <button className="text-slate-500" onClick={()=>{ setMediaOpen(false); setMediaLot(null); setMediaItems([]); }}>✕</button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <button className={`px-3 py-1 rounded ${mediaTab==='images'?'bg-indigo-600 text-white':'border'}`} onClick={()=>openMediaModal({ module: mediaContext.module, entityId: mediaContext.entityId, lot: mediaLot, tab: 'images' })}>تصاویر</button>
              <button className={`px-3 py-1 rounded ${mediaTab==='videos'?'bg-indigo-600 text-white':'border'}`} onClick={()=>openMediaModal({ module: mediaContext.module, entityId: mediaContext.entityId, lot: mediaLot, tab: 'videos' })}>ویدیوها</button>
            </div>
            {mediaLoading ? (
              <div className="text-slate-500">در حال بارگذاری...</div>
            ) : mediaItems.length === 0 ? (
              <div className="text-slate-500">موردی برای نمایش وجود ندارد.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mediaItems.map(m => (
                  <div key={m.id} className="border rounded-md overflow-hidden bg-white">
                    <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                      {String(m.mimeType||'').startsWith('video/') ? (
                        <video src={m.downloadUrl} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={m.downloadUrl} alt={m.originalName||''} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-2 text-xs truncate" title={m.originalName}>{m.originalName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Products list (only show when there are sub-products) */}
      {!loading && children.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">محصولات</h2>
          <div className="space-y-2">
            {children.map((ch) => (
              <Link key={ch.id} href={`/catalog/${ch.id}`} className="flex items-center justify-between bg-white rounded-lg shadow p-3 border hover:bg-slate-50">
                <div className="font-medium text-slate-800">{ch.name}</div>
                <span className="text-xs text-slate-400">مشاهده</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

