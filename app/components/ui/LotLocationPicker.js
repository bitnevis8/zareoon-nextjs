"use client";

import dynamic from "next/dynamic";
import SearchBox from "./Map/SearchBox";

const Map = dynamic(() => import("./Map/Map"), { ssr: false });

export default function LotLocationPicker({
  latitude,
  longitude,
  locationLabel,
  onLocationLabelChange,
  onPositionChange,
  label = "موقعیت روی نقشه",
  hint = "روی نقشه کلیک کنید یا از جستجو استفاده کنید",
}) {
  const lat = latitude != null && latitude !== "" ? parseFloat(latitude) : null;
  const lng = longitude != null && longitude !== "" ? parseFloat(longitude) : null;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const center = hasCoords ? [lat, lng] : [35.7219, 51.3347];

  const markers = hasCoords
    ? [{ latitude: lat, longitude: lng, name: locationLabel || "موقعیت" }]
    : [];

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">عنوان موقعیت</label>
        <input
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          placeholder="مثلاً: محل بارگیری، انبار، مزرعه"
          value={locationLabel || ""}
          onChange={(e) => onLocationLabelChange?.(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
        <p className="mb-2 text-xs text-gray-500">{hint}</p>
        <div className="mb-2">
          <SearchBox
            onSearchSelect={([newLat, newLng]) => {
              onPositionChange?.({ latitude: newLat, longitude: newLng });
            }}
          />
        </div>
        <Map
          center={center}
          zoom={hasCoords ? 14 : 6}
          markers={markers}
          height="280px"
          onMapClick={({ latitude: newLat, longitude: newLng }) => {
            onPositionChange?.({ latitude: newLat, longitude: newLng });
          }}
        />
        {hasCoords ? (
          <p className="mt-2 text-xs text-gray-600" dir="ltr">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        ) : null}
        {hasCoords ? (
          <button
            type="button"
            className="mt-2 text-xs text-red-600 hover:text-red-800"
            onClick={() => onPositionChange?.({ latitude: null, longitude: null })}
          >
            حذف موقعیت
          </button>
        ) : null}
      </div>
    </div>
  );
}
