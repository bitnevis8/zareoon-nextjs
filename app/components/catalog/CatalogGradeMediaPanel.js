"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import SupplyCountryFlag from "../ui/SupplyCountryFlag";
import CatalogMediaSlider from "./CatalogMediaSlider";
import { buildGradeMediaSlides } from "../../utils/catalogGradeMedia";
import { getGradeDisplayLabel } from "../../utils/catalogGrades";
import { getLotSupplierDisplay } from "../../utils/catalogLotSupplier";
import { catalogText } from "./catalogTheme";

export function GradeMediaBadge({ children }) {
  return (
    <span className="inline-flex max-w-[min(100%,12rem)] items-center rounded-lg bg-green-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-md ring-1 ring-white/30">
      <span className="truncate">{children}</span>
    </span>
  );
}

export default function CatalogGradeMediaPanel({
  lots = [],
  gradeLabel,
  productTitle = "",
  supplyCountry = "IR",
  supplyCity = "",
  language,
  lotMediaPreview,
  openMediaGallery,
  className = "",
  aspectClass = "aspect-[5/4]",
  supplierName = "",
  supplierIndex = 1,
  supplierTotal = 1,
}) {
  const t = useTranslations("catalog");
  const slides = useMemo(
    () => buildGradeMediaSlides(lots, lotMediaPreview, language, t),
    [lots, lotMediaPreview, language, t]
  );

  const label = gradeLabel || getGradeDisplayLabel(lots, language, t);
  const activeLot = lots[0];
  const supplier = supplierName
    ? { label: supplierName }
    : activeLot
    ? getLotSupplierDisplay(activeLot, t)
    : { label: "" };

  const openAt = (index) => {
    const slide = slides[index];
    if (!slide?.lotId) return;
    const galleryTitle = supplier.label ? `${label} — ${supplier.label}` : label;
    openMediaGallery({
      module: "inventory",
      entityId: slide.lotId,
      startIndex: slide.galleryIndex ?? 0,
      galleryTitle,
    });
  };

  const topOverlay = productTitle ? (
    <div className="flex items-start justify-end gap-2 text-right">
      <h1 className="min-w-0 flex-1 text-base font-bold leading-tight text-white drop-shadow-sm lg:text-xl">
        {productTitle}
      </h1>
      <SupplyCountryFlag countryCode={supplyCountry} city={supplyCity} className="shrink-0 shadow-lg" />
    </div>
  ) : null;

  const bottomOverlay = label ? (
    <div className="space-y-0.5 text-right">
      <p className="text-[10px] font-semibold text-green-300">{t("lotGradeLabel")}</p>
      <p className="text-base font-bold leading-tight text-white drop-shadow-sm">{label}</p>
      {supplier.label && supplierTotal > 1 ? (
        <>
          <p className="pt-1.5 text-[10px] font-semibold text-green-300">{t("supplier")}</p>
          <p className="text-sm font-bold leading-snug text-white drop-shadow-sm">{supplier.label}</p>
          {supplierTotal > 1 ? (
            <p className="text-[11px] font-medium text-white/85">
              {t("supplierOfTotal", { index: supplierIndex, total: supplierTotal })}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  ) : null;

  return (
    <div className={`overflow-hidden bg-slate-900 ${className}`}>
      {slides.length > 0 ? (
        <CatalogMediaSlider
          slides={slides}
          aspectClass={aspectClass}
          onSlideTap={openAt}
          expandAriaLabel={t("viewGallery")}
          cornerTopBar={topOverlay}
          cornerBottomEnd={bottomOverlay}
        />
      ) : (
        <div className={`relative bg-gradient-to-b from-slate-700 to-slate-900 ${aspectClass}`}>
          {topOverlay ? (
            <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/95 via-black/70 to-transparent px-4 pb-8 pt-3">
              {topOverlay}
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-3 pt-10">
            {bottomOverlay}
            <p className={`mt-2 text-center text-xs leading-relaxed text-white/70`}>{t("noGradeMedia")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
