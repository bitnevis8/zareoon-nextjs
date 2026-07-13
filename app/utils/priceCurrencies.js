/** Supported price currencies for inventory lots. */

export const DEFAULT_PRICE_CURRENCY = "TOMAN";

export const PRICE_CURRENCIES = [
  { code: "TOMAN", label: "تومان", shortLabel: "تومان", wordLabel: "تومان", hasRialSubunit: true },
  { code: "USD", label: "دلار آمریکا", shortLabel: "دلار", wordLabel: "دلار آمریکا" },
  { code: "AED", label: "درهم امارات", shortLabel: "درهم", wordLabel: "درهم امارات" },
  { code: "EUR", label: "یورو", shortLabel: "یورو", wordLabel: "یورو" },
  { code: "GBP", label: "پوند انگلیس", shortLabel: "پوند", wordLabel: "پوند انگلیس" },
  { code: "TRY", label: "لیر ترکیه", shortLabel: "لیر", wordLabel: "لیر ترکیه" },
  { code: "SAR", label: "ریال عربستان", shortLabel: "ریال سعودی", wordLabel: "ریال عربستان" },
  { code: "CNY", label: "یوان چین", shortLabel: "یوان", wordLabel: "یوان چین" },
  { code: "RUB", label: "روبل روسیه", shortLabel: "روبل", wordLabel: "روبل روسیه" },
  { code: "CAD", label: "دلار کانادا", shortLabel: "دلار کانادا", wordLabel: "دلار کانادا" },
  { code: "CHF", label: "فرانک سوئیس", shortLabel: "فرانک", wordLabel: "فرانک سوئیس" },
  { code: "JPY", label: "ین ژاپن", shortLabel: "ین", wordLabel: "ین ژاپن" },
  { code: "AUD", label: "دلار استرالیا", shortLabel: "دلار استرالیا", wordLabel: "دلار استرالیا" },
  { code: "USDT", label: "تتر (USDT)", shortLabel: "USDT", wordLabel: "تتر" },
];

export function getCurrencyDefinition(code) {
  const normalized = String(code || DEFAULT_PRICE_CURRENCY).toUpperCase();
  return PRICE_CURRENCIES.find((c) => c.code === normalized) || PRICE_CURRENCIES[0];
}

export function formatPriceWithCurrency(amount, currencyCode = DEFAULT_PRICE_CURRENCY) {
  if (amount == null || amount === "") return "—";
  const num = Number(amount);
  if (!Number.isFinite(num)) return "—";
  const cur = getCurrencyDefinition(currencyCode);
  return `${num.toLocaleString("fa-IR")} ${cur.shortLabel}`;
}
