"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

/** دسکتاپ: ۲ ستون × ۳ سطر = ۶ کارت در هر اسلاید */
const PAGE_SIZE = 6;
const SWIPE_THRESHOLD = 48;

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
 * نمایش ۶ کارت (۲×۳) در هر اسلاید + فلش روی‌هم‌افتاده (بدون گرفتن فضای کارت) + سوایپ + نشانگر.
 */
export default function TradeServicesCategoryPager({ items, renderItem, pageSize = PAGE_SIZE, className = "" }) {
  const { isRTL, t } = useLanguage();
  const [page, setPage] = useState(0);
  const [gridMinHeight, setGridMinHeight] = useState(null);
  const gridRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const swiping = useRef(false);

  const pageCount = Math.max(1, Math.ceil((items?.length || 0) / pageSize));

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1));
  }, [pageCount]);

  const visible = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const start = page * pageSize;
    return list.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  // همیشه pageSize خانه تا ارتفاع اسلاید ثابت بماند
  const slots = useMemo(() => {
    const cells = Array.from({ length: pageSize }, (_, i) => visible[i] ?? null);
    return cells;
  }, [visible, pageSize]);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return undefined;

    const measure = () => {
      if (visible.length < pageSize && gridMinHeight != null) return;
      const h = Math.ceil(el.getBoundingClientRect().height);
      if (h <= 0) return;
      setGridMinHeight((prev) => (prev == null || h > prev ? h : prev));
    };

    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [visible.length, pageSize, page, items, gridMinHeight]);

  const canPrev = page > 0;
  const canNext = page < pageCount - 1;

  const goPrev = useCallback(() => {
    setPage((p) => (p > 0 ? p - 1 : p));
  }, []);

  const goNext = useCallback(() => {
    setPage((p) => (p < pageCount - 1 ? p + 1 : p));
  }, [pageCount]);

  const onPointerDown = (e) => {
    if (pageCount <= 1) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    swiping.current = false;
  };

  const onPointerMove = (e) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const dx = e.clientX - touchStartX.current;
    const dy = e.clientY - touchStartY.current;
    if (!swiping.current && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      swiping.current = true;
    }
  };

  const onPointerUp = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.clientX - touchStartX.current;
    const dy = e.clientY - (touchStartY.current ?? e.clientY);
    touchStartX.current = null;
    touchStartY.current = null;

    if (!swiping.current && Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;

    const goForward = isRTL ? dx > 0 : dx < 0;
    if (goForward) goNext();
    else goPrev();
  };

  const onPointerCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    swiping.current = false;
  };

  // روی کارت‌ها؛ بدون padding که فضای کارت را کم کند
  const arrowBtn =
    "pointer-events-auto absolute top-1/2 z-20 flex h-11 w-4 -translate-y-1/2 items-center justify-center rounded-sm border text-white shadow-md backdrop-blur-[2px] transition sm:h-14 sm:w-5 lg:h-16 lg:w-6 " +
    "border-emerald-600/25 bg-emerald-700/55 hover:bg-emerald-700/80 hover:shadow-lg " +
    "disabled:cursor-not-allowed disabled:border-slate-300/60 disabled:bg-slate-300/75 disabled:text-slate-500 disabled:opacity-100 disabled:shadow-none disabled:hover:bg-slate-300/75";

  if (!items?.length) return null;

  const prevLabel = t("pagerPrevSlide");
  const nextLabel = t("pagerNextSlide");

  const onLeftArrow = isRTL ? goNext : goPrev;
  const onRightArrow = isRTL ? goPrev : goNext;
  const leftDisabled = isRTL ? !canNext : !canPrev;
  const rightDisabled = isRTL ? !canPrev : !canNext;
  const leftLabel = isRTL ? nextLabel : prevLabel;
  const rightLabel = isRTL ? prevLabel : nextLabel;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative overflow-visible px-4 sm:px-5 lg:px-6">
        <div
          className="touch-pan-y select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          style={{ touchAction: "pan-y" }}
        >
          <div
            ref={gridRef}
            className="grid grid-cols-2 gap-2 sm:gap-4 lg:auto-rows-fr"
            style={gridMinHeight ? { minHeight: gridMinHeight } : undefined}
          >
            {slots.map((item, index) => {
              if (item) {
                return (
                  <div key={item.id || `item-${page}-${index}`} className="min-h-0 h-full">
                    {renderItem(item, page * pageSize + index)}
                  </div>
                );
              }
              return (
                <div
                  key={`empty-${page}-${index}`}
                  className="invisible min-h-[10.5rem] pointer-events-none sm:min-h-[12rem]"
                  aria-hidden
                />
              );
            })}
          </div>
        </div>

        {pageCount > 1 ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20">
            <button
              type="button"
              onClick={onLeftArrow}
              disabled={leftDisabled}
              className={`${arrowBtn} left-0 sm:left-0.5`}
              aria-label={leftLabel}
              aria-disabled={leftDisabled}
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              onClick={onRightArrow}
              disabled={rightDisabled}
              className={`${arrowBtn} right-0 sm:right-0.5`}
              aria-label={rightLabel}
              aria-disabled={rightDisabled}
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </button>
          </div>
        ) : null}
      </div>

      {pageCount > 1 ? (
        <div
          className="mt-3 flex items-center justify-center gap-1.5 sm:mt-4 sm:gap-2"
          role="tablist"
          aria-label={t("pagerSlidesLabel")}
        >
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
      ) : null}
    </div>
  );
}
