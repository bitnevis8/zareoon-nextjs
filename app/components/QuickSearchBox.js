"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import ExploreSearchModal from "@/app/components/ExploreSearchModal";

const DESKTOP_MQ = "(min-width: 1024px)";

const FILTER_CHIPS = [
  { id: "all", labelKey: "mobileSearchFilterAll" },
  { id: "products", labelKey: "mobileSearchFilterProducts" },
  { id: "services", labelKey: "mobileSearchFilterServices" },
  { id: "posts", labelKey: "mobileSearchFilterPosts" },
  { id: "hashtag", labelKey: "mobileSearchFilterHashtag" },
];

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
 * جستجوی سریع:
 * - homepage: باکس بزرگ (بدون فیلتر — فیلترها فقط در صفحه/مودال جستجو)
 * - header: فشرده وسط هدر (دسکتاپ)
 */
export default function QuickSearchBox({
  className = "",
  inputClassName = "",
  variant = "homepage",
  autoFocus = false,
  initialQuery = "",
  showFilters = false,
}) {
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();
  const inputRef = useRef(null);
  const [q, setQ] = useState(initialQuery);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFilter, setModalFilter] = useState("all");

  const isHomepage = variant === "homepage";
  const isHeader = variant === "header";
  const filtersVisible = showFilters;
  const iconOnLeft = language === "fa" || language === "ar" || language === "ur";

  const exploreHref = (query = q, filter = "all") => {
    const params = new URLSearchParams();
    params.set("mode", "explore");
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    if (filter && filter !== "all") params.set("filter", filter);
    return `/search?${params.toString()}`;
  };

  const isDesktop = () =>
    typeof window !== "undefined" && window.matchMedia(DESKTOP_MQ).matches;

  const openSearch = (filter = "all") => {
    if (isDesktop()) {
      setModalFilter(filter);
      setModalOpen(true);
      return;
    }
    router.push(exploreHref(q, filter));
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      openSearch("all");
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

  const shellClass = isHeader
    ? "w-full max-w-xl"
    : isHomepage
      ? "mx-auto w-full max-w-xl px-1 sm:max-w-2xl sm:px-2 lg:max-w-3xl"
      : "mx-auto w-full max-w-2xl";

  const textAlignClass = isRTL
    ? "text-right placeholder:text-right"
    : "text-left placeholder:text-left";

  const fieldClass = inputClassName
    ? inputClassName
    : isHeader
      ? [
          "w-full cursor-pointer appearance-none rounded-full border border-slate-200 bg-slate-50",
          "text-sm text-slate-800 placeholder:text-slate-400",
          "transition-[border-color,box-shadow,background-color] duration-200",
          "hover:border-emerald-200 hover:bg-white",
          "focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
          "min-h-10 px-4 py-2",
          textAlignClass,
          iconOnLeft ? "ps-10 pe-4" : "pe-10 ps-4",
        ].join(" ")
      : [
          "w-full cursor-pointer appearance-none rounded-2xl border border-slate-200/90 bg-white",
          "text-slate-800 shadow-[0_4px_24px_rgba(15,23,42,0.06)]",
          "placeholder:text-slate-400/90",
          "transition-[border-color,box-shadow] duration-200",
          "hover:border-emerald-200 hover:shadow-[0_8px_28px_rgba(6,95,70,0.08)]",
          "focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/15",
          "min-h-11 px-3.5 py-2.5 text-sm leading-snug",
          "sm:min-h-[3.25rem] sm:rounded-full sm:px-5 sm:leading-normal",
          "lg:min-h-[3.75rem] lg:px-6 lg:text-base lg:tracking-tight",
          textAlignClass,
          iconOnLeft
            ? "ps-10 pe-3.5 sm:ps-12 sm:pe-5 lg:ps-[3.25rem] lg:pe-6"
            : "pe-10 ps-3.5 sm:pe-12 sm:ps-5 lg:pe-[3.25rem] lg:ps-6",
        ].join(" ");

  return (
    <>
      <div
        className={`relative ${shellClass} ${className}`}
        id={isHomepage ? "homepage-quick-search" : undefined}
      >
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
              openSearch("all");
            }}
            onClick={() => openSearch("all")}
            onKeyDown={onKeyDown}
            enterKeyHint="search"
            autoComplete="off"
            aria-label={t("searchAdvanced")}
            dir={isRTL ? "rtl" : "ltr"}
          />
          <span
            className={`pointer-events-none absolute top-1/2 z-[1] -translate-y-1/2 text-emerald-700/80 ${
              iconOnLeft
                ? isHeader
                  ? "left-3.5"
                  : "left-3.5 sm:left-4 lg:left-5"
                : isHeader
                  ? "right-3.5"
                  : "right-3.5 sm:right-4 lg:right-5"
            }`}
            aria-hidden
          >
            <SearchIcon
              className={
                isHeader ? "h-4 w-4" : "h-4.5 w-4.5 sm:h-[1.35rem] sm:w-[1.35rem] lg:h-6 lg:w-6"
              }
            />
          </span>
        </div>

        {filtersVisible ? (
          <div
            className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-2.5 sm:justify-center sm:overflow-visible sm:flex-wrap"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => openSearch(chip.id)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 sm:px-3 sm:py-1.5 sm:text-xs"
              >
                {t(chip.labelKey)}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <ExploreSearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialQuery={q}
        initialFilter={modalFilter}
      />
    </>
  );
}
