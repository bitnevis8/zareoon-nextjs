"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const defaultIconBtnClass =
  "inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors";

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75H4.5v-.75z"
      />
    </svg>
  );
}

export default function AuthButtons({ iconButtonClass = defaultIconBtnClass }) {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return null;

  if (user) {
    const displayName = [user.firstName || user.username, user.lastName].filter(Boolean).join(" ");

    const handleLogout = async () => {
      await logout();
      setOpen(false);
    };

    return (
      <div className="relative" ref={rootRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={iconButtonClass}
          aria-label={t("account")}
          title={t("account")}
          aria-expanded={open}
        >
          <UserIcon />
        </button>
        {open && (
          <div
            className={`absolute mt-2 min-w-[11rem] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden ${
              isRTL ? "left-0 right-auto" : "left-0 right-auto"
            }`}
          >
            <div className={`px-4 py-3 border-b border-gray-100 bg-gray-50 ${isRTL ? "text-right" : "text-left"}`}>
              <div className="text-sm font-semibold text-gray-900 truncate">{displayName}</div>
              {(user.mobile || user.phone || user.email) && (
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  {user.mobile || user.phone || user.email}
                </div>
              )}
            </div>
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("dashboard")}
              </Link>
              <button
                onClick={handleLogout}
                className={`w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("logout")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="bg-blue-600 text-white hover:bg-blue-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
    >
      {t("loginRegister")}
    </Link>
  );
}
