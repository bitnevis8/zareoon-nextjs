"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

/** دسکتاپ: ۲ ستون × ۳ سطر = ۶ کارت در هر اسلاید */
const PAGE_SIZE = 6;
const SWIPE_THRESHOLD = 36;

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
 * اسلایدر کارت — فلش روی کارت‌ها (بدون گرفتن فضای شبکه)
 */
export default function TradeServicesCategoryPager({
  items,
  renderItem,
  pageSize = PAGE_SIZE,
  className = "",
  /** اگر false باشد خانه‌های خالی اسلاید آخر پر نمی‌شود و کارت‌ها وسط/طبیعی‌تر می‌مانند */
  fillEmptySlots = true,
  /** کلاس شبکه؛ پیش‌فرض ۲ ستون */
  gridClassName = "grid grid-cols-2 gap-2 sm:gap-4 lg:auto-rows-fr",
}) {
  const { isRTL, t } = useLanguage();
  const [page, setPage] = useState(0);
  const [gridMinHeight, setGridMinHeight] = useState(null);
  const gridRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const swiping = useRef(false);
  const suppressClick = useRef(false);

  const pageCount = Math.max(1, Math.ceil((items?.length || 0) / pageSize));

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1));
  }, [pageCount]);

  const visible = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const start = page * pageSize;
    return list.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const slots = useMemo(() => {
    if (!fillEmptySlots) return visible;
    return Array.from({ length: pageSize }, (_, i) => visible[i] ?? null);
  }, [visible, pageSize, fillEmptySlots]);

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
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (e) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const dx = e.clientX - touchStartX.current;
    const dy = e.clientY - touchStartY.current;
    if (!swiping.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.1) {
      swiping.current = true;
    }
  };

  const onPointerUp = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.clientX - touchStartX.current;
    const dy = e.clientY - (touchStartY.current ?? e.clientY);
    const wasSwipe = swiping.current;
    touchStartX.current = null;
    touchStartY.current = null;
    swiping.current = false;

    if (!wasSwipe && Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 0.85) return;

    suppressClick.current = true;
    // کشیدن به چپ = بعدی (در LTR)؛ در RTL برعکس حس طبیعی پیمایش
    const goForward = isRTL ? dx > 0 : dx < 0;
    if (goForward) goNext();
    else goPrev();
  };

  const onPointerCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    swiping.current = false;
  };

  const onClickCapture = (e) => {
    if (!suppressClick.current) return;
    e.preventDefault();
    e.stopPropagation();
    suppressClick.current = false;
  };

  // هر دو فلش همیشه دیده می‌شوند؛ غیرفعال فقط کم‌رنگ
  const arrowBtn =
    "pointer-events-auto absolute top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/95 text-emerald-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:shadow-lg disabled:cursor-default disabled:border-slate-200/80 disabled:bg-white/80 disabled:text-slate-300 disabled:shadow-sm sm:h-10 sm:w-10";

  if (!items?.length) return null;

  const prevLabel = t("pagerPrevSlide");
  const nextLabel = t("pagerNextSlide");

  // جابه‌جایی جهت‌ها نسبت به قبل (برعکس)
  const onLeftArrow = isRTL ? goPrev : goNext;
  const onRightArrow = isRTL ? goNext : goPrev;
  const leftDisabled = isRTL ? !canPrev : !canNext;
  const rightDisabled = isRTL ? !canNext : !canPrev;
  const leftLabel = isRTL ? prevLabel : nextLabel;
  const rightLabel = isRTL ? nextLabel : prevLabel;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <div
          className="select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onClickCapture={onClickCapture}
          style={{ touchAction: "pan-y pinch-zoom" }}
        >
          <div
            ref={gridRef}
            className={gridClassName}
            style={gridMinHeight && fillEmptySlots ? { minHeight: gridMinHeight } : undefined}
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
          <>
            <button
              type="button"
              onClick={onLeftArrow}
              disabled={leftDisabled}
              className={`${arrowBtn} left-1 sm:left-1.5`}
              aria-label={leftLabel}
              aria-disabled={leftDisabled}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              onClick={onRightArrow}
              disabled={rightDisabled}
              className={`${arrowBtn} right-1 sm:right-1.5`}
              aria-label={rightLabel}
              aria-disabled={rightDisabled}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </>
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
