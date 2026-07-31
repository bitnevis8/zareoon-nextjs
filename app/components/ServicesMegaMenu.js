"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { useTradeServicesContent } from "@/app/hooks/useTradeServicesContent";
import { getCategoryIconPath, getSubcategoryIconPath } from "@/app/utils/tradeServiceIcons";

const HOVER_CLOSE_DELAY_MS = 400;
const HOVER_BRIDGE_PX = 10;
const DESKTOP_BP = 1024;
const PANEL_BOTTOM_GAP_RATIO = 0.1;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BP}px)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

function MenuIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function CloseIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronDown({ open }) {
  return (
    <svg
      className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ServiceGlyph({ path, className = "h-4 w-4" }) {
  return (
    <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

/** دکمه + مگامنوی خدمات — الگوی مشابه مگامنوی محصولات */
export default function ServicesMegaMenu({ triggerClassName = "" }) {
  const { t, isRTL, language } = useLanguage();
  const content = useTradeServicesContent();
  const categories = content?.categories || [];
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [activeCatId, setActiveCatId] = useState(null);
  const [panelTop, setPanelTop] = useState(0);
  const [panelHeight, setPanelHeight] = useState(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const closeTimerRef = useRef(null);
  const pinnedRef = useRef(false);

  pinnedRef.current = pinned;

  const activeCat = useMemo(
    () => categories.find((c) => c.id === activeCatId) || categories[0] || null,
    [categories, activeCatId]
  );

  const children = useMemo(
    () => (Array.isArray(activeCat?.children) ? activeCat.children : []),
    [activeCat]
  );

  const updatePanelLayout = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.bottom;
    const bottomGap = window.innerHeight * PANEL_BOTTOM_GAP_RATIO;
    setPanelTop(top);
    setPanelHeight(Math.max(280, window.innerHeight - top - bottomGap));
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(false);
    setPinned(false);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    if (pinnedRef.current || !isDesktop) return;
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      if (!pinnedRef.current) setOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer, isDesktop]);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
    updatePanelLayout();
  }, [clearCloseTimer, updatePanelLayout]);

  const keepOpen = useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  const selectCat = useCallback(
    (catId) => {
      setActiveCatId(catId);
      requestAnimationFrame(() => {
        if (!isDesktop) {
          contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
      });
    },
    [isDesktop]
  );

  const handleTriggerMouseEnter = () => {
    if (!isDesktop) return;
    openMenu();
  };

  const handleTriggerClick = () => {
    if (!isDesktop) {
      setPinned(true);
      setOpen(true);
      updatePanelLayout();
      return;
    }
    updatePanelLayout();
    if (open && pinned) {
      closeMenu();
      return;
    }
    clearCloseTimer();
    setPinned(true);
    setOpen(true);
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    if (categories.length && activeCatId == null) {
      setActiveCatId(categories[0].id);
    }
  }, [open, categories, activeCatId]);

  useEffect(() => {
    if (!open) return;
    updatePanelLayout();
    const onResize = () => updatePanelLayout();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, updatePanelLayout]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !pinned) return;
    const onPointerDown = (e) => {
      const target = e.target;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      closeMenu();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, pinned, closeMenu]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const label = t("mobileServicesTab") || t("navServices") || "خدمات";
  const showBackdrop = open && (pinned || !isDesktop);

  const rootButtonClass = (active) =>
    [
      "flex w-full items-center gap-2.5 text-right transition-colors duration-100",
      "rounded-lg px-2.5 py-2 max-lg:min-h-[44px] max-lg:border max-lg:py-2.5",
      "lg:rounded-lg lg:px-2.5 lg:py-2",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
      active
        ? "border-emerald-200 bg-emerald-50 text-emerald-950 max-lg:border-emerald-200 lg:border lg:border-emerald-200 lg:bg-emerald-50 lg:text-emerald-950"
        : "border-transparent bg-transparent text-slate-800 hover:bg-emerald-50/80 hover:text-emerald-950 max-lg:bg-white",
    ].join(" ");

  const megaPanel =
    mounted && open ? (
      <>
        {showBackdrop ? (
          <button
            type="button"
            className="fixed inset-0 z-[10000] bg-slate-900/45 backdrop-blur-[1px] lg:bg-black/20"
            aria-label={t("closeMenu") || "بستن"}
            onClick={closeMenu}
          />
        ) : null}

        {isDesktop ? (
          <div
            className="fixed inset-x-0 z-[10001]"
            style={{ top: panelTop - HOVER_BRIDGE_PX, height: HOVER_BRIDGE_PX }}
            onMouseEnter={keepOpen}
            onMouseLeave={scheduleClose}
            aria-hidden
          />
        ) : null}

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={[
            "fixed z-[10001] flex flex-col overflow-hidden bg-white shadow-xl",
            "max-lg:inset-0 max-lg:max-h-[100dvh]",
            "lg:inset-x-0 lg:border-b lg:border-slate-200",
          ].join(" ")}
          style={
            isDesktop
              ? { top: panelTop, height: panelHeight ?? undefined, maxHeight: panelHeight ?? undefined }
              : undefined
          }
          onMouseEnter={isDesktop ? keepOpen : undefined}
          onMouseLeave={isDesktop ? scheduleClose : undefined}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5 lg:hidden">
            <h2 className="truncate text-sm font-bold text-slate-900">{label}</h2>
            <button
              type="button"
              onClick={closeMenu}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
              aria-label={t("closeMenu") || "بستن"}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
            <aside
              className={[
                "flex shrink-0 flex-col overflow-hidden bg-slate-50 lg:w-[19rem]",
                isRTL ? "lg:border-l lg:border-slate-200" : "lg:border-r lg:border-slate-200",
                "max-lg:max-h-[38vh] max-lg:border-b max-lg:border-slate-200",
              ].join(" ")}
            >
              <p className="hidden shrink-0 border-b border-slate-200/80 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 lg:block">
                {t("tradeServicesCategoriesTitle") || "دسته‌های خدمات"}
              </p>

              <ul
                className={[
                  "grid min-h-0 flex-1 grid-cols-2 gap-1 overflow-y-auto overscroll-y-contain p-1.5 sm:grid-cols-2",
                  "lg:grid-cols-1 lg:content-start lg:auto-rows-min lg:gap-1 lg:p-2",
                  "[scrollbar-gutter:stable] [scrollbar-width:thin]",
                  "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80",
                ].join(" ")}
              >
                {categories.map((cat) => {
                  const active = activeCat?.id === cat.id;
                  const iconPath = getCategoryIconPath(cat.icon || cat.id);
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        onMouseEnter={isDesktop ? () => selectCat(cat.id) : undefined}
                        onFocus={() => selectCat(cat.id)}
                        onClick={() => selectCat(cat.id)}
                        className={rootButtonClass(active)}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md lg:h-6 lg:w-6 ${
                            active
                              ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80"
                              : "bg-white text-emerald-700 ring-1 ring-slate-200/80"
                          }`}
                        >
                          <ServiceGlyph path={iconPath} className="h-3.5 w-3.5" />
                        </span>
                        <span className="flex-1 text-start text-xs font-semibold leading-snug text-inherit sm:text-sm lg:text-[13px]">
                          {cat.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {activeCat ? (
                <>
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-3 py-1.5 lg:px-3 lg:py-2">
                    <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">{activeCat.title}</h3>
                    <Link
                      href="/trade-services"
                      onClick={closeMenu}
                      className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-900 sm:text-sm"
                    >
                      {t("viewAll") || "مشاهده همه"}
                    </Link>
                  </div>

                  <div
                    ref={contentRef}
                    className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-3 [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80"
                  >
                    <div className="space-y-4 px-3 lg:px-4">
                      {/* والد — دسته اصلی قابل کلیک */}
                      <Link
                        href={`/trade-services/${activeCat.id}`}
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-3 transition hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 ring-1 ring-emerald-200/80 shadow-sm">
                          <ServiceGlyph
                            path={getCategoryIconPath(activeCat.icon || activeCat.id)}
                            className="h-5 w-5"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="mb-0.5 block text-[10px] font-semibold text-emerald-700">
                            {language === "en" ? "Main category" : "دسته اصلی"}
                          </span>
                          <span className="block text-sm font-bold text-slate-900 sm:text-base">
                            {activeCat.title}
                          </span>
                          {activeCat.description ? (
                            <span className="mt-0.5 line-clamp-1 block text-xs text-slate-600">
                              {activeCat.description}
                            </span>
                          ) : null}
                        </span>
                        <svg
                          className="h-4 w-4 shrink-0 text-emerald-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path
                            fillRule="evenodd"
                            d={
                              isRTL
                                ? "M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                : "M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                            }
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>

                      {children.length ? (
                        <div>
                          <p className="mb-2 text-[11px] font-semibold text-slate-500">
                            {t("tradeServicesSubcategoriesTitle") || "زیرشاخه‌ها"}
                          </p>
                          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {children.map((sub) => (
                              <li key={sub.id}>
                                <Link
                                  href={`/trade-services/${activeCat.id}?sub=${encodeURIComponent(sub.id)}`}
                                  onClick={closeMenu}
                                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-950"
                                >
                                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-emerald-700 ring-1 ring-slate-200/80">
                                    <ServiceGlyph path={getSubcategoryIconPath(sub.id)} className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0 flex-1 text-sm font-medium leading-snug">{sub.title}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="py-6 text-center text-xs text-slate-500">
                          {t("noCategoryRegistered") || "زیرشاخه‌ای ثبت نشده است."}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 px-3 py-2 text-center lg:hidden">
            <Link href="/trade-services" onClick={closeMenu} className="text-xs font-semibold text-emerald-700">
              {t("viewAll") || "مشاهده همه خدمات"}
            </Link>
          </div>
        </div>
      </>
    ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        className="relative z-20 flex h-full shrink-0 self-stretch"
        onMouseEnter={handleTriggerMouseEnter}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          onClick={handleTriggerClick}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={[
            "flex h-full min-h-10 items-center justify-center gap-1.5 border-l border-emerald-200/90 bg-white px-3 text-[11px] font-semibold text-slate-800 transition sm:gap-2 sm:px-4 sm:text-xs",
            "hover:bg-emerald-50 hover:text-emerald-900",
            open ? "bg-emerald-50 text-emerald-900 ring-1 ring-inset ring-emerald-200" : "",
            triggerClassName,
          ].join(" ")}
        >
          <MenuIcon className="h-3.5 w-3.5 shrink-0 text-teal-700" />
          <span className="whitespace-nowrap">{label}</span>
          <ChevronDown open={open} />
        </button>
      </div>
      {mounted && megaPanel ? createPortal(megaPanel, document.body) : null}
    </>
  );
}
