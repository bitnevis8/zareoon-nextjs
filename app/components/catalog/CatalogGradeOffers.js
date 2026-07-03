"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import CatalogGradeMediaPanel from "./CatalogGradeMediaPanel";
import CatalogGradeLocationPanel from "./CatalogGradeLocationPanel";
import CatalogProductDescription from "./CatalogProductDescription";
import CatalogInventoryOverview from "./CatalogInventoryOverview";
import CatalogLotOfferCard from "./CatalogLotOfferCard";
import { getGradeDisplayLabel, getGradeTabLabel, groupLotsByGrade } from "../../utils/catalogGrades";
import { getLotSupplierDisplay } from "../../utils/catalogLotSupplier";
import { formatLocalizedNumber, getLocalizedText, localizeUnit } from "../../utils/localize";
import { catalogBadge, catalogSurface, catalogText } from "./catalogTheme";

function GradeTab({ grade, label, available, active, onClick, language, unitLabel, size = "default" }) {
  const isCompact = size === "compact";
  return (
    <button
      id={`grade-tab-${grade}`}
      type="button"
      onClick={onClick}
      className={`flex shrink-0 flex-col items-center rounded-xl border text-center transition ${
        isCompact ? "px-4 py-2.5" : "px-3 py-2"
      } ${
        active
          ? "border-green-600 bg-green-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:bg-green-50"
      }`}
    >
      <span className={`font-bold leading-tight ${isCompact ? "text-sm" : "text-xs"} ${active ? "text-white" : catalogText.heading}`}>
        {label}
      </span>
      {available > 0 ? (
        <span className={`mt-0.5 font-medium ${isCompact ? "text-xs" : "text-[10px]"} ${active ? "text-white/85" : catalogText.muted}`}>
          {formatLocalizedNumber(available, language)} {unitLabel}
        </span>
      ) : (
        <span className={`mt-0.5 ${isCompact ? "text-xs" : "text-[10px]"} ${active ? "text-white/70" : catalogText.subtle}`}>—</span>
      )}
    </button>
  );
}

function GradeTabsRow({ groups, displayGrade, language, unitLabel, onActiveGradeChange, t, tabsRef, size = "default", className = "", scrollable = false }) {
  if (groups.length <= 1) return null;
  return (
    <div className={className}>
      <p className={`mb-2 ${size === "compact" ? "text-xs" : "text-[10px]"} ${catalogText.muted}`}>{t("selectGradeHint")}</p>
      <div
        ref={tabsRef}
        className={`flex gap-2 ${scrollable ? "overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" : "flex-wrap"}`}
      >
        {groups.map((g) => (
          <GradeTab
            key={g.grade}
            grade={g.grade}
            label={getGradeTabLabel(g.grade, g.lots, language, t)}
            available={g.available}
            active={g.grade === displayGrade}
            language={language}
            unitLabel={unitLabel}
            size={size}
            onClick={() => onActiveGradeChange?.(g.grade)}
          />
        ))}
      </div>
    </div>
  );
}

function lotAvailableQty(lot) {
  return Math.max(0, parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0));
}

function SupplierTab({ lotId, label, available, active, onClick, language, unitLabel, size = "default" }) {
  const isCompact = size === "compact";
  return (
    <button
      id={`supplier-tab-${lotId}`}
      type="button"
      onClick={onClick}
      className={`flex shrink-0 flex-col items-center rounded-xl border text-center transition ${
        isCompact ? "min-w-[7rem] px-4 py-2.5" : "min-w-[6.5rem] px-3 py-2"
      } ${
        active
          ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
      }`}
    >
      <span className={`max-w-[9rem] truncate font-bold leading-tight ${isCompact ? "text-sm" : "text-xs"} ${active ? "text-white" : catalogText.heading}`}>
        {label}
      </span>
      {available > 0 ? (
        <span className={`mt-0.5 font-medium ${isCompact ? "text-xs" : "text-[10px]"} ${active ? "text-white/85" : catalogText.muted}`}>
          {formatLocalizedNumber(available, language)} {unitLabel}
        </span>
      ) : (
        <span className={`mt-0.5 ${isCompact ? "text-xs" : "text-[10px]"} ${active ? "text-white/70" : catalogText.subtle}`}>—</span>
      )}
    </button>
  );
}

function SupplierTabsRow({
  lots,
  activeLotId,
  onActiveLotChange,
  language,
  productUnit,
  t,
  tabsRef,
  size = "default",
  className = "",
}) {
  if (lots.length <= 1) return null;
  return (
    <div className={className}>
      <p className={`mb-2 ${size === "compact" ? "text-xs" : "text-[10px]"} ${catalogText.muted}`}>{t("selectSupplierHint")}</p>
      <div
        ref={tabsRef}
        className="flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin] [-ms-overflow-style:auto] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
      >
        {lots.map((lot) => {
          const supplier = getLotSupplierDisplay(lot, t);
          return (
            <SupplierTab
              key={lot.id}
              lotId={lot.id}
              label={supplier.label}
              available={lotAvailableQty(lot)}
              active={lot.id === activeLotId}
              language={language}
              unitLabel={localizeUnit(lot.unit || productUnit, language)}
              size={size}
              onClick={() => onActiveLotChange(lot.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function CatalogGradeOffers({
  item,
  lots = [],
  language,
  t,
  activeGrade,
  onActiveGradeChange,
  isAdmin,
  lotMediaPreview,
  openMediaGallery,
  lotQtyById,
  setLotQtyById,
  placingLotId,
  onAddToCart,
  productUnit,
  cartTotalQty = 0,
  cartUnit = "",
  inventorySummary = null,
  orderMsg = "",
  orderMsgType = "info",
  productDescription = "",
}) {
  const tabsRef = useRef(null);
  const supplierTabsRef = useRef(null);
  const [activeLotId, setActiveLotId] = useState(null);
  const productTitle = getLocalizedText(item, language) || "";

  const groups = useMemo(() => groupLotsByGrade(lots), [lots]);
  const unitLabel = localizeUnit(productUnit || "", language);

  const displayGrade = useMemo(() => {
    if (activeGrade && groups.some((g) => g.grade === activeGrade)) return activeGrade;
    const withStock = groups.find((g) => g.available > 0);
    return withStock?.grade || groups[0]?.grade || null;
  }, [activeGrade, groups]);

  const activeGroup = groups.find((g) => g.grade === displayGrade);

  useEffect(() => {
    const group = groups.find((g) => g.grade === displayGrade);
    setActiveLotId(group?.lots?.[0]?.id ?? null);
  }, [displayGrade, groups]);

  const activeLot = useMemo(() => {
    if (!activeGroup?.lots?.length) return null;
    if (activeLotId != null) {
      const found = activeGroup.lots.find((lot) => lot.id === activeLotId);
      if (found) return found;
    }
    return activeGroup.lots[0];
  }, [activeGroup, activeLotId]);

  useEffect(() => {
    const el = document.getElementById(`grade-tab-${displayGrade}`);
    if (!el || !tabsRef.current) return;
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [displayGrade]);

  useEffect(() => {
    const el = document.getElementById(`supplier-tab-${activeLotId}`);
    if (!el || !supplierTabsRef.current) return;
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeLotId]);

  const activeGradeLabel = activeGroup ? getGradeDisplayLabel(activeGroup.lots, language, t) : "";
  const showTabs = groups.length > 1;
  const supplierTotal = activeGroup?.lots?.length ?? 0;
  const multiSupplier = supplierTotal > 1;
  const activeSupplierIndex = activeLot
    ? Math.max(0, activeGroup.lots.findIndex((lot) => lot.id === activeLot.id)) + 1
    : 1;
  const activeSupplier = activeLot ? getLotSupplierDisplay(activeLot, t) : null;
  const mediaLots = activeLot ? [activeLot] : [];

  const cardProps = {
    language,
    t,
    lotMediaPreview,
    openMediaGallery,
    lotQtyById,
    setLotQtyById,
    placingLotId,
    onAddToCart,
    productUnit,
    productId: item?.id,
  };

  const mediaPanelBaseProps = activeLot
    ? {
        lots: mediaLots,
        gradeLabel: activeGradeLabel,
        productTitle,
        supplyCountry: item?.supplyCountry || "IR",
        supplyCity: item?.supplyCity || "",
        language,
        t,
        lotMediaPreview,
        openMediaGallery,
        supplierName: multiSupplier ? activeSupplier?.label : "",
        supplierIndex: activeSupplierIndex,
        supplierTotal,
      }
    : null;
  const mediaPanelKey = `${activeGroup?.grade ?? "grade"}-${activeLot?.id ?? "lot"}-media`;
  const hasDescription = Boolean((productDescription || "").trim());
  const hasLocation = (() => {
    if (!activeLot) return false;
    const lat = parseFloat(activeLot.latitude);
    const lng = parseFloat(activeLot.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng);
  })();

  const descriptionBlock = hasDescription ? (
    <CatalogProductDescription description={productDescription} t={t} embedded />
  ) : null;

  const locationBlockMobile = activeLot ? (
    <CatalogGradeLocationPanel
      lots={mediaLots}
      language={language}
      t={t}
      className="px-3 pb-4"
      mapVariant="hero"
      supplyCountry={item?.supplyCountry || "IR"}
      supplyCity={item?.supplyCity || ""}
      showSupplierSubtitle={multiSupplier}
    />
  ) : null;

  const locationBlockDesktop = activeLot ? (
    <CatalogGradeLocationPanel
      lots={mediaLots}
      language={language}
      t={t}
      mapVariant="full"
      supplyCountry={item?.supplyCountry || "IR"}
      supplyCity={item?.supplyCity || ""}
      showSupplierSubtitle={multiSupplier}
    />
  ) : null;

  const renderActiveLotCard = (embeddedLayout = false) =>
    activeLot ? (
      <CatalogLotOfferCard
        key={activeLot.id}
        lot={activeLot}
        showMedia={false}
        embedded={embeddedLayout}
        fillHeight={embeddedLayout}
        {...cardProps}
      />
    ) : null;

  const supplierTabsProps = multiSupplier
    ? {
        lots: activeGroup.lots,
        activeLotId: activeLot?.id,
        onActiveLotChange: setActiveLotId,
        language,
        productUnit,
        t,
        tabsRef: supplierTabsRef,
      }
    : null;

  return (
    <section className="space-y-0 lg:space-y-0" id="catalog-grade-offers">
      {/* موبایل */}
      <div className="-mx-3 flex flex-col gap-0 overflow-hidden border-y border-slate-200 bg-white lg:hidden">
        {inventorySummary ? (
          <CatalogInventoryOverview
            summary={inventorySummary}
            t={t}
            language={language}
            productUnit={productUnit}
            orderMsg={orderMsg}
            orderMsgType={orderMsgType}
          />
        ) : null}

        <div className="border-b border-slate-100 bg-white px-4 py-2">
          {showTabs ? (
            <GradeTabsRow
              groups={groups}
              displayGrade={displayGrade}
              language={language}
              unitLabel={unitLabel}
              onActiveGradeChange={onActiveGradeChange}
              t={t}
              tabsRef={tabsRef}
              scrollable
            />
          ) : null}
        </div>

        {supplierTabsProps ? (
          <div className="border-b border-slate-100 bg-white px-4 py-2">
            <SupplierTabsRow {...supplierTabsProps} />
          </div>
        ) : null}

        {mediaPanelBaseProps ? <CatalogGradeMediaPanel key={mediaPanelKey} {...mediaPanelBaseProps} /> : null}

        {cartTotalQty > 0 ? (
          <div className={`mx-3 mt-3 flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm ${catalogBadge.warning}`}>
            <span className="leading-snug">
              {t("youHaveInCart", {
                quantity: cartTotalQty.toFixed(3),
                unit: localizeUnit(cartUnit || "", language),
              })}
            </span>
            <Link href="/cart" className={`shrink-0 font-semibold underline underline-offset-2 ${catalogText.accentStrong}`}>
              {t("viewCart")}
            </Link>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 px-0 pb-3 pt-2">
          {renderActiveLotCard(false)}
        </div>

        {hasDescription ? <div className="border-t border-slate-100 px-3 py-3">{descriptionBlock}</div> : null}

        {hasLocation ? <div className="border-t border-slate-100">{locationBlockMobile}</div> : null}
      </div>

      {/* دسکتاپ */}
      <div className={`hidden lg:block ${catalogSurface.card} overflow-hidden`}>
        {inventorySummary ? (
          <CatalogInventoryOverview
            summary={inventorySummary}
            t={t}
            language={language}
            productUnit={productUnit}
            orderMsg={orderMsg}
            orderMsgType={orderMsgType}
          />
        ) : null}

        {showTabs ? (
          <div className="border-b border-slate-100 px-6 py-3">
            <GradeTabsRow
              groups={groups}
              displayGrade={displayGrade}
              language={language}
              unitLabel={unitLabel}
              onActiveGradeChange={onActiveGradeChange}
              t={t}
              tabsRef={tabsRef}
              size="compact"
            />
          </div>
        ) : null}

        {supplierTabsProps ? (
          <div className="border-b border-slate-100 px-6 py-3">
            <SupplierTabsRow {...supplierTabsProps} size="compact" />
          </div>
        ) : null}

        <div className="flex flex-col gap-6 p-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:items-stretch">
            <div className="flex min-h-0 min-w-0">
              {mediaPanelBaseProps ? (
                <CatalogGradeMediaPanel
                  key={mediaPanelKey}
                  {...mediaPanelBaseProps}
                  aspectClass="aspect-[4/3] w-full"
                  className="h-full w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm"
                />
              ) : null}
            </div>

            <div className="flex h-full min-h-0 min-w-0 flex-col gap-4">
              {cartTotalQty > 0 ? (
                <div className={`flex shrink-0 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${catalogBadge.warning}`}>
                  <span className="leading-snug">
                    {t("youHaveInCart", {
                      quantity: cartTotalQty.toFixed(3),
                      unit: localizeUnit(cartUnit || "", language),
                    })}
                  </span>
                  <Link href="/cart" className={`shrink-0 font-semibold underline underline-offset-2 ${catalogText.accentStrong}`}>
                    {t("viewCart")}
                  </Link>
                </div>
              ) : null}

              <div className="flex min-h-0 flex-1 flex-col">
                {renderActiveLotCard(true)}
              </div>
            </div>
          </div>

          {hasDescription ? <div className="w-full">{descriptionBlock}</div> : null}

          {hasLocation ? <div className="w-full">{locationBlockDesktop}</div> : null}
        </div>
      </div>
    </section>
  );
}
