"use client";

import { useSidebar, DESKTOP_SIDEBAR_MODES } from "@/app/context/SidebarContext";
import { useTranslations } from "next-intl";
import Sidebar from "@/app/components/ui/Sidebar";

function MenuIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronRightIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const MODE_WIDTH = {
  [DESKTOP_SIDEBAR_MODES.EXPANDED]: "w-[19rem]",
  [DESKTOP_SIDEBAR_MODES.ICONS]: "w-[4.75rem]",
  [DESKTOP_SIDEBAR_MODES.COLLAPSED]: "w-0",
};

function SidebarEdgeControls({
  collapsed = false,
  canExpand,
  canCollapse,
  onExpand,
  onCollapse,
  expandLabel,
  collapseLabel,
}) {
  const btnSize = collapsed ? "h-12 w-10" : "h-9 w-7";
  const iconClass = collapsed ? "h-5 w-5" : "h-3.5 w-3.5";

  return (
    <div
      className={`pointer-events-auto absolute top-1/2 z-50 hidden -translate-y-1/2 md:flex ${
        collapsed ? "left-0 -translate-x-full" : "left-0 -translate-x-1/2"
      }`}
      role="group"
      aria-label="کنترل سایدبار"
    >
      <div
        className={`flex flex-col overflow-hidden border bg-white ring-1 ring-slate-900/5 ${
          collapsed
            ? "rounded-l-xl border-slate-300 shadow-[0_8px_28px_-8px_rgba(15,23,42,0.45)]"
            : "rounded-lg border-slate-200/90 shadow-[0_4px_18px_-6px_rgba(15,23,42,0.35)]"
        }`}
      >
        <button
          type="button"
          onClick={onExpand}
          disabled={!canExpand}
          title={expandLabel}
          aria-label={expandLabel}
          className={`flex items-center justify-center transition ${btnSize} ${
            canExpand
              ? "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
              : "cursor-default text-slate-300"
          }`}
        >
          <ChevronLeftIcon className={iconClass} />
        </button>
        <span className="h-px w-full bg-slate-200" aria-hidden />
        <button
          type="button"
          onClick={onCollapse}
          disabled={!canCollapse}
          title={collapseLabel}
          aria-label={collapseLabel}
          className={`flex items-center justify-center transition ${btnSize} ${
            canCollapse
              ? "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
              : "cursor-default text-slate-300"
          }`}
        >
          <ChevronRightIcon className={iconClass} />
        </button>
      </div>
    </div>
  );
}

export default function DashboardShell({ breadcrumb, alert, children }) {
  const t = useTranslations("dashboard");
  const {
    openSidebar,
    desktopSidebarMode,
    expandDesktopSidebar,
    collapseDesktopSidebar,
    canExpandDesktopSidebar,
    canCollapseDesktopSidebar,
    desktopModeHydrated,
  } = useSidebar();

  const mode = desktopModeHydrated ? desktopSidebarMode : DESKTOP_SIDEBAR_MODES.EXPANDED;
  const collapsed = mode === DESKTOP_SIDEBAR_MODES.COLLAPSED;
  const iconsOnly = mode === DESKTOP_SIDEBAR_MODES.ICONS;

  return (
    <div className="dashboard-scroll relative flex h-full min-h-0 flex-1 overflow-hidden bg-slate-100">
      <aside
        className={`relative z-40 hidden h-full shrink-0 self-stretch overflow-visible border-l border-slate-200 bg-white transition-[width] duration-300 ease-out md:block ${MODE_WIDTH[mode]} ${
          collapsed ? "border-l-0" : ""
        }`}
      >
        {!collapsed ? (
          <div className="h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain">
            <Sidebar onLinkClick={() => {}} compact={iconsOnly} />
          </div>
        ) : null}

        <SidebarEdgeControls
          collapsed={collapsed}
          canExpand={canExpandDesktopSidebar}
          canCollapse={canCollapseDesktopSidebar}
          onExpand={expandDesktopSidebar}
          onCollapse={collapseDesktopSidebar}
          expandLabel={t("shell.expandSidebar") || "باز کردن منو"}
          collapseLabel={t("shell.collapseSidebar") || "جمع کردن منو"}
        />
      </aside>

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex min-h-12 shrink-0 items-center border-b border-slate-200 bg-white px-2 md:hidden">
          <button
            type="button"
            onClick={() => openSidebar()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-slate-700 transition hover:bg-slate-100"
            aria-label={t("shell.openMenu")}
          >
            <MenuIcon />
            <span className="text-[13px] font-bold">{t("shell.menuLabel")}</span>
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 pt-2.5 pb-5 md:px-6 md:py-6">
            {breadcrumb}
            {alert}
            {children}
          </div>
        </main>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500 md:px-6">
          {t("shell.footer", { year: new Date().getFullYear() })}
        </footer>
      </div>
    </div>
  );
}
