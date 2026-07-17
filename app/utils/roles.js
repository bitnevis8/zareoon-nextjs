/** نقش‌ها: super_admin, admin, user, seller, service_provider */

export const ROLE_SLUGS = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
  SELLER: "seller",
  SERVICE_PROVIDER: "service_provider",
  /** @deprecated */
  SUPPLIER: "seller",
  /** @deprecated */
  CUSTOMER: "user",
  /** @deprecated */
  EMPLOYEE: "employee",
};

const ADMIN_SLUGS = new Set(["super_admin", "admin", "administrator"]);
const SELLER_SLUGS = new Set(["seller", "supplier", "farmer", "loader"]);

export function normalizeRoleSlug(role) {
  const raw = (role?.name || role?.nameEn || "").toLowerCase().trim().replace(/\s+/g, "_");
  if (raw === "administrator") return "admin";
  if (raw === "superadmin") return "super_admin";
  if (raw === "farmer" || raw === "loader" || raw === "supplier") return "seller";
  if (raw === "customer" || raw === "regular_user") return "user";
  return raw;
}

export function getRoleSlugs(user) {
  return (user?.roles || []).map(normalizeRoleSlug).filter(Boolean);
}

export function getRoleLabel(role, t) {
  const slug = normalizeRoleSlug(role);
  if (role?.nameFa) return role.nameFa;
  if (t && slug) {
    const key = `roles.${slug}`;
    if (typeof t.has === "function" && t.has(key)) return t(key);
    if (typeof t === "function") {
      try {
        return t(key);
      } catch {
        /* fall through */
      }
    }
  }
  return role?.nameEn || role?.name || slug;
}

/** @deprecated use getRoleLabel(role, t) */
export function getRoleLabelFa(role, t) {
  return getRoleLabel(role, t);
}

export function isSuperAdmin(user) {
  return getRoleSlugs(user).includes(ROLE_SLUGS.SUPER_ADMIN);
}

export function isAdmin(user) {
  return getRoleSlugs(user).some((r) => ADMIN_SLUGS.has(r));
}

export function isSeller(user) {
  return getRoleSlugs(user).some((r) => SELLER_SLUGS.has(r));
}

/** @deprecated use isSeller */
export function isSupplier(user) {
  return isSeller(user);
}

export function isServiceProvider(user) {
  return getRoleSlugs(user).includes(ROLE_SLUGS.SERVICE_PROVIDER);
}

export function isUser(user) {
  return getRoleSlugs(user).includes(ROLE_SLUGS.USER);
}

/** @deprecated use isUser */
export function isCustomer(user) {
  return isUser(user);
}

/** @deprecated */
export function isEmployee(user) {
  return getRoleSlugs(user).includes("employee");
}

export function canAccessSupplierInventory(user) {
  return isAdmin(user) || isSeller(user);
}

/** پنل فروشنده — فروشنده یا مدیر */
export function shouldShowSellerPanel(user) {
  return isSeller(user) || isAdmin(user);
}

/** @deprecated use shouldShowSellerPanel */
export function shouldShowSupplierPanel(user) {
  return shouldShowSellerPanel(user);
}

export function resolveOwnScope(user, scopeParam) {
  if (scopeParam === "own") return true;
  if (scopeParam === "all") return false;
  return isSeller(user) && !isAdmin(user);
}

export function canAccessSupplierOrders(user, scopeParam) {
  if (!user) return false;
  if (isSeller(user) && !isAdmin(user)) return true;
  return scopeParam === "own" && shouldShowSellerPanel(user);
}

export function canAccessAdminDashboard(user) {
  return isAdmin(user);
}
