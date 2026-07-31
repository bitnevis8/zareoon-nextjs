"use client";

import { useId, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

/**
 * متن بلند: روی موبایل خلاصه + دکمه بیشتر/کمتر؛ از sm به بالا کامل.
 */
export default function ExpandableText({
  children,
  className = "",
  clampClass = "line-clamp-3",
  mobileOnly = true,
  tone = "emerald",
}) {
  const { t, isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const more = t("showMore") || t("readMore") || "نمایش بیشتر";
  const less = t("showLess") || "نمایش کمتر";
  const btnTone =
    tone === "light"
      ? "text-emerald-100 hover:text-white"
      : "text-emerald-700 hover:text-emerald-900";

  if (!children) return null;

  return (
    <div className={className} dir={isRTL ? "rtl" : "ltr"}>
      <p
        id={panelId}
        className={`${open ? "" : clampClass} ${mobileOnly ? "sm:line-clamp-none" : ""}`}
      >
        {children}
      </p>
      <button
        type="button"
        className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold underline-offset-2 hover:underline sm:text-xs ${btnTone} ${
          mobileOnly ? "sm:hidden" : ""
        }`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? less : more}
        <svg
          className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
