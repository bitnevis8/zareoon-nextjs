"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import AuthButtons from "@/app/components/AuthButtons";
import LanguageSwitcher from "./LanguageSwitcher";
import LoginRequiredMessage from "@/app/components/LoginRequiredMessage";

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800";

function CartIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path d="M3 3h2l.4 2M7 13h10l3-7H6.4" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="20" cy="19" r="1" />
    </svg>
  );
}

/**
 * هدر مینیمال زارعون مخصوص صفحهٔ لندینگ محصول
 * لوگو + نام برند + زبان + سبد/حساب — بدون تیکر، سرچ و پشتیبانی
 */
export default function LandingMinimalHeader() {
  const { user, loading } = useAuth() || { user: null, loading: true };
  const { t, isRTL, isHydrated } = useLanguage();
  const showUser = isHydrated && !loading ? user : null;
  const layoutRtl = !isHydrated || isRTL;
  const brandName = layoutRtl ? t("siteName") : "Zareoon";

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const headerEl = document.getElementById("site-header");
    if (!headerEl) return undefined;

    const apply = () => {
      const h = Math.ceil(headerEl.getBoundingClientRect().height);
      if (h <= 0) return;
      const value = `${h}px`;
      document.documentElement.style.setProperty("--site-top-chrome", value);
      document.documentElement.style.setProperty("--site-mobile-top-chrome", value);
      document.documentElement.style.setProperty("--site-desktop-top-chrome", value);
    };

    apply();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(apply) : null;
    ro?.observe(headerEl);
    window.addEventListener("resize", apply);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [showUser]);

  const brand = (
    <Link
      href="/"
      className="flex min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
      prefetch
      aria-label={brandName}
    >
      {layoutRtl ? (
        <>
          <span className="truncate text-sm font-bold tracking-tight text-slate-800 sm:text-base">{brandName}</span>
          <Image src="/images/logo.png" alt="" width={36} height={36} className="h-8 w-8 shrink-0 rounded object-contain sm:h-9 sm:w-9" priority />
        </>
      ) : (
        <>
          <Image src="/images/logo.png" alt="" width={36} height={36} className="h-8 w-8 shrink-0 rounded object-contain sm:h-9 sm:w-9" priority />
          <span className="truncate text-sm font-bold tracking-tight text-slate-800 sm:text-base">{brandName}</span>
        </>
      )}
    </Link>
  );

  const actions = (
    <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-label="Header actions">
      <LanguageSwitcher buttonClass={iconBtn} />
      {showUser ? (
        <Link href="/cart" className={iconBtn} aria-label={t("cart")} title={t("cart")} prefetch>
          <CartIcon />
        </Link>
      ) : (
        <LoginRequiredMessage>
          <button type="button" className={iconBtn} aria-label={t("cart")} title={t("cart")}>
            <CartIcon />
          </button>
        </LoginRequiredMessage>
      )}
      <AuthButtons iconButtonClass={iconBtn} />
    </nav>
  );

  return (
    <>
      <div
        id="site-header"
        className="fixed inset-x-0 top-0 z-[9999] border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md"
        suppressHydrationWarning
      >
        <header>
          <div
            className="mx-auto flex min-h-12 max-w-6xl items-center justify-between gap-3 px-3 py-1.5 sm:min-h-[3.25rem] sm:px-4"
            dir="ltr"
            suppressHydrationWarning
          >
            {layoutRtl ? (
              <>
                {actions}
                {brand}
              </>
            ) : (
              <>
                {brand}
                {actions}
              </>
            )}
          </div>
        </header>
      </div>
      <div className="h-[var(--site-top-chrome,3.25rem)]" aria-hidden />
    </>
  );
}
