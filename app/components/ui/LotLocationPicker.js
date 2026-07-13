"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SearchBox from "./Map/SearchBox";

const Map = dynamic(() => import("./Map/Map"), { ssr: false });

function FullscreenIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function MapPanel({
  lat,
  lng,
  hasCoords,
  center,
  markers,
  onPositionChange,
  compact = true,
  onRequestFullscreen,
  onCloseFullscreen,
}) {
  return (
    <div
      className={
        compact
          ? "relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
          : "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-100"
      }
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between gap-2 p-2">
        <div className="pointer-events-auto min-w-0 flex-1">
          <SearchBox
            variant="overlay"
            onSearchSelect={([newLat, newLng]) => {
              onPositionChange?.({ latitude: newLat, longitude: newLng });
            }}
          />
        </div>
        {compact ? (
          <button
            type="button"
            title="نمایش تمام‌صفحه"
            aria-label="نمایش تمام‌صفحه"
            onClick={onRequestFullscreen}
            className="pointer-events-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-800 active:scale-95"
          >
            <FullscreenIcon />
          </button>
        ) : (
          <button
            type="button"
            title="بستن"
            aria-label="بستن نقشه تمام‌صفحه"
            onClick={onCloseFullscreen}
            className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-700 active:scale-95"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      <div className={compact ? "h-44 sm:h-52 md:h-56" : "min-h-0 flex-1"}>
        <Map
          center={center}
          zoom={hasCoords ? 14 : 6}
          markers={markers}
          height="100%"
          preserveZoomOnPan
          showZoomButtons
          scrollWheelZoom
          onMapClick={({ latitude: newLat, longitude: newLng }) => {
            onPositionChange?.({ latitude: newLat, longitude: newLng });
          }}
        />
      </div>

      {hasCoords ? (
        <div className="absolute inset-x-0 bottom-0 z-[500] flex items-center justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent px-2 pb-2 pt-6">
          <p className="truncate text-[10px] font-medium text-white sm:text-[11px]" dir="ltr">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
          <button
            type="button"
            className="shrink-0 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-rose-600 hover:bg-white sm:text-[11px]"
            onClick={() => onPositionChange?.({ latitude: null, longitude: null })}
          >
            حذف
          </button>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-2 bottom-2 z-[500]">
          <p className="rounded-md bg-black/45 px-2 py-1 text-center text-[10px] text-white backdrop-blur-sm sm:text-[11px]">
            {compact ? "برای انتخاب دقیق‌تر، نقشه را تمام‌صفحه کنید" : "روی نقشه کلیک کنید یا جستجو کنید"}
          </p>
        </div>
      )}
    </div>
  );
}

export default function LotLocationPicker({
  latitude,
  longitude,
  locationLabel,
  onLocationLabelChange,
  onPositionChange,
}) {
  const [fullscreen, setFullscreen] = useState(false);

  const lat = latitude != null && latitude !== "" ? parseFloat(latitude) : null;
  const lng = longitude != null && longitude !== "" ? parseFloat(longitude) : null;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const center = hasCoords ? [lat, lng] : [35.7219, 51.3347];

  const markers = hasCoords
    ? [{ latitude: lat, longitude: lng, name: locationLabel || "موقعیت" }]
    : [];

  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  useEffect(() => {
    if (!fullscreen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") closeFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen, closeFullscreen]);

  const mapPanelProps = {
    lat,
    lng,
    hasCoords,
    center,
    markers,
    onPositionChange,
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">عنوان موقعیت</label>
        <input
          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-100"
          placeholder="مثلاً انبار، مزرعه، محل بارگیری"
          value={locationLabel || ""}
          onChange={(e) => onLocationLabelChange?.(e.target.value)}
        />
      </div>

      <MapPanel
        {...mapPanelProps}
        compact
        onRequestFullscreen={() => setFullscreen(true)}
      />

      {fullscreen ? (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2.5 sm:px-4">
            <div>
              <p className="text-sm font-bold text-slate-900">انتخاب موقعیت روی نقشه</p>
              <p className="text-xs text-slate-500">کلیک کنید یا جستجو کنید — Esc برای بستن</p>
            </div>
            <button
              type="button"
              onClick={closeFullscreen}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="بستن"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <MapPanel
              {...mapPanelProps}
              compact={false}
              onCloseFullscreen={closeFullscreen}
            />
          </div>

          <div className="shrink-0 border-t border-slate-200 px-3 py-3 sm:px-4">
            <label className="mb-1 block text-xs font-medium text-slate-600">عنوان موقعیت</label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-100"
              placeholder="مثلاً انبار، مزرعه، محل بارگیری"
              value={locationLabel || ""}
              onChange={(e) => onLocationLabelChange?.(e.target.value)}
            />
            <button
              type="button"
              onClick={closeFullscreen}
              className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              تأیید موقعیت
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
