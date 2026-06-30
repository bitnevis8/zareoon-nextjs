const MAIN_CATEGORY_ICONS = {
  agriculture: "🌾",
  "food-products": "🍽",
  "chemical-petrochemical": "🧪",
  "metals-mining": "⛏",
  "building-materials": "🏗",
  "machinery": "⚙",
  "electric-electronics": "💡",
  "auto-parts": "🚗",
  "apparel-textiles": "👕",
  "home-decor": "🏠",
  "cosmetics-hygiene": "💄",
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
  return MAIN_CATEGORY_ICONS[item.slug] || "📦";
}

export function hasCategoryImage(item) {
  return Boolean(item?.imageUrl);
}
