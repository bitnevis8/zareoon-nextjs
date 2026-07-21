"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { useExistingPublicSlug } from "../hooks/useExistingPublicSlug";

const linkClass =
  "block w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-right transition-colors";

const primaryLinkClass =
  "block w-full px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50 text-right transition-colors";

export default function UserProfileMenu({ onClose, onLogout }) {
  const { t, isRTL } = useLanguage();
  const { publicPath, hasSlug } = useExistingPublicSlug();
  const textAlign = isRTL ? "text-right" : "text-left";
  const dedicatedHref = hasSlug && publicPath ? publicPath : "/dashboard/dedicated-page";

  return (
    <div className={`py-1 ${textAlign}`}>
      <Link href="/dashboard" onClick={onClose} className={primaryLinkClass}>
        {t("zareoonMe")}
      </Link>

      <Link href="/dashboard/account" onClick={onClose} className={linkClass}>
        {t("editProfile")}
      </Link>

      <Link href={dedicatedHref} onClick={onClose} className={linkClass}>
        {t("myDedicatedPage")}
      </Link>

      <Link href="/help" onClick={onClose} className={linkClass}>
        {t("guide")}
      </Link>

      <button
        type="button"
        onClick={onLogout}
        className={`w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 ${textAlign}`}
      >
        {t("logout")}
      </button>
    </div>
  );
}
