import { isAdmin } from "./roles";

export const CATALOG_PDF_SCOPES = {
  FULL: "full",
  CATEGORY: "category",
  PRODUCT: "product",
  LOT: "lot",
  SUPPLIER_OWN: "supplier-own",
};

/** Full catalog — super_admin / admin only */
export function canDownloadFullCatalog(user) {
  return isAdmin(user);
}

/** Category / subcategory catalog — super_admin / admin only */
export function canDownloadCategoryCatalog(user) {
  return isAdmin(user);
}

/** Single orderable product catalog — any visitor; non-orderable categories need admin */
export function canDownloadProductCatalog(user, { isOrderable = true } = {}) {
  if (!isOrderable) return isAdmin(user);
  return true;
}

/** Single supplier lot offer — public when browsing orderable products */
export function canDownloadLotCatalog() {
  return true;
}

/** All products offered by the logged-in supplier */
export function canDownloadSupplierOwnCatalog(user, supplierUserId) {
  if (!user?.id || supplierUserId == null) return false;
  if (isAdmin(user)) return true;
  return Number(user.id) === Number(supplierUserId);
}

export function canDownloadCatalogPdf({
  user,
  scope,
  productIsOrderable = true,
  supplierUserId,
}) {
  switch (scope) {
    case CATALOG_PDF_SCOPES.FULL:
      return canDownloadFullCatalog(user);
    case CATALOG_PDF_SCOPES.CATEGORY:
      return canDownloadCategoryCatalog(user);
    case CATALOG_PDF_SCOPES.PRODUCT:
      return canDownloadProductCatalog(user, { isOrderable: productIsOrderable });
    case CATALOG_PDF_SCOPES.LOT:
      return canDownloadLotCatalog();
    case CATALOG_PDF_SCOPES.SUPPLIER_OWN:
      return canDownloadSupplierOwnCatalog(user, supplierUserId);
    default:
      return false;
  }
}

export function assertCatalogPdfAccess(options) {
  if (!canDownloadCatalogPdf(options)) {
    throw new Error("شما مجاز به دانلود این کاتالوگ نیستید.");
  }
}

/** Pick download scope for a catalog tree item (product vs category node). */
export function resolveCatalogDownloadForItem(item, user) {
  if (!item) return null;

  if (item.isOrderable) {
    if (!canDownloadProductCatalog(user, { isOrderable: true })) return null;
    return { scope: CATALOG_PDF_SCOPES.PRODUCT, productId: item.id };
  }

  if (!canDownloadCategoryCatalog(user)) return null;
  return { scope: CATALOG_PDF_SCOPES.CATEGORY, categoryId: item.id };
}
