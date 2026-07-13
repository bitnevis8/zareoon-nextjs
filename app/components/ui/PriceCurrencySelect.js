"use client";

import { inv } from "@/app/dashboard/supplier/inventory/inventoryTheme";
import { PRICE_CURRENCIES } from "@/app/utils/priceCurrencies";

export default function PriceCurrencySelect({ value, onChange, className = "" }) {
  return (
    <select
      className={`${inv.selectCompact} shrink-0 ${className}`}
      value={value || "TOMAN"}
      onChange={(e) => onChange?.(e.target.value)}
      aria-label="واحد پول"
    >
      {PRICE_CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
