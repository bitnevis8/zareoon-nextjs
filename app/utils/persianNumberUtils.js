const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Normalize Persian/Arabic digits to ASCII 0-9. */
export function toEnglishDigits(value) {
  return String(value ?? "")
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

/** Format integer with Persian digits and thousand separator (٬). */
export function formatPersianInteger(value) {
  const raw = toEnglishDigits(value).replace(/\D/g, "");
  if (!raw) return "";
  const num = Number(raw);
  if (!Number.isFinite(num)) return "";
  return num.toLocaleString("fa-IR");
}

/** Parse user input to plain integer string (ASCII digits only). */
export function parsePersianIntegerInput(value) {
  const raw = toEnglishDigits(value).replace(/\D/g, "");
  if (!raw) return "";
  return String(Number(raw));
}

/** Parse to number or null. */
export function parsePersianNumber(value) {
  const raw = parsePersianIntegerInput(value);
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

export function toPersianDigits(value) {
  return String(value ?? "").replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}
