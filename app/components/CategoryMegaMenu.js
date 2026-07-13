"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";
import { useLanguage } from "@/app/context/LanguageContext";
import { getLocalizedText } from "@/app/utils/localize";
import { sortCatalogItems } from "@/app/utils/productSort";
import { getMainCategoryIcon } from "@/app/utils/mainCategoryIcons";

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

const DESKTOP_L2_COLUMNS = 5;
const AGRICULTURE_ROOT_ID = 900001;
/** Pinned L2 order per column index (0-based). */
const AG_L2_PINNED_COLUMNS = {
  3: [910009, 910010, 910007, 910008], // قهوه، کاکائو، حبوبات، بذر و نهال
  4: [910004, 910006], // غلات، دامپروری
};

function distributeL2ToColumns(items, columnCount, rootId) {
  if (Number(rootId) === AGRICULTURE_ROOT_ID) {
    return distributeAgricultureL2ToColumns(items, columnCount);
  }
  const columns = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns;
}

function distributeAgricultureL2ToColumns(items, columnCount) {
  const columns = Array.from({ length: columnCount }, () => []);
  const pinnedIds = new Set(Object.values(AG_L2_PINNED_COLUMNS).flat());

  for (const [colIndex, ids] of Object.entries(AG_L2_PINNED_COLUMNS)) {
    columns[Number(colIndex)] = ids
      .map((id) => items.find((item) => Number(item.id) === id))
      .filter(Boolean);
  }

  const rest = items.filter((item) => !pinnedIds.has(Number(item.id)));
  const freeColumnIndices = Array.from({ length: columnCount }, (_, i) => i).filter(
    (i) => !Object.prototype.hasOwnProperty.call(AG_L2_PINNED_COLUMNS, String(i))
  );

  rest.forEach((item, index) => {
    columns[freeColumnIndices[index % freeColumnIndices.length]].push(item);
  });
  return columns;
}

function L2CategorySection({ l2, childrenMap, language, closeMenu }) {
  const l2Label = getLocalizedText(l2, language);
  const products = childrenMap.get(l2.id) || [];

  return (
    <section className="mb-3 min-w-0">
      <Link
        href={`/catalog/${l2.id}`}
        onClick={closeMenu}
        className="mb-1 block text-sm font-bold leading-snug text-slate-900 transition hover:text-emerald-700"
      >
        {l2Label}
      </Link>
      {products.length ? (
        <ul className="space-y-0.5">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/catalog/${product.id}`}
                onClick={closeMenu}
                className="block truncate py-0.5 text-[13px] leading-relaxed text-slate-600 transition hover:text-emerald-700 sm:text-sm"
              >
                {getLocalizedText(product, language)}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function MenuIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
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

function buildChildrenMap(items, language) {
  const map = new Map();
  for (const item of items) {
    const key = item.parentId == null ? "root" : item.parentId;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  for (const [key, list] of map) {
    map.set(key, sortCatalogItems(list, language));
  }
  return map;
}

export default function CategoryMegaMenu() {
  const { t, language, isRTL } = useLanguage();
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRootId, setActiveRootId] = useState(null);
  const [panelTop, setPanelTop] = useState(0);
  const [panelHeight, setPanelHeight] = useState(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const closeTimerRef = useRef(null);
  const pinnedRef = useRef(false);

  pinnedRef.current = pinned;

  const childrenMap = useMemo(
    () => buildChildrenMap(allItems, language),
    [allItems, language]
  );

  const roots = useMemo(() => childrenMap.get("root") || [], [childrenMap]);

  const activeRoot = useMemo(
    () => roots.find((r) => Number(r.id) === Number(activeRootId)) || roots[0] || null,
    [roots, activeRootId]
  );

  const l2Categories = useMemo(() => {
    if (!activeRoot) return [];
    return childrenMap.get(activeRoot.id) || [];
  }, [activeRoot, childrenMap]);

  const l2ColumnGroups = useMemo(() => {
    if (!isDesktop || !l2Categories.length) return null;
    return distributeL2ToColumns(l2Categories, DESKTOP_L2_COLUMNS, activeRoot?.id);
  }, [isDesktop, l2Categories, activeRoot?.id]);

  const loadCatalog = useCallback(async () => {
    if (allItems.length) return;
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.supplier.products.getAll, { cache: "no-store" });
      const json = await res.json();
      setAllItems(Array.isArray(json?.data) ? json.data : []);
    } catch {
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, [allItems.length]);

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
    loadCatalog();
    updatePanelLayout();
  }, [clearCloseTimer, loadCatalog, updatePanelLayout]);

  const keepOpen = useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  const selectRoot = useCallback(
    (rootId) => {
      setActiveRootId(rootId);
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
      loadCatalog();
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
    loadCatalog();
  };

  useEffect(() => {
    setMounted(true);
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (!open) return;
    if (roots.length && activeRootId == null) {
      setActiveRootId(roots[0].id);
    }
  }, [open, roots, activeRootId]);

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
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const onWheel = (e) => {
      if (!panel.contains(e.target)) return;

      let node = e.target;
      while (node && node !== panel) {
        if (node instanceof HTMLElement) {
          const { overflowY } = getComputedStyle(node);
          const scrollable =
            (overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight;
          if (scrollable) {
            const atTop = node.scrollTop <= 0;
            const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
            if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
              return;
            }
            break;
          }
        }
        node = node.parentElement;
      }

      const content = contentRef.current;
      if (content && content.scrollHeight > content.clientHeight) {
        e.preventDefault();
        content.scrollTop += e.deltaY;
        return;
      }

      e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
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

  const showBackdrop = open && (pinned || !isDesktop);

  const rootButtonClass = (active) =>
    [
      "flex w-full items-center gap-2 text-right transition-colors duration-100",
      "rounded-lg px-2 py-2 max-lg:min-h-[44px] max-lg:border max-lg:py-2.5",
      "lg:rounded-md lg:px-2.5 lg:py-2 lg:gap-2",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50",
      active
        ? "max-lg:border-emerald-600 max-lg:bg-emerald-600 max-lg:text-white lg:bg-emerald-600 lg:text-white"
        : "max-lg:border-transparent max-lg:bg-white max-lg:text-slate-800 lg:text-slate-700 lg:hover:bg-white/70",
    ].join(" ");

  const megaPanel =
    mounted && open ? (
      <>
        {showBackdrop ? (
          <button
            type="button"
            className="fixed inset-0 z-[10000] bg-slate-900/45 backdrop-blur-[1px] lg:bg-black/20"
            aria-label={t("closeMenu")}
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
          aria-label={t("categoriesShort")}
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
        >
          {/* Mobile header */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5 lg:hidden">
            <h2 className="truncate text-sm font-bold text-slate-900">{t("categoriesShort")}</h2>
            <button
              type="button"
              onClick={closeMenu}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
              aria-label={t("closeMenu")}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
            {/* Roots sidebar */}
            <aside
              className={[
                "flex shrink-0 flex-col overflow-hidden bg-slate-50 lg:w-[19rem]",
                isRTL ? "lg:border-l lg:border-slate-200" : "lg:border-r lg:border-slate-200",
                "max-lg:max-h-[38vh] max-lg:border-b max-lg:border-slate-200",
              ].join(" ")}
            >
              <p className="hidden shrink-0 border-b border-slate-200/80 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 lg:block">
                {t("productCategories")}
              </p>

              {loading ? (
                <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-y-contain p-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-7 animate-pulse rounded bg-slate-200/60" />
                  ))}
                </div>
              ) : (
                <ul
                  className={[
                    "grid min-h-0 flex-1 grid-cols-2 gap-1 overflow-y-auto overscroll-y-contain p-1.5 sm:grid-cols-2",
                    "lg:grid-cols-1 lg:content-start lg:auto-rows-min lg:gap-1 lg:p-2",
                    "[scrollbar-gutter:stable] [scrollbar-width:thin] [-ms-overflow-style:auto]",
                    "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80 [&::-webkit-scrollbar-thumb:hover]:bg-slate-400",
                  ].join(" ")}
                >
                  {roots.map((root) => {
                    const label = getLocalizedText(root, language);
                    const active = Number(activeRoot?.id) === Number(root.id);
                    return (
                      <li key={root.id}>
                        <button
                          type="button"
                          onMouseEnter={isDesktop ? () => selectRoot(root.id) : undefined}
                          onFocus={() => selectRoot(root.id)}
                          onClick={() => selectRoot(root.id)}
                          className={rootButtonClass(active)}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center text-sm lg:h-5 lg:w-5 lg:text-xs ${
                              active ? "lg:opacity-90" : ""
                            }`}
                          >
                            {getMainCategoryIcon(root)}
                          </span>
                          <span className="flex-1 whitespace-nowrap text-xs font-medium leading-snug sm:text-sm lg:text-[13px]">
                            {label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>

            {/* Content — inner scroll box */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {loading ? (
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="space-y-1">
                        <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                        <div className="h-2 w-full animate-pulse rounded bg-slate-100" />
                        <div className="h-2 w-4/5 animate-pulse rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeRoot ? (
                <>
                  {/* Compact header — fixed, not scrolled */}
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-3 py-1.5 lg:px-3 lg:py-2">
                    <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                      {getLocalizedText(activeRoot, language)}
                    </h3>
                    <Link
                      href={`/catalog/${activeRoot.id}`}
                      onClick={closeMenu}
                      className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-900 sm:text-sm"
                    >
                      {t("viewCategoryProducts")}
                    </Link>
                  </div>

                  <div
                    ref={contentRef}
                    dir={isRTL ? "rtl" : "ltr"}
                    className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-2 [scrollbar-gutter:stable] [scrollbar-width:thin] [-ms-overflow-style:auto] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80 [&::-webkit-scrollbar-thumb:hover]:bg-slate-400"
                  >
                    <div className="px-3 lg:px-3">
                    {l2Categories.length ? (
                      isDesktop && l2ColumnGroups ? (
                        <div className="flex items-start gap-x-4">
                          {l2ColumnGroups.map((column, colIndex) => (
                            <div key={colIndex} className="min-w-0 flex-1 basis-0">
                              {column.map((l2) => (
                                <L2CategorySection
                                  key={l2.id}
                                  l2={l2}
                                  childrenMap={childrenMap}
                                  language={language}
                                  closeMenu={closeMenu}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
                          {l2Categories.map((l2) => (
                            <L2CategorySection
                              key={l2.id}
                              l2={l2}
                              childrenMap={childrenMap}
                              language={language}
                              closeMenu={closeMenu}
                            />
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="py-6 text-center text-xs text-slate-500">{t("noCategoryRegistered")}</p>
                    )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Mobile footer only */}
          <div className="shrink-0 border-t border-slate-200 px-3 py-2 text-center lg:hidden">
            <Link
              href="/catalog/browse"
              onClick={closeMenu}
              className="text-xs font-semibold text-emerald-700"
            >
              {t("viewAllCategories")}
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
            "flex h-full min-h-10 shrink-0 items-center gap-1 border-l border-emerald-950/40 bg-emerald-950 px-2.5 text-[11px] font-bold text-white transition hover:bg-emerald-900 sm:px-3 sm:text-xs",
            open ? "bg-emerald-900 ring-1 ring-inset ring-emerald-400/40" : "",
          ].join(" ")}
        >
          <MenuIcon />
          <span className="whitespace-nowrap">{t("categoriesShort")}</span>
          <ChevronDown open={open} />
        </button>
      </div>

      {mounted && megaPanel ? createPortal(megaPanel, document.body) : null}
    </>
  );
}
