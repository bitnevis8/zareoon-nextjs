"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import SupplyCountryFlag from "../ui/SupplyCountryFlag";
import CatalogMediaSlider, { buildMediaSlides } from "./CatalogMediaSlider";
import { buildGradeMediaSlides } from "../../utils/catalogGradeMedia";
import { getGradeDisplayLabel } from "../../utils/catalogGrades";
import { getLotSupplierDisplay } from "../../utils/catalogLotSupplier";

export function GradeMediaBadge({ children }) {
  return (
    <span className="inline-flex max-w-[min(100%,12rem)] items-center rounded-lg bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-md ring-1 ring-white/20">
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
  aspectClass = "aspect-[4/3]",
  supplierName = "",
  supplierIndex = 1,
  supplierTotal = 1,
  productItem = null,
  productMedia = [],
}) {
  const t = useTranslations("catalog");
  const lotSlides = useMemo(
    () => buildGradeMediaSlides(lots, lotMediaPreview, language, t),
    [lots, lotMediaPreview, language, t]
  );

  const slides = useMemo(() => {
    if (lotSlides.length > 0) return lotSlides;
    if (!productItem && !(productMedia || []).length) return [];
    return buildMediaSlides({
      product: productItem,
      media: productMedia,
      title: productTitle || gradeLabel,
    }).map((slide, index) => ({
      ...slide,
      lotId: lots[0]?.id,
      galleryIndex: index,
      gradeLabel,
    }));
  }, [lotSlides, productItem, productMedia, productTitle, gradeLabel, lots]);

  const label = gradeLabel || getGradeDisplayLabel(lots, language, t);
  const activeLot = lots[0];
  const supplier = supplierName
    ? { label: supplierName }
    : activeLot
    ? getLotSupplierDisplay(activeLot, t)
    : { label: "" };

  const openAt = (index) => {
    const slide = slides[index];
    if (slide?.lotId && lotSlides.length > 0) {
      const galleryTitle = supplier.label ? `${label} — ${supplier.label}` : label;
      openMediaGallery({
        module: "inventory",
        entityId: slide.lotId,
        startIndex: slide.galleryIndex ?? 0,
        galleryTitle,
      });
      return;
    }
    if (productItem?.id) {
      openMediaGallery({
        module: "products",
        entityId: productItem.id,
        startIndex: index,
        productItem,
      });
    }
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`}>
      {productTitle ? (
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
          <h1 className="min-w-0 flex-1 text-sm font-bold leading-snug text-slate-900 lg:text-base">{productTitle}</h1>
          <SupplyCountryFlag countryCode={supplyCountry} city={supplyCity} className="shrink-0" />
        </div>
      ) : null}

      {slides.length > 0 ? (
        <CatalogMediaSlider
          slides={slides}
          aspectClass={aspectClass}
          onSlideTap={openAt}
          expandAriaLabel={t("viewGallery")}
          cornerTopStart={label ? <GradeMediaBadge>{label}</GradeMediaBadge> : null}
        />
      ) : (
        <div className={`flex flex-col items-center justify-center bg-slate-50 px-4 py-10 ${aspectClass}`}>
          <p className="text-sm font-semibold text-slate-700">{label || t("noGradeMedia")}</p>
          {supplier.label && supplierTotal > 1 ? (
            <p className="mt-1 text-xs text-slate-500">
              {t("supplierOfTotal", { index: supplierIndex, total: supplierTotal })}
            </p>
          ) : null}
          <p className="mt-2 text-center text-xs text-slate-400">{t("noGradeMedia")}</p>
        </div>
      )}
    </div>
  );
}
