"use client";

import { useTranslations } from "next-intl";
import { humanizeFilterKey } from "@/app/utils/productCatalogSchema";

/**
 * Dynamic filter value fields driven by product.filters from seederData5.
 * Keys are string filter names (e.g. originCountry); values live in a plain object.
 */
export default function ProductFilterFields({
  keys = [],
  values = {},
  onChange,
  optionsByKey = {},
  compact = false,
  optional = false,
  className = "",
}) {
  const t = useTranslations("catalog");
  const tInv = useTranslations("inventory");

  if (!keys.length) return null;

  const labelClass = compact
    ? "mb-0.5 text-xs font-medium text-slate-600"
    : "mb-1 text-sm font-medium text-gray-700";
  const inputClass = compact
    ? "w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-100"
    : "w-full rounded-lg border border-gray-300 p-2.5 text-sm";

  const labelFor = (key) => {
    try {
      const translated = t(`filterKeys.${key}`);
      if (translated && translated !== `filterKeys.${key}`) return translated;
    } catch {
      /* missing key */
    }
    return humanizeFilterKey(key);
  };

  return (
    <div className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${className}`}>
      {keys.map((key) => {
        const opts = optionsByKey[key];
        return (
          <div key={key} className="flex flex-col">
            <label className={labelClass}>
              {labelFor(key)}
              {optional ? (
                <span className="ms-1 font-normal text-slate-400">({tInv("create.optional")})</span>
              ) : null}
            </label>
            {Array.isArray(opts) && opts.length > 0 ? (
              <select
                className={inputClass}
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
              >
                <option value="">—</option>
                {opts.map((opt) => (
                  <option key={String(opt)} value={String(opt)}>
                    {String(opt)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={inputClass}
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={labelFor(key)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
