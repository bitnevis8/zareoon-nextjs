"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

/** دسکتاپ: ۲ ستون × ۳ سطر = ۶ کارت در هر اسلاید */
const PAGE_SIZE = 6;

function ChevronLeft({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

/**
 * نمایش ۶ کارت (۲×۳) در هر اسلاید + فلش چپ/راست + نشانگر مستطیلی زیر اسلایدها.
 * بدون اسکرول افقی.
 */
export default function TradeServicesCategoryPager({ items, renderItem, pageSize = PAGE_SIZE, className = "" }) {
  const { isRTL, t } = useLanguage();
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil((items?.length || 0) / pageSize));

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1));
  }, [pageCount]);

  const visible = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const start = page * pageSize;
    return list.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const canPrev = page > 0;
  const canNext = page < pageCount - 1;

  const goPrev = () => {
    if (canPrev) setPage((p) => p - 1);
  };
  const goNext = () => {
    if (canNext) setPage((p) => p + 1);
  };

  const arrowBtn =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200/90 bg-white text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white sm:h-11 sm:w-11";

  if (!items?.length) return null;

  const prevLabel = t("pagerPrevSlide");
  const nextLabel = t("pagerNextSlide");

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:auto-rows-fr">
        {visible.map((item, index) => renderItem(item, page * pageSize + index))}
      </div>

      {pageCount > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-2.5 sm:mt-4 sm:gap-3">
          <button
            type="button"
            onClick={isRTL ? goPrev : goNext}
            disabled={isRTL ? !canPrev : !canNext}
            className={arrowBtn}
            aria-label={isRTL ? prevLabel : nextLabel}
          >
            <ChevronRight />
          </button>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2" role="tablist" aria-label={t("pagerSlidesLabel")}>
            {Array.from({ length: pageCount }).map((_, i) => {
              const active = i === page;
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={t("pagerSlideN", { n: String(i + 1) })}
                  onClick={() => setPage(i)}
                  className={`rounded-md transition-all duration-300 ${
                    active
                      ? "h-2 w-8 bg-emerald-600 sm:h-2.5 sm:w-9"
                      : "h-2 w-4 bg-emerald-200/90 hover:bg-emerald-300 sm:h-2.5 sm:w-5"
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={isRTL ? goNext : goPrev}
            disabled={isRTL ? !canNext : !canPrev}
            className={arrowBtn}
            aria-label={isRTL ? nextLabel : prevLabel}
          >
            <ChevronLeft />
          </button>
        </div>
      ) : null}
    </div>
  );
}
