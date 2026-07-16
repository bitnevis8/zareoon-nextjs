export const SUPPLY_COUNTRY_CODES = [
  "IR",
  "AE",
  "SA",
  "IQ",
  "TR",
  "OM",
  "QA",
  "KW",
  "PK",
  "AF",
  "US",
  "RU",
];

/** @deprecated use SUPPLY_COUNTRY_CODES */
export const SUPPLY_COUNTRIES = SUPPLY_COUNTRY_CODES.map((code) => ({ code }));

const countryCodeSet = new Set(SUPPLY_COUNTRY_CODES);

export function getCountryByCode(code) {
  const normalized = String(code || "IR").toUpperCase();
  return countryCodeSet.has(normalized) ? { code: normalized } : { code: "IR" };
}

export function countryCodeToFlag(code) {
  const normalized = String(code || "IR").toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return "🏳️";
  return String.fromCodePoint(
    ...[...normalized].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65)
  );
}

export function countryCodeToFlagUrl(code, width = 40) {
  const normalized = String(code || "IR").toLowerCase();
  if (!/^[a-z]{2}$/.test(normalized)) return null;
  return `https://flagcdn.com/w${width}/${normalized}.png`;
}

export function getSupplyCountryName(code, t) {
  const normalized = getCountryByCode(code).code;
  if (!t) return normalized;
  const key = `supplyCountries.${normalized}`;
  return typeof t.has === "function" && t.has(key) ? t(key) : t(key);
}

export function getSupplyCountryOptions(t) {
  return SUPPLY_COUNTRY_CODES.map((code) => ({
    code,
    label: getSupplyCountryName(code, t),
  }));
}

export function formatSupplySource(product, t) {
  if (!product) return "";
  const countryName = getSupplyCountryName(product.supplyCountry, t);
  const city = String(product.supplyCity || "").trim();
  if (!city) return countryName;
  if (t) return t("supplySource.withCity", { country: countryName, city });
  return `${countryName}، ${city}`;
}
