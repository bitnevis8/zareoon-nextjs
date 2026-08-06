"use client";

import { usePathname } from "next/navigation";
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

/** جمع کردن سایدبار (به حالت آیکن) — جهت برای سایدبار راست */
function CollapseIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M3 12h18" />
    </svg>
  );
}

/** باز کردن سایدبار از حالت آیکن */
function ExpandIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12l7.5-7.5M21 12H3" />
    </svg>
  );
}

const MODE_WIDTH = {
  [DESKTOP_SIDEBAR_MODES.EXPANDED]: "w-[19rem]",
  [DESKTOP_SIDEBAR_MODES.ICONS]: "w-[4.75rem]",
};

export default function DashboardShell({ breadcrumb, alert, children }) {
  const t = useTranslations("dashboard");
  const pathname = usePathname() || "";
  const fullBleed =
    /\/dashboard\/supplier\/landings\/\d+/.test(pathname) ||
    pathname.includes("/dashboard/site-settings/landing-templates");
  const {
    openSidebar,
    desktopSidebarMode,
    toggleDesktopSidebar,
    desktopModeHydrated,
    isDesktopSidebarIcons,
  } = useSidebar();

  const mode = desktopModeHydrated ? desktopSidebarMode : DESKTOP_SIDEBAR_MODES.EXPANDED;
  const iconsOnly = mode === DESKTOP_SIDEBAR_MODES.ICONS || isDesktopSidebarIcons;
  const toggleLabel = iconsOnly
    ? t("shell.expandSidebar") || "باز کردن منو"
    : t("shell.collapseSidebar") || "جمع کردن منو";

  return (
    <div className="dashboard-scroll relative flex h-full min-h-0 max-h-full flex-1 overflow-hidden bg-slate-100">
      <aside
        className={`sticky top-0 z-40 hidden h-full max-h-full min-h-0 w-auto shrink-0 overflow-hidden border-l border-slate-200 bg-white transition-[width] duration-300 ease-out md:flex md:h-[calc(100dvh-var(--site-top-chrome,0px))] md:max-h-[calc(100dvh-var(--site-top-chrome,0px))] md:flex-col ${MODE_WIDTH[mode]}`}
      >
        {/* هدر استاندارد سایدبار — یک دکمه تاگل */}
        <div
          className={`flex h-12 shrink-0 items-center border-b border-slate-200 ${
            iconsOnly ? "justify-center px-1.5" : "justify-between gap-2 px-3"
          }`}
        >
          {!iconsOnly ? (
            <p className="truncate text-sm font-bold text-slate-800">{t("shell.menuLabel") || "منو"}</p>
          ) : null}
          <button
            type="button"
            onClick={toggleDesktopSidebar}
            title={toggleLabel}
            aria-label={toggleLabel}
            aria-expanded={!iconsOnly}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          >
            {iconsOnly ? <ExpandIcon /> : <CollapseIcon />}
          </button>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden">
          <Sidebar onLinkClick={() => {}} compact={iconsOnly} />
        </div>
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

        <main className={`min-h-0 flex-1 ${fullBleed ? "overflow-hidden" : "overflow-y-auto"}`}>
          {fullBleed ? (
            <div className="flex h-full min-h-0 flex-col">
              {alert ? <div className="shrink-0 px-2 pt-2">{alert}</div> : null}
              <div className="min-h-0 flex-1 overflow-hidden p-1.5 md:p-2">{children}</div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-6xl px-4 pt-2.5 pb-5 md:px-6 md:py-6">
              {breadcrumb}
              {alert}
              {children}
            </div>
          )}
        </main>

        {!fullBleed ? (
          <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500 md:px-6">
            {t("shell.footer", { year: new Date().getFullYear() })}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
