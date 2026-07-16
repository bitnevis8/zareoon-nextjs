"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

function UserAvatar({ user, userFallback, avatarFallbackInitial }) {
  const initial = (user.firstName?.[0] || user.username?.[0] || avatarFallbackInitial).toUpperCase();

  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.firstName || user.username || userFallback}
        width={48}
        height={48}
        className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-emerald-100"
        unoptimized
      />
    );
  }

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-base font-bold text-white ring-2 ring-emerald-100">
      {initial}
    </span>
  );
}

export default function SidebarMobileUserHeader({ user, onLinkClick }) {
  const tLayout = useTranslations("layout");

  if (!user) return null;

  const displayName =
    [user.firstName || user.username, user.lastName].filter(Boolean).join(" ") || user.username || "";
  const contact = user.mobile || user.phone;

  return (
    <Link
      href="/dashboard/account"
      onClick={onLinkClick}
      className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-l from-emerald-50/80 to-white px-4 py-3 transition hover:bg-emerald-50/60"
    >
      <UserAvatar
        user={user}
        userFallback={tLayout("userFallback")}
        avatarFallbackInitial={tLayout("avatarFallbackInitial")}
      />
      <div className="min-w-0 flex-1 text-right">
        <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
        {contact ? (
          <p className="mt-0.5 truncate text-xs text-slate-500 tabular-nums" dir="ltr">
            {contact}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
