"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { formatPriceWithCurrency } from "@/app/utils/priceCurrencies";
import {
  isDomesticCurrency,
  resolveFxRateToman,
  toTomanEquivalent,
} from "@/app/utils/fxRate";
import { useExchangeRatesMap } from "@/app/hooks/useExchangeRatesMap";

/**
 * نمایش قیمت ارز + معادل تقریبی تومان (نرخ دستی فروشنده یا نرخ زارعون)
 */
export default function LotPriceDisplay({
  amount,
  currency = "TOMAN",
  fxRateSource,
  fxRateManual,
  className = "",
  amountClassName = "",
  showDisclaimer = false,
}) {
  const tShared = useTranslations("shared");
  const exchangeRates = useExchangeRatesMap();
  const domestic = isDomesticCurrency(currency);

  const rateToman = useMemo(
    () =>
      resolveFxRateToman({
        currency,
        fxRateSource,
        fxRateManual,
        exchangeRates,
      }),
    [currency, fxRateSource, fxRateManual, exchangeRates]
  );

  const tomanEq = useMemo(
    () => (domestic ? null : toTomanEquivalent(amount, rateToman)),
    [domestic, amount, rateToman]
  );

  if (amount == null || amount === "") {
    return <p className={className}>—</p>;
  }

  return (
    <div className={className}>
      <p className={amountClassName || "text-xl font-extrabold text-emerald-800"}>
        {formatPriceWithCurrency(amount, currency, tShared)}
      </p>
      {tomanEq != null ? (
        <p className="mt-1 text-[11px] font-medium text-slate-500">
          ≈ {Math.round(tomanEq).toLocaleString("fa-IR")} تومان
          {fxRateSource === "manual"
            ? " (نرخ فروشنده)"
            : fxRateSource === "zareoon"
              ? " (نرخ زارعون — تقریبی)"
              : ""}
        </p>
      ) : null}
      {showDisclaimer && fxRateSource === "zareoon" && !domestic ? (
        <p className="mt-2 text-[10px] leading-4 text-slate-400">
          نرخ زارعون صرفاً راهنماست و ممکن است دقیق یا به‌روز نباشد؛ زارعون مسئولیتی در این‌باره ندارد.
        </p>
      ) : null}
    </div>
  );
}
