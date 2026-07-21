/** Shared SVG path data for trade-service category / subcategory icons. */

export const CATEGORY_ICON_PATHS = {
  "import-export": "M3 7h18M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2M7 11h10M9 15h6M12 7v12",
  "intl-logistics": "M3 16h2l2-7h11l2 5h2M7 16a2 2 0 104 0M15 16a2 2 0 104 0",
  "customs-clearance": "M9 12h6m-8 8h10a2 2 0 002-2V8l-4-4H8L4 8v10a2 2 0 002 2z",
  "intl-finance": "M3 10h18M7 14h.01M11 14h.01M15 14h.01M6 6h12v12H6z",
  "inspection-standards":
    "M9 12l2 2 4-4M7.2 20.2l-4.1-1.1a1 1 0 01-.6-1.3l1.1-4.1 9.9-9.9a2 2 0 012.8 0l1.1 1.1a2 2 0 010 2.8l-9.9 9.9-4.1 1.1z",
  "insurance-risk": "M12 3l8 4v6c0 4.4-3.4 7.7-8 8-4.6-.3-8-3.6-8-8V7l8-4z",
  "legal-trade": "M12 3v18M8 7h8M6 21h12M9 7V5h6v2",
  "market-development": "M4 19V5M4 19h16M8 15l3-4 3 2 4-6",
  "packaging-prep": "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5",
  "specialized-trade": "M8 10h8M8 14h5M12 20a8 8 0 100-16 8 8 0 000 16z",
  "intl-certificates":
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  "export-compliance":
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  "trade-documents": "M8 4h6l4 4v10a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2zM14 4v4h4M9 13h6M9 17h4",
  "supply-chain": "M4 6h4v4H4zM10 6h4v4h-4zM16 6h4v4h-4zM7 14h4v4H7zM13 14h4v4h-4zM9 10v4M15 10v4",
  "ecommerce-marketplace": "M3 9l1-4h16l1 4M4 9v10a1 1 0 001 1h4V13h6v7h4a1 1 0 001-1V9",
  "trade-digital":
    "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "investment-consulting": "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  "trade-events": "M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z",
  "business-immigration":
    "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "esg-sustainability": "M12 3c4 6 6 10 6 13a6 6 0 11-12 0c0-3 2-7 6-13z",
};

/** Distinct stroke paths used for subcategory chips (rotating by id hash). */
const SUBCATEGORY_ICON_POOL = [
  "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  "M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z",
  "M4 19V5M4 19h16M8 15l3-4 3 2 4-6",
  "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  "M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z",
  "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "M12 3l8 4v6c0 4.4-3.4 7.7-8 8-4.6-.3-8-3.6-8-8V7l8-4z",
  "M13 10V3L4 14h7v7l9-11h-7z",
  "M12 3c4 6 6 10 6 13a6 6 0 11-12 0c0-3 2-7 6-13z",
  "M3 7h18M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2M7 11h10M9 15h6M12 7v12",
  "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "M8 4h6l4 4v10a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2zM14 4v4h4",
];

const SUBCATEGORY_ICON_OVERRIDES = {
  "fdi-consulting": "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "business-growth": "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  "feasibility-studies": "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  "export-strategy": "M4 19V5M4 19h16M8 15l3-4 3 2 4-6",
};

function hashId(id) {
  let h = 0;
  const s = String(id || "");
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function getCategoryIconPath(name) {
  return CATEGORY_ICON_PATHS[name] || "M8 6h8M8 10h8M8 14h5M6 4h12v16H6z";
}

export function getSubcategoryIconPath(subcategoryId) {
  if (SUBCATEGORY_ICON_OVERRIDES[subcategoryId]) {
    return SUBCATEGORY_ICON_OVERRIDES[subcategoryId];
  }
  return SUBCATEGORY_ICON_POOL[hashId(subcategoryId) % SUBCATEGORY_ICON_POOL.length];
}
