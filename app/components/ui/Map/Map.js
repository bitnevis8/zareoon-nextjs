"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

const ChangeView = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMap } = mod;
      return function ChangeView({ center, zoom, preserveZoom }) {
        const map = useMap();
        const prevCenter = useRef(null);
        const prevZoom = useRef(zoom);

        useEffect(() => {
          if (!map || !center) return;

          const centerKey = `${center[0]},${center[1]}`;
          const centerChanged = prevCenter.current !== centerKey;
          const zoomChanged = prevZoom.current !== zoom;

          if (zoomChanged) {
            map.setView(center, zoom, { animate: true });
          } else if (centerChanged) {
            if (preserveZoom) {
              map.panTo(center, { animate: true });
            } else {
              map.setView(center, map.getZoom(), { animate: true });
            }
          }

          prevCenter.current = centerKey;
          prevZoom.current = zoom;
        }, [center, zoom, map, preserveZoom]);

        return null;
      };
    }),
  { ssr: false }
);

const MapEvents = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMapEvents } = mod;
      return function MapEvents({ onMapClick }) {
        useMapEvents({
          click(e) {
            onMapClick?.({ latitude: e.latlng.lat, longitude: e.latlng.lng });
          },
        });
        return null;
      };
    }),
  { ssr: false }
);

const MapZoomControls = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMap } = mod;

      return function MapZoomControlsInner({ minZoom = 3, maxZoom = 18 }) {
        const map = useMap();

        const zoomIn = () => map.setZoom(Math.min(map.getZoom() + 1, maxZoom));
        const zoomOut = () => map.setZoom(Math.max(map.getZoom() - 1, minZoom));

        return (
          <div className="leaflet-bottom leaflet-left !bottom-3 !left-3">
            <div className="leaflet-control flex flex-col gap-1 !border-0 !bg-transparent !shadow-none">
              <button
                type="button"
                onClick={zoomIn}
                title="بزرگ‌نمایی"
                aria-label="بزرگ‌نمایی"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-base font-bold text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-800 active:scale-95"
              >
                +
              </button>
              <button
                type="button"
                onClick={zoomOut}
                title="کوچک‌نمایی"
                aria-label="کوچک‌نمایی"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-base font-bold text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-800 active:scale-95"
              >
                −
              </button>
            </div>
          </div>
        );
      };
    }),
  { ssr: false }
);

export default function Map({
  center = [35.7219, 51.3347],
  zoom = 13,
  markers = [],
  onMarkerClick,
  onMapClick,
  height = "400px",
  width = "100%",
  className = "",
  showControls = true,
  showZoomButtons = true,
  preserveZoomOnPan = false,
  minZoom = 3,
  maxZoom = 18,
  scrollWheelZoom = true,
}) {
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  const handleMapClick = ({ latitude, longitude }) => {
    setSelectedPosition([latitude, longitude]);
    onMapClick?.({ latitude, longitude });
  };

  return (
    <div style={{ height, width }} className={`relative overflow-hidden rounded-lg ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
        attributionControl={showControls}
        scrollWheelZoom={scrollWheelZoom}
        doubleClickZoom
        touchZoom
        boxZoom
        keyboard
      >
        <ChangeView center={center} zoom={zoom} preserveZoom={preserveZoomOnPan} />
        <MapEvents onMapClick={handleMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.latitude, marker.longitude]}
            eventHandlers={{
              click: () => onMarkerClick?.(marker),
            }}
          >
            <Popup>{marker.name || `موقعیت ${index + 1}`}</Popup>
          </Marker>
        ))}

        {selectedPosition ? (
          <Marker position={selectedPosition}>
            <Popup>موقعیت انتخاب‌شده</Popup>
          </Marker>
        ) : null}

        {showZoomButtons ? <MapZoomControls minZoom={minZoom} maxZoom={maxZoom} /> : null}
      </MapContainer>
    </div>
  );
}
