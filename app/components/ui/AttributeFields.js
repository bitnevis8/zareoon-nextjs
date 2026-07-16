"use client";

import { useTranslations } from "next-intl";

export default function AttributeFields({ defs = [], values = {}, onChange, className = "", compact = false }) {
  const t = useTranslations("shared");

  if (!defs.length) return null;

  const labelClass = compact ? "mb-0.5 text-xs font-medium text-slate-600" : "mb-1 text-sm font-medium text-gray-700";
  const inputClass = compact
    ? "rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-100"
    : "rounded-lg border border-gray-300 p-2.5 text-sm";

  return (
    <div className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${className}`}>
      {defs.map((def) => (
        <div key={def.id} className="flex flex-col">
          <label className={labelClass}>{def.name}</label>
          {def.type === "number" ? (
            <input
              type="number"
              className={inputClass}
              value={values[def.id] ?? ""}
              onChange={(e) => onChange(def.id, e.target.value)}
            />
          ) : def.type === "boolean" ? (
            <select
              className={inputClass}
              value={values[def.id] ?? ""}
              onChange={(e) => onChange(def.id, e.target.value)}
            >
              <option value="">—</option>
              <option value="true">{t("attributeFields.yes")}</option>
              <option value="false">{t("attributeFields.no")}</option>
            </select>
          ) : def.type === "date" ? (
            <input
              type="date"
              className={inputClass}
              value={values[def.id] ?? ""}
              onChange={(e) => onChange(def.id, e.target.value)}
            />
          ) : def.type === "select" && Array.isArray(def.options) ? (
            <select
              className={inputClass}
              value={values[def.id] ?? ""}
              onChange={(e) => onChange(def.id, e.target.value)}
            >
              <option value="">—</option>
              {def.options.map((opt) => (
                <option key={String(opt?.value ?? opt)} value={String(opt?.value ?? opt)}>
                  {String(opt?.label ?? opt)}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={inputClass}
              value={values[def.id] ?? ""}
              onChange={(e) => onChange(def.id, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
