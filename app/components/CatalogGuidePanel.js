"use client";

import { useLanguage } from "../context/LanguageContext";
import { getStockLegend } from "../utils/stockUtils";

const STOCK_DOT_CLASS = {
  "stock-empty": "stock-guide-dot stock-guide-dot-empty",
  "stock-low": "stock-guide-dot stock-guide-dot-low",
  "stock-medium": "stock-guide-dot stock-guide-dot-medium",
  "stock-high": "stock-guide-dot stock-guide-dot-high",
};

function StockColorDot({ stockClass }) {
  return (
    <span
      className={STOCK_DOT_CLASS[stockClass] || "stock-guide-dot stock-guide-dot-empty"}
      aria-hidden
    />
  );
}

export default function CatalogGuidePanel({
  showCategoryGuide = true,
  showStockLegend = true,
  className = "",
}) {
  const { t } = useLanguage();
  const legendItems = getStockLegend(t);

  if (!showCategoryGuide && !showStockLegend) return null;

  return (
    <div
      className={`rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600 sm:text-xs ${className}`}
      role="note"
      aria-label={t("guide")}
    >
      <p>
        <span className="font-semibold text-slate-700">{t("guide")}:</span>{" "}
        {showCategoryGuide ? (
          <>
            <span className="font-medium text-slate-700">{t("category")}</span>{" "}
            {t("categoryProductGuideCategoryShort")}
            <span className="mx-1.5 text-slate-300" aria-hidden>
              ·
            </span>
            <span className="font-medium text-slate-700">{t("product")}</span>{" "}
            {t("categoryProductGuideProductShort")}
          </>
        ) : null}
        {showCategoryGuide && showStockLegend ? (
          <span className="mx-1.5 text-slate-300" aria-hidden>
            ·
          </span>
        ) : null}
        {showStockLegend
          ? legendItems.map((item, index) => (
              <span key={item.className} className="inline-flex items-center gap-1">
                {index > 0 ? (
                  <span className="mx-1.5 text-slate-300" aria-hidden>
                    ·
                  </span>
                ) : null}
                <StockColorDot stockClass={item.className} />
                <span>
                  {item.label} ({item.range})
                </span>
              </span>
            ))
          : null}
      </p>
    </div>
  );
}
