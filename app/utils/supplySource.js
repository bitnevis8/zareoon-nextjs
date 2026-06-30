export const SUPPLY_COUNTRIES = [
  { code: "IR", nameFa: "ایران", nameEn: "Iran", nameRu: "Иран" },
  { code: "AE", nameFa: "امارات", nameEn: "UAE", nameRu: "ОАЭ" },
  { code: "SA", nameFa: "عربستان", nameEn: "Saudi Arabia", nameRu: "Саудовская Аравия" },
  { code: "IQ", nameFa: "عراق", nameEn: "Iraq", nameRu: "Ирак" },
  { code: "TR", nameFa: "ترکیه", nameEn: "Turkey", nameRu: "Турция" },
  { code: "OM", nameFa: "عمان", nameEn: "Oman", nameRu: "Оман" },
  { code: "QA", nameFa: "قطر", nameEn: "Qatar", nameRu: "Катар" },
  { code: "KW", nameFa: "کویت", nameEn: "Kuwait", nameRu: "Кувейт" },
  { code: "PK", nameFa: "پاکستان", nameEn: "Pakistan", nameRu: "Пакистан" },
  { code: "AF", nameFa: "افغانستان", nameEn: "Afghanistan", nameRu: "Афганистан" },
  { code: "US", nameFa: "آمریکا", nameEn: "United States", nameRu: "США" },
  { code: "RU", nameFa: "روسیه", nameEn: "Russia", nameRu: "Россия" },
];

const countryByCode = Object.fromEntries(SUPPLY_COUNTRIES.map((c) => [c.code, c]));

export function getCountryByCode(code) {
  return countryByCode[String(code || "IR").toUpperCase()] || countryByCode.IR;
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

export function getSupplyCountryName(code, language = "fa") {
  const country = getCountryByCode(code);
  if (language === "en") return country.nameEn;
  if (language === "ru") return country.nameRu;
  return country.nameFa;
}

export function formatSupplySource(product, language = "fa") {
  if (!product) return "";
  const countryName = getSupplyCountryName(product.supplyCountry, language);
  const city = String(product.supplyCity || "").trim();
  return city ? `${countryName}، ${city}` : countryName;
}
