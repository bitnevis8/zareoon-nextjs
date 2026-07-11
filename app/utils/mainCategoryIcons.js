/** Icons for top-level catalog roots (by stable product id). */
const MAIN_ROOT_ICONS_BY_ID = {
  900001: "🌾", // محصولات کشاورزی
  900002: "🍽️", // مواد غذایی و نوشیدنی (فرآورده — نه میوه خام)
  900003: "🧪", // فلزات، مواد معدنی و مواد شیمیایی
  900004: "⚙️", // ماشین‌آلات و تجهیزات صنعتی
  900005: "🏗️", // ساختمان و مصالح ساختمانی
  900006: "🔌", // لوازم خانگی و الکترونیک
  900007: "👗", // پوشاک، نساجی و مد
  900008: "👜", // کیف، کفش و محصولات چرمی
  900009: "⚽", // ورزش، بازی، هدایا و کودک
  900010: "🧴", // آرایشی، بهداشتی و سلامت
  900011: "🚗", // خودرو و قطعات
  900012: "📦", // سایر کالاها و محصولات عمومی
};

/** Fallback when lookup by id is unavailable (legacy slugs). */
const MAIN_CATEGORY_ICONS = {
  agriculture: "🌾",
  "food-products": "🍽️",
  "root-900002": "🍽️",
  "root-900003": "🧪",
  "chemical-petrochemical": "🧪",
  "metals-mining": "⛏",
  "root-900004": "⚙️",
  machinery: "⚙️",
  "root-900005": "🏗️",
  "building-materials": "🏗️",
  "root-900006": "🔌",
  "electric-electronics": "🔌",
  "root-900007": "👗",
  "apparel-textiles": "👗",
  "root-900008": "👜",
  "root-900009": "⚽",
  "root-900010": "🧴",
  "cosmetics-hygiene": "🧴",
  "auto-parts": "🚗",
  "home-decor": "🏠",
  "other-goods": "🎁",
};

const MAIN_ROOT_IDS = new Set([
  900001, 900002, 900003, 900004, 900005, 900006,
  900007, 900008, 900009, 900010, 900011, 900012,
]);

export function isMainRootCategory(item) {
  return item?.parentId == null && (MAIN_ROOT_IDS.has(item?.id) || Boolean(MAIN_CATEGORY_ICONS[item?.slug]));
}

export function getMainCategoryIcon(item) {
  if (!item) return "📦";
  if (MAIN_ROOT_ICONS_BY_ID[item.id]) return MAIN_ROOT_ICONS_BY_ID[item.id];
  return MAIN_CATEGORY_ICONS[item.slug] || "📦";
}

export function hasCategoryImage(item) {
  return Boolean(item?.imageUrl);
}
