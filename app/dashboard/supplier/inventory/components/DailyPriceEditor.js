"use client";

import { useMemo, useState } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import { PersianPriceInput } from "@/app/components/ui/PersianNumberInput";
import { inv } from "../inventoryTheme";

function toGregorianYmd(dateObj) {
  if (!dateObj) return "";
  try {
    const obj = dateObj instanceof DateObject ? dateObj : new DateObject(dateObj);
    return obj.convert(gregorian).format("YYYY-MM-DD");
  } catch {
    return "";
  }
}

function formatJalaliLabel(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd || "—";
  try {
    const [y, m, d] = ymd.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return ymd;
  }
}

/**
 * برنامه قیمت روزانه — انتخاب تاریخ شمسی + قیمت واحد برای هر روز
 */
export default function DailyPriceEditor({
  rows = [],
  onChange,
  currency = "TOMAN",
  exchangeRates,
  className = "",
}) {
  const [picked, setPicked] = useState(null);
  const [draftPrice, setDraftPrice] = useState("");

  const sorted = useMemo(
    () => [...(rows || [])].sort((a, b) => String(a.priceDate).localeCompare(String(b.priceDate))),
    [rows]
  );

  const addOrUpdate = () => {
    const priceDate = toGregorianYmd(picked);
    const price = draftPrice !== "" && draftPrice != null ? Number(draftPrice) : NaN;
    if (!priceDate || !Number.isFinite(price) || price < 0) return;
    const next = [...(rows || []).filter((r) => r.priceDate !== priceDate), { priceDate, price }];
    next.sort((a, b) => String(a.priceDate).localeCompare(String(b.priceDate)));
    onChange?.(next);
    setPicked(null);
    setDraftPrice("");
  };

  const removeRow = (priceDate) => {
    onChange?.((rows || []).filter((r) => r.priceDate !== priceDate));
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-3.5 ${className}`}>
      <div className="mb-2.5">
        <h3 className="text-sm font-bold text-slate-800">قیمت روزانه (تقویم شمسی)</h3>
        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
          برای هر روز می‌توانید قیمت جدا بگذارید؛ مثلاً فردا یک قیمت و پس‌فردا قیمت دیگر. اگر برای امروز قیمت
          روز تعریف شده باشد، همان در فروش نمایش داده می‌شود.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1">
          <span className="mb-1 block text-[11px] font-semibold text-slate-600">تاریخ شمسی</span>
          <DatePicker
            value={picked}
            onChange={setPicked}
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            inputClass={`${inv.inputCompact} w-full text-sm`}
            containerClassName="w-full"
            placeholder="انتخاب روز"
            minDate={new DateObject({ calendar: persian })}
            format="YYYY/MM/DD"
          />
        </label>
        <label className="block min-w-0 flex-1">
          <span className="mb-1 block text-[11px] font-semibold text-slate-600">قیمت آن روز</span>
          <PersianPriceInput
            className={inv.inputCompact}
            value={draftPrice}
            onChange={setDraftPrice}
            currency={currency}
            exchangeRates={exchangeRates}
            placeholder="مثلاً ۵۰٬۰۰۰"
          />
        </label>
        <button
          type="button"
          onClick={addOrUpdate}
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white transition hover:bg-emerald-700 sm:min-w-[5.5rem]"
        >
          افزودن
        </button>
      </div>

      {sorted.length ? (
        <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {sorted.map((row) => (
            <li key={row.priceDate} className="flex items-center gap-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">{formatJalaliLabel(row.priceDate)}</p>
                <p className="mt-0.5 text-[10px] text-slate-400" dir="ltr">
                  {row.priceDate}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold tabular-nums text-emerald-800">
                {Number(row.price).toLocaleString("fa-IR")}
              </p>
              <button
                type="button"
                onClick={() => removeRow(row.priceDate)}
                className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
              >
                حذف
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2.5 text-[11px] text-slate-400">هنوز قیمت روزانه‌ای ثبت نشده است.</p>
      )}
    </div>
  );
}
