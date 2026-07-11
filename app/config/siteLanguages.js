/** Supported storefront languages (UI + catalog title fields). */
export const SITE_LANGUAGES = [
  { code: "fa", label: "فارسی", shortLabel: "Fa", countryCode: "IR" },
  { code: "en", label: "English", shortLabel: "En", countryCode: "GB" },
  { code: "ru", label: "Русский", shortLabel: "Ru", countryCode: "RU" },
  { code: "ar", label: "العربية", shortLabel: "Ar", countryCode: "SA" },
  { code: "tr", label: "Türkçe", shortLabel: "Tr", countryCode: "TR" },
  { code: "fi", label: "Suomi", shortLabel: "Fi", countryCode: "FI" },
];

/** Order for stacked homepage intro lines: fa → ar → en → ru → tr → fi */
export const SITE_INTRO_ORDER = ["fa", "ar", "en", "ru", "tr", "fi"];

export const SITE_LANGUAGE_CODES = SITE_LANGUAGES.map((item) => item.code);

export function isRtlLanguage(code) {
  return code === "fa" || code === "ar";
}
