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

export function getLotSupplierDisplayName(lot) {
  const supplier = getLotSupplier(lot);
  if (!supplier) return "";
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

/** برچسب نمایشی تأمین‌کننده برای تب‌ها و کارت‌ها */
export function getLotSupplierDisplay(lot, t) {
  const supplier = getLotSupplier(lot);
  const name = getLotSupplierDisplayName(lot);
  const mobile = getLotSupplierPhone(lot);
  const label =
    (name && mobile ? `${name} · ${mobile}` : "") ||
    name ||
    mobile ||
    supplier?.username ||
    (t ? t("lotNumber", { id: lot?.id }) : null) ||
    (t ? t("notSet") : "—");
  return { label, name, mobile };
}
