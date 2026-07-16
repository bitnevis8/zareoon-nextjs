/** Currencies supported in escrow agreements (IRR is default). */

export const DEFAULT_ESCROW_CURRENCY = "IRR";

export const ESCROW_CURRENCY_CODES = ["IRR", "USD", "EUR", "AED", "TRY"];

const CURRENCY_META = {
  IRR: { integerOnly: true },
  USD: { integerOnly: false },
  EUR: { integerOnly: false },
  AED: { integerOnly: false },
  TRY: { integerOnly: false },
};

export function getEscrowCurrency(code, t) {
  const normalized = String(code || DEFAULT_ESCROW_CURRENCY).toUpperCase();
  const meta = CURRENCY_META[normalized] || CURRENCY_META.IRR;
  const labels = t?.raw?.(`currencies.${normalized}`) || {};
  return {
    code: normalized,
    label: labels.label || normalized,
    shortLabel: labels.shortLabel || normalized,
    hint: labels.hint || "",
    integerOnly: meta.integerOnly,
  };
}

export function getEscrowCurrencies(t) {
  return ESCROW_CURRENCY_CODES.map((code) => getEscrowCurrency(code, t));
}

/** @deprecated use getEscrowCurrencies(t) */
export const ESCROW_CURRENCIES = ESCROW_CURRENCY_CODES.map((code) => ({
  code,
  ...CURRENCY_META[code],
}));

export function formatEscrowMoney(amount, currencyCode = DEFAULT_ESCROW_CURRENCY, t) {
  const n = Number(amount || 0);
  if (!Number.isFinite(n)) return "—";
  const cur = getEscrowCurrency(currencyCode, t);
  return `${n.toLocaleString("fa-IR")} ${cur.shortLabel}`;
}
