/** دسته‌های انحصاری پلتفرم — دیگر استفاده نمی‌شود؛ عضویت آزاد برای همه دسته‌ها */
export const PLATFORM_EXCLUSIVE_CATEGORY_IDS = new Set();

export function isPlatformExclusiveCategory(categoryId) {
  return PLATFORM_EXCLUSIVE_CATEGORY_IDS.has(categoryId);
}

/** @deprecated بسته‌بندی دیگر اختصاصی زارعون نیست */
export function isZareoonOperatedCategory() {
  return false;
}
