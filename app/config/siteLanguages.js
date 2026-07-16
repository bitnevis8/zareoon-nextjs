/** Supported storefront languages — labels from messages/fa/languages.json */
import languageLabels from "../../messages/fa/languages.json";

export const SITE_LANGUAGES = [
  { code: "fa", label: languageLabels.fa, shortLabel: "Fa", countryCode: "IR" },
  { code: "en", label: languageLabels.en, shortLabel: "En", countryCode: "GB" },
  { code: "ar", label: languageLabels.ar, shortLabel: "Ar", countryCode: "SA" },
  { code: "ru", label: languageLabels.ru, shortLabel: "Ru", countryCode: "RU" },
  { code: "ur", label: languageLabels.ur, shortLabel: "Ur", countryCode: "PK" },
  { code: "fi", label: languageLabels.fi, shortLabel: "Fi", countryCode: "FI" },
];

/** Order for stacked homepage intro lines */
export const SITE_INTRO_ORDER = ["fa", "ar", "en", "ru", "ur", "fi"];

export const SITE_LANGUAGE_CODES = SITE_LANGUAGES.map((item) => item.code);

export function isRtlLanguage(code) {
  return code === "fa" || code === "ar" || code === "ur";
}
