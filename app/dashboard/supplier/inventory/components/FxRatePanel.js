"use client";

import { useMemo } from "react";
import { PersianNumberInput } from "@/app/components/ui/PersianNumberInput";
import { inv } from "@/app/dashboard/supplier/inventory/inventoryTheme";
import { getCurrencyDefinition } from "@/app/utils/priceCurrencies";
import {
  isDomesticCurrency,
  resolveFxRateToman,
  toTomanEquivalent,
  zareoonRialToToman,
} from "@/app/utils/fxRate";

/**
 * تنظیم نرخ تبدیل ارز قیمت به تومان — دستی یا نرخ زارعون + سلب مسئولیت
 */
export default function FxRatePanel({
  currency,
  fxRateSource,
  fxRateManual,
  onChange,
  exchangeRates = {},
  priceAmount = "",
  tShared,
  className = "",
}) {
  const domestic = isDomesticCurrency(currency);
  const cur = getCurrencyDefinition(currency, tShared);
  const source = fxRateSource === "manual" ? "manual" : "zareoon";
  const zareoonToman = zareoonRialToToman(exchangeRates?.[cur.code]);
  const activeRate = resolveFxRateToman({
    currency: cur.code,
    fxRateSource: source,
    fxRateManual,
    exchangeRates,
  });
  const tomanEq = useMemo(
    () => (domestic ? null : toTomanEquivalent(priceAmount, activeRate)),
    [domestic, priceAmount, activeRate]
  );

  if (domestic) return null;

  const setSource = (next) => {
    onChange?.({
      fxRateSource: next,
      fxRateManual,
    });
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5 ${className}`}>
      <div className="mb-2.5">
        <h4 className="text-xs font-bold text-slate-800 sm:text-sm">نرخ تبدیل به تومان</h4>
        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
          قیمت را به {cur.shortLabel} وارد کرده‌اید؛ مشخص کنید معادل تومانی با چه نرخی محاسبه شود.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setSource("manual")}
          className={`rounded-lg px-2 py-2 text-[11px] font-bold transition sm:text-xs ${
            source === "manual"
              ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-100"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          نرخ دستی
        </button>
        <button
          type="button"
          onClick={() => setSource("zareoon")}
          className={`rounded-lg px-2 py-2 text-[11px] font-bold transition sm:text-xs ${
            source === "zareoon"
              ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-100"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          نرخ زارعون
        </button>
      </div>

      {source === "manual" ? (
        <label className="mt-3 block">
          <span className="mb-1 block text-[11px] font-semibold text-slate-600">
            نرخ هر ۱ {cur.shortLabel} به تومان
          </span>
          <PersianNumberInput
            className={inv.inputCompact}
            value={fxRateManual ?? ""}
            onChange={(v) => onChange?.({ fxRateSource: "manual", fxRateManual: v })}
            placeholder="مثلاً ۹۵٬۰۰۰"
          />
          <p className="mt-1 text-[10px] leading-4 text-slate-400">
            این نرخ توسط شما ثبت می‌شود و مبنای نمایش معادل تومانی آگهی است.
          </p>
        </label>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5">
            <p className="text-[11px] text-slate-500">نرخ فعلی زارعون (تقریبی)</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">
              {zareoonToman
                ? `۱ ${cur.shortLabel} ≈ ${Math.round(zareoonToman).toLocaleString("fa-IR")} تومان`
                : "در حال حاضر نرخ در دسترس نیست"}
            </p>
          </div>
          <div
            className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-[11px] leading-5 text-amber-950"
            role="note"
          >
            <p className="font-bold text-amber-900">توجه</p>
            <p className="mt-1">
              نرخ‌های اعلامی زارعون صرفاً جنبهٔ اطلاع‌رسانی دارند و ممکن است به‌دلیل تأخیر، قطعی سامانه، یا خطای
              منابع خارجی دقیق یا به‌روز نباشند. زارعون مسئولیتی در قبال صحت نرخ، نوسان بازار، یا هرگونه زیان ناشی
              از اتکا به این اطلاعات ندارد؛ مبنای نهایی معامله، توافق شما با طرف مقابل است.
            </p>
          </div>
        </div>
      )}

      {tomanEq != null ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-900 ring-1 ring-emerald-100">
          معادل تقریبی واحد: {Math.round(tomanEq).toLocaleString("fa-IR")} تومان
          {source === "zareoon" ? " (بر اساس نرخ زارعون)" : " (بر اساس نرخ دستی شما)"}
        </p>
      ) : null}
    </div>
  );
}
