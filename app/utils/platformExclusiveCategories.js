/** دسته‌هایی که زارعون/شریک اختصاصی ارائه می‌دهد — عضویت آزاد ندارد */
export const PLATFORM_EXCLUSIVE_CATEGORY_IDS = new Set([
  "inspection-standards",
  "packaging-prep",
]);

export function isPlatformExclusiveCategory(categoryId) {
  return PLATFORM_EXCLUSIVE_CATEGORY_IDS.has(categoryId);
}

export function isZareoonOperatedCategory(categoryId) {
  return categoryId === "packaging-prep";
}
