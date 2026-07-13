"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import LoginRequiredMessage from "./LoginRequiredMessage";
import HeaderNotificationBell from "./ui/Header/HeaderNotificationBell";
import HeaderMessagesIcon from "./ui/Header/HeaderMessagesIcon";

const iconBtnClass =
  "inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors";

function CartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path d="M3 3h2l.4 2M7 13h10l3-7H6.4" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="20" cy="19" r="1" />
    </svg>
  );
}

export default function MobileHeaderActions() {
  const { t, isHydrated } = useLanguage();
  const { user, loading } = useAuth() || { user: null, loading: true };
  const showUser = isHydrated && !loading ? user : null;

  return (
    <div className="flex md:hidden items-center gap-2">
      {showUser ? (
        <>
          <HeaderMessagesIcon buttonClass={iconBtnClass} />
          <HeaderNotificationBell buttonClass={iconBtnClass} />
          <Link href="/cart" className={iconBtnClass} aria-label={t("cart")} title={t("cart")} prefetch>
            <CartIcon />
          </Link>
        </>
      ) : (
        <LoginRequiredMessage>
          <button type="button" className={iconBtnClass} aria-label={t("cart")} title={t("cart")}>
            <CartIcon />
          </button>
        </LoginRequiredMessage>
      )}
    </div>
  );
}
