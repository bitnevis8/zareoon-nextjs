"use client";

import { useTranslations } from "next-intl";
import { getStockLegend } from "../utils/stockUtils";

export default function StockLegend({ className = "" }) {
  const t = useTranslations("shared");
  const legendItems = getStockLegend(t);

  return (
    <div
      dir="rtl"
      className={`rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 ${className}`}
      role="note"
      aria-label={t("stock.legendAriaLabel")}
    >
      <p className="text-xs font-medium text-slate-600 mb-2">{t("stock.legendTitle")}</p>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 sm:justify-start">
        {legendItems.map((item) => (
          <div
            key={item.className}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs border ${item.className}`}
          >
            <span className="font-medium">{item.label}</span>
            <span className="opacity-80">({item.range})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
