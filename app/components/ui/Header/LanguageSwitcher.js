"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { SITE_LANGUAGES } from "../../../config/siteLanguages";

function GlobeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 100-18 9 9 0 000 18z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.4 3.3 5.6 3.3 9s-1.1 6.6-3.3 9c-2.2-2.4-3.3-5.6-3.3-9s1.1-6.6 3.3-9z" />
    </svg>
  );
}

export default function LanguageSwitcher({ buttonClass }) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const ref = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      const target = e.target;
      if (ref.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const menuWidth = 176;
      const gap = 8;
      const viewportPadding = 8;
      let left = rect.left;

      if (left + menuWidth > window.innerWidth - viewportPadding) {
        left = window.innerWidth - menuWidth - viewportPadding;
      }
      if (left < viewportPadding) left = viewportPadding;

      setMenuStyle({
        top: rect.bottom + gap,
        left,
        width: menuWidth,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const pick = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  const menu =
    open && menuStyle ? (
      <ul
        ref={menuRef}
        role="listbox"
        aria-label={t("selectLanguage")}
        style={menuStyle}
        className="fixed z-[10050] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl"
      >
        {SITE_LANGUAGES.map((item) => {
          const active = item.code === language;
          return (
            <li key={item.code} role="option" aria-selected={active}>
              <button
                type="button"
                onClick={() => pick(item.code)}
                className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-sm transition ${
                  active
                    ? "bg-emerald-50 font-semibold text-emerald-800"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="truncate">{item.label}</span>
                {active ? (
                  <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        className={buttonClass}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("language")}
        title={t("language")}
      >
        <GlobeIcon />
      </button>

      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
