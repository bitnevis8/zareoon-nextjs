/** Icons for top-level catalog roots (by stable product id from seederData5). */
const MAIN_ROOT_ICONS_BY_ID = {
  10000: "🌾", // محصولات کشاورزی
  10106: "🍽️", // مواد غذایی و نوشیدنی
  10175: "🧪", // فلزات، مواد معدنی و مواد شیمیایی
  10353: "⚙️", // ماشین‌آلات و تجهیزات صنعتی
  10503: "🏗️", // ساختمان و مصالح ساختمانی
  10560: "🔌", // لوازم خانگی و الکترونیک
  10592: "👗", // پوشاک، نساجی و مد
  10620: "👜", // کیف، کفش و محصولات چرمی
  10640: "⚽", // ورزش، بازی، هدایا و کودک
  10672: "🧴", // آرایشی، بهداشتی و سلامت
  10711: "🚗", // خودرو و قطعات
  10774: "📦", // سایر کالاها و محصولات عمومی
};

/** Fallback when lookup by id is unavailable (legacy slugs). */
const MAIN_CATEGORY_ICONS = {
  agriculture: "🌾",
  "food-beverages": "🍽️",
  "food-products": "🍽️",
  "metals-minerals-chemicals": "🧪",
  "industrial-machinery-equipment": "⚙️",
  "construction-building-materials": "🏗️",
  "home-appliances-electronics": "🔌",
  "apparel-textiles-fashion": "👗",
  "bags-shoes-leather-products": "👜",
  "sports-entertainment-gifts-kids": "⚽",
  "cosmetics-hygiene-health": "🧴",
  "automotive-parts": "🚗",
  "other-goods-general-products": "📦",
  "auto-parts": "🚗",
  "other-goods": "🎁",
};

const MAIN_ROOT_IDS = new Set(Object.keys(MAIN_ROOT_ICONS_BY_ID).map(Number));

export function isMainRootCategory(item) {
  return item?.parentId == null && (MAIN_ROOT_IDS.has(Number(item?.id)) || Boolean(MAIN_CATEGORY_ICONS[item?.slug]));
}

export function getMainCategoryIcon(item) {
  if (!item) return "📦";
  if (MAIN_ROOT_ICONS_BY_ID[item.id]) return MAIN_ROOT_ICONS_BY_ID[item.id];
  return MAIN_CATEGORY_ICONS[item.slug] || "📦";
}

export function hasCategoryImage(item) {
  return Boolean(item?.imageUrl);
}
