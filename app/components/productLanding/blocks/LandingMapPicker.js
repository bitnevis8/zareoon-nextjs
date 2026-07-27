"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/app/components/ui/Map/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[240px] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">
      در حال بارگذاری نقشه…
    </div>
  ),
});

const DEFAULT_CENTER = [35.6892, 51.389];

/**
 * نقشهٔ لندینگ — نمایش مارکر و در حالت ویرایش کلیک برای انتخاب موقعیت
 */
export default function LandingMapPicker({
  lat = null,
  lng = null,
  placeName = "",
  address = "",
  editable = false,
  onPick,
  height = "280px",
  className = "",
}) {
  const latN = lat != null && lat !== "" ? Number(lat) : NaN;
  const lngN = lng != null && lng !== "" ? Number(lng) : NaN;
  const hasCoords = Number.isFinite(latN) && Number.isFinite(lngN);
  const center = hasCoords ? [latN, lngN] : DEFAULT_CENTER;
  const markers = hasCoords
    ? [
        {
          latitude: latN,
          longitude: lngN,
          name: placeName || address || "موقعیت انتخاب‌شده",
        },
      ]
    : [];

  return (
    <div className={`overflow-hidden rounded-[var(--lp-radius,16px)] border border-[var(--lp-border,#e2e8f0)] ${className}`}>
      {editable ? (
        <div className="border-b border-slate-200 bg-emerald-50/80 px-3 py-2 text-[11px] leading-5 text-emerald-950">
          روی نقشه کلیک کنید تا مارکر بگذارید. مختصات ذخیره می‌شود و در صفحهٔ عمومی نمایش داده می‌شود.
        </div>
      ) : null}
      <Map
        center={center}
        zoom={hasCoords ? 14 : 11}
        markers={markers}
        height={height}
        width="100%"
        scrollWheelZoom={editable}
        showZoomButtons
        onMapClick={
          editable
            ? ({ latitude, longitude }) => {
                onPick?.({
                  mapLat: Number(latitude.toFixed(6)),
                  mapLng: Number(longitude.toFixed(6)),
                });
              }
            : undefined
        }
      />
      {!hasCoords && !editable ? (
        <p className="bg-[var(--lp-surface-2,#f1f5f9)] px-3 py-2 text-center text-xs text-[var(--lp-muted,#64748b)]">
          موقعیت هنوز مشخص نشده است.
        </p>
      ) : null}
    </div>
  );
}
