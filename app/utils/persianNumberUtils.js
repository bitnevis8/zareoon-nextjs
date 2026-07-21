import i18nData from "./i18nFaData";

export const PERSIAN_DIGITS = i18nData.persianDigits;
export const ARABIC_DIGITS = i18nData.arabicDigits;

export function toPersianDigits(value) {
  return String(value ?? "").replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function toArabicIndicDigits(value) {
  return String(value ?? "").replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}

/** Western (0-9) digits — strips any Persian/Arabic-Indic numerals first. */
export function toWesternDigits(value) {
  return String(value ?? "")
    .replace(/[۰-۹]/g, (ch) => String(PERSIAN_DIGITS.indexOf(ch)))
    .replace(/[٠-٩]/g, (ch) => String(ARABIC_DIGITS.indexOf(ch)));
}

/**
 * Locale-aware digit shaping for phones, years, etc.
 * fa → Persian · ar → Arabic-Indic · others → Western
 */
export function formatLocalizedDigits(value, language = "fa") {
  const western = toWesternDigits(value);
  if (language === "fa") return toPersianDigits(western);
  if (language === "ar") return toArabicIndicDigits(western);
  return western;
}

export function parsePersianNumber(input) {
  if (input == null || input === "") return null;
  let s = String(input);
  s = s.replace(/[۰-۹]/g, (ch) => String(PERSIAN_DIGITS.indexOf(ch)));
  s = s.replace(/[٠-٩]/g, (ch) => String(ARABIC_DIGITS.indexOf(ch)));
  s = s.replace(/[,٬\s]/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export function parsePersianIntegerInput(input) {
  const n = parsePersianNumber(input);
  if (n == null) return "";
  return String(Math.trunc(n));
}

export function formatPersianInteger(value) {
  if (value === "" || value == null) return "";
  const n = parsePersianNumber(value);
  if (n == null) return String(value);
  return toPersianDigits(Math.trunc(n).toLocaleString("en-US"));
}
