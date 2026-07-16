"use client";

import { useTranslations } from "next-intl";
import { useMap } from "react-leaflet";

export default function MapZoomControls({ minZoom = 3, maxZoom = 18 }) {
  const map = useMap();
  const t = useTranslations("shared");

  const zoomIn = () => map.setZoom(Math.min(map.getZoom() + 1, maxZoom));
  const zoomOut = () => map.setZoom(Math.max(map.getZoom() - 1, minZoom));

  return (
    <div className="leaflet-bottom leaflet-left !bottom-3 !left-3">
      <div className="leaflet-control flex flex-col gap-1 !border-0 !bg-transparent !shadow-none">
        <button
          type="button"
          onClick={zoomIn}
          title={t("map.zoomIn")}
          aria-label={t("map.zoomIn")}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-base font-bold text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-800 active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          title={t("map.zoomOut")}
          aria-label={t("map.zoomOut")}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-base font-bold text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-800 active:scale-95"
        >
          −
        </button>
      </div>
    </div>
  );
}
