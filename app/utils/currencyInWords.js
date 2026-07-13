import { parsePersianNumber } from "./persianNumberUtils";
import { DEFAULT_PRICE_CURRENCY, getCurrencyDefinition } from "./priceCurrencies";

const ONES = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const TEENS = [
  "ده",
  "یازده",
  "دوازده",
  "سیزده",
  "چهارده",
  "پانزده",
  "شانزده",
  "هفده",
  "هجده",
  "نوزده",
];
const TENS = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const HUNDREDS = [
  "",
  "یکصد",
  "دویست",
  "سیصد",
  "چهارصد",
  "پانصد",
  "ششصد",
  "هفتصد",
  "هشتصد",
  "نهصد",
];
const SCALES = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

function joinParts(parts) {
  return parts.filter(Boolean).join(" و ");
}

function twoDigitWords(n) {
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return one ? `${TENS[ten]} و ${ONES[one]}` : TENS[ten];
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

/** Convert a positive integer to Persian words. */
export function numberToPersianWords(input) {
  const num = typeof input === "number" ? input : parsePersianNumber(input);
  if (num == null || !Number.isFinite(num)) return "";
  if (num === 0) return "صفر";
  if (num < 0) return `منفی ${numberToPersianWords(Math.abs(num))}`;

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
      if (group === 1) return `یک ${scale}`;
      return `${words} ${scale}`;
    })
    .filter(Boolean)
    .reverse();

  return joinParts(parts);
}

/** Price amount → Persian word summary with optional IRR/TOMAN equivalent. */
export function getPriceWordSummary(amount, currencyCode = DEFAULT_PRICE_CURRENCY, exchangeRates = {}) {
  const num = typeof amount === "number" ? amount : parsePersianNumber(amount);
  if (num == null || num <= 0) return "";

  const currency = getCurrencyDefinition(currencyCode);
  const words = numberToPersianWords(num);

  if (currency.code === "TOMAN") {
    const rial = Math.round(num * 10);
    return `${words} تومان — معادل ${numberToPersianWords(rial)} ریال`;
  }

  let summary = `${words} ${currency.wordLabel}`;
  const rateInRial = exchangeRates[currency.code];
  if (rateInRial && rateInRial > 0) {
    const rialTotal = Math.round(num * rateInRial);
    const tomanTotal = Math.floor(rialTotal / 10);
    if (tomanTotal > 0) {
      summary += ` — معادل ${numberToPersianWords(tomanTotal)} تومان (${numberToPersianWords(rialTotal)} ریال)`;
    }
  }

  return summary;
}

export function getQuantityWordSummary(value, unit = "واحد") {
  const num = typeof value === "number" ? value : parsePersianNumber(value);
  if (num == null || num <= 0) return "";
  return `${numberToPersianWords(num)} ${unit}`;
}
