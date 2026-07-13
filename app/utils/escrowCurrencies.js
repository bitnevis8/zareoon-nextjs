/** Currencies supported in escrow agreements (IRR is default). */

export const DEFAULT_ESCROW_CURRENCY = "IRR";

export const ESCROW_CURRENCIES = [
  {
    code: "IRR",
    label: "ریال ایران",
    shortLabel: "ریال",
    hint: "واحد پول ملی — مبالغ به ریال وارد شود",
    integerOnly: true,
  },
  {
    code: "USD",
    label: "دلار آمریکا",
    shortLabel: "دلار",
    hint: "United States Dollar (USD)",
    integerOnly: false,
  },
  {
    code: "EUR",
    label: "یورو",
    shortLabel: "یورو",
    hint: "Euro (EUR)",
    integerOnly: false,
  },
  {
    code: "AED",
    label: "درهم امارات",
    shortLabel: "درهم",
    hint: "UAE Dirham (AED)",
    integerOnly: false,
  },
  {
    code: "TRY",
    label: "لیر ترکیه",
    shortLabel: "لیر",
    hint: "Turkish Lira (TRY)",
    integerOnly: false,
  },
];

export function getEscrowCurrency(code) {
  const normalized = String(code || DEFAULT_ESCROW_CURRENCY).toUpperCase();
  return ESCROW_CURRENCIES.find((c) => c.code === normalized) || ESCROW_CURRENCIES[0];
}

export function formatEscrowMoney(amount, currencyCode = DEFAULT_ESCROW_CURRENCY) {
  const n = Number(amount || 0);
  if (!Number.isFinite(n)) return "—";
  const cur = getEscrowCurrency(currencyCode);
  return `${n.toLocaleString("fa-IR")} ${cur.shortLabel}`;
}
