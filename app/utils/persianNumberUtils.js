import i18nData from "./i18nFaData";

export const PERSIAN_DIGITS = i18nData.persianDigits;
export const ARABIC_DIGITS = i18nData.arabicDigits;

export function toPersianDigits(value) {
  return String(value ?? "").replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
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
