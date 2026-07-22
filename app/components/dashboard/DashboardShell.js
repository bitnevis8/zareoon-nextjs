"use client";

import { useSidebar } from "@/app/context/SidebarContext";
import { useTranslations } from "next-intl";
import Sidebar from "@/app/components/ui/Sidebar";

function MenuIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function DashboardShell({ breadcrumb, alert, children }) {
  const t = useTranslations("dashboard");
  const { openSidebar } = useSidebar();

  return (
    <div className="dashboard-scroll flex min-h-0 flex-1 bg-slate-100">
      <aside className="hidden w-[19rem] shrink-0 border-l border-slate-200 bg-white md:block">
        <div className="sticky top-0 max-h-[calc(100dvh-7rem)] overflow-y-auto">
          <Sidebar onLinkClick={() => {}} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
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

        <main className="flex-1 overflow-y-auto">
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
