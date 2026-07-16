import { parsePersianNumber } from "./persianNumberUtils";
import { DEFAULT_PRICE_CURRENCY, getCurrencyDefinition } from "./priceCurrencies";
import i18nData from "./i18nFaData";

const { ones: ONES, teens: TEENS, tens: TENS, hundreds: HUNDREDS, scales: SCALES, zero: ZERO, negative: NEGATIVE, and: AND, oneScale: ONE_SCALE, tomanEquivalent: TOMAN_EQ, currencyEquivalent: CURR_EQ, defaultUnit: DEFAULT_UNIT } = {
  ones: i18nData.numerals.ones,
  teens: i18nData.numerals.teens,
  tens: i18nData.numerals.tens,
  hundreds: i18nData.numerals.hundreds,
  scales: i18nData.numerals.scales,
  zero: i18nData.numerals.zero,
  negative: i18nData.numerals.negative,
  and: i18nData.numerals.and,
  oneScale: i18nData.numerals.oneScale,
  tomanEquivalent: i18nData.numerals.tomanEquivalent,
  currencyEquivalent: i18nData.numerals.currencyEquivalent,
  defaultUnit: i18nData.numerals.defaultUnit,
};

function joinParts(parts) {
  return parts.filter(Boolean).join(AND);
}

function twoDigitWords(n) {
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return one ? `${TENS[ten]}${AND}${ONES[one]}` : TENS[ten];
}

function threeDigitWords(n) {
  if (n === 0) return "";
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const parts = [];
  if (hundred) parts.push(HUNDREDS[hundred]);
  if (rest) parts.push(twoDigitWords(rest));
  return joinParts(parts);
}

export function numberToPersianWords(input) {
  const num = typeof input === "number" ? input : parsePersianNumber(input);
  if (num == null || !Number.isFinite(num)) return "";
  if (num === 0) return ZERO;
  if (num < 0) return `${NEGATIVE} ${numberToPersianWords(Math.abs(num))}`;

  let remaining = Math.floor(num);
  const groups = [];

  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts = groups
    .map((group, index) => {
      if (group === 0) return "";
      const scale = SCALES[index];
      const words = threeDigitWords(group);
      if (!scale) return words;
      if (group === 1) return ONE_SCALE.replace("{scale}", scale);
      return `${words} ${scale}`;
    })
    .filter(Boolean)
    .reverse();

  return joinParts(parts);
}

export function getPriceWordSummary(amount, currencyCode = DEFAULT_PRICE_CURRENCY, exchangeRates = {}, t) {
  const num = typeof amount === "number" ? amount : parsePersianNumber(amount);
  if (num == null || num <= 0) return "";

  const currency = getCurrencyDefinition(currencyCode, t);
  const words = numberToPersianWords(num);

  if (currency.code === "TOMAN") {
    const rial = Math.round(num * 10);
    return TOMAN_EQ.replace("{words}", words).replace("{rialWords}", numberToPersianWords(rial));
  }

  let summary = `${words} ${currency.wordLabel}`;
  const rateInRial = exchangeRates[currency.code];
  if (rateInRial && rateInRial > 0) {
    const rialTotal = Math.round(num * rateInRial);
    const tomanTotal = Math.floor(rialTotal / 10);
    if (tomanTotal > 0) {
      summary += CURR_EQ.replace("{tomanWords}", numberToPersianWords(tomanTotal)).replace(
        "{rialWords}",
        numberToPersianWords(rialTotal)
      );
    }
  }

  return summary;
}

export function getQuantityWordSummary(value, unit = DEFAULT_UNIT) {
  const num = typeof value === "number" ? value : parsePersianNumber(value);
  if (num == null || num <= 0) return "";
  return `${numberToPersianWords(num)} ${unit}`;
}
