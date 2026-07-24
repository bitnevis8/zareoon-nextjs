"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { formatLocalizedDigits } from "@/app/utils/persianNumberUtils";
import { useLanguage } from "@/app/context/LanguageContext";

function EditIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  );
}

/** فقط آواتار کاربر — نه تصویر فروشگاه / coverImage */
function UserAvatar({ user, userFallback, avatarFallbackInitial }) {
  const initial = (user.firstName?.[0] || user.username?.[0] || avatarFallbackInitial).toUpperCase();
  const avatarUrl = resolveMediaUrl(user?.avatar || null);

  if (avatarUrl) {
    return (
      <span className="relative inline-flex h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 sm:h-14 sm:w-14">
        <Image
          src={avatarUrl}
          alt={user.firstName || user.username || userFallback}
          fill
          className="object-cover object-center"
          sizes="56px"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base font-bold text-slate-600 ring-1 ring-slate-200 sm:h-14 sm:w-14 sm:text-lg">
      {initial}
    </span>
  );
}

/**
 * هدر کاربر بالای سایدبار — آواتار مربعی کاربر + نام + آیکون ویرایش
 */
export default function SidebarMobileUserHeader({ user, onLinkClick }) {
  const tLayout = useTranslations("layout");
  const tDash = useTranslations("dashboard.shell");
  const { language } = useLanguage();

  if (!user) return null;

  const displayName =
    [user.firstName || user.username, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    tLayout("userFallback");
  const contactRaw = user.mobile || user.phone;
  const contact = contactRaw ? formatLocalizedDigits(contactRaw, language) : null;
  const editLabel = tDash("editProfile");

  return (
    <div className="border-b border-slate-200 bg-white px-3 py-3.5 sm:px-4 sm:py-4">
      <Link
        href="/dashboard/account"
        onClick={onLinkClick}
        className="flex min-w-0 items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        aria-label={editLabel}
      >
        <UserAvatar
          user={user}
          userFallback={tLayout("userFallback")}
          avatarFallbackInitial={tLayout("avatarFallbackInitial")}
        />
        <div className="min-w-0 flex-1 text-start">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="truncate text-sm font-bold text-slate-900 sm:text-[15px]">{displayName}</p>
            <span
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              title={editLabel}
              aria-hidden
            >
              <EditIcon className="h-3.5 w-3.5" />
            </span>
          </div>
          {contact ? (
            <p className="mt-0.5 truncate text-right text-[11px] text-slate-500" dir="ltr">
              {contact}
            </p>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
