/** Supported storefront languages — labels from messages/fa/languages.json */
import languageLabels from "../../messages/fa/languages.json";

export const SITE_LANGUAGES = [
  { code: "fa", label: languageLabels.fa, shortLabel: "Fa", countryCode: "IR", flagOnly: true },
  { code: "es", label: languageLabels.es, shortLabel: "Es", countryCode: "ES" },
  { code: "ar", label: languageLabels.ar, shortLabel: "Ar", countryCode: "IQ" },
  { code: "en", label: languageLabels.en, shortLabel: "En", countryCode: "GB" },
  { code: "nl", label: languageLabels.nl, shortLabel: "Nl", countryCode: "NL" },
  { code: "tr", label: languageLabels.tr, shortLabel: "Tr", countryCode: "TR" },
  { code: "ru", label: languageLabels.ru, shortLabel: "Ru", countryCode: "RU" },
  { code: "ur", label: languageLabels.ur, shortLabel: "Ur", countryCode: "PK" },
  { code: "fi", label: languageLabels.fi, shortLabel: "Fi", countryCode: "FI" },
];

/** Order for stacked homepage intro lines — fa, ar, ur, then others */
export const SITE_INTRO_ORDER = ["fa", "ar", "ur", "en", "es", "nl", "tr", "ru", "fi"];

export const SITE_LANGUAGE_CODES = SITE_LANGUAGES.map((item) => item.code);

export function isRtlLanguage(code) {
  return code === "fa" || code === "ar" || code === "ur";
}
