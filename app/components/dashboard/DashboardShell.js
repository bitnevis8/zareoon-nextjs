"use client";

import { useSidebar } from "@/app/context/SidebarContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/app/components/ui/Sidebar";

function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function resolveMobileHeaderTitle({ isApplicantView, isServicesView, isSellerView }) {
  if (isServicesView) return "خدمات بازرگانی";
  if (isApplicantView) return "متقاضی";
  if (isSellerView) return "فروشنده";
  return "داشبورد";
}

export default function DashboardShell({ breadcrumb, alert, children }) {
  const { openSidebar } = useSidebar();
  const { isApplicantView, isServicesView, isSellerView } = useDashboardPersona();
  const mobileHeaderTitle = resolveMobileHeaderTitle({ isApplicantView, isServicesView, isSellerView });

  return (
    <div className="flex min-h-0 flex-1 bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-[19rem] shrink-0 border-l border-slate-200 bg-white md:block">
        <div className="sticky top-0 max-h-[calc(100dvh-7rem)] overflow-y-auto">
          <Sidebar onLinkClick={() => {}} />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
          <button
            type="button"
            onClick={() => openSidebar()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
            aria-label="باز کردن منو"
          >
            <MenuIcon />
          </button>
          <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="زارعون"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded border border-slate-200 object-contain"
            />
            <span className="truncate text-sm font-semibold text-slate-800">{mobileHeaderTitle}</span>
          </Link>
          <Link
            href="/"
            className="shrink-0 text-xs font-medium text-emerald-700 hover:text-emerald-900"
          >
            سایت
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-6">
            {breadcrumb}
            {alert}
            {children}
          </div>
        </main>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500 md:px-6">
          © {new Date().getFullYear()} زارعون — پنل مدیریت
        </footer>
      </div>
    </div>
  );
}
