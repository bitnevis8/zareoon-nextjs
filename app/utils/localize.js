export function getLocalizedText(entity, language, fallbackKey = "name") {
  if (!entity) return "";
  if (language === "en" && entity.englishName) return entity.englishName;
  if (language === "ru") {
    if (entity.russianName) return entity.russianName;
    if (entity.englishName) return entity.englishName;
  }
  if (language === "ar" && entity.arabicName) return entity.arabicName;
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
  if (language === "ru") return "ru-RU";
  if (language === "ar") return "ar-EG";
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
  s = s.replace(/[۰-۹]/g, (ch) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(ch)));
  s = s.replace(/[٠-٩]/g, (ch) => String("٠١٢٣٤٥٦٧٨٩".indexOf(ch)));
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
  const units = {
    kg: { fa: "کیلوگرم", en: "kg", ru: "кг", ar: "كجم" },
    ton: { fa: "تن", en: "ton", ru: "т", ar: "طن" },
  };
  return units[normalized]?.[language] || units[normalized]?.fa || unit;
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
  const map = {
    "صادراتی": "qualityExport",
    "درجه 1": "qualityGrade1",
    "درجه 2": "qualityGrade2",
    "درجه 3": "qualityGrade3",
    "ضایعاتی": "qualityWaste",
    "سایر": "qualityOther",
  };
  return t(map[normalized] || normalized || "qualityOther");
}
