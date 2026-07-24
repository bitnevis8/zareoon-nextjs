"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import UserProfileMenu from "./UserProfileMenu";
import { resolveMediaUrl } from "../utils/mediaUrl";

const defaultIconBtnClass =
  "inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors";

const MENU_WIDTH = 272;
const MENU_GAP = 8;
const VIEWPORT_PAD = 8;

function AvatarCircle({ src, alt, size = "sm", fallback }) {
  const dims =
    size === "lg"
      ? { box: "h-12 w-12", img: 48, text: "text-lg" }
      : size === "md"
        ? { box: "h-10 w-10", img: 40, text: "text-sm" }
        : { box: "h-8 w-8", img: 32, text: "text-xs" };
  const url = resolveMediaUrl(src);

  return (
    <span
      className={`relative inline-flex ${dims.box} shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-600 font-bold text-white ring-2 ring-white`}
    >
      {url ? (
        <Image src={url} alt={alt || ""} width={dims.img} height={dims.img} className="h-full w-full object-cover" unoptimized />
      ) : (
        <span className={dims.text}>{fallback}</span>
      )}
    </span>
  );
}

export default function AuthButtons({ iconButtonClass = defaultIconBtnClass }) {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const { t, isRTL, isHydrated } = useLanguage();

  const updateMenuPosition = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const menuEl = menuRef.current;
    const menuHeight = menuEl?.offsetHeight || 320;

    let left = isRTL ? rect.left : rect.right - MENU_WIDTH;
    left = Math.min(Math.max(VIEWPORT_PAD, left), vw - MENU_WIDTH - VIEWPORT_PAD);

    const spaceBelow = vh - rect.bottom - MENU_GAP - VIEWPORT_PAD;
    const spaceAbove = rect.top - MENU_GAP - VIEWPORT_PAD;
    const openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;

    let top;
    if (openUp) {
      top = Math.max(VIEWPORT_PAD, rect.top - MENU_GAP - menuHeight);
    } else {
      top = Math.min(rect.bottom + MENU_GAP, vh - VIEWPORT_PAD - Math.min(menuHeight, spaceBelow + menuHeight));
      top = Math.max(VIEWPORT_PAD, Math.min(top, vh - VIEWPORT_PAD - 120));
    }

    const maxHeight = openUp
      ? Math.max(160, rect.top - MENU_GAP - VIEWPORT_PAD)
      : Math.max(160, vh - top - VIEWPORT_PAD);

    setMenuPos({ top, left, maxHeight, openUp });
  }, [isRTL]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target) && menuRef.current && !menuRef.current.contains(event.target)) {
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

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return undefined;
    }
    updateMenuPosition();
    const raf = requestAnimationFrame(() => updateMenuPosition());
    const onWin = () => updateMenuPosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, updateMenuPosition]);

  if (loading || !isHydrated) return null;

  if (user) {
    const displayName = [user.firstName || user.username, user.lastName].filter(Boolean).join(" ");
    const initial = (user.firstName?.[0] || user.username?.[0] || "؟").toUpperCase();

    const handleLogout = async () => {
      await logout();
      setOpen(false);
    };

    return (
      <div className="relative z-[10050] flex items-center" ref={rootRef}>
        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`${iconButtonClass} overflow-hidden !p-0`}
          aria-label={t("account")}
          title={displayName || t("account")}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          {user.avatar ? (
            <Image
              src={resolveMediaUrl(user.avatar)}
              alt={displayName || ""}
              width={40}
              height={40}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <span className="inline-flex h-full w-full items-center justify-center bg-emerald-50 text-sm font-bold text-emerald-800">
              {initial}
            </span>
          )}
        </button>

        {open ? (
          <>
            <div
              className="fixed inset-0 z-[10049] bg-black/20 md:bg-transparent"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              ref={menuRef}
              role="menu"
              className="fixed z-[10051] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white shadow-xl"
              style={{
                top: menuPos?.top ?? 0,
                left: menuPos?.left ?? 0,
                width: MENU_WIDTH,
                maxHeight: menuPos?.maxHeight ?? "min(70vh, 28rem)",
                visibility: menuPos ? "visible" : "hidden",
              }}
            >
              <div className={`border-b border-slate-100 bg-slate-50 px-3 py-2.5`} dir={isRTL ? "rtl" : "ltr"}>
                <div className="flex flex-row items-center gap-2.5">
                  <AvatarCircle src={user.avatar} alt={displayName} size="md" fallback={initial} />
                  <div className="min-w-0 flex-1 text-start">
                    <div className="truncate text-[13px] font-semibold text-slate-900">{displayName}</div>
                    {(user.mobile || user.phone || user.email) && (
                      <div className="mt-0.5 truncate text-[11px] text-slate-500">
                        {user.mobile || user.phone || user.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <UserProfileMenu user={user} onClose={() => setOpen(false)} onLogout={handleLogout} />
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="hidden rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-700 lg:inline-flex"
    >
      {t("loginRegister")}
    </Link>
  );
}
