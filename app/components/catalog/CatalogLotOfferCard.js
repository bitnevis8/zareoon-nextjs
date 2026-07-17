"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import TieredPricingDisplay from "../ui/TieredPricingDisplay";
import {
  formatLocalizedNumber,
  formatLocalizedPrice,
  formatQuantityForInput,
  formatQuantityWithUnit,
  getLocalizedLotLabel,
  localizeStatus,
  localizeUnit,
  parseLocalizedNumberInput,
} from "../../utils/localize";
import { getLotDisplayForLanguage } from "@/app/dashboard/supplier/inventory/utils/inventoryDisplayLocales";
import Link from "next/link";
import { getLotSupplierDisplay, getLotSupplierProfileUrl, getLotSupplier } from "../../utils/catalogLotSupplier";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import CatalogPdfDownload from "./CatalogPdfDownload";
import CatalogMediaSlider, { buildMediaSlides } from "./CatalogMediaSlider";
import { GradeMediaBadge } from "./CatalogGradeMediaPanel";
import {
  catalogBtn,
  catalogStatusClass,
  catalogSurface,
  catalogText,
} from "./catalogTheme";

function DetailRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className={`text-sm ${catalogText.muted}`}>{label}</span>
      <span className={`text-sm font-bold ${highlight ? catalogText.accentStrong : catalogText.heading}`}>{value}</span>
    </div>
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
  productId,
  showMedia = true,
  embedded = false,
  fillHeight = false,
}) {
  const t = useTranslations("catalog");
  const preview = lotMediaPreview.get(lot.id) || [];
  const coverUrl = resolveMediaUrl(lot.coverImageUrl);
  const available = Math.max(0, parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0));
  const gradeLabel = getLocalizedLotLabel(lot, language, t);
  const unitLabel = localizeUnit(lot.unit || productUnit || "-", language);
  const statusLabel = localizeStatus(lot.status, t);
  const display = getLotDisplayForLanguage(lot, language);
  const lotDescription = display.description;
  const lotHashtags = display.hashtags;
  const customTitle = display.title;
  const supplier = getLotSupplierDisplay(lot, t);
  const supplierUser = getLotSupplier(lot);
  const supplierProfileUrl = getLotSupplierProfileUrl(lot);

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

  const articleClass = embedded
    ? `overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm${fillHeight ? " flex h-full min-h-0 flex-col" : ""}`
    : `overflow-hidden ${catalogSurface.card}`;

  const bodyClass = embedded
    ? fillHeight
      ? "flex min-h-0 flex-1 flex-col"
      : ""
    : `mx-3 mb-3 sm:mx-4 sm:mb-4 ${showMedia ? catalogSurface.card : ""}`;

  const scrollableClass = fillHeight ? "min-h-0 flex-1 overflow-y-auto" : "";
  const orderSectionClass = fillHeight ? "mt-auto shrink-0" : "";

  return (
    <article className={articleClass}>
      {showMedia && slides.length > 0 ? (
        <CatalogMediaSlider
          slides={slides}
          aspectClass="aspect-[2/1] max-h-56 sm:aspect-[16/9] sm:max-h-none"
          onSlideTap={openAt}
          expandAriaLabel={t("viewGallery")}
          cornerTopStart={<GradeMediaBadge>{gradeLabel}</GradeMediaBadge>}
          cornerBottomEnd={
            <div>
              <p className="text-[10px] font-semibold text-green-300">{t("gradeMediaBadge")}</p>
              <p className="text-base font-bold leading-snug text-white drop-shadow-md">{gradeLabel}</p>
            </div>
          }
        />
      ) : showMedia ? (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className={`text-xs ${catalogText.muted}`}>{t("lotGradeLabel")}</p>
              <p className={`text-lg font-bold ${catalogText.heading}`}>{gradeLabel}</p>
            </div>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${catalogStatusClass(lot.status)}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      ) : null}

      <div className={bodyClass}>
        <div className={scrollableClass}>
        <div className={embedded ? "p-5 pb-0" : "px-4 py-1"}>
          {customTitle ? (
            <div className={`border-b border-slate-100 ${embedded ? "pb-3" : "py-3"}`}>
              <p className={`text-base font-bold leading-snug ${catalogText.heading}`}>{customTitle}</p>
            </div>
          ) : null}
          <div className={`border-b border-slate-100 ${embedded ? "pb-4" : "py-3"}`}>
            <p className={`mb-1 font-medium ${embedded ? "text-sm" : "text-xs"} ${catalogText.muted}`}>{t("priceSectionTitle")}</p>
            {lot.tieredPricing?.length > 0 ? (
              <TieredPricingDisplay tieredPricing={lot.tieredPricing} unit={lot.unit} />
            ) : lot.price ? (
              <p className={`text-xl font-extrabold ${catalogText.accentStrong}`}>
                {formatLocalizedPrice(lot.price, language, t)}
              </p>
            ) : (
              <p className={`text-sm ${catalogText.muted}`}>{t("priceNotSet")}</p>
            )}
            {lot.minimumOrderQuantity && !lot.tieredPricing?.length ? (
              <p className={`mt-1.5 text-xs ${catalogText.body}`}>
                {t("minimumOrder")}: {formatQuantityWithUnit(lot.minimumOrderQuantity, language, unitLabel)}
              </p>
            ) : null}
          </div>
        </div>

        {lotDescription ? (
          <div className={`border-t border-slate-100 ${embedded ? "mx-5" : "px-4"} py-3`}>
            <p className={`mb-2 text-xs font-semibold ${catalogText.body}`}>{t("lotDescriptionTitle")}</p>
            <p className={`whitespace-pre-wrap text-sm leading-relaxed ${catalogText.body}`}>{lotDescription}</p>
          </div>
        ) : null}

        {Array.isArray(lotHashtags) && lotHashtags.length > 0 ? (
          <div className={`flex flex-wrap gap-1.5 border-t border-slate-100 ${embedded ? "mx-5" : "px-4"} py-3`}>
            {lotHashtags.map((tag) => (
              <span key={tag} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {Array.isArray(lot.attributes) && lot.attributes.length > 0 ? (
          <div className={`border-t border-slate-100 ${embedded ? "mx-5" : "px-4"} py-1`}>
            <p className={`py-2.5 text-xs font-semibold ${catalogText.body}`}>{t("technicalSpecsTitle")}</p>
            {lot.attributes.map((a) => (
              <DetailRow
                key={a.id}
                label={a.definition?.name || `#${a.attributeDefinitionId}`}
                value={a.value ?? "—"}
              />
            ))}
          </div>
        ) : null}

        {(lot.packagingType ||
          lot.hsCode ||
          (lot.filterValues && Object.keys(lot.filterValues).length > 0)) ? (
          <div className={`border-t border-slate-100 ${embedded ? "mx-5" : "px-4"} py-1`}>
            <p className={`py-2.5 text-xs font-semibold ${catalogText.body}`}>{t("lotTradeDetailsTitle")}</p>
            {lot.packagingType ? (
              <DetailRow label={t("packagingType")} value={lot.packagingType} />
            ) : null}
            {lot.hsCode ? <DetailRow label={t("hsCode")} value={lot.hsCode} /> : null}
            {lot.filterValues &&
              Object.entries(lot.filterValues)
                .filter(([k, v]) => v && k !== "hsCode")
                .map(([k, v]) => (
                  <DetailRow
                    key={k}
                    label={(() => {
                      try {
                        const tr = t(`filterKeys.${k}`);
                        return tr && tr !== `filterKeys.${k}` ? tr : k;
                      } catch {
                        return k;
                      }
                    })()}
                    value={String(v)}
                  />
                ))}
          </div>
        ) : null}

        {getLotSupplier(lot) && (supplier.mobile || supplier.name) ? (
          <div className={`border-t border-dashed border-slate-100 ${embedded ? "mx-5" : "px-4"} py-3`}>
            <p className={`mb-2 text-xs ${catalogText.muted}`}>{t("supplier")}</p>
            <p className="mb-2 text-[11px] leading-5 text-slate-500">
              ارتباط مستقیم با فروشنده — زارعون طرف معامله نیست.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {supplier.name ? (
                supplierProfileUrl ? (
                  <Link href={supplierProfileUrl} className={`font-semibold text-emerald-700 hover:underline ${catalogText.heading}`}>
                    {supplier.name}
                  </Link>
                ) : (
                  <span className={`font-semibold ${catalogText.heading}`}>{supplier.name}</span>
                )
              ) : (
                <span />
              )}
              <div className="flex flex-wrap items-center gap-2">
                {supplier.mobile ? (
                  <a
                    href={`tel:${String(supplier.mobile).replace(/\s/g, "")}`}
                    dir="ltr"
                    className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-mono text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
                  >
                    {supplier.mobile}
                  </a>
                ) : null}
                {supplierUser?.id ? (
                  <Link
                    href={`/dashboard/messages?u=${supplierUser.id}`}
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    پیام
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {productId ? (
          <div className={`border-t border-slate-100 ${embedded ? "mx-5" : "px-4"} py-3`}>
            <CatalogPdfDownload
              scope="lot"
              productId={productId}
              lotId={lot.id}
              label={t("downloadSupplierCatalogPdf")}
              compact
              block
              className="w-full"
            />
          </div>
        ) : null}
        </div>

        <div className={`border-t border-green-200 bg-gradient-to-b from-green-50/90 to-white ${embedded ? "mx-0 mt-0 rounded-b-xl px-5 py-5" : "px-4 py-4"} ${orderSectionClass}`}>
          <p className={`mb-3 text-sm font-bold ${catalogText.accentStrong}`}>{t("orderSectionTitle")}</p>
          <p className={`mb-3 text-sm leading-relaxed ${catalogText.body}`}>
            {t("orderMaxHint", {
              quantity: formatLocalizedNumber(available, language, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3,
                useGrouping: false,
              }),
              unit: unitLabel,
            })}
          </p>
          <label className={`mb-1.5 block text-sm font-semibold ${catalogText.heading}`} htmlFor={`lot-qty-${lot.id}`}>
            {t("orderQuantityLabel")}
          </label>
          <div className="mb-3 flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100">
            <span className={`flex shrink-0 items-center border-l border-slate-200 bg-slate-50 px-3 text-sm font-semibold ${catalogText.body}`}>
              {unitLabel}
            </span>
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
            onClick={() => onAddToCart(lot, productUnit)}
          >
            {placingLotId === lot.id ? "…" : t("addToCartAction")}
          </button>
        </div>
      </div>
    </article>
  );
}
