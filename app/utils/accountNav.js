import { isAdmin } from "./roles";

const ENTITY_NAV_BADGES = {
  individual: "یوزر",
  company: "کمپانی",
  trader: "ساپلایر",
  manufacturer: "ساپلایر",
  distributor: "کمپانی",
};

export function resolveAccountNav(user) {
  if (!user) return null;

  if (user.accountNav?.navBadge && user.accountNav?.navTitle) {
    return user.accountNav;
  }

  const fallbackName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username ||
    "";

  if (user.entityType) {
    return {
      navBadge: ENTITY_NAV_BADGES[user.entityType] || "یوزر",
      navTitle: user.displayName || user.profileSlug || fallbackName,
      entityType: user.entityType,
      profileSlug: user.profileSlug || null,
    };
  }

  if (isAdmin(user)) {
    return { navBadge: "ادمین", navTitle: fallbackName, entityType: null, profileSlug: null };
  }

  return {
    navBadge: "یوزر",
    navTitle: fallbackName,
    entityType: null,
    profileSlug: null,
  };
}

export function AccountNavSubtitle({ user, className = "" }) {
  const nav = resolveAccountNav(user);
  if (!nav?.navTitle) return null;

  return (
    <p className={`flex flex-wrap items-center gap-1.5 text-xs font-medium ${className}`}>
      <span className="inline-flex shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
        {nav.navBadge}
      </span>
      <span className="truncate text-slate-600">{nav.navTitle}</span>
    </p>
  );
}
