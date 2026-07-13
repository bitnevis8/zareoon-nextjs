export const ESCROW_MENU_TITLE = "تضمین معاملات و حساب امانی";
export const ESCROW_PAGE_TITLE = "تضمین معاملات و حساب امانی";
export const ESCROW_TAGLINE =
  "با تضمین معاملات، وجه شما تا انجام کامل تعهدات نزد سیستم امن نگهداری می‌شود.";
export const ESCROW_SETTINGS_TITLE = "تنظیمات تضمین معاملات";
export const ESCROW_DEPOSIT_LABEL = "وجه تضمین";

export function formatUserDisplayName(user) {
  if (!user) return "";
  if (user.displayName) return user.displayName;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.username || user.mobile || `کاربر ${user.id}`;
}
