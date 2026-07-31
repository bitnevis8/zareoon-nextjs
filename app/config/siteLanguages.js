/** Supported storefront languages — labels from messages/fa/languages.json */
import languageLabels from "../../messages/fa/languages.json";

/** ترتیب نمایش: فارسی بالا، سپس زبان‌های فعال پیش‌فرض، بعد بقیه */
export const SITE_LANGUAGES = [
  { code: "fa", label: languageLabels.fa, shortLabel: "Fa", countryCode: "IR" },
  { code: "ar", label: languageLabels.ar, shortLabel: "Ar", countryCode: "IQ" },
  { code: "en", label: languageLabels.en, shortLabel: "En", countryCode: "GB" },
  { code: "ru", label: languageLabels.ru, shortLabel: "Ru", countryCode: "RU" },
  { code: "tr", label: languageLabels.tr, shortLabel: "Tr", countryCode: "TR" },
  { code: "es", label: languageLabels.es, shortLabel: "Es", countryCode: "ES" },
  { code: "nl", label: languageLabels.nl, shortLabel: "Nl", countryCode: "NL" },
  { code: "ur", label: languageLabels.ur, shortLabel: "Ur", countryCode: "PK" },
  { code: "fi", label: languageLabels.fi, shortLabel: "Fi", countryCode: "FI" },
];

/** زبان‌های فعال پیش‌فرض فروشگاه */
export const DEFAULT_ENABLED_LANGUAGE_CODES = ["fa", "ar", "en", "ru", "tr"];

/** Order for stacked homepage intro lines */
export const SITE_INTRO_ORDER = ["fa", "ar", "en", "ru", "tr", "ur", "es", "nl", "fi"];

export const SITE_LANGUAGE_CODES = SITE_LANGUAGES.map((item) => item.code);

export function isRtlLanguage(code) {
  return code === "fa" || code === "ar" || code === "ur";
}
