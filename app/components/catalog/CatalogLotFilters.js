"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  collectFilterOptions,
  getProductFilterKeys,
  humanizeFilterKey,
} from "@/app/utils/productCatalogSchema";
import { catalogText } from "./catalogTheme";

export default function CatalogLotFilters({
  product,
  lots = [],
  activeFilters = {},
  onChange,
  onClear,
}) {
  const t = useTranslations("catalog");
  const keys = useMemo(() => {
    const fromProduct = getProductFilterKeys(product);
    // Prefer keys that appear on lots, but keep product schema order
    const useful = fromProduct.filter((k) => k !== "minimumOrderQuantity");
    return useful.slice(0, 8);
  }, [product]);

  const options = useMemo(() => collectFilterOptions(lots, keys), [lots, keys]);

  const activeCount = Object.values(activeFilters || {}).filter((v) => v != null && String(v).trim()).length;

  if (!keys.length || !lots.length) return null;

  const labelFor = (key) => {
    try {
      const translated = t(`filterKeys.${key}`);
      if (translated && translated !== `filterKeys.${key}`) return translated;
    } catch {
      /* missing */
    }
    return humanizeFilterKey(key);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className={`text-sm font-bold sm:text-base ${catalogText.heading}`}>{t("lotFiltersTitle")}</h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            {t("clearLotFilters")}
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {keys.map((key) => {
          const opts = options[key] || [];
          if (!opts.length && key !== "hsCode" && key !== "originCountry" && key !== "cropYear") {
            // Skip empty option keys except common free-text-ish ones with no data yet
            if (!activeFilters[key]) return null;
          }
          return (
            <label key={key} className="flex flex-col gap-1">
              <span className={`text-[11px] font-medium ${catalogText.muted}`}>{labelFor(key)}</span>
              {opts.length ? (
                <select
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                  value={activeFilters[key] || ""}
                  onChange={(e) => onChange(key, e.target.value)}
                >
                  <option value="">{t("allFilterValues")}</option>
                  {opts.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                  value={activeFilters[key] || ""}
                  onChange={(e) => onChange(key, e.target.value)}
                  placeholder={labelFor(key)}
                />
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
}

