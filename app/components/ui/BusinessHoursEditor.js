"use client";

import { DAY_LABELS_FA, WEEK_DAY_KEYS } from "@/app/utils/businessHours";

/**
 * ویرایشگر ساده ساعت کاری — مناسب کاربر تازه‌وارد
 */
export default function BusinessHoursEditor({ value, onChange }) {
  const hours = value || {};

  const setDay = (day, patch) => {
    onChange({
      ...hours,
      [day]: { ...(hours[day] || {}), ...patch },
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs leading-5 text-slate-500">
        روزهایی که باز هستید را مشخص کنید. می‌توانید بعداً هم تغییر دهید.
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        {WEEK_DAY_KEYS.map((day) => {
          const row = hours[day] || { closed: true, open: "08:00", close: "18:00" };
          return (
            <div
              key={day}
              className="flex flex-col gap-2 border-b border-slate-100 px-3 py-2.5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <label className="flex min-w-[7rem] items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={!row.closed}
                  onChange={(e) =>
                    setDay(day, {
                      closed: !e.target.checked,
                      open: row.open || "08:00",
                      close: row.close || "18:00",
                    })
                  }
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                {DAY_LABELS_FA[day]}
              </label>
              {row.closed ? (
                <span className="text-xs font-medium text-slate-400">تعطیل</span>
              ) : (
                <div className="flex items-center gap-2" dir="ltr">
                  <input
                    type="time"
                    value={row.open || "08:00"}
                    onChange={(e) => setDay(day, { open: e.target.value })}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  />
                  <span className="text-slate-400">–</span>
                  <input
                    type="time"
                    value={row.close || "18:00"}
                    onChange={(e) => setDay(day, { close: e.target.value })}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
