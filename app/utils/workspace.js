/**
 * نقش‌ها و نشان‌های Workspace — جدا از نقش‌های پلتفرم
 */

export const WORKSPACE_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  SALES: "sales",
  ORDERS_MANAGER: "orders_manager",
  PRODUCT_EDITOR: "product_editor",
  VIEWER: "viewer",
};

export const WORKSPACE_ROLE_LABELS_FA = {
  owner: "مالک",
  admin: "مدیر",
  sales: "کارشناس فروش",
  orders_manager: "مدیر سفارش‌ها",
  product_editor: "ویرایشگر محصولات",
  viewer: "فقط مشاهده",
};

export const PUBLIC_BADGE_KINDS = {
  PLAN_MEMBER: "plan_member",
  IDENTITY_VERIFIED: "identity_verified",
  BUSINESS_VERIFIED: "business_verified",
  REPRESENTATION_VERIFIED: "representation_verified",
};

/** ظاهر متمایز — عمداً شبیه هم نیستند */
export function badgeToneClass(kind, tone) {
  if (kind === PUBLIC_BADGE_KINDS.PLAN_MEMBER) {
    if (tone === "gold") return "bg-amber-100 text-amber-900 ring-amber-300";
    if (tone === "silver") return "bg-slate-200 text-slate-800 ring-slate-400";
    return "bg-orange-100 text-orange-900 ring-orange-300";
  }
  if (kind === PUBLIC_BADGE_KINDS.IDENTITY_VERIFIED) {
    return "bg-sky-50 text-sky-900 ring-sky-300";
  }
  if (kind === PUBLIC_BADGE_KINDS.BUSINESS_VERIFIED) {
    return "bg-emerald-50 text-emerald-900 ring-emerald-300";
  }
  if (kind === PUBLIC_BADGE_KINDS.REPRESENTATION_VERIFIED) {
    return "bg-violet-50 text-violet-900 ring-violet-300";
  }
  return "bg-slate-100 text-slate-700 ring-slate-300";
}
