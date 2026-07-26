"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { parseLatLng } from "@/app/utils/businessHours";

const Map = dynamic(() => import("@/app/components/ui/Map/Map"), {
  ssr: false,
  loading: () => <div className="h-44 animate-pulse rounded-xl bg-slate-100" />,
});

/**
 * نقشهٔ فقط‌خواندنی موقعیت کسب‌وکار — جدا از هدر پروفایل کاربر
 */
export default function DashboardBusinessMap({ workspace, className = "" }) {
  const parsed = parseLatLng(workspace?.latitude, workspace?.longitude);
  const label = useMemo(
    () =>
      workspace?.addressLabel ||
      workspace?.addressText ||
      workspace?.displayName ||
      workspace?.name ||
      "موقعیت کسب‌وکار",
    [workspace]
  );

  if (!workspace || !parsed) return null;

  const markers = [
    {
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      name: label,
    },
  ];

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ${className}`}
      aria-label="نقشه موقعیت کسب‌وکار"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900">موقعیت کسب‌وکار روی نقشه</h3>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{label}</p>
        </div>
        <span className="shrink-0 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">
          {workspace.displayName || workspace.name || "کسب‌وکار"}
        </span>
      </div>
      <div className="overflow-hidden">
        <Map
          center={[parsed.latitude, parsed.longitude]}
          zoom={14}
          markers={markers}
          height="220px"
          scrollWheelZoom={false}
          showZoomButtons={false}
          showControls={false}
        />
      </div>
    </section>
  );
}
