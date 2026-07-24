import { UNIT_CATEGORIES, UNIT_CONVERTER_META } from "@/app/data/tradeUnits";

export { UNIT_CONVERTER_META };

export function getCategories() {
  return UNIT_CATEGORIES;
}

export function getCategoryById(id) {
  return UNIT_CATEGORIES.find((c) => c.id === id) || UNIT_CATEGORIES[0];
}

export function findUnit(category, unitId) {
  if (!category) return null;
  return (category.units || []).find((u) => u.id === unitId) || null;
}

function normalizeQuery(q) {
  return String(q || "")
    .trim()
    .toLowerCase()
    .replace(/²/g, "2")
    .replace(/³/g, "3");
}

export function unitMatchesQuery(unit, query) {
  const q = normalizeQuery(query);
  if (!q) return true;
  const hay = [unit.id, unit.symbol, unit.nameFa, unit.nameEn, ...(unit.aliases || [])]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function filterUnits(category, query) {
  const units = category?.units || [];
  if (!normalizeQuery(query)) return units;
  return units.filter((u) => unitMatchesQuery(u, query));
}

export function searchAcrossCategories(query) {
  const q = normalizeQuery(query);
  if (!q) return [];
  const hits = [];
  for (const cat of UNIT_CATEGORIES) {
    for (const unit of cat.units || []) {
      if (unitMatchesQuery(unit, q)) {
        hits.push({ categoryId: cat.id, categoryNameFa: cat.nameFa, unit });
      }
    }
  }
  return hits.slice(0, 24);
}

/** دما → سلسیوس */
function toCelsius(value, formula) {
  switch (formula) {
    case "fahrenheit":
      return ((value - 32) * 5) / 9;
    case "kelvin":
      return value - 273.15;
    default:
      return value;
  }
}

function fromCelsius(celsius, formula) {
  switch (formula) {
    case "fahrenheit":
      return (celsius * 9) / 5 + 32;
    case "kelvin":
      return celsius + 273.15;
    default:
      return celsius;
  }
}

/** مصرف سوخت → L/100km */
function toL100km(value, formula) {
  if (!Number.isFinite(value) || value === 0) return NaN;
  switch (formula) {
    case "mpg_us":
      return 235.214583 / value;
    case "mpg_uk":
      return 282.4809363 / value;
    case "km_l":
      return 100 / value;
    default:
      return value;
  }
}

function fromL100km(l100, formula) {
  if (!Number.isFinite(l100) || l100 === 0) return NaN;
  switch (formula) {
    case "mpg_us":
      return 235.214583 / l100;
    case "mpg_uk":
      return 282.4809363 / l100;
    case "km_l":
      return 100 / l100;
    default:
      return l100;
  }
}

/**
 * تبدیل مقدار بین دو واحد هم‌دسته
 * @returns {{ result: number|null, factor: number|null, formulaText: string, error?: string }}
 */
export function convertValue(category, fromUnit, toUnit, amount) {
  const n = typeof amount === "number" ? amount : Number(String(amount).replace(/,/g, ""));
  if (!category || !fromUnit || !toUnit) {
    return { result: null, factor: null, formulaText: "", error: "واحد نامعتبر" };
  }
  if (!Number.isFinite(n)) {
    return { result: null, factor: null, formulaText: "", error: "مقدار نامعتبر" };
  }

  const kind = category.kind || "linear";

  if (kind === "temperature") {
    const c = toCelsius(n, fromUnit.formula);
    const result = fromCelsius(c, toUnit.formula);
    return {
      result,
      factor: null,
      formulaText: formulaTempText(fromUnit, toUnit),
    };
  }

  if (kind === "fuel") {
    const base = toL100km(n, fromUnit.formula);
    const result = fromL100km(base, toUnit.formula);
    return {
      result: Number.isFinite(result) ? result : null,
      factor: null,
      formulaText: "تبدیل مصرف سوخت با فرمول استاندارد (L/100km ↔ mpg / km/L)",
      error: Number.isFinite(result) ? undefined : "مقدار صفر برای این تبدیل مجاز نیست",
    };
  }

  const fromF = Number(fromUnit.toBase);
  const toF = Number(toUnit.toBase);
  if (!Number.isFinite(fromF) || !Number.isFinite(toF) || toF === 0) {
    return { result: null, factor: null, formulaText: "", error: "ضریب تبدیل نامعتبر" };
  }

  const result = (n * fromF) / toF;
  const factor = fromF / toF;
  return {
    result,
    factor,
    formulaText: `۱ ${fromUnit.symbol} = ${formatSmart(factor)} ${toUnit.symbol}`,
  };
}

function formulaTempText(fromU, toU) {
  if (fromU.id === toU.id) return "واحد مبدأ و مقصد یکسان است.";
  const map = {
    "c-f": "°F = (°C × ۹/۵) + ۳۲",
    "f-c": "°C = (°F − ۳۲) × ۵/۹",
    "c-k": "K = °C + ۲۷۳٫۱۵",
    "k-c": "°C = K − ۲۷۳٫۱۵",
    "f-k": "K = (°F − ۳۲) × ۵/۹ + ۲۷۳٫۱۵",
    "k-f": "°F = (K − ۲۷۳٫۱۵) × ۹/۵ + ۳۲",
  };
  return map[`${fromU.id}-${toU.id}`] || "تبدیل دما با فرمول استاندارد";
}

export function formatSmart(value, { maxFrac = 8 } = {}) {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-4 || abs >= 1e9)) {
    return value.toExponential(4).replace("e+", "×10^").replace("e-", "×10^−");
  }
  const fixed = Number(value.toPrecision(12));
  const str = fixed.toLocaleString("en-US", {
    maximumFractionDigits: maxFrac,
    useGrouping: true,
  });
  return str;
}

export function formatFaDigits(enFormatted, useFa = true) {
  if (!useFa) return enFormatted;
  const map = "۰۱۲۳۴۵۶۷۸۹";
  return String(enFormatted).replace(/\d/g, (d) => map[d]);
}
