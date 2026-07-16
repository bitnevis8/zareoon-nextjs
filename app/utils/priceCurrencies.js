/** Supported price currencies for inventory lots. */

export const DEFAULT_PRICE_CURRENCY = "TOMAN";

export const PRICE_CURRENCY_CODES = [
  "TOMAN",
  "USD",
  "AED",
  "EUR",
  "GBP",
  "TRY",
  "SAR",
  "CNY",
  "RUB",
  "CAD",
  "CHF",
  "JPY",
  "AUD",
  "USDT",
];

const CURRENCY_META = {
  TOMAN: { hasRialSubunit: true },
};

export function getPriceCurrency(code, t) {
  const normalized = String(code || DEFAULT_PRICE_CURRENCY).toUpperCase();
  const meta = CURRENCY_META[normalized] || {};
  const labels = t?.raw?.(`currencies.${normalized}`) || {};
  return {
    code: normalized,
    label: labels.label || normalized,
    shortLabel: labels.shortLabel || normalized,
    wordLabel: labels.wordLabel || normalized,
    hasRialSubunit: Boolean(meta.hasRialSubunit),
  };
}

export function getPriceCurrencies(t) {
  return PRICE_CURRENCY_CODES.map((code) => getPriceCurrency(code, t));
}

/** @deprecated use getPriceCurrencies(t) */
export const PRICE_CURRENCIES = PRICE_CURRENCY_CODES.map((code) => ({ code }));

export function getCurrencyDefinition(code, t) {
  return getPriceCurrency(code, t);
}

export function formatPriceWithCurrency(amount, currencyCode = DEFAULT_PRICE_CURRENCY, t) {
  if (amount == null || amount === "") return "—";
  const num = Number(amount);
  if (!Number.isFinite(num)) return "—";
  const cur = getCurrencyDefinition(currencyCode, t);
  return `${num.toLocaleString("fa-IR")} ${cur.shortLabel}`;
}
