/** نقش‌های سامانه — پلتفرم vs فعالیت vs Workspace */

export const ROLE_SLUGS = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  SUPPORT: "support",
  CONTENT_MODERATOR: "content_moderator",
  VERIFICATION_OFFICER: "verification_officer",
  FINANCE_OFFICER: "finance_officer",
  SUBSCRIPTION_OFFICER: "subscription_officer",
  USER: "user",
  /** نوع فعالیت (نه ACL امنیتی) — سازگاری */
  SELLER: "seller",
  SERVICE_PROVIDER: "service_provider",
  SUPPLIER: "seller",
  CUSTOMER: "user",
  EMPLOYEE: "employee",
};

export const WORKSPACE_ROLE_SLUGS = {
  OWNER: "owner",
  ADMIN: "admin",
  SALES: "sales",
  ORDERS_MANAGER: "orders_manager",
  PRODUCT_EDITOR: "product_editor",
  VIEWER: "viewer",
};

export const ACTIVITY_TYPES = {
  BUYER: "buyer",
  SELLER: "seller",
  SERVICES: "services",
};

const ADMIN_SLUGS = new Set(["super_admin", "admin", "administrator"]);
const PLATFORM_STAFF_SLUGS = new Set([
  "super_admin",
  "admin",
  "support",
  "content_moderator",
  "verification_officer",
  "finance_officer",
  "subscription_officer",
]);
const SELLER_SLUGS = new Set(["seller", "supplier", "farmer", "loader"]);
const ACTIVITY_ROLE_SLUGS = new Set(["seller", "supplier", "farmer", "loader", "service_provider", "user", "customer"]);

export function isPlatformManagementRole(role) {
  const slug = normalizeRoleSlug(role);
  return PLATFORM_STAFF_SLUGS.has(slug) || ADMIN_SLUGS.has(slug);
}

export function isActivityRole(role) {
  return ACTIVITY_ROLE_SLUGS.has(normalizeRoleSlug(role));
}

/** جداسازی نقش‌های مدیریتی پلتفرم از نقش‌های فعالیت کاربر */
export function splitUserRoles(user, t) {
  const roles = user?.roles || [];
  const management = [];
  const activity = [];
  for (const role of roles) {
    const label = getRoleLabel(role, t);
    if (!label) continue;
    if (isPlatformManagementRole(role)) management.push(label);
    else activity.push(label);
  }
  return {
    management: [...new Set(management)],
    activity: [...new Set(activity)],
  };
}

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

export function getRoleLabelFa(role, t) {
  return getRoleLabel(role, t);
}

export function isSuperAdmin(user) {
  return getRoleSlugs(user).includes(ROLE_SLUGS.SUPER_ADMIN);
}

export function isAdmin(user) {
  return getRoleSlugs(user).some((r) => ADMIN_SLUGS.has(r));
}

export function isPlatformStaff(user) {
  return getRoleSlugs(user).some((r) => PLATFORM_STAFF_SLUGS.has(r));
}

export function isSeller(user) {
  return getRoleSlugs(user).some((r) => SELLER_SLUGS.has(r));
}

export function isSupplier(user) {
  return isSeller(user);
}

export function isServiceProvider(user) {
  return getRoleSlugs(user).includes(ROLE_SLUGS.SERVICE_PROVIDER);
}

export function isUser(user) {
  return getRoleSlugs(user).includes(ROLE_SLUGS.USER);
}

export function isCustomer(user) {
  return isUser(user);
}

export function isEmployee(user) {
  return getRoleSlugs(user).includes("employee");
}

export function canAccessSupplierInventory(user) {
  return isAdmin(user) || isSeller(user);
}

export function shouldShowSellerPanel(user) {
  return isSeller(user) || isAdmin(user);
}

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
