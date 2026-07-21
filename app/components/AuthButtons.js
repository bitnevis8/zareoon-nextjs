"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { AccountNavSubtitle } from "../utils/accountNav";
import UserProfileMenu from "./UserProfileMenu";

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
  const { t, isRTL, isHydrated } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  if (loading || !isHydrated) return null;

  if (user) {
    const displayName = [user.firstName || user.username, user.lastName].filter(Boolean).join(" ");

    const handleLogout = async () => {
      await logout();
      setOpen(false);
    };

    return (
      <div className="relative z-[10050]" ref={rootRef}>
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

        {open ? (
          <>
            <div
              className="fixed inset-0 z-[10049] bg-black/20 md:bg-transparent"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              className={`absolute z-[10051] mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ${
                isRTL ? "left-0" : "right-0"
              }`}
            >
              <div className={`border-b border-slate-100 bg-slate-50 px-4 py-3 ${isRTL ? "text-right" : "text-left"}`}>
                <div className="truncate text-sm font-semibold text-slate-900">{displayName}</div>
                {(user.mobile || user.phone || user.email) && (
                  <div className="mt-0.5 truncate text-xs text-slate-500">
                    {user.mobile || user.phone || user.email}
                  </div>
                )}
                <div className="mt-1.5">
                  <AccountNavSubtitle user={user} />
                </div>
              </div>
              <UserProfileMenu
                user={user}
                onClose={() => setOpen(false)}
                onLogout={handleLogout}
              />
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-700"
    >
      {t("loginRegister")}
    </Link>
  );
}
