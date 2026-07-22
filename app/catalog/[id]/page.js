"use client";
import { useEffect, useMemo, useState, useRef, use as usePromise } from "react";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { calculateAvailableStock } from "@/app/utils/stockUtils";
import { formatLocalizedNumber, getLocalizedText, localizeUnit } from "@/app/utils/localize";
import CartStatusBanner from "@/app/components/CartStatusBanner";
import CatalogBreadcrumb, { buildCatalogPath } from "@/app/components/CatalogBreadcrumb";
import CatalogChildrenGrid from "@/app/components/CatalogChildrenGrid";
import LatestAvailableProductsSection from "@/app/components/LatestAvailableProductsSection";
import CatalogProductHero from "@/app/components/catalog/CatalogProductHero";
import CatalogProductDescription from "@/app/components/catalog/CatalogProductDescription";
import CatalogGradeOffers from "@/app/components/catalog/CatalogGradeOffers";
import CatalogLotFilters from "@/app/components/catalog/CatalogLotFilters";
import CatalogTradeCompliance from "@/app/components/catalog/CatalogTradeCompliance";
import { lotMatchesFilterValues } from "@/app/utils/productCatalogSchema";
import { buildLotGalleryItems } from "@/app/utils/catalogGradeMedia";
import CatalogMediaLightbox, { sortMediaItems, buildProductGalleryItems } from "@/app/components/catalog/CatalogMediaLightbox";
import CatalogPdfDownload from "@/app/components/catalog/CatalogPdfDownload";
import ShareButton from "@/app/components/ui/ShareButton";
import CatalogPageSkeleton from "@/app/components/CatalogPageSkeleton";
import { sortCatalogItems } from "@/app/utils/productSort";
import { authFetch } from "@/app/utils/authHeaders";
import { isAdmin } from "@/app/utils/roles";
import { useNavigationLoading } from "@/app/context/NavigationLoadingContext";
import {
  useCatalogChildren,
  useCatalogProduct,
  useFullCatalog,
  useInventoryLots,
  useBackgroundCatalogWarmup,
  prefetchCatalogChildren,
} from "@/app/hooks/useCatalogProducts";

export default function CatalogItemPage({ params }) {
  const { id } = usePromise(params);
  const auth = useAuth();
  const { language, isRTL } = useLanguage();
  const t = useTranslations("catalog");
  const { start: startNavLoading, done: doneNavLoading } = useNavigationLoading();
  const userPhone = auth?.user?.mobile || auth?.user?.phone || null;
  const user = auth?.user;
  const admin = isAdmin(user);

  // Homepage warms these SWR keys — open category without waiting for the full tree.
  const { product: item } = useCatalogProduct(id);
  const { children: rawChildren, loading: childrenLoading, hasCache: childrenCached } =
    useCatalogChildren(id);
  const { products: allProducts, loading: catalogLoading } = useFullCatalog({
    enabled: Boolean(item),
  });
  const { lots: inventoryLots, loading: lotsLoading } = useInventoryLots({
    enabled: Boolean(item),
  });

  const children = useMemo(
    () => sortCatalogItems(rawChildren || [], language),
    [rawChildren, language]
  );

  useBackgroundCatalogWarmup(children.filter((c) => !c.isOrderable).slice(0, 16));

  // Static root (or warmed cache) means product is ready immediately.
  const coreReady = Boolean(item) && (childrenCached || !childrenLoading);
  const loading = !coreReady;

  const [lotQtyById, setLotQtyById] = useState({});
  const [placingLotId, setPlacingLotId] = useState(null);
  const [orderMsg, setOrderMsg] = useState("");
  const [orderMsgType, setOrderMsgType] = useState("info");
  const [lotMediaCounts, setLotMediaCounts] = useState(new Map());
  const [productMedia, setProductMedia] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const mediaCacheRef = useRef(new Map());
  const [lotMediaPreview, setLotMediaPreview] = useState(new Map());
  const [activeOfferGrade, setActiveOfferGrade] = useState(null);
  const [lotFilters, setLotFilters] = useState({});
  const [cartTotalQty, setCartTotalQty] = useState(0);
  const [cartUnit, setCartUnit] = useState("");

  const fetchCart = useCallback(async () => {
    try {
      const r = await authFetch(`${API_ENDPOINTS.farmer.cart.base}/me`, { cache: "no-store" });
      const j = await r.json();
      const items = j?.data?.items || [];
      let sum = 0;
      let unit = cartUnit;
      for (const it of items) {
        if (Number(it.productId) === Number(id)) {
          const q = parseFloat(it.quantity || 0);
          if (Number.isFinite(q)) sum += q;
          if (!unit && it.unit) unit = it.unit;
        }
      }
      setCartTotalQty(sum);
      setCartUnit(unit || item?.unit || "");
    } catch {}
  }, [id, cartUnit, item?.unit]);

  const loadLotMediaCounts = useCallback(async (lotId) => {
    try {
      const r = await fetch(
        `${API_ENDPOINTS.fileUpload.getFilesByModule("inventory")}?entityId=${encodeURIComponent(lotId)}`,
        { cache: "no-store" }
      );
      const j = await r.json();
      if (j?.success) {
        const arr = Array.isArray(j.data) ? j.data : [];
        const sorted = sortMediaItems(arr);
        setLotMediaCounts((prev) =>
          new Map(prev).set(lotId, {
            images: sorted.filter((it) => String(it.mimeType || "").startsWith("image/")).length,
            videos: sorted.filter((it) => String(it.mimeType || "").startsWith("video/")).length,
          })
        );
        setLotMediaPreview((prev) => new Map(prev).set(lotId, sorted));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!loading) {
      doneNavLoading();
      return;
    }
    startNavLoading();
    return () => doneNavLoading();
  }, [loading, startNavLoading, doneNavLoading]);

  useEffect(() => {
    fetchCart();
  }, [id, fetchCart]);

  useEffect(() => {
    if (!children.length) return;
    const subs = children.filter((c) => !c.isOrderable).slice(0, 8);
    let cancelled = false;
    (async () => {
      for (const sub of subs) {
        if (cancelled) break;
        try {
          await prefetchCatalogChildren(sub.id);
        } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [children]);

  const productById = useMemo(() => {
    const map = new Map();
    for (const p of allProducts) map.set(p.id, p);
    if (item) map.set(item.id, item);
    for (const c of children) map.set(c.id, c);
    return map;
  }, [allProducts, item, children]);

  const breadcrumbPath = useMemo(() => buildCatalogPath(item, productById), [item, productById]);

  const productIdNum = Number(id);
  const lots = inventoryLots;
  const productLots = useMemo(
    () => (lots || []).filter((l) => l.productId === productIdNum),
    [lots, productIdNum]
  );
  const filteredLots = useMemo(
    () => productLots.filter((l) => lotMatchesFilterValues(l, lotFilters)),
    [productLots, lotFilters]
  );
  const summary = useMemo(() => {
    let total = 0;
    let reserved = 0;
    for (const l of filteredLots) {
      total += parseFloat(l.totalQuantity || 0);
      reserved += parseFloat(l.reservedQuantity || 0);
    }
    return {
      totalQuantity: total,
      reservedQuantity: reserved,
      availableQuantity: Math.max(0, total - reserved),
      lots: filteredLots,
    };
  }, [filteredLots]);

  useEffect(() => {
    setLotFilters({});
  }, [id]);

  useEffect(() => {
    if (!productLots.length) return;
    productLots.slice(0, 12).forEach((l) => {
      if (!lotMediaCounts.has(l.id)) loadLotMediaCounts(l.id);
    });
  }, [productLots, lotMediaCounts, loadLotMediaCounts]);

  const openMediaGallery = useCallback(async ({ module, entityId, startMediaId = null, startIndex = null, productItem = null, galleryTitle: titleOverride = null }) => {
    const cacheKey = `${module}:${entityId}`;
    setGalleryOpen(true);
    setGalleryLoading(true);
    setGalleryTitle(titleOverride || "");

    try {
      let items = mediaCacheRef.current.get(cacheKey);
      if (!items) {
        const r = await fetch(
          `${API_ENDPOINTS.fileUpload.getFilesByModule(module)}?entityId=${encodeURIComponent(entityId)}`,
          { cache: "no-store", credentials: "include" }
        );
        const j = await r.json();
        const raw = j?.success && Array.isArray(j.data) ? j.data : [];
        items = sortMediaItems(raw);
        mediaCacheRef.current.set(cacheKey, items);

        if (module === "inventory") {
          setLotMediaPreview((prev) => new Map(prev).set(Number(entityId), items));
          setLotMediaCounts((prev) =>
            new Map(prev).set(Number(entityId), {
              images: items.filter((it) => String(it.mimeType || "").startsWith("image/")).length,
              videos: items.filter((it) => String(it.mimeType || "").startsWith("video/")).length,
            })
          );
        } else if (module === "products") {
          setProductMedia(items);
        }
      }

      if (module === "products" && productItem) {
        items = buildProductGalleryItems(productItem, items);
      }

      if (module === "inventory") {
        const lot = filteredLots.find((l) => Number(l.id) === Number(entityId));
        if (lot) items = buildLotGalleryItems(lot, items);
      }

      setGalleryItems(items);
      let resolvedIndex = 0;
      if (startIndex != null && startIndex >= 0) {
        resolvedIndex = Math.min(startIndex, Math.max(0, items.length - 1));
      } else if (startMediaId) {
        resolvedIndex = Math.max(0, items.findIndex((it) => it.id === startMediaId));
      }
      setGalleryIndex(resolvedIndex);
    } catch {
      setGalleryItems([]);
      setGalleryIndex(0);
    } finally {
      setGalleryLoading(false);
    }
  }, [filteredLots]);

  // Load product-level media counts
  useEffect(() => {
    if (!productIdNum) return;
    (async () => {
      try {
        const r = await fetch(`${API_ENDPOINTS.fileUpload.getFilesByModule('products')}?entityId=${encodeURIComponent(productIdNum)}`, { cache: 'no-store', credentials: 'include' });
        const j = await r.json();
        if (j?.success) {
          const arr = Array.isArray(j.data) ? j.data : [];
          const sorted = sortMediaItems(arr);
          setProductMedia(sorted);
          mediaCacheRef.current.set(`products:${productIdNum}`, sorted);
        }
      } catch {}
    })();
  }, [productIdNum]);

  const handleAddToLotCart = useCallback(
    async (lot, productUnit) => {
      setOrderMsg("");
      if (!auth?.user && typeof window !== "undefined" && !localStorage.getItem("token")) {
        setOrderMsgType("error");
        setOrderMsg(t("pleaseLoginFirst"));
        return;
      }
      const v = parseFloat(lotQtyById[lot.id] || 0);
      if (!Number.isFinite(v) || v <= 0) {
        setOrderMsgType("error");
        setOrderMsg(t("invalidQuantity"));
        return;
      }
      const available = Math.max(0, parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0));
      if (v > available + 1e-9) {
        setOrderMsgType("error");
        setOrderMsg(t("orderMaxFromLot", { quantity: available.toFixed(3), unit: lot.unit || "" }));
        return;
      }
      setPlacingLotId(lot.id);
      try {
        const payload = {
          productId: productIdNum,
          inventoryLotId: lot.id,
          qualityGrade: lot.qualityGrade,
          quantity: Number(v.toFixed(3)),
          unit: lot.unit || productUnit || null,
        };
        const res = await authFetch(`${API_ENDPOINTS.farmer.cart.base}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await res.json();
        if (!res.ok || !j?.success) throw new Error(j?.message || t("addToCartError"));
        setOrderMsgType("success");
        const contactNote = userPhone ? ` (${userPhone})` : "";
        setOrderMsg(`${t("orderAdded")}${contactNote}`);
        fetchCart();
      } catch (e) {
        setOrderMsgType("error");
        setOrderMsg(e.message || t("addToCartError"));
      } finally {
        setPlacingLotId(null);
      }
    },
    [lotQtyById, productIdNum, userPhone, t, fetchCart, auth?.user]
  );

  if (loading || !item) {
    return <CatalogPageSkeleton variant="category" />;
  }

  const stockExtrasLoading = (catalogLoading || lotsLoading) && !allProducts.length;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 overflow-x-hidden px-3 py-3 pb-24 sm:space-y-6 sm:px-6 sm:py-4 sm:pb-6">
      <CartStatusBanner />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CatalogBreadcrumb path={breadcrumbPath} language={language} homeLabel={t("mainPage")} />
        {item ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-center">
            <ShareButton
              variant="button"
              url={`/catalog/${productIdNum || id}`}
              title={getLocalizedText(item, language) || t("product")}
            />
            <CatalogPdfDownload
              scope={item.isOrderable ? "product" : "category"}
              productId={item.isOrderable ? productIdNum : undefined}
              categoryId={!item.isOrderable ? productIdNum : undefined}
              productIsOrderable={item.isOrderable}
              user={user}
              product={item}
              lots={productLots}
              label={t("downloadCatalogPdf")}
              compact
            />
          </div>
        ) : null}
      </div>

      <CatalogProductHero
        item={item}
        language={language}
        productMedia={productMedia}
        productIdNum={productIdNum}
        openMediaGallery={openMediaGallery}
        cartTotalQty={cartTotalQty}
        cartUnit={cartUnit}
        hideMedia={filteredLots.length > 0 || productLots.length > 0}
      />

      {productLots.length > 0 ? (
        <CatalogLotFilters
          product={item}
          lots={productLots}
          activeFilters={lotFilters}
          onChange={(key, value) =>
            setLotFilters((prev) => {
              const next = { ...prev };
              if (!value) delete next[key];
              else next[key] = value;
              return next;
            })
          }
          onClear={() => setLotFilters({})}
        />
      ) : null}

      {filteredLots.length > 0 && (
        <CatalogGradeOffers
          item={item}
          lots={filteredLots}
          language={language}
          activeGrade={activeOfferGrade}
          onActiveGradeChange={setActiveOfferGrade}
          isAdmin={admin}
          lotMediaPreview={lotMediaPreview}
          openMediaGallery={openMediaGallery}
          lotQtyById={lotQtyById}
          setLotQtyById={setLotQtyById}
          placingLotId={placingLotId}
          onAddToCart={handleAddToLotCart}
          productUnit={item?.defaultMeasurementUnit || item?.unit}
          cartTotalQty={cartTotalQty}
          cartUnit={cartUnit}
          inventorySummary={summary}
          orderMsg={orderMsg}
          orderMsgType={orderMsgType}
          productDescription={item?.description}
          productMedia={productMedia}
        />
      )}

      {item?.isOrderable ? <CatalogTradeCompliance product={item} /> : null}

      {item?.description && filteredLots.length === 0 ? (
        <CatalogProductDescription description={item.description} />
      ) : null}

      {/* Category stock summary (for non-orderable items) */}
      {!item?.isOrderable && children.length > 0 && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 text-base font-bold text-slate-900 sm:mb-4 sm:text-lg">{t("totalStockStatus")}</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center sm:p-4 sm:text-right">
                <div className="text-[10px] font-medium leading-tight text-slate-500 sm:text-xs">{t("totalStock")}</div>
                <div className="mt-1 text-sm font-bold text-slate-900 sm:text-lg">
                  {formatLocalizedNumber(
                    children.reduce((sum, ch) => {
                      const stock = calculateAvailableStock(ch, allProducts, inventoryLots);
                      return sum + stock;
                    }, 0),
                    language
                  )}{" "}
                  {localizeUnit("kg", language)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center sm:p-4 sm:text-right">
                <div className="text-[10px] font-medium leading-tight text-slate-500 sm:text-xs">{t("totalProducts")}</div>
                <div className="mt-1 text-sm font-bold text-slate-900 sm:text-lg">{children.length} {t("product")}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center sm:p-4 sm:text-right">
                <div className="text-[10px] font-medium leading-tight text-slate-500 sm:text-xs">{t("productsWithStock")}</div>
                <div className="mt-1 text-sm font-bold text-slate-900 sm:text-lg">
                  {children.filter(ch => calculateAvailableStock(ch, allProducts, inventoryLots) > 0).length} {t("product")}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <CatalogMediaLightbox
        isOpen={galleryOpen}
        onClose={() => {
          setGalleryOpen(false);
          setGalleryItems([]);
          setGalleryIndex(0);
          setGalleryTitle("");
        }}
        items={galleryItems}
        activeIndex={galleryIndex}
        onIndexChange={setGalleryIndex}
        loading={galleryLoading}
        titleOverride={galleryTitle}
        isRTL={isRTL}
      />

      {item && !item.isOrderable ? (
        <LatestAvailableProductsSection
          inventoryLots={inventoryLots}
          allProducts={allProducts}
          loading={stockExtrasLoading}
          scopeCategoryId={item.id}
          scopeCategoryName={getLocalizedText(item, language)}
          variant="catalog"
          className="mb-4"
        />
      ) : null}

      {/* Subcategories and products */}
      {children.length > 0 && (
        <CatalogChildrenGrid
          items={children}
          allProducts={allProducts}
          inventoryLots={inventoryLots}
          parentItem={item}
        />
      )}

      {!item?.isOrderable && children.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-center text-sm text-slate-500">
          {t("noItemsRegistered")}
        </div>
      ) : null}


    </main>
  );
}

