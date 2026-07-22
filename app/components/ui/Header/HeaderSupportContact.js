"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatLocalizedDigits } from "@/app/utils/persianNumberUtils";
import {
  SITE_PHONE_DISPLAY,
  SITE_PHONE_TEL,
  SITE_PHONE_TELEGRAM,
  SITE_PHONE_WHATSAPP,
} from "@/app/config/siteContact";

function PhoneIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h2.6a1 1 0 01.96.73l1.1 3.9a1 1 0 01-.5 1.1l-1.7 1a12.05 12.05 0 005.5 5.5l1-1.7a1 1 0 011.1-.5l3.9 1.1a1 1 0 01.73.96V19a2 2 0 01-2 2h-.5C9.9 21 3 14.1 3 5.5V5z"
      />
    </svg>
  );
}

function TelegramIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * آیکن پشتیبانی — هاور/کلیک → منو: شماره موبایل، تلگرام، واتساپ
 * @param {"up"|"down"} menuPlacement — جهت باز شدن منو نسبت به دکمه
 */
export default function HeaderSupportContact({
  className = "",
  buttonClassName = "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-emerald-700 transition-colors hover:bg-gray-50 hover:text-emerald-800",
  menuPlacement = "down",
}) {
  const { t, isRTL, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const closeTimerRef = useRef(null);
  const displayPhone = formatLocalizedDigits(SITE_PHONE_DISPLAY, language);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    const onDoc = (e) => {
      const target = e.target;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const menuWidth = 220;
      const gap = 8;
      const pad = 8;
      let left = isRTL ? rect.right - menuWidth : rect.left;
      if (left + menuWidth > window.innerWidth - pad) left = window.innerWidth - menuWidth - pad;
      if (left < pad) left = pad;

      if (menuPlacement === "up") {
        const approxHeight = 150;
        let top = rect.top - gap - approxHeight;
        if (top < pad) top = rect.bottom + gap;
        setMenuStyle({ top, left, width: menuWidth });
      } else {
        setMenuStyle({ top: rect.bottom + gap, left, width: menuWidth });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, isRTL, menuPlacement]);

  const channelItems = [
    {
      href: SITE_PHONE_TELEGRAM,
      label: t("supportTelegram"),
      icon: <TelegramIcon className="h-4 w-4 text-sky-600" />,
    },
    {
      href: SITE_PHONE_WHATSAPP,
      label: t("supportWhatsapp"),
      icon: <WhatsAppIcon className="h-4 w-4 text-emerald-600" />,
    },
  ];

  const menu =
    open && menuStyle ? (
      <div
        ref={menuRef}
        role="menu"
        aria-label={t("supportContact")}
        style={menuStyle}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        className="fixed z-[10050] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
      >
        <a
          role="menuitem"
          href={SITE_PHONE_TEL}
          onClick={() => setOpen(false)}
          className="flex w-full items-center gap-2.5 border-b border-slate-100 px-3.5 py-2.5 text-sm text-slate-800 transition hover:bg-slate-50"
          dir="ltr"
        >
          <PhoneIcon className="h-4 w-4 shrink-0 text-emerald-700" />
          <span className="font-semibold tabular-nums tracking-wide">{displayPhone}</span>
        </a>
        {channelItems.map((item) => (
          <a
            key={item.href}
            role="menuitem"
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    ) : null;

  return (
    <div
      ref={rootRef}
      className={`relative shrink-0 ${className}`}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("supportContact")}
        title={t("supportContact")}
        className={buttonClassName}
      >
        <PhoneIcon className="h-5 w-5" />
      </button>

      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
