"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

function ChevronIcon({ direction, className = "h-4 w-4" }) {
  const rotate = direction === "left" ? "rotate-180" : "";
  return (
    <svg className={`${className} ${rotate}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function getHorizontalScrollState(el, isRTL) {
  const max = Math.max(0, el.scrollWidth - el.clientWidth);
  if (max < 8) {
    return { scrollable: false, canBack: false, canForward: false, page: 0, pageCount: 1 };
  }

  const pageWidth = el.clientWidth || 1;
  const pageCount = Math.max(2, Math.ceil(el.scrollWidth / pageWidth));

  let current = el.scrollLeft;
  if (isRTL) {
    if (current < 0) {
      current = Math.abs(current);
    } else {
      current = max - current;
    }
  }

  current = Math.min(Math.max(current, 0), max);

  return {
    scrollable: true,
    canBack: current > 4,
    canForward: current < max - 4,
    page: Math.min(pageCount - 1, Math.round((current / max) * (pageCount - 1))),
    pageCount,
  };
}

function ScrollDots({ page, pageCount, onSelect, isRTL }) {
  if (pageCount <= 1) return null;

  return (
    <div
      className="mt-2 flex items-center justify-center gap-1.5"
      dir={isRTL ? "rtl" : "ltr"}
      role="tablist"
      aria-label="صفحه‌بندی"
    >
      {Array.from({ length: pageCount }).map((_, index) => {
        const active = index === page;
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`صفحه ${index + 1}`}
            onClick={() => onSelect(index)}
            className={`h-2 w-2 rounded-full border transition-all ${
              active
                ? "border-green-600 bg-green-600/80 scale-110"
                : "border-green-600/35 bg-transparent hover:border-green-600/55"
            }`}
          />
        );
      })}
    </div>
  );
}

const ARROW_STYLES = {
  center:
    "absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-green-600/20 bg-white/80 text-green-700 shadow-sm backdrop-blur-md transition-all sm:h-8 sm:w-8 sm:bg-white/60 hover:border-green-600/35 hover:bg-white/80 disabled:pointer-events-none disabled:opacity-0",
  bottom:
    "absolute bottom-1 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-emerald-700/15 bg-emerald-50/70 text-emerald-800 shadow-sm backdrop-blur-md transition-all sm:h-8 sm:w-8 sm:bg-emerald-50/50 hover:border-emerald-700/30 hover:bg-emerald-50/70 disabled:pointer-events-none disabled:opacity-0",
};

export default function HorizontalScrollRow({
  children,
  isRTL = true,
  className = "",
  showArrows = true,
  showDots = true,
  arrowPlacement = "center",
}) {
  const ref = useRef(null);
  const [scrollable, setScrollable] = useState(false);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const updateState = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const state = getHorizontalScrollState(el, isRTL);
    setScrollable(state.scrollable);
    setCanScrollBack(state.canBack);
    setCanScrollForward(state.canForward);
    setPage(state.page);
    setPageCount(state.pageCount);
  }, [isRTL]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const runUpdate = () => requestAnimationFrame(updateState);

    runUpdate();
    const t1 = setTimeout(runUpdate, 120);
    const t2 = setTimeout(runUpdate, 400);

    el.addEventListener("scroll", runUpdate, { passive: true });
    window.addEventListener("resize", runUpdate);

    const ro = new ResizeObserver(runUpdate);
    ro.observe(el);
    for (const child of el.children) {
      ro.observe(child);
    }

    const mo = new MutationObserver(runUpdate);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      el.removeEventListener("scroll", runUpdate);
      window.removeEventListener("resize", runUpdate);
      ro.disconnect();
      mo.disconnect();
    };
  }, [updateState, children]);

  const scrollByPage = (forward) => {
    const el = ref.current;
    if (!el) return;
    const delta = el.clientWidth * 0.85;
    const sign = forward ? 1 : -1;
    const left = isRTL ? -sign * delta : sign * delta;
    el.scrollBy({ left, behavior: "smooth" });
  };

  const scrollToPage = (targetPage) => {
    const el = ref.current;
    if (!el?.children?.length) return;

    const count = Math.max(1, pageCount);
    const index = Math.min(
      el.children.length - 1,
      Math.round((targetPage / Math.max(1, count - 1)) * (el.children.length - 1))
    );

    el.children[index]?.scrollIntoView({
      behavior: "smooth",
      inline: isRTL ? "end" : "start",
      block: "nearest",
    });
  };

  const childCount = Children.count(children);
  const arrowClass = ARROW_STYLES[arrowPlacement] || ARROW_STYLES.center;
  const backPos =
    arrowPlacement === "bottom"
      ? isRTL
        ? "right-1.5"
        : "left-1.5"
      : isRTL
        ? "right-1"
        : "left-1";
  const forwardPos =
    arrowPlacement === "bottom"
      ? isRTL
        ? "left-1.5"
        : "right-1.5"
      : isRTL
        ? "left-1"
        : "right-1";

  return (
    <div className={`relative ${className}`}>
      {showArrows && scrollable ? (
        <>
          <button
            type="button"
            className={`${arrowClass} ${backPos}`}
            onClick={() => scrollByPage(false)}
            disabled={!canScrollBack}
            aria-label="اسکرول به عقب"
          >
            <ChevronIcon direction={isRTL ? "right" : "left"} />
          </button>
          <button
            type="button"
            className={`${arrowClass} ${forwardPos}`}
            onClick={() => scrollByPage(true)}
            disabled={!canScrollForward}
            aria-label="اسکرول به جلو"
          >
            <ChevronIcon direction={isRTL ? "left" : "right"} />
          </button>
        </>
      ) : null}

      <div
        ref={ref}
        dir={isRTL ? "rtl" : "ltr"}
        className={`product-scroll-row flex gap-2.5 overflow-x-auto snap-x snap-mandatory sm:gap-3 ${
          showArrows && scrollable
            ? arrowPlacement === "bottom"
              ? "pb-10 sm:pb-9"
              : "px-2 pb-1 sm:px-9"
            : "pb-1"
        }`}
      >
        {children}
      </div>

      {showDots && scrollable && childCount > 0 ? (
        <ScrollDots page={page} pageCount={pageCount} onSelect={scrollToPage} isRTL={isRTL} />
      ) : null}
    </div>
  );
}
