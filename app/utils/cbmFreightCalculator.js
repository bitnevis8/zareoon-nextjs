/**
 * محاسبات CBM، وزن حجمی و پیشنهاد حمل
 * واحد ابعاد پیش‌فرض: سانتی‌متر | وزن: کیلوگرم
 */

export const TRANSPORT_MODES = [
  { id: "auto", label: "پیشنهاد خودکار" },
  { id: "sea", label: "دریایی" },
  { id: "air", label: "هوایی" },
  { id: "road", label: "زمینی" },
  { id: "rail", label: "ریلی" },
];

/** ضرایب وزن حجمی تقریبی صنعت (kg در هر CBM) */
export const VOLUMETRIC_FACTORS = {
  air: 167,
  sea: 1000,
  road: 333,
  rail: 333,
};

export const CONTAINER_TYPES = [
  { id: "20ft", label: "کانتینر ۲۰ فوت", cbm: 28, teu: 1 },
  { id: "40ft", label: "کانتینر ۴۰ فوت", cbm: 58, teu: 2 },
  { id: "40hc", label: "کانتینر ۴۰ فوت HC", cbm: 68, teu: 2 },
];

function num(v) {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * @param {{ lengthCm: number, widthCm: number, heightCm: number, packages: number, weightKg: number }[]} packages
 */
export function calcPackageTotals(packages = []) {
  let totalCbm = 0;
  let totalWeightKg = 0;
  let totalPackages = 0;

  for (const p of packages) {
    const qty = Math.max(0, num(p.packages));
    const l = Math.max(0, num(p.lengthCm));
    const w = Math.max(0, num(p.widthCm));
    const h = Math.max(0, num(p.heightCm));
    const wt = Math.max(0, num(p.weightKg));
    const cbmEach = (l * w * h) / 1_000_000;
    totalCbm += cbmEach * qty;
    totalWeightKg += wt * qty;
    totalPackages += qty;
  }

  return {
    totalCbm,
    totalWeightKg,
    totalPackages,
    densityKgPerCbm: totalCbm > 0 ? totalWeightKg / totalCbm : 0,
  };
}

export function calcVolumetricWeightKg(cbm, mode) {
  const factor = VOLUMETRIC_FACTORS[mode] || VOLUMETRIC_FACTORS.air;
  return cbm * factor;
}

/**
 * وزن قابل محاسبه (Chargeable)
 * هوایی: max(واقعی، حجمی)
 * دریایی/زمینی LCL: معمولاً max بر حسب تن یا CBM (قانون ۱CBM≈۱تن)
 */
export function calcChargeable({ totalCbm, totalWeightKg, mode }) {
  if (mode === "air") {
    const volumetricKg = calcVolumetricWeightKg(totalCbm, "air");
    return {
      chargeableKg: Math.max(totalWeightKg, volumetricKg),
      chargeableCbm: totalCbm,
      basis: totalWeightKg >= volumetricKg ? "weight" : "volume",
      volumetricKg,
    };
  }

  const weightTons = totalWeightKg / 1000;
  const measure = Math.max(weightTons, totalCbm);
  return {
    chargeableKg: measure * 1000,
    chargeableCbm: measure,
    basis: weightTons >= totalCbm ? "weight" : "volume",
    volumetricKg: calcVolumetricWeightKg(totalCbm, mode === "sea" ? "sea" : "road"),
  };
}

export function suggestLoadType(totalCbm) {
  if (totalCbm <= 0) return { type: "—", label: "—", reason: "" };
  if (totalCbm < 15) {
    return {
      type: "LCL",
      label: "خرده‌بار (LCL)",
      reason: "حجم کمتر از حدود ۱۵ CBM معمولاً برای خرده‌بار دریایی مناسب‌تر است.",
    };
  }
  if (totalCbm < 28) {
    return {
      type: "FCL_OR_LCL",
      label: "مقایسه LCL و کانتینر ۲۰ فوت",
      reason: "نزدیک به ظرفیت ۲۰ فوت هستید؛ هزینه LCL را با یک کانتینر کامل مقایسه کنید.",
    };
  }
  return {
    type: "FCL",
    label: "کانتینر کامل (FCL)",
    reason: "حجم بالا معمولاً با کانتینر کامل به‌صرفه‌تر از خرده‌بار است.",
  };
}

export function suggestContainers(totalCbm) {
  if (totalCbm <= 0) return [];
  return CONTAINER_TYPES.map((c) => {
    const count = Math.max(1, Math.ceil(totalCbm / c.cbm));
    const capacity = count * c.cbm;
    return {
      ...c,
      count,
      fillPercent: capacity > 0 ? Math.min(100, (totalCbm / capacity) * 100) : 0,
    };
  });
}

export function suggestTransportMode({ totalCbm, totalWeightKg, preferredMode }) {
  if (preferredMode && preferredMode !== "auto") {
    return {
      mode: preferredMode,
      label: TRANSPORT_MODES.find((m) => m.id === preferredMode)?.label || preferredMode,
      reason: "بر اساس انتخاب شما.",
    };
  }

  const density = totalCbm > 0 ? totalWeightKg / totalCbm : 0;

  if (totalCbm > 0 && totalCbm < 2 && density < 150) {
    return {
      mode: "air",
      label: "هوایی",
      reason: "حجم کم و چگالی پایین؛ هوایی می‌تواند برای محموله‌های سبک و فوری مناسب باشد.",
    };
  }
  if (totalCbm >= 10 || density >= 250) {
    return {
      mode: "sea",
      label: "دریایی",
      reason: "حجم یا وزن نسبتاً بالا؛ دریایی معمولاً اقتصادی‌ترین گزینه برای بین‌الملل است.",
    };
  }
  if (totalCbm > 0 && totalCbm < 10) {
    return {
      mode: "road",
      label: "زمینی / ترکیبی",
      reason: "برای مسیرهای منطقه‌ای یا اتصال به بندر، زمینی یا ترکیبی رایج است.",
    };
  }
  return {
    mode: "sea",
    label: "دریایی",
    reason: "پیشنهاد پیش‌فرض برای برآورد اولیه حمل بین‌المللی.",
  };
}

export function estimateFreightCost({
  mode,
  chargeableCbm,
  chargeableKg,
  ratePerCbm,
  ratePerKg,
}) {
  const rCbm = Math.max(0, num(ratePerCbm));
  const rKg = Math.max(0, num(ratePerKg));
  if (rCbm <= 0 && rKg <= 0) {
    return { amount: null, currencyNote: "تعرفه وارد نشده — فقط استعلام" };
  }

  let amount = 0;
  let breakdown = [];
  if (mode === "air" && rKg > 0) {
    amount = chargeableKg * rKg;
    breakdown.push({ label: "بر اساس کیلوگرم قابل محاسبه", amount });
  } else if (rCbm > 0) {
    amount = chargeableCbm * rCbm;
    breakdown.push({ label: "بر اساس CBM / واحد حجمی", amount });
  } else if (rKg > 0) {
    amount = chargeableKg * rKg;
    breakdown.push({ label: "بر اساس کیلوگرم", amount });
  }

  return { amount, breakdown, currencyNote: "برآورد اولیه با تعرفه واردشده شما" };
}

export function runFreightCalculation(input) {
  const packages = Array.isArray(input.packages) ? input.packages : [];
  const totals = calcPackageTotals(packages);
  const preferredMode = input.transportMode || "auto";
  const suggestion = suggestTransportMode({
    ...totals,
    preferredMode,
  });
  const mode = suggestion.mode;
  const chargeable = calcChargeable({ ...totals, mode });
  const loadType = suggestLoadType(totals.totalCbm);
  const containers = suggestContainers(totals.totalCbm);
  const cost = estimateFreightCost({
    mode,
    chargeableCbm: chargeable.chargeableCbm,
    chargeableKg: chargeable.chargeableKg,
    ratePerCbm: input.ratePerCbm,
    ratePerKg: input.ratePerKg,
  });

  return {
    origin: String(input.origin || "").trim(),
    destination: String(input.destination || "").trim(),
    ...totals,
    mode,
    modeLabel: suggestion.label,
    modeReason: suggestion.reason,
    ...chargeable,
    loadType,
    containers,
    cost,
  };
}

export function formatNumber(value, digits = 2) {
  const n = num(value);
  return n.toLocaleString("fa-IR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}
