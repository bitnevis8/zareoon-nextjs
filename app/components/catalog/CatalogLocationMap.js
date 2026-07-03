"use client";

import dynamic from "next/dynamic";
import SupplyCountryFlag from "../ui/SupplyCountryFlag";
import CatalogMapNavButtons from "./CatalogMapNavButtons";
import { catalogText } from "./catalogTheme";

const Map = dynamic(() => import("../ui/Map/Map"), { ssr: false });

export default function CatalogLocationMap({
  latitude,
  longitude,
  label,
  subtitle,
  t,
  variant = "default",
  supplyCountry = "",
  supplyCity = "",
}) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const isHero = variant === "hero";
  const isSidebar = variant === "sidebar";
  const isFull = variant === "full";
  const mapHeight = isFull ? "280px" : isSidebar ? "220px" : isHero ? "min(52vw, 240px)" : "220px";
  const showFlag = Boolean(supplyCountry);

  return (
    <div
      className={`overflow-hidden bg-white ${
        isHero || isSidebar || isFull
          ? "rounded-xl border border-slate-200 shadow-sm"
          : "rounded-xl border border-slate-200"
      }`}
    >
      <div
        className={`flex items-start justify-between gap-4 border-b border-slate-100 ${
          isFull ? "px-5 py-4" : isHero ? "px-4 py-3.5" : "px-4 py-3"
        }`}
      >
        <div className="min-w-0 flex-1 text-right">
          <p className={`font-medium ${catalogText.muted} ${isFull ? "text-sm" : "text-xs"}`}>
            {t("locationSectionTitle")}
          </p>
          <p className={`mt-0.5 font-bold text-slate-900 ${isFull ? "text-lg" : isHero ? "text-base" : "text-sm"}`}>
            {label}
          </p>
          {subtitle ? (
            <p className={`mt-1 ${catalogText.muted} ${isFull ? "text-sm" : "text-xs"}`}>
              {t("lotGradeLabel")}: {subtitle}
            </p>
          ) : null}
        </div>
        {showFlag ? (
          <div className="shrink-0 pt-0.5">
            <SupplyCountryFlag
              countryCode={supplyCountry}
              city={supplyCity}
              className="h-9 min-w-[3rem] rounded-lg shadow-md ring-1 ring-slate-200"
            />
          </div>
        ) : null}
      </div>

      <Map
        center={[lat, lng]}
        zoom={14}
        markers={[{ latitude: lat, longitude: lng, name: label || t("locationOnMap") }]}
        height={mapHeight}
        showControls
        draggable={false}
        className="rounded-none"
      />

      <CatalogMapNavButtons latitude={lat} longitude={lng} t={t} />
    </div>
  );
}