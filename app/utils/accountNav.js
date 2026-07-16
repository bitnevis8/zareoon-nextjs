"use client";

import { useTranslations } from "next-intl";
import { isAdmin } from "./roles";

export function resolveAccountNav(user, t) {
  if (!user) return null;

  if (user.accountNav?.navBadge && user.accountNav?.navTitle) {
    return user.accountNav;
  }

  const fallbackName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username ||
    "";

  const entityBadge = (entityType) => {
    if (!t) return entityType;
    const key = `accountNav.${entityType}`;
    return typeof t.has === "function" && t.has(key) ? t(key) : t("accountNav.user");
  };

  if (user.entityType) {
    return {
      navBadge: entityBadge(user.entityType),
      navTitle: user.displayName || user.profileSlug || fallbackName,
      entityType: user.entityType,
      profileSlug: user.profileSlug || null,
    };
  }

  if (isAdmin(user)) {
    return {
      navBadge: t ? t("accountNav.admin") : "admin",
      navTitle: fallbackName,
      entityType: null,
      profileSlug: null,
    };
  }

  return {
    navBadge: t ? t("accountNav.user") : "user",
    navTitle: fallbackName,
    entityType: null,
    profileSlug: null,
  };
}

export function AccountNavSubtitle({ user, className = "" }) {
  const t = useTranslations("shared");
  const nav = resolveAccountNav(user, t);
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
