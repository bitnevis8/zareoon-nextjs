"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SearchBox from "@/app/components/ui/Map/SearchBox";
import { DEFAULT_MAP_CENTER, parseLatLng } from "@/app/utils/businessHours";

const Map = dynamic(() => import("@/app/components/ui/Map/Map"), { ssr: false });

/**
 * انتخاب موقعیت روی نقشه با جستجو و کلیک
 */
export default function LocationPickerMap({
  latitude,
  longitude,
  addressLabel = "",
  onChange,
  height = "240px",
  optional = false,
}) {
  const parsed = parseLatLng(latitude, longitude);
  const [hint, setHint] = useState("");
  const [mapKey, setMapKey] = useState(0);

  const center = useMemo(() => {
    if (parsed) return [parsed.latitude, parsed.longitude];
    return [DEFAULT_MAP_CENTER.latitude, DEFAULT_MAP_CENTER.longitude];
  }, [parsed]);

  const markers = parsed
    ? [{ latitude: parsed.latitude, longitude: parsed.longitude, name: addressLabel || "موقعیت فروشگاه" }]
    : [];

  return (
    <div className="space-y-3">
      <p className="text-xs leading-5 text-slate-500">
        {optional
          ? "اختیاری — مکان را جستجو کنید یا روی نقشه بزنید."
          : "مکان را جستجو کنید یا روی نقشه بزنید تا موقعیت مشخص شود."}
      </p>

      <SearchBox
        className="!shadow-none !p-0"
        onSearchSelect={(coords, displayName) => {
          const [lat, lng] = coords;
          setHint("موقعیت از جستجو انتخاب شد");
          setMapKey((k) => k + 1);
          onChange?.({
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            addressLabel: displayName || addressLabel,
          });
        }}
      />

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <Map
          key={mapKey}
          center={center}
          zoom={parsed ? 14 : 11}
          markers={markers}
          height={height}
          onMapClick={({ latitude: lat, longitude: lng }) => {
            setHint("موقعیت انتخاب شد");
            onChange?.({
              latitude: Number(lat.toFixed(6)),
              longitude: Number(lng.toFixed(6)),
              addressLabel,
            });
          }}
          showControls
          scrollWheelZoom={false}
        />
      </div>
      <label className="block text-sm font-medium text-slate-700">
        آدرس نوشتاری (اختیاری)
        <input
          type="text"
          value={addressLabel || ""}
          onChange={(e) =>
            onChange?.({
              latitude: parsed?.latitude ?? null,
              longitude: parsed?.longitude ?? null,
              addressLabel: e.target.value,
            })
          }
          placeholder="مثلاً تهران، خیابان ..."
          className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </label>
      {parsed ? (
        <p className="text-[11px] text-slate-400" dir="ltr">
          {parsed.latitude}, {parsed.longitude}
          {hint ? ` · ${hint}` : ""}
        </p>
      ) : (
        <p className="text-[11px] text-slate-500">هنوز نقطه‌ای انتخاب نشده است{optional ? " (اختیاری)" : ""}.</p>
      )}
    </div>
  );
}
