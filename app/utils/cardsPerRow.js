/** تعداد کارت در هر سطر — پیش‌فرض ۴ */

export const DEFAULT_CARDS_PER_ROW = 4;
export const CARDS_PER_ROW_OPTIONS = [2, 3, 4, 5, 6];
export const CARDS_PER_ROW_STORAGE_KEY = "zareoon-cards-per-row";

/** کلاس‌های Tailwind برای شبکه کارت‌ها بر اساس تعداد ستون در دسکتاپ */
const GRID_CLASS_BY_COUNT = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
};

export function normalizeCardsPerRow(value, fallback = DEFAULT_CARDS_PER_ROW) {
  const n = Number(value);
  if (CARDS_PER_ROW_OPTIONS.includes(n)) return n;
  return fallback;
}

export function getCardsPerRowGridClass(count, { gapClass = "gap-3", withGrid = true } = {}) {
  const cols = normalizeCardsPerRow(count);
  const colsClass = GRID_CLASS_BY_COUNT[cols] || GRID_CLASS_BY_COUNT[DEFAULT_CARDS_PER_ROW];
  return withGrid ? `grid ${gapClass} ${colsClass}` : `${gapClass} ${colsClass}`;
}

export function readStoredCardsPerRow() {
  if (typeof window === "undefined") return DEFAULT_CARDS_PER_ROW;
  try {
    return normalizeCardsPerRow(window.localStorage.getItem(CARDS_PER_ROW_STORAGE_KEY));
  } catch {
    return DEFAULT_CARDS_PER_ROW;
  }
}

export function writeStoredCardsPerRow(count) {
  const n = normalizeCardsPerRow(count);
  try {
    window.localStorage.setItem(CARDS_PER_ROW_STORAGE_KEY, String(n));
  } catch {
    /* ignore */
  }
  return n;
}
