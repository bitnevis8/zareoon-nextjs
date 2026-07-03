import { getRoleLabelFa, isSupplier, normalizeRoleSlug } from "@/app/utils/roles";

export function getUserRoles(user) {
  if (!user) return [];
  if (user.userRoles?.length) return user.userRoles;
  return user.roles || [];
}

export function getRoleLabel(role) {
  return getRoleLabelFa(role);
}

export function fullName(user) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return name || user?.username || user?.email || "کاربر";
}

export function getInitials(user) {
  const first = user?.firstName?.[0] || user?.username?.[0] || user?.email?.[0] || "?";
  const last = user?.lastName?.[0] || "";
  return (first + last).toUpperCase();
}

export function isSupplierUser(user) {
  return isSupplier(user);
}

export function formatDate(date) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function computeUserStats(users) {
  const total = users.length;
  const active = users.filter((u) => u.isActive !== false).length;
  const emailVerified = users.filter((u) => u.isEmailVerified).length;
  const mobileVerified = users.filter((u) => u.isMobileVerified).length;
  const suppliers = users.filter(isSupplierUser).length;

  return { total, active, emailVerified, mobileVerified, suppliers };
}

export function roleBadgeClass(roleName) {
  const slug = normalizeRoleSlug({ name: roleName });
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold";
  if (slug === "super_admin") return `${base} bg-fuchsia-100 text-fuchsia-900`;
  if (slug === "admin") return `${base} bg-violet-100 text-violet-800`;
  if (slug === "farmer" || slug === "supplier") return `${base} bg-emerald-100 text-emerald-800`;
  if (slug === "employee") return `${base} bg-amber-100 text-amber-900`;
  if (slug === "customer") return `${base} bg-sky-100 text-sky-800`;
  return `${base} bg-slate-100 text-slate-700`;
}
