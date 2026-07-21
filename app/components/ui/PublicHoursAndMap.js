"use client";

import dynamic from "next/dynamic";
import { DAY_LABELS_FA, WEEK_DAY_KEYS, parseLatLng } from "@/app/utils/businessHours";

const Map = dynamic(() => import("@/app/components/ui/Map/Map"), { ssr: false });

function HoursTable({ hours }) {
  if (!hours) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <tbody>
          {WEEK_DAY_KEYS.map((key) => {
            const row = hours[key] || {};
            return (
              <tr key={key} className="border-b border-slate-100 last:border-0">
                <td className="w-[38%] bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 sm:text-sm">
                  {DAY_LABELS_FA[key]}
                </td>
                <td className="px-3 py-2 text-xs text-slate-600 sm:text-sm" dir="ltr">
                  {row.closed ? "تعطیل" : `${row.open || "—"} تا ${row.close || "—"}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * نمایش عمومی: ساعات کاری → نقشه → آدرس ریز
 */
export default function PublicHoursAndMap({
  businessHours,
  latitude,
  longitude,
  addressLabel,
  title = "ساعات کاری",
}) {
  const point = parseLatLng(latitude, longitude);
  const hasHours = businessHours && typeof businessHours === "object";
  const address = String(addressLabel || "").trim();

  if (!hasHours && !point && !address) return null;

  return (
    <div className="space-y-3">
      {hasHours ? (
        <section className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm sm:p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">{title}</h2>
          <HoursTable hours={businessHours} />
        </section>
      ) : null}

      {point ? (
        <section className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-3.5 py-2.5 sm:px-4">
            <h2 className="text-sm font-semibold text-slate-800">موقعیت روی نقشه</h2>
          </div>
          <Map
            center={[point.latitude, point.longitude]}
            zoom={14}
            markers={[
              {
                latitude: point.latitude,
                longitude: point.longitude,
                name: address || "موقعیت",
              },
            ]}
            height="200px"
            showControls
            scrollWheelZoom={false}
          />
          {address ? (
            <p className="border-t border-slate-100 px-3.5 py-2 text-[11px] leading-5 text-slate-500 sm:px-4">
              {address}
            </p>
          ) : null}
        </section>
      ) : address ? (
        <section className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm sm:p-4">
          <h2 className="mb-1.5 text-sm font-semibold text-slate-800">آدرس</h2>
          <p className="text-[11px] leading-5 text-slate-500">{address}</p>
        </section>
      ) : null}
    </div>
  );
}
