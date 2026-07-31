/**
 * آیکون نقش‌ها — منبع واحد برای سایدبار و باکس پروفایل داشبورد
 * name باید با SidebarIcon هم‌خوان باشد.
 */

/** نقش‌های مدیریتی پلتفرم */
export const PLATFORM_ROLE_ICONS = {
  super_admin: "shield",
  admin: "users",
  administrator: "users",
  support: "inbox",
  content_moderator: "roles",
  verification_officer: "shield",
  finance_officer: "escrow",
  subscription_officer: "chart",
};

/** نقش‌های فعالیت / کاربری */
export const ACTIVITY_ROLE_ICONS = {
  seller: "store",
  supplier: "store",
  farmer: "store",
  loader: "store",
  service_provider: "services",
  user: "profile",
  customer: "profile",
  employee: "users",
};

export const SIDEBAR_ROLE_ICONS = {
  ...PLATFORM_ROLE_ICONS,
  ...ACTIVITY_ROLE_ICONS,
};

export function getRoleSidebarIcon(slug) {
  const key = String(slug || "").toLowerCase();
  return SIDEBAR_ROLE_ICONS[key] || "profile";
}
