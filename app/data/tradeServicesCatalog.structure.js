export const SHARED_CATEGORY_IDS = [
  "inspection-standards",
  "packaging-prep",
  "import-export",
  "intl-logistics",
  "customs-clearance",
  "intl-finance",
  "insurance-risk",
  "legal-trade",
  "market-development",
  "specialized-trade",
];

/** Legacy service-request slugs → current L1 category id */
export const LEGACY_SERVICE_TYPE_MAP = {
  trade: "import-export",
  logistics: "intl-logistics",
  customs: "customs-clearance",
  finance: "intl-finance",
  inspection: "inspection-standards",
  insurance: "insurance-risk",
  consulting: "specialized-trade",
  documents: "import-export",
};

export const L1_CATEGORY_IDS = [...SHARED_CATEGORY_IDS];

export function isValidL1CategoryId(id) {
  const normalized = LEGACY_SERVICE_TYPE_MAP[id] || id;
  return L1_CATEGORY_IDS.includes(normalized);
}
