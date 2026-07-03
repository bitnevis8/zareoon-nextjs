"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { shouldShowSupplierPanel } from "../utils/roles";

const linkClass =
  "block w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-right transition-colors";

const primaryLinkClass =
  "block w-full px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50 text-right transition-colors";

export default function UserProfileMenu({ user, onClose, onLogout }) {
  const { t, isRTL } = useLanguage();
  const supplier = shouldShowSupplierPanel(user);
  const textAlign = isRTL ? "text-right" : "text-left";

  return (
    <div className={`py-1 ${textAlign}`}>
      <Link href="/dashboard" onClick={onClose} className={primaryLinkClass}>
        {t("zareoonMe")}
      </Link>

      {supplier ? (
        <Link href="/dashboard/supplier-profile" onClick={onClose} className={linkClass}>
          {t("myPublicPage")}
        </Link>
      ) : null}

      <Link href="/dashboard/account" onClick={onClose} className={linkClass}>
        {t("editProfile")}
      </Link>

      {supplier ? (
        <Link
          href="/dashboard/supplier/inventory?scope=own"
          onClick={onClose}
          className={linkClass}
        >
          {t("myProducts")}
        </Link>
      ) : null}

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
