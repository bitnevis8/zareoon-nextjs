import i18nData from "./i18nFaData";

export function getLocalizedText(entity, language, fallbackKey = "name") {
  if (!entity) return "";
  if (language === "en" && entity.englishName) return entity.englishName;
  if (language === "ru") {
    if (entity.russianName) return entity.russianName;
    if (entity.englishName) return entity.englishName;
  }
  if (language === "ar" && entity.arabicName) return entity.arabicName;
  if (language === "tr" && entity.turkishName) return entity.turkishName;
  if (language === "fi" && entity.finnishName) return entity.finnishName;
  if (language === "es" && entity.spanishName) return entity.spanishName;
  if (language === "nl" && entity.dutchName) return entity.dutchName;
  if (language === "ur" && entity.urduName) return entity.urduName;
  if (entity.translations?.[language]?.name) return entity.translations[language].name;
  if (
    (language === "tr" || language === "fi" || language === "ur" || language === "es" || language === "nl") &&
    entity.englishName
  ) {
    return entity.englishName;
  }
  return entity[fallbackKey] || "";
}

export function getLocalizedLotLabel(lot, language, t) {
  if (!lot) return t ? t("qualityOther") : "";
  const localizedName = getLocalizedText(lot, language, "qualityGrade");
  if (localizedName) return localizedName;
  return localizeGrade(lot.qualityGrade, t);
}

export function getNumberLocale(language) {
  if (language === "en") return "en-US";
  if (language === "es") return "es-ES";
  if (language === "nl") return "nl-NL";
  if (language === "ru") return "ru-RU";
  if (language === "ar") return "ar-EG";
  if (language === "tr") return "tr-TR";
  if (language === "fi") return "fi-FI";
  return "fa-IR";
}

export function formatLocalizedNumber(value, language, options = {}) {
  const numericValue = Number(value || 0);
  return numericValue.toLocaleString(getNumberLocale(language), options);
}

/** Parse user typing with Persian/Arabic digits into a plain number string. */
export function parseLocalizedNumberInput(input) {
  if (input == null || input === "") return "";
  let s = String(input);
  s = s.replace(/[۰-۹]/g, (ch) => String(i18nData.persianDigits.indexOf(ch)));
  s = s.replace(/[٠-٩]/g, (ch) => String(i18nData.arabicDigits.indexOf(ch)));
  s = s.replace(/[,٬\s]/g, "");
  return s;
}

/** Format stored quantity for display in inputs (Persian digits when fa/ar). */
export function formatQuantityForInput(value, language, maxDecimals = 3) {
  if (value === "" || value == null) return "";
  const parsed = parseLocalizedNumberInput(value);
  const n = parseFloat(parsed);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString(getNumberLocale(language), {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
    useGrouping: false,
  });
}

export function formatQuantityWithUnit(value, language, unit, maxDecimals = 3) {
  const n = Number(value || 0);
  const qty = n.toLocaleString(getNumberLocale(language), {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
    useGrouping: false,
  });
  return unit ? `${unit} ${qty}` : qty;
}

export function formatLocalizedPrice(value, language, t) {
  return `${formatLocalizedNumber(value, language)} ${t("currencyToman")}`;
}

export function localizeUnit(unit, language) {
  if (!unit) return "";
  const normalized = String(unit).toLowerCase();
  const units = i18nData.units;
  return units[normalized]?.[language] || units[normalized]?.fa || unit;
}

export function localizePackaging(packaging, language) {
  if (!packaging) return "";
  const key = String(packaging).toLowerCase();
  const packs = i18nData.packaging || {};
  return packs[key]?.[language] || packs[key]?.fa || packaging;
}

export function localizeStatus(status, t) {
  const map = {
    on_field: "statusOnField",
    harvested: "statusHarvested",
    reserved: "statusReserved",
    sold: "statusSold",
  };
  return t(map[status] || status);
}

export function localizeGrade(grade, t) {
  const normalized = String(grade || "").trim();
  const map = i18nData.gradeDbToKey;
  return t(map[normalized] || normalized || "qualityOther");
}
