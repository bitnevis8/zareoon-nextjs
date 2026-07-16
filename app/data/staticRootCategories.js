import data from "./staticRootCategories.json";

/** Static homepage root categories. Synced with seederData5 level-1. */
export const STATIC_ROOT_CATEGORIES = data;

export const STATIC_ROOT_IDS = STATIC_ROOT_CATEGORIES.map((c) => c.id);

export function getStaticRootById(id) {
  const n = Number(id);
  return STATIC_ROOT_CATEGORIES.find((c) => Number(c.id) === n) || null;
}
