"use client";

import { useEffect, useId, useRef, useState } from "react";
import { isRtlLanguage } from "@/app/config/siteLanguages";

/**
 * خطوط معرفی زیر سرچ — در موبایل با لمس، متن کامل در tooltip نشان داده می‌شود.
 */
export default function HomeIntroLines({ introOrder, language, siteIntroByLang }) {
  const [openCode, setOpenCode] = useState(null);
  const rootRef = useRef(null);
  const tipId = useId();

  useEffect(() => {
    if (!openCode) return undefined;
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpenCode(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpenCode(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openCode]);

  return (
    <div
      ref={rootRef}
      className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-1 px-3 text-center sm:px-4"
      suppressHydrationWarning
    >
      {introOrder.map((code) => {
        const isActive = language === code;
        const rtl = isRtlLanguage(code);
        const text = siteIntroByLang[code] || "";
        const isOpen = openCode === code;

        return (
          <button
            key={code}
            type="button"
            dir={rtl ? "rtl" : "ltr"}
            lang={code}
            onClick={() => {
              if (isActive) return;
              setOpenCode((prev) => (prev === code ? null : code));
            }}
            onBlur={(e) => {
              if (!rootRef.current?.contains(e.relatedTarget)) setOpenCode(null);
            }}
            aria-expanded={isActive ? undefined : isOpen}
            aria-describedby={!isActive && isOpen ? `${tipId}-${code}` : undefined}
            title={isActive ? undefined : text}
            className={`relative mx-auto block w-full max-w-full rounded-md px-2 text-center leading-snug outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
              isActive
                ? "cursor-default whitespace-normal text-pretty text-[13px] font-semibold text-slate-800 sm:text-sm"
                : "cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-normal text-slate-400 sm:text-[11px]"
            }`}
            style={{ textAlign: "center" }}
            suppressHydrationWarning
          >
            {text}
            {isOpen && !isActive ? (
              <span
                id={`${tipId}-${code}`}
                role="tooltip"
                className="absolute bottom-full left-1/2 z-30 mb-1.5 w-[min(92vw,28rem)] -translate-x-1/2 whitespace-normal rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-center text-[12px] font-medium leading-5 text-white shadow-lg"
              >
                {text}
                <span
                  className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-slate-900"
                  aria-hidden
                />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
