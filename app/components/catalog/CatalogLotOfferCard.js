"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import TieredPricingDisplay from "../ui/TieredPricingDisplay";
import {
  formatLocalizedNumber,
  formatQuantityForInput,
  formatQuantityWithUnit,
  getLocalizedLotLabel,
  localizeStatus,
  localizeUnit,
  parseLocalizedNumberInput,
} from "../../utils/localize";
import { getLotDisplayForLanguage } from "@/app/dashboard/supplier/inventory/utils/inventoryDisplayLocales";
import Link from "next/link";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import { getAllowedMeasurementUnits } from "../../utils/productCatalogSchema";
import { buildHashtagSearchHref } from "../../utils/mobileSearchUtils";
import CatalogPdfDownload from "./CatalogPdfDownload";
import CatalogMediaSlider, { buildMediaSlides } from "./CatalogMediaSlider";
import { GradeMediaBadge } from "./CatalogGradeMediaPanel";
import {
  catalogBtn,
  catalogStatusClass,
  catalogSurface,
  catalogText,
} from "./catalogTheme";
import LotPriceDisplay from "./LotPriceDisplay";
import { buildLotTradeDetailRows } from "@/app/utils/lotTradeDetails";

function DetailRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <span className={`text-sm ${catalogText.muted}`}>{label}</span>
      <span className={`text-sm font-bold ${highlight ? catalogText.accentStrong : catalogText.heading}`}>{value}</span>
    </div>
  );
}

function SectionCard({ title, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white ${className}`}>
      {title ? (
        <header className="border-b border-slate-100 px-4 py-2.5">
          <h3 className={`text-xs font-bold tracking-wide ${catalogText.muted}`}>{title}</h3>
        </header>
      ) : null}
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

export default function CatalogLotOfferCard({
  lot,
  language,
  lotMediaPreview,
  openMediaGallery,
  lotQtyById,
  setLotQtyById,
  placingLotId,
  onAddToCart,
  productUnit,
  product = null,
  productId,
  showMedia = true,
  embedded = false,
}) {
  const t = useTranslations("catalog");
  const tShared = useTranslations("shared");
  const preview = lotMediaPreview.get(lot.id) || [];
  const coverUrl = resolveMediaUrl(lot.coverImageUrl);
  const available = Math.max(0, parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0));
  const gradeLabel = getLocalizedLotLabel(lot, language, t);
  const statusLabel = localizeStatus(lot.status, t);
  const display = getLotDisplayForLanguage(lot, language);
  const lotDescription = display.description;
  const lotHashtags = display.hashtags;
  const customTitle = display.title;

  const unitOptions = useMemo(() => {
    const allowed = getAllowedMeasurementUnits(product);
    const lotUnit = lot.unit || productUnit || getAllowedMeasurementUnits(product)[0] || "kg";
    const list = allowed.length ? [...allowed] : [lotUnit];
    if (lotUnit && !list.includes(lotUnit)) list.unshift(lotUnit);
    return [...new Set(list.filter(Boolean))];
  }, [product, lot.unit, productUnit]);

  const [orderUnit, setOrderUnit] = useState(lot.unit || productUnit || unitOptions[0] || "kg");

  useEffect(() => {
    const next = lot.unit || productUnit || unitOptions[0] || "kg";
    setOrderUnit(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lot.id]);

  const unitLabel = localizeUnit(orderUnit || "-", language);

  const tradeRows = useMemo(
    () => buildLotTradeDetailRows({ lot, language, tCatalog: t, tShared }),
    [lot, language, t, tShared]
  );

  const slides = useMemo(
    () => buildMediaSlides({ coverUrl: coverUrl || undefined, media: preview, title: gradeLabel }),
    [coverUrl, preview, gradeLabel]
  );

  const openAt = (index) => {
    const slide = slides[index];
    if (!slide) return;
    openMediaGallery({
      module: "inventory",
      entityId: lot.id,
      startIndex: index,
      galleryTitle: gradeLabel,
    });
  };

  const productBlock = (
    <SectionCard title={t("product")}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-xs ${catalogText.muted}`}>{t("lotGradeLabel")}</p>
          <p className={`text-base font-bold ${catalogText.heading}`}>{customTitle || gradeLabel}</p>
        </div>
        <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${catalogStatusClass(lot.status)}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mb-3 border-t border-slate-100 pt-3">
        <p className={`mb-1 text-xs font-medium ${catalogText.muted}`}>{t("priceSectionTitle")}</p>
        {lot.priceFromSchedule && (lot.effectivePrice != null || lot.price) ? (
          <div>
            <LotPriceDisplay
              amount={lot.effectivePrice ?? lot.price}
              currency={lot.priceCurrency || lot.price_currency || "TOMAN"}
              fxRateSource={lot.fxRateSource || lot.fx_rate_source}
              fxRateManual={lot.fxRateManual ?? lot.fx_rate_manual}
              amountClassName={`text-xl font-extrabold ${catalogText.accentStrong}`}
              showDisclaimer
            />
            <p className={`mt-1 text-[11px] ${catalogText.muted}`}>{t("dailyPriceToday") || "قیمت امروز (برنامه روزانه)"}</p>
          </div>
        ) : lot.tieredPricing?.length > 0 ? (
          <TieredPricingDisplay tieredPricing={lot.tieredPricing} unit={lot.unit} />
        ) : lot.effectivePrice != null || lot.price ? (
          <LotPriceDisplay
            amount={lot.effectivePrice ?? lot.price}
            currency={lot.priceCurrency || lot.price_currency || "TOMAN"}
            fxRateSource={lot.fxRateSource || lot.fx_rate_source}
            fxRateManual={lot.fxRateManual ?? lot.fx_rate_manual}
            amountClassName={`text-xl font-extrabold ${catalogText.accentStrong}`}
            showDisclaimer
          />
        ) : (
          <p className={`text-sm ${catalogText.muted}`}>{t("priceNotSet")}</p>
        )}
        {lot.minimumOrderQuantity && !lot.tieredPricing?.length ? (
          <p className={`mt-1.5 text-xs ${catalogText.body}`}>
            {t("minimumOrder")}: {formatQuantityWithUnit(lot.minimumOrderQuantity, language, unitLabel)}
          </p>
        ) : null}
        {lot.acceptBarter ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2.5">
            <p className="text-[11px] font-bold text-amber-900">
              {lot.barterDesiredKind === "service" ? "معاوضه کالا به خدمات" : "معاوضه کالا به کالا"}
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-900/90">
              آماده معاوضه با{" "}
              <strong>
                {lot.barterDesiredName ||
                  lot.barterDesiredCategoryLabel ||
                  (lot.barterDesiredKind === "service" ? "خدمت توافقی" : "کالای توافقی")}
              </strong>
              {lot.barterDesiredKind !== "service" && lot.barterDesiredQuantity
                ? ` (حدود ${lot.barterDesiredQuantity} ${lot.barterDesiredUnit || ""})`
                : lot.barterDesiredKind !== "service"
                  ? " — مقدار منعطف"
                  : ""}
            </p>
            <Link href="/barter" className="mt-1.5 inline-flex text-[11px] font-bold text-amber-800 hover:underline">
              مشاهده بازار معاوضه
            </Link>
          </div>
        ) : null}
      </div>

      {lotDescription ? (
        <div className="mb-3 border-t border-slate-100 pt-3">
          <p className={`mb-1.5 text-xs font-semibold ${catalogText.body}`}>{t("lotDescriptionTitle")}</p>
          <p className={`whitespace-pre-wrap text-sm leading-relaxed ${catalogText.body}`}>{lotDescription}</p>
        </div>
      ) : null}

      {Array.isArray(lotHashtags) && lotHashtags.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          {lotHashtags.map((tag) => (
            <Link
              key={tag}
              href={buildHashtagSearchHref(tag)}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}

      {Array.isArray(lot.attributes) && lot.attributes.length > 0 ? (
        <div className="border-t border-slate-100 pt-1">
          <p className={`py-2 text-xs font-semibold ${catalogText.body}`}>{t("technicalSpecsTitle")}</p>
          {lot.attributes.map((a) => (
            <DetailRow key={a.id} label={a.definition?.name || `#${a.attributeDefinitionId}`} value={a.value ?? "—"} />
          ))}
        </div>
      ) : null}

      {tradeRows.length > 0 ? (
        <div className="border-t border-slate-100 pt-1">
          <p className={`py-2 text-xs font-semibold ${catalogText.body}`}>{t("lotTradeDetailsTitle")}</p>
          {tradeRows.map((row) => (
            <DetailRow key={row.key} label={row.label} value={row.value} />
          ))}
        </div>
      ) : null}

      {productId ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <CatalogPdfDownload
            scope="lot"
            productId={productId}
            lotId={lot.id}
            lot={lot}
            product={product}
            label={t("downloadSupplierCatalogPdf")}
            compact
            block
            className="w-full"
          />
        </div>
      ) : null}
    </SectionCard>
  );

  const orderBlock = (
    <SectionCard title={t("orderSectionTitle")} className="border-emerald-200/80 bg-emerald-50/30">
      <p className={`mb-3 text-sm leading-relaxed ${catalogText.body}`}>
        {t("orderMaxHint", {
          quantity: formatLocalizedNumber(available, language, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
            useGrouping: false,
          }),
          unit: localizeUnit(lot.unit || orderUnit || "", language),
        })}
      </p>
      <label className={`mb-1.5 block text-sm font-semibold ${catalogText.heading}`} htmlFor={`lot-qty-${lot.id}`}>
        {t("orderQuantityLabel")}
      </label>
      <div className="mb-3 flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
        {unitOptions.length > 1 ? (
          <select
            id={`lot-unit-${lot.id}`}
            value={orderUnit}
            onChange={(e) => setOrderUnit(e.target.value)}
            className={`max-w-[40%] shrink-0 border-0 border-l border-slate-200 bg-slate-50 px-2.5 py-3.5 text-sm font-semibold outline-none ${catalogText.body}`}
          >
            {unitOptions.map((u) => (
              <option key={u} value={u}>
                {localizeUnit(u, language)}
              </option>
            ))}
          </select>
        ) : (
          <span className={`flex shrink-0 items-center border-l border-slate-200 bg-slate-50 px-3 text-sm font-semibold ${catalogText.body}`}>
            {unitLabel}
          </span>
        )}
        <input
          id={`lot-qty-${lot.id}`}
          type="text"
          inputMode="decimal"
          dir="ltr"
          className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          placeholder={t("qtyPlaceholder")}
          value={formatQuantityForInput(lotQtyById[lot.id] ?? "", language)}
          onChange={(e) =>
            setLotQtyById((prev) => ({
              ...prev,
              [lot.id]: parseLocalizedNumberInput(e.target.value),
            }))
          }
        />
      </div>
      <button
        type="button"
        className={catalogBtn.primaryBlock}
        disabled={placingLotId === lot.id}
        onClick={() => onAddToCart(lot, orderUnit)}
      >
        {placingLotId === lot.id ? "…" : t("addToCartAction")}
      </button>
      <div className="mt-3 rounded-xl border border-emerald-100 bg-white/80 px-3 py-2.5">
        <p className={`text-[11px] font-bold ${catalogText.accentStrong}`}>{t("cartProcessTitle")}</p>
        <p className={`mt-1 text-[11px] leading-6 ${catalogText.body}`}>{t("cartProcessSteps")}</p>
      </div>
    </SectionCard>
  );

  if (embedded) {
    return (
      <div className="flex flex-col gap-3">
        {productBlock}
        {orderBlock}
      </div>
    );
  }

  return (
    <article className={`overflow-hidden ${catalogSurface.card}`}>
      {showMedia && slides.length > 0 ? (
        <CatalogMediaSlider
          slides={slides}
          aspectClass="aspect-[2/1] max-h-56 sm:aspect-[16/9] sm:max-h-none"
          onSlideTap={openAt}
          expandAriaLabel={t("viewGallery")}
          cornerTopStart={<GradeMediaBadge>{gradeLabel}</GradeMediaBadge>}
          brandWatermark
        />
      ) : null}
      <div className="space-y-3 p-3 sm:p-4">
        {productBlock}
        {orderBlock}
      </div>
    </article>
  );
}
