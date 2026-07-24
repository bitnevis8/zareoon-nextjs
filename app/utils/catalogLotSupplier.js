/** کاربر تأمین‌کنندهٔ یک لات — سازگار با پاسخ قدیمی `farmer` */
import { providerPublicPath } from "@/app/utils/providerPublicPath";

export function getLotSupplier(lot) {
  return lot?.supplier ?? lot?.farmer ?? null;
}

export function getLotSupplierProfileUrl(lot) {
  const supplier = getLotSupplier(lot);
  if (!supplier?.id) return null;
  const slug = supplier.account?.profileSlug || supplier.profileSlug;
  if (!slug || /^\d+$/.test(String(slug))) return null;
  return providerPublicPath(slug);
}

/** اسلاگ صفحهٔ تجاری تأمین‌کننده (نه شناسهٔ عددی کاتالوگ) */
export function getLotSupplierProfileSlug(lot) {
  const supplier = getLotSupplier(lot);
  const slug = supplier?.account?.profileSlug || supplier?.profileSlug;
  if (!slug || /^\d+$/.test(String(slug))) return null;
  return String(slug).trim();
}

/** تصویر صفحهٔ تجاری (کاور فروشگاه) یا در صورت نبود، آواتار کاربر */
export function getLotSupplierPageImage(lot) {
  const supplier = getLotSupplier(lot);
  return supplier?.account?.coverImage || supplier?.avatar || null;
}

/** نام فروشگاه / صفحه عمومی — نه نام شخصی */
export function getLotSupplierDisplayName(lot) {
  const supplier = getLotSupplier(lot);
  if (!supplier) return "";
  const shopName = String(supplier.account?.displayName || supplier.displayName || "").trim();
  if (shopName) return shopName;
  return (
    [supplier.firstName, supplier.lastName].filter(Boolean).join(" ").trim() ||
    supplier.username ||
    ""
  );
}

export function getLotSupplierPhone(lot) {
  const supplier = getLotSupplier(lot);
  return supplier?.mobile || supplier?.phone || "";
}

export function lotSupplierHasPhone(lot) {
  const supplier = getLotSupplier(lot);
  if (!supplier) return false;
  if (supplier.hasPhone === true) return true;
  return Boolean(getLotSupplierPhone(lot));
}

/** برچسب نمایشی تأمین‌کننده برای تب‌ها و کارت‌ها (بدون شماره) */
export function getLotSupplierDisplay(lot, t) {
  const supplier = getLotSupplier(lot);
  const name = getLotSupplierDisplayName(lot);
  const mobile = getLotSupplierPhone(lot);
  const label =
    name ||
    supplier?.username ||
    (t ? t("lotNumber", { id: lot?.id }) : null) ||
    (t ? t("notSet") : "—");
  return { label, name, mobile, hasPhone: lotSupplierHasPhone(lot) };
}
