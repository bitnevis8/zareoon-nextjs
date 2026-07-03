"use client";

import { lotAvailableQuantity } from "../../utils/catalogGrades";
import { formatLocalizedNumber, localizeUnit } from "../../utils/localize";
import { catalogAlert, catalogText } from "./catalogTheme";

function StockStat({ label, amount, unit, language, accent = false, subtitle = "" }) {
  const qty = formatLocalizedNumber(amount, language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
    useGrouping: true,
  });

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-center justify-center px-2 py-3 text-center sm:px-4 sm:py-3.5 lg:py-4 ${
        accent ? "bg-green-50/90" : "bg-white"
      }`}
    >
      <p className={`text-[10px] font-semibold leading-tight sm:text-xs ${accent ? catalogText.accent : catalogText.muted}`}>
        {label}
      </p>
      <p
        className={`mt-1.5 text-base font-extrabold tabular-nums leading-none tracking-tight sm:text-lg lg:text-xl ${
          accent ? catalogText.accentStrong : catalogText.heading
        }`}
      >
        {qty}
      </p>
      <p className={`mt-1 text-[10px] font-medium sm:text-xs ${catalogText.muted}`}>{unit}</p>
      {subtitle ? (
        <p className={`mt-1 text-[10px] font-semibold leading-tight sm:text-[11px] ${accent ? catalogText.accent : catalogText.body}`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export default function CatalogInventoryOverview({
  summary,
  t,
  orderMsg,
  orderMsgType,
  language,
  productUnit = "",
  className = "",
}) {
  if (!summary) return null;

  const lots = summary.lots || [];
  const unitLabel = localizeUnit(productUnit, language);
  const availableLotsCount = lots.filter((lot) => lotAvailableQuantity(lot) > 0).length;
  const lotsSubtitle =
    availableLotsCount > 1 ? t("stockInLotsCount", { count: availableLotsCount }) : "";

  return (
    <div className={className}>
      <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="grid grid-cols-3 divide-x divide-slate-200/80 rtl:divide-x-reverse">
          <StockStat
            label={t("stockTotalLabel")}
            amount={summary.totalQuantity}
            unit={unitLabel}
            language={language}
            subtitle={lots.length > 1 ? t("stockInLotsCount", { count: lots.length }) : ""}
          />
          <StockStat
            label={t("stockReservedLabel")}
            amount={summary.reservedQuantity}
            unit={unitLabel}
            language={language}
          />
          <StockStat
            label={t("stockAvailableLabel")}
            amount={summary.availableQuantity}
            unit={unitLabel}
            language={language}
            accent
            subtitle={lotsSubtitle}
          />
        </div>
      </div>

      {orderMsg ? (
        <div
          className={`border-b px-4 py-2.5 text-xs font-medium leading-snug sm:text-sm ${
            orderMsgType === "success"
              ? catalogAlert.success
              : orderMsgType === "error"
              ? catalogAlert.error
              : catalogAlert.info
          }`}
        >
          {orderMsg}
        </div>
      ) : null}
    </div>
  );
}
