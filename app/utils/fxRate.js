import { DEFAULT_PRICE_CURRENCY } from "@/app/utils/priceCurrencies";

/** ارزهای ریالی/تومانی که نیاز به نرخ تبدیل ندارند */
export function isDomesticCurrency(code) {
  const c = String(code || DEFAULT_PRICE_CURRENCY).toUpperCase();
  return c === "TOMAN" || c === "IRT" || c === "IRR";
}

/** نرخ زارعون از API معمولاً به ریال است → تومان */
export function zareoonRialToToman(rateInRial) {
  const n = Number(rateInRial);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n / 10;
}

/**
 * نرخ تبدیل به تومان برای ۱ واحد ارز قیمت
 * @returns {number|null}
 */
export function resolveFxRateToman({
  currency,
  fxRateSource,
  fxRateManual,
  exchangeRates = {},
}) {
  if (isDomesticCurrency(currency)) return 1;

  if (fxRateSource === "manual") {
    const n = Number(fxRateManual);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  // zareoon یا پیش‌فرض
  return zareoonRialToToman(exchangeRates?.[String(currency || "").toUpperCase()]);
}

export function toTomanEquivalent(amount, rateToman) {
  const a = Number(amount);
  const r = Number(rateToman);
  if (!Number.isFinite(a) || !Number.isFinite(r) || a < 0 || r <= 0) return null;
  return a * r;
}

export function normalizeFxFieldsForCurrency(currency, fxRateSource, fxRateManual) {
  if (isDomesticCurrency(currency)) {
    return { fxRateSource: null, fxRateManual: null };
  }
  const source = fxRateSource === "manual" ? "manual" : "zareoon";
  return {
    fxRateSource: source,
    fxRateManual:
      source === "manual" && fxRateManual !== "" && fxRateManual != null
        ? Number(fxRateManual)
        : null,
  };
}
