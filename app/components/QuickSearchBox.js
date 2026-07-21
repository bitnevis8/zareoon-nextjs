"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import ExploreSearchModal from "@/app/components/ExploreSearchModal";

const DESKTOP_MQ = "(min-width: 1024px)";

function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M16.2 16.2L20.5 20.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * جستجوی سریع در صفحه اصلی:
 * - موبایل/تبلت: رفتن به صفحه جستجوی پیشرفته
 * - دسکتاپ: باز شدن مدال جستجوی پیشرفته
 */
export default function QuickSearchBox({
  className = "",
  inputClassName = "",
  variant = "homepage",
  autoFocus = false,
  initialQuery = "",
}) {
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();
  const inputRef = useRef(null);
  const [q, setQ] = useState(initialQuery);
  const [modalOpen, setModalOpen] = useState(false);

  const isHomepage = variant === "homepage";
  /** فارسی، عربی، اردو: ذره‌بین داخل اینپوت سمت چپ (آخر متن RTL) */
  const iconOnLeft = language === "fa" || language === "ar" || language === "ur";

  const exploreHref = (query = q) => {
    const trimmed = query.trim();
    return trimmed
      ? `/search?mode=explore&q=${encodeURIComponent(trimmed)}`
      : "/search?mode=explore";
  };

  const isDesktop = () =>
    typeof window !== "undefined" && window.matchMedia(DESKTOP_MQ).matches;

  const openSearch = () => {
    if (isDesktop()) {
      setModalOpen(true);
      return;
    }
    router.push(exploreHref());
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      openSearch();
    }
  };

  useEffect(() => {
    if (!modalOpen) return undefined;
    const onResize = () => {
      if (!window.matchMedia(DESKTOP_MQ).matches) {
        setModalOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [modalOpen]);

  const shellClass = isHomepage
    ? "mx-auto w-full max-w-xl px-1 sm:max-w-2xl sm:px-2 lg:max-w-3xl"
    : "mx-auto w-full max-w-2xl";

  const textAlignClass = isRTL
    ? "text-right placeholder:text-right"
    : "text-left placeholder:text-left";

  const fieldClass = inputClassName
    ? inputClassName
    : [
        "w-full cursor-pointer appearance-none rounded-2xl border border-slate-200/90 bg-white",
        "text-slate-800 shadow-[0_4px_24px_rgba(15,23,42,0.06)]",
        "placeholder:text-slate-400/90",
        "transition-[border-color,box-shadow] duration-200",
        "hover:border-emerald-200 hover:shadow-[0_8px_28px_rgba(6,95,70,0.08)]",
        "focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/15",
        /* mobile — فونت کوچک‌تر */
        "min-h-11 px-3.5 py-2.5 text-[13px] leading-snug",
        /* tablet+ */
        "sm:min-h-[3.25rem] sm:rounded-full sm:px-5 sm:text-[15px] sm:leading-normal",
        /* desktop */
        "lg:min-h-[3.75rem] lg:px-6 lg:text-base lg:tracking-tight",
        textAlignClass,
        iconOnLeft
          ? "ps-10 pe-3.5 sm:ps-12 sm:pe-5 lg:ps-[3.25rem] lg:pe-6"
          : "pe-10 ps-3.5 sm:pe-12 sm:ps-5 lg:pe-[3.25rem] lg:ps-6",
      ].join(" ");

  return (
    <>
      <div className={`relative ${shellClass} ${className}`}>
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            readOnly
            autoFocus={autoFocus}
            className={fieldClass}
            placeholder={t("searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={(e) => {
              e.target.blur();
              openSearch();
            }}
            onClick={openSearch}
            onKeyDown={onKeyDown}
            enterKeyHint="search"
            autoComplete="off"
            aria-label={t("searchAdvanced")}
            dir={isRTL ? "rtl" : "ltr"}
          />
          <span
            className={`pointer-events-none absolute top-1/2 z-[1] -translate-y-1/2 text-emerald-700/80 ${
              iconOnLeft
                ? "left-3.5 sm:left-4 lg:left-5"
                : "right-3.5 sm:right-4 lg:right-5"
            }`}
            aria-hidden
          >
            <SearchIcon className="h-4.5 w-4.5 sm:h-[1.35rem] sm:w-[1.35rem] lg:h-6 lg:w-6" />
          </span>
        </div>
      </div>

      <ExploreSearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialQuery={q}
      />
    </>
  );
}
