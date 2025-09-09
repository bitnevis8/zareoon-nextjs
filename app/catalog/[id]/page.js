"use client";
import { useEffect, useMemo, useState, use as usePromise } from "react";
import ProductImage from "@/app/components/ui/ProductImage";
import TieredPricingDisplay from "@/app/components/ui/TieredPricingDisplay";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getProductStockClass, calculateAvailableStock } from "@/app/utils/stockUtils";
import CartStatusBanner from "@/app/components/CartStatusBanner";

export default function CatalogItemPage({ params }) {
  // Next.js 15: params is a Promise; unwrap with React.use()
  const { id } = usePromise(params);
  const router = useRouter();
  const auth = useAuth();
  const userPhone = auth?.user?.mobile || auth?.user?.phone || null;
  const isAdmin = auth?.user?.roles?.some(role => role.nameEn === 'Administrator') || false;
  
  // Check user roles for bottom bar
  const userRoles = auth?.user?.roles?.map(role => role.nameEn) || [];
  const isFarmer = userRoles.includes('Farmer') || userRoles.includes('farmer');
  const isSupplier = userRoles.includes('Supplier') || userRoles.includes('supplier');
  const isBargeCollector = userRoles.includes('BargeCollector') || userRoles.includes('bargeCollector');
  const isSupervisor = userRoles.includes('Supervisor') || userRoles.includes('supervisor');
  const canAddProduct = isAdmin || isFarmer || isSupplier || isBargeCollector || isSupervisor;
  const [item, setItem] = useState(null);
  const [children, setChildren] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [inventoryLots, setInventoryLots] = useState([]);
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
  }, [id, cartUnit, item?.unit]);

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
        const [ri, rc, rl, rall] = await Promise.all([
          fetch(API_ENDPOINTS.farmer.products.getById(id), { cache: "no-store" }),
          fetch(`${API_ENDPOINTS.farmer.products.getAll}?parentId=${id}`, { cache: "no-store" }),
          fetch(API_ENDPOINTS.farmer.inventoryLots.getAll, { cache: "no-store" }),
          fetch(API_ENDPOINTS.farmer.products.getAll, { cache: "no-store" }),
        ]);
        const di = await ri.json();
        const dc = await rc.json();
        const dl = await rl.json();
        const dall = await rall.json();
        setItem(di.data || null);
        setChildren(dc.data || []);
        setLots(dl.data || []);
        setInventoryLots(dl.data || []);
        setAllProducts(dall.data || []);
        
        // Debug: Check inventory lots
        console.log('Inventory lots loaded:', dl.data?.length || 0);
        const wheatLots = dl.data?.filter(lot => lot.productId === 1101) || [];
        console.log('Wheat bread lots:', wheatLots.map(lot => `${lot.qualityGrade}: ${lot.totalQuantity}kg`));
        
        // Debug: Check children
        console.log('Children loaded:', dc.data?.length || 0);
        console.log('Children:', dc.data?.map(ch => `${ch.name} (${ch.id}, orderable: ${ch.isOrderable})`));
        
        // Debug: Check all products
        console.log('All products loaded:', dall.data?.length || 0);
        const wheatProducts = dall.data?.filter(p => p.parentId === 1001) || [];
        console.log('Wheat products in allProducts:', wheatProducts.map(p => `${p.name} (${p.id})`));
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
    <main className="w-full px-2 sm:px-4 lg:px-6 py-2 space-y-4 sm:space-y-6 overflow-x-hidden">
      <CartStatusBanner />
      <div className="text-sm text-slate-500"><Link href="/">صفحه اصلی</Link> / {item?.name || "..."}</div>

      {/* Header: image on the right, title on the left of the image (RTL-friendly) */}
        <section className={`bg-white rounded-xl shadow border p-3 sm:p-4 ${item ? getProductStockClass(item, allProducts, inventoryLots) : ''}`}>
        <div className="flex items-center gap-3 sm:gap-4 flex-row-reverse">
          <div className="shrink-0">
            <ProductImage slug={item?.slug} imageUrl={item?.imageUrl} alt={item?.name || "item"} width={80} height={80} className="sm:w-24 sm:h-24" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{item?.name || ""}</h1>
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
                        <Image src={m.downloadUrl} alt={m.originalName||''} className="w-full h-full object-cover" width={300} height={200} />
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

      {/* Category stock summary (for non-orderable items) */}
      {!item?.isOrderable && children.length > 0 && (
        <section className="bg-white rounded-xl shadow border p-3 sm:p-4">
          <h2 className="text-lg font-semibold mb-3">وضعیت موجودی کل</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-md border p-3">
              <div className="text-xs text-slate-500">کل موجودی</div>
              <div className="text-lg font-semibold">
                {children.reduce((sum, ch) => {
                  const stock = calculateAvailableStock(ch, allProducts, inventoryLots);
                  return sum + stock;
                }, 0).toLocaleString()} کیلوگرم
              </div>
            </div>
            <div className="bg-slate-50 rounded-md border p-3">
              <div className="text-xs text-slate-500">تعداد محصولات</div>
              <div className="text-lg font-semibold">{children.length} محصول</div>
            </div>
            <div className="bg-slate-50 rounded-md border p-3">
              <div className="text-xs text-slate-500">محصولات دارای موجودی</div>
              <div className="text-lg font-semibold">
                {children.filter(ch => calculateAvailableStock(ch, allProducts, inventoryLots) > 0).length} محصول
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Inventory summary (if any) */}
      {filteredLots.length > 0 && (
        <section className="bg-white rounded-xl shadow border p-3 sm:p-4">
          <h2 className="text-lg font-semibold mb-3">وضعیت موجودی</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4">
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
            <table className="w-full text-sm" style={{ minWidth: '100%' }}>
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
        <section className="bg-gray-50 rounded-xl shadow border p-3 sm:p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">محصولات موجود</h2>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '100%' }}>
              <thead>
                <tr className="bg-gray-50 text-gray-700 border-b">
                  <th className="px-4 py-3 text-right font-medium">رسانه</th>
                  <th className="px-4 py-3 text-right font-medium">درجه</th>
                  <th className="px-4 py-3 text-right font-medium">واحد</th>
                  <th className="px-4 py-3 text-right font-medium">کل</th>
                  <th className="px-4 py-3 text-right font-medium">رزرو</th>
                  <th className="px-4 py-3 text-right font-medium">قیمت</th>
                  <th className="px-4 py-3 text-right font-medium">حداقل سفارش</th>
                  <th className="px-4 py-3 text-right font-medium">وضعیت</th>
                  <th className="px-4 py-3 text-right font-medium">ویژگی‌ها</th>
                  {isAdmin && <th className="px-4 py-3 text-right font-medium">تامین‌کننده</th>}
                  <th className="px-4 py-3 text-right font-medium">درخواست</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLots.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {(() => {
                        const c = lotMediaCounts.get(l.id);
                        const preview = lotMediaPreview.get(l.id) || [];
                        if (!c || (c.images + c.videos) === 0) return '—';
                        return (
                          <div className="flex items-center gap-2">
                            {preview.slice(0, 1).map(m => (
                              <div
                                key={m.id}
                                className="w-16 h-12 rounded overflow-hidden bg-slate-100 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openMediaModal({ module: 'inventory', entityId: l.id, lot: l, tab: String(m.mimeType||'').startsWith('video/') ? 'videos' : 'images' })}
                                title="مشاهده رسانه‌ها"
                              >
                                {String(m.mimeType||'').startsWith('video/') ? (
                                  <video src={m.downloadUrl} className="w-full h-full object-cover" muted />
                                ) : (
                                  <Image src={m.downloadUrl} alt={m.originalName||''} className="w-full h-full object-cover" width={300} height={200} />
                                )}
                              </div>
                            ))}
                            {(c.images + c.videos) > 1 ? (
                              <button className="text-indigo-600 text-xs hover:text-indigo-800" onClick={() => openMediaModal({ module: 'inventory', entityId: l.id, lot: l, tab: 'images' })}>
                                +{(c.images + c.videos) - 1}
                              </button>
                            ) : null}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {l.qualityGrade}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{l.unit}</td>
                    <td className="px-4 py-3 font-mono text-xs">{l.totalQuantity?.toLocaleString('fa-IR')}</td>
                    <td className="px-4 py-3 font-mono text-xs">{l.reservedQuantity?.toLocaleString('fa-IR')}</td>
                    <td className="px-4 py-3">
                      {l.tieredPricing && l.tieredPricing.length > 0 ? (
                        <TieredPricingDisplay tieredPricing={l.tieredPricing} unit={l.unit} />
                      ) : l.price ? (
                        <span className="font-medium text-green-600">{l.price.toLocaleString('fa-IR')} تومان</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {l.tieredPricing && l.tieredPricing.length > 0 ? (
                        <span className="text-xs text-gray-500">قیمت پلکانی</span>
                      ) : l.minimumOrderQuantity ? (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {l.minimumOrderQuantity} {l.unit}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        l.status === 'harvested' ? 'bg-green-100 text-green-800' :
                        l.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                        l.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {statusToFa[l.status] || l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
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
                    {isAdmin && (
                      <td className="px-4 py-3">
                        {l.farmer ? (
                          <div className="text-sm">
                            <div className="font-medium">{l.farmer.firstName} {l.farmer.lastName}</div>
                            <div className="text-gray-500 text-xs">{l.farmer.username}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          className="border rounded px-2 py-1 w-24 sm:w-32 md:w-40 lg:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder={`حداکثر ${(Math.max(0, (parseFloat(l.totalQuantity||0) - parseFloat(l.reservedQuantity||0)))||0).toFixed(3)}`}
                          value={lotQtyById[l.id] ?? ''}
                          onChange={(e)=> setLotQtyById(prev => ({ ...prev, [l.id]: e.target.value }))}
                        />
                        <button
                          className="bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={placingLotId === l.id}
                          onClick={async ()=>{
                            setOrderMsg('');
                            const v = parseFloat(lotQtyById[l.id] || 0);
                            if (!Number.isFinite(v) || v <= 0) { setOrderMsgType('error'); setOrderMsg('مقدار نامعتبر است'); return; }
                            const available = Math.max(0, parseFloat(l.totalQuantity||0) - parseFloat(l.reservedQuantity||0));
                            if (v > available + 1e-9) { setOrderMsgType('error'); setOrderMsg(`حداکثر قابل سفارش از این بار: ${available.toFixed(3)} ${l.unit||''}`); return; }
                            setPlacingLotId(l.id);
                            try {
                              const payload = { productId: productIdNum, inventoryLotId: l.id, qualityGrade: l.qualityGrade, quantity: Number(v.toFixed(3)), unit: l.unit || item?.unit || null };
                              const res = await fetch(`${API_ENDPOINTS.farmer.cart.base}/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
                              const j = await res.json();
                              if (!res.ok || !j?.success) throw new Error(j?.message || 'خطا در افزودن به بار');
                              setOrderMsgType('success');
                              const contactNote = userPhone ? ` (${userPhone})` : '';
                              setOrderMsg(`به بار اضافه شد. رزرو توسط مدیریت انجام می‌شود و برای تایید نهایی با شما تماس می‌گیریم${contactNote}. شما می‌توانید از بالای صفحه یا از داشبورد بخش بار، سفارشات خود را مشاهده کرده و ثبت بار را بزنید. با زدن ثبت بار، بار رزرو نمی‌شود ولی با مشتری تماس گرفته می‌شود جهت رزرو شدن بار. تماس پشتیبانی: 09393387148`);
                              // refresh cart badge for this product
                              fetchCart();
                            } catch (e) {
                              setOrderMsgType('error'); setOrderMsg(e.message || 'خطا در افزودن به بار');
                            } finally {
                              setPlacingLotId(null);
                            }
                          }}
                        >{placingLotId === l.id ? '...' : 'سفارش'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden space-y-3 sm:space-y-4">
            {filteredLots.map((l) => (
              <div key={l.id} className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                {/* Header with image and basic info - only show if media exists */}
                {(() => {
                  const c = lotMediaCounts.get(l.id);
                  const preview = lotMediaPreview.get(l.id) || [];
                  if (c && (c.images + c.videos) > 0) {
                    return (
                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                          {preview.slice(0, 1).map(m => (
                            <div
                              key={m.id}
                              className="w-full h-full cursor-pointer hover:scale-105 transition-transform duration-200"
                              onClick={() => openMediaModal({ module: 'inventory', entityId: l.id, lot: l, tab: String(m.mimeType||'').startsWith('video/') ? 'videos' : 'images' })}
                              title="مشاهده رسانه‌ها"
                            >
                              {String(m.mimeType||'').startsWith('video/') ? (
                                <video src={m.downloadUrl} className="w-full h-full object-cover" muted />
                              ) : (
                                <Image src={m.downloadUrl} alt={m.originalName||''} className="w-full h-full object-cover" width={400} height={300} />
                              )}
                            </div>
                          ))}
                          {/* Media count badge */}
                          {(c.images + c.videos) > 1 && (
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              +{(c.images + c.videos) - 1}
                            </div>
                          )}
                          {/* Quality grade badge */}
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white shadow-lg">
                              {l.qualityGrade}
                            </span>
                          </div>
                          {/* Status badge */}
                          <div className="absolute bottom-2 right-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-lg ${
                              l.status === 'harvested' ? 'bg-green-600 text-white' :
                              l.status === 'reserved' ? 'bg-yellow-600 text-white' :
                              l.status === 'sold' ? 'bg-blue-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {statusToFa[l.status] || l.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // No media - show badges in header area instead
                    return (
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white shadow-lg">
                          {l.qualityGrade}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-lg ${
                          l.status === 'harvested' ? 'bg-green-600 text-white' :
                          l.status === 'reserved' ? 'bg-yellow-600 text-white' :
                          l.status === 'sold' ? 'bg-blue-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {statusToFa[l.status] || l.status}
                        </span>
                      </div>
                    );
                  }
                })()}

                {/* Content */}
                <div className="p-4">
                  {/* Unit and basic info */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">{l.unit}</span>
                    <div className="text-xs text-gray-500">
                      موجودی: {Math.max(0, (parseFloat(l.totalQuantity||0) - parseFloat(l.reservedQuantity||0))).toFixed(3)}
                    </div>
                  </div>
                  
                  {/* Stock info grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-gray-500 text-xs mb-1">مقدار کل</div>
                      <div className="font-mono font-semibold text-gray-900">{l.totalQuantity?.toLocaleString('fa-IR')}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-gray-500 text-xs mb-1">رزرو شده</div>
                      <div className="font-mono font-semibold text-gray-900">{l.reservedQuantity?.toLocaleString('fa-IR')}</div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="text-gray-500 text-xs mb-2">قیمت‌گذاری</div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      {l.tieredPricing && l.tieredPricing.length > 0 ? (
                        <TieredPricingDisplay tieredPricing={l.tieredPricing} unit={l.unit} />
                      ) : l.price ? (
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-green-700 text-lg">{l.price.toLocaleString('fa-IR')} تومان</span>
                          <span className="text-xs text-green-600">قیمت ثابت</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">قیمت تعیین نشده</span>
                      )}
                    </div>
                  </div>

                  {/* Minimum order */}
                  {l.tieredPricing && l.tieredPricing.length > 0 ? (
                    <div className="mb-4">
                      <div className="text-gray-500 text-xs mb-2">حداقل سفارش</div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <span className="text-sm text-blue-700">قیمت پلکانی - جزئیات در بالا</span>
                      </div>
                    </div>
                  ) : l.minimumOrderQuantity ? (
                    <div className="mb-4">
                      <div className="text-gray-500 text-xs mb-2">حداقل سفارش</div>
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <span className="text-sm font-medium text-yellow-800">{l.minimumOrderQuantity} {l.unit}</span>
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Attributes */}
                  {Array.isArray(l.attributes) && l.attributes.length > 0 && (
                    <div className="mb-4">
                      <div className="text-gray-500 text-xs mb-2">ویژگی‌ها</div>
                      <div className="space-y-2">
                        {l.attributes.slice(0, 3).map((a) => (
                          <div key={a.id} className="flex justify-between items-center text-xs bg-white rounded px-3 py-2 border border-gray-200">
                            <span className="font-medium text-gray-700">{a.definition?.name}:</span>
                            <span className="text-gray-600">{a.value}</span>
                          </div>
                        ))}
                        {l.attributes.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{l.attributes.length - 3} ویژگی دیگر
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Farmer info (admin only) */}
                  {isAdmin && l.farmer && (
                    <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-gray-500 text-xs mb-1">تامین‌کننده</div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{l.farmer.firstName} {l.farmer.lastName}</div>
                        <div className="text-gray-500 text-xs">{l.farmer.username}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Order section */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-gray-500 text-xs mb-2">درخواست سفارش</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm max-w-[200px]"
                        placeholder={`حداکثر ${(Math.max(0, (parseFloat(l.totalQuantity||0) - parseFloat(l.reservedQuantity||0)))||0).toFixed(3)}`}
                        value={lotQtyById[l.id] ?? ''}
                        onChange={(e)=> setLotQtyById(prev => ({ ...prev, [l.id]: e.target.value }))}
                      />
                      <button
                        className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
                        disabled={placingLotId === l.id}
                        onClick={async ()=>{
                          setOrderMsg('');
                          const v = parseFloat(lotQtyById[l.id] || 0);
                          if (!Number.isFinite(v) || v <= 0) { setOrderMsgType('error'); setOrderMsg('مقدار نامعتبر است'); return; }
                          const available = Math.max(0, parseFloat(l.totalQuantity||0) - parseFloat(l.reservedQuantity||0));
                          if (v > available + 1e-9) { setOrderMsgType('error'); setOrderMsg(`حداکثر قابل سفارش از این بار: ${available.toFixed(3)} ${l.unit||''}`); return; }
                          setPlacingLotId(l.id);
                          try {
                            const payload = { productId: productIdNum, inventoryLotId: l.id, qualityGrade: l.qualityGrade, quantity: Number(v.toFixed(3)), unit: l.unit || item?.unit || null };
                            const res = await fetch(`${API_ENDPOINTS.farmer.cart.base}/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
                            const j = await res.json();
                            if (!res.ok || !j?.success) throw new Error(j?.message || 'خطا در افزودن به بار');
                            setOrderMsgType('success');
                            const contactNote = userPhone ? ` (${userPhone})` : '';
                            setOrderMsg(`به بار اضافه شد. رزرو توسط مدیریت انجام می‌شود و برای تایید نهایی با شما تماس می‌گیریم${contactNote}. شما می‌توانید از بالای صفحه یا از داشبورد بخش بار، سفارشات خود را مشاهده کرده و ثبت بار را بزنید. با زدن ثبت بار، بار رزرو نمی‌شود ولی با مشتری تماس گرفته می‌شود جهت رزرو شدن بار. تماس پشتیبانی: 09393387148`);
                            // refresh cart badge for this product
                            fetchCart();
                          } catch (e) {
                            setOrderMsgType('error'); setOrderMsg(e.message || 'خطا در افزودن به بار');
                          } finally {
                            setPlacingLotId(null);
                          }
                        }}
                      >{placingLotId === l.id ? '...' : 'سفارش'}</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                        <Image src={m.downloadUrl} alt={m.originalName||''} className="w-full h-full object-cover" width={300} height={200} />
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
          <div className="space-y-2 sm:space-y-3">
            {children.map((ch) => {
              // محاسبه موجودی برای هر محصول/دسته
              const availableStock = calculateAvailableStock(ch, allProducts, inventoryLots);
              console.log(`Child ${ch.name} (${ch.id}): availableStock = ${availableStock}`);
              
              // Debug: Check inventory lots for this product
              if (ch.isOrderable) {
                const productLots = inventoryLots.filter(lot => lot.productId === ch.id);
                console.log(`Debug ${ch.name}:`, productLots.map(lot => ({
                  id: lot.id,
                  totalQuantity: lot.totalQuantity,
                  reservedQuantity: lot.reservedQuantity,
                  totalParsed: parseFloat(lot.totalQuantity || 0),
                  reservedParsed: parseFloat(lot.reservedQuantity || 0)
                })));
              }
              
              return (
                <Link key={ch.id} href={`/catalog/${ch.id}`} className={`flex items-center justify-between bg-white rounded-lg shadow p-3 sm:p-4 border hover:bg-slate-50 transition-colors ${ch ? getProductStockClass(ch, allProducts, inventoryLots) : ''}`}>
                  <div className="font-medium text-slate-800">{ch.name}</div>
                  <div className="flex items-center gap-2">
                    {availableStock > 0 && (
                      <span className="text-xs text-green-600 font-medium">
                        {availableStock.toLocaleString()} کیلوگرم
                      </span>
                    )}
                    <span className="text-xs text-slate-400">مشاهده</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}


    </main>
  );
}

