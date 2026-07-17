"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import ExploreSearchModal from "@/app/components/ExploreSearchModal";

const DESKTOP_MQ = "(min-width: 1024px)";

const INPUT_CLASS =
  "w-full min-h-11 rounded-full border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:px-5 sm:text-sm";

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
  const textAlign = isRTL ? "text-right" : "text-left";
  const inputClass = `${inputClassName || INPUT_CLASS} ${textAlign}`;
  /** فارسی و انگلیسی: ذره‌بین چپ (آخر اینپوت) · سایر زبان‌ها: راست (اول اینپوت) */
  const iconOnLeft = language === "fa" || language === "en";

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

  return (
    <>
      <div
        className={`relative mx-auto w-full ${isHomepage ? "max-w-xl px-1 sm:px-2" : "max-w-2xl"} ${className}`}
      >
        <span
          className={`pointer-events-none absolute top-1/2 z-[1] -translate-y-1/2 text-slate-400 ${
            iconOnLeft ? "left-3.5 sm:left-4" : "right-3.5 sm:right-4"
          }`}
          aria-hidden
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          readOnly
          autoFocus={autoFocus}
          className={`${inputClass} cursor-pointer ${iconOnLeft ? "ps-11 pe-4" : "pe-11 ps-4"}`}
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
      </div>

      <ExploreSearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialQuery={q}
      />
    </>
  );
}
