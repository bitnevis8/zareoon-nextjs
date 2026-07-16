"use client";

import { useTranslations } from "next-intl";
import { inv } from "@/app/dashboard/supplier/inventory/inventoryTheme";
import { getPriceCurrencies } from "@/app/utils/priceCurrencies";

export default function PriceCurrencySelect({ value, onChange, className = "" }) {
  const t = useTranslations("shared");
  const currencies = getPriceCurrencies(t);

  return (
    <select
      className={`${inv.selectCompact} shrink-0 ${className}`}
      value={value || "TOMAN"}
      onChange={(e) => onChange?.(e.target.value)}
      aria-label={t("priceCurrencySelect.ariaLabel")}
    >
      {currencies.map((c) => (
        <option key={c.code} value={c.code}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
