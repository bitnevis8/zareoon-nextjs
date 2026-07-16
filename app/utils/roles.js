/** نقش‌های فعال: super_admin, admin, employee, supplier, customer */

export const ROLE_SLUGS = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  SUPPLIER: "supplier",
  CUSTOMER: "customer",
};

const ADMIN_SLUGS = new Set(["super_admin", "admin", "administrator"]);
const SUPPLIER_SLUGS = new Set(["supplier", "farmer", "loader"]);

export function normalizeRoleSlug(role) {
  const raw = (role?.name || role?.nameEn || "").toLowerCase().trim().replace(/\s+/g, "_");
  if (raw === "administrator") return "admin";
  if (raw === "superadmin") return "super_admin";
  if (raw === "farmer") return "supplier";
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

export function isEmployee(user) {
  return getRoleSlugs(user).includes(ROLE_SLUGS.EMPLOYEE);
}

export function isSupplier(user) {
  return getRoleSlugs(user).some((r) => SUPPLIER_SLUGS.has(r));
}

export function isCustomer(user) {
  return getRoleSlugs(user).includes(ROLE_SLUGS.CUSTOMER);
}

export function canAccessSupplierInventory(user) {
  return isAdmin(user) || isSupplier(user);
}

/** پنل شخصی تأمین — برای تأمین‌کننده و مدیران */
export function shouldShowSupplierPanel(user) {
  return isSupplier(user) || isAdmin(user);
}

export function resolveOwnScope(user, scopeParam) {
  if (scopeParam === "own") return true;
  if (scopeParam === "all") return false;
  return isSupplier(user) && !isAdmin(user);
}

export function canAccessSupplierOrders(user, scopeParam) {
  if (!user) return false;
  if (isSupplier(user) && !isAdmin(user)) return true;
  return scopeParam === "own" && shouldShowSupplierPanel(user);
}

export function canAccessAdminDashboard(user) {
  return isAdmin(user);
}
