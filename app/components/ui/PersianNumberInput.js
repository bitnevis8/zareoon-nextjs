"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { formatPersianInteger, parsePersianIntegerInput, parsePersianNumber } from "@/app/utils/persianNumberUtils";
import { getPriceWordSummary, getQuantityWordSummary } from "@/app/utils/currencyInWords";
import { DEFAULT_PRICE_CURRENCY } from "@/app/utils/priceCurrencies";

/**
 * Numeric input with Persian/Arabic digits, thousand separators, and optional word hint.
 * Stores plain ASCII digit string in parent state.
 */
export function PersianNumberInput({
  value = "",
  onChange,
  className = "",
  placeholder = "",
  hint = "",
  unit = "",
  currency = DEFAULT_PRICE_CURRENCY,
  exchangeRates = {},
  disabled = false,
  id,
  name,
}) {
  const t = useTranslations("shared");
  const displayValue = useMemo(() => formatPersianInteger(value), [value]);

  const wordHint = useMemo(() => {
    const num = parsePersianNumber(value);
    if (!num || num <= 0) return "";
    if (hint === "price") return getPriceWordSummary(num, currency, exchangeRates, t);
    if (hint === "quantity" && unit) return getQuantityWordSummary(num, unit);
    if (hint === "quantity") return getQuantityWordSummary(num);
    return "";
  }, [value, hint, unit, currency, exchangeRates, t]);

  const handleChange = (e) => {
    onChange?.(parsePersianIntegerInput(e.target.value));
  };

  return (
    <div>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        dir="ltr"
        className={`text-left tabular-nums ${className}`}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        autoComplete="off"
      />
      {wordHint ? (
        <p className="mt-1 text-[11px] leading-5 text-emerald-800/90">{wordHint}</p>
      ) : null}
    </div>
  );
}

export function PersianPriceInput({ currency, exchangeRates, ...props }) {
  return (
    <PersianNumberInput hint="price" currency={currency} exchangeRates={exchangeRates} {...props} />
  );
}

export function PersianQuantityInput({ unit, ...props }) {
  return <PersianNumberInput hint="quantity" unit={unit} {...props} />;
}

export default PersianNumberInput;
