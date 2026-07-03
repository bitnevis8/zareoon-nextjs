import { getLocalizedLotLabel, localizeGrade } from "./localize";

export const GRADE_ORDER = ["صادراتی", "درجه 1", "درجه 2", "درجه 3", "ضایعاتی", "سایر"];

export function normalizeQualityGrade(val) {
  const v = (val || "").toString().trim();
  if (GRADE_ORDER.slice(0, 5).includes(v)) return v;
  if (v === "درجه یک") return "درجه 1";
  if (v === "درجه دو") return "درجه 2";
  if (v === "درجه سه") return "درجه 3";
  return "سایر";
}

/** Unique key per actual quality grade (e.g. جامبو and درجه 1 stay separate). */
export function getLotGradeKey(lot) {
  const raw = (lot?.qualityGrade || "").toString().trim();
  return raw || `lot-${lot?.id ?? "unknown"}`;
}

export function getGradeDisplayLabel(lots = [], language, t) {
  const lot = lots[0];
  if (lot) return getLocalizedLotLabel(lot, language, t);
  return t("qualityOther");
}

export function sortGradeKeys(keys = []) {
  return [...keys].sort((a, b) => {
    const aNorm = normalizeQualityGrade(a);
    const bNorm = normalizeQualityGrade(b);
    const aIdx = GRADE_ORDER.indexOf(aNorm);
    const bIdx = GRADE_ORDER.indexOf(bNorm);
    const aRank = aIdx >= 0 ? aIdx : 100;
    const bRank = bIdx >= 0 ? bIdx : 100;
    if (aRank !== bRank) return aRank - bRank;
    if (aNorm === "سایر" && bNorm === "سایر" && a !== b) return a.localeCompare(b, "fa");
    return a.localeCompare(b, "fa");
  });
}

export function lotAvailableQuantity(lot) {
  return Math.max(0, parseFloat(lot?.totalQuantity || 0) - parseFloat(lot?.reservedQuantity || 0));
}

export function groupLotsByGrade(lots = []) {
  const map = new Map();
  for (const lot of lots) {
    const key = getLotGradeKey(lot);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(lot);
  }

  return sortGradeKeys([...map.keys()]).map((grade) => {
    const gradeLots = map.get(grade);
    return {
      grade,
      lots: gradeLots,
      available: gradeLots.reduce((sum, lot) => sum + lotAvailableQuantity(lot), 0),
    };
  });
}

export function buildGradeSummary(lots = []) {
  return groupLotsByGrade(lots).map(({ grade, lots: gradeLots, available }) => {
    let total = 0;
    let reserved = 0;
    for (const lot of gradeLots) {
      total += parseFloat(lot.totalQuantity || 0);
      reserved += parseFloat(lot.reservedQuantity || 0);
    }
    return {
      grade,
      lots: gradeLots,
      total,
      reserved,
      count: gradeLots.length,
      available,
    };
  });
}

/** Tab/overview label — uses lot name for custom grades like جامبو. */
export function getGradeTabLabel(gradeKey, lots, language, t) {
  if (lots?.length) return getGradeDisplayLabel(lots, language, t);
  return localizeGrade(gradeKey, t);
}
