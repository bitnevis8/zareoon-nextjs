/** کاربر تأمین‌کنندهٔ یک لات — سازگار با پاسخ قدیمی `farmer` */
export function getLotSupplier(lot) {
  return lot?.supplier ?? lot?.farmer ?? null;
}

export function getLotSupplierProfileUrl(lot) {
  const supplier = getLotSupplier(lot);
  if (!supplier?.id) return null;
  const slug = supplier.account?.profileSlug || supplier.profileSlug;
  if (slug) return `/tamin/${slug}`;
  if (supplier.username && !String(supplier.username).startsWith("temp")) {
    return `/tamin/${supplier.username}`;
  }
  return `/tamin/${supplier.id}`;
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
    (lot?.id ? `بار #${lot.id}` : "—");
  return { label, name, mobile };
}
