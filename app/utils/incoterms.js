import {
  INCOTERMS_2020,
  COST_LABELS_FA,
  PARTY_LABELS_FA,
  JOURNEY_STAGES,
} from "@/app/data/incoterms2020";

export function getAllIncoterms() {
  return INCOTERMS_2020;
}

export function getIncotermByCode(code) {
  const c = String(code || "").toUpperCase();
  return INCOTERMS_2020.find((t) => t.code === c || t.id === String(code || "").toLowerCase()) || null;
}

export function partyLabel(key) {
  return PARTY_LABELS_FA[key] || key || "—";
}

export function costRows(term) {
  return Object.entries(COST_LABELS_FA).map(([key, label]) => ({
    key,
    label,
    party: term.costs?.[key] || "none",
    partyLabel: partyLabel(term.costs?.[key]),
  }));
}

export function filterIncoterms(terms, { q = "", mode = "any", group = "" } = {}) {
  const query = String(q || "")
    .trim()
    .toLowerCase();
  return terms.filter((t) => {
    if (group && t.group !== group) return false;
    const modes = t.transportModes || [];
    if (mode === "sea") {
      if (!modes.includes("sea") && !modes.includes("any")) return false;
    } else if (mode === "multimodal") {
      // شرایط مخصوص فقط‌دریا را حذف می‌کند
      if (modes.length === 1 && modes[0] === "sea") return false;
    }
    if (!query) return true;
    const hay = [
      t.code,
      t.nameFa,
      t.nameEn,
      t.summary,
      ...(t.tags || []),
      ...(t.sellerDuties || []),
      ...(t.buyerDuties || []),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(query);
  });
}

export function compareIncoterms(codes) {
  const list = codes.map((c) => getIncotermByCode(c)).filter(Boolean);
  return list;
}

export function journeyStages() {
  return JOURNEY_STAGES;
}
