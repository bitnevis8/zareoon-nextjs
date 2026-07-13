"use client";

import CatalogLocationMap from "./CatalogLocationMap";
import { getLocalizedLotLabel } from "../../utils/localize";
import { getLotSupplierDisplay } from "../../utils/catalogLotSupplier";

function hasValidCoords(lot) {
  const lat = parseFloat(lot?.latitude);
  const lng = parseFloat(lot?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng);
}

export default function CatalogGradeLocationPanel({
  lots = [],
  language,
  t,
  className = " ",
  mapVariant = "hero",
  supplyCountry = "IR",
  supplyCity = "",
  showSupplierSubtitle = false,
}) {
  const located = lots.filter(hasValidCoords);
  if (!located.length) return null;

  const showLotHint = located.length > 1;

  return (
    <div className={className}>
      {located.map((lot, index) => {
        const supplierLabel = getLotSupplierDisplay(lot, t).label;
        const subtitle = showLotHint
          ? getLocalizedLotLabel(lot, language, t)
          : showSupplierSubtitle && supplierLabel
          ? supplierLabel
          : null;

        return (
        <div key={lot.id} className={index > 0 ? "mt-3 border-t border-slate-100 pt-3" : ""}>
          <CatalogLocationMap
            latitude={lot.latitude}
            longitude={lot.longitude}
            label={lot.locationLabel || t("loadingLocationDefault")}
            subtitle={subtitle}
            t={t}
            variant={mapVariant}
            supplyCountry={supplyCountry}
            supplyCity={supplyCity}
          />
        </div>
        );
      })}
    </div>
  );
}