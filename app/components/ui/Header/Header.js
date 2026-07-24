'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import AuthButtons from '../../AuthButtons';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import LoginRequiredMessage from '../../LoginRequiredMessage';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencyTickerBar from '../CurrencyTickerBar';
import HeaderNotificationBell from './HeaderNotificationBell';
import HeaderMessagesIcon from './HeaderMessagesIcon';
import HeaderSupportContact from './HeaderSupportContact';
import SlugChangePendingBanner from './SlugChangePendingBanner';
import QuickSearchBox from '../../QuickSearchBox';
import BreakpointBadge from '../../BreakpointBadge';

const headerIconBtnClass =
  'inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-gray-50 transition-colors';

function CartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path d="M3 3h2l.4 2M7 13h10l3-7H6.4" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="20" cy="19" r="1" />
    </svg>
  );
}

export default function Header() {
  const { user, loading } = useAuth() || { user: null, loading: true };
  const { t, isRTL, isHydrated, language } = useLanguage();
  const pathname = usePathname();
  const showUser = isHydrated && !loading ? user : null;
  const layoutRtl = !isHydrated || isRTL;
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);

  const brandName = layoutRtl ? t('siteName') : 'Zareoon';

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const headerEl = document.getElementById("site-header");
    if (!headerEl) return undefined;

    const applyChromeHeight = () => {
      const h = Math.ceil(headerEl.getBoundingClientRect().height);
      if (h <= 0) return;
      const value = `${h}px`;
      document.documentElement.style.setProperty("--site-top-chrome", value);
      document.documentElement.style.setProperty("--site-mobile-top-chrome", value);
      document.documentElement.style.setProperty("--site-desktop-top-chrome", value);
    };

    applyChromeHeight();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(applyChromeHeight) : null;
    ro?.observe(headerEl);
    window.addEventListener("resize", applyChromeHeight);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", applyChromeHeight);
    };
  }, [showUser, pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mq = window.matchMedia('(min-width: 1024px)');
    let onScroll = null;

    const clear = () => {
      if (onScroll) {
        window.removeEventListener('scroll', onScroll);
        onScroll = null;
      }
    };

    const sync = () => {
      clear();

      if (!mq.matches) {
        setShowHeaderSearch(false);
        return;
      }

      // همه صفحات به‌جز خانه: سرچ همیشه در هدر
      if (pathname !== '/') {
        setShowHeaderSearch(true);
        return;
      }

      // صفحه اصلی: فقط بعد از رد شدن سرچ وسط صفحه از زیر هدر
      setShowHeaderSearch(false);
      onScroll = () => {
        const homeSearch = document.getElementById('homepage-quick-search');
        if (!homeSearch) {
          setShowHeaderSearch(false);
          return;
        }
        const headerEl = document.getElementById('site-header');
        const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 0;
        setShowHeaderSearch(homeSearch.getBoundingClientRect().bottom <= headerBottom);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    };

    sync();
    mq.addEventListener('change', sync);
    return () => {
      clear();
      mq.removeEventListener('change', sync);
    };
  }, [pathname]);

  const logo = (
    <Image
      src="/images/logo.png"
      alt={brandName}
      width={53}
      height={53}
      className="h-[3.3rem] w-[3.3rem] shrink-0 rounded object-contain"
      priority
    />
  );

  const ayahText = t('headerAyahText');
  const ayahRef = t('headerAyahRef');
  const ayahIsArabicScript = language === 'ar';
  const ayahDir = ayahIsArabicScript || isRTL ? 'rtl' : 'ltr';

  const ayahTooltip = (
    <div
      className={`pointer-events-none absolute top-full z-[10000] mt-2 w-max max-w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-emerald-100/90 bg-white/95 px-3.5 py-2.5 text-center shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 backdrop-blur-sm transition-all duration-200 ease-out ${
        layoutRtl ? 'end-0 origin-top-right' : 'start-0 origin-top-left'
      } scale-95 opacity-0 translate-y-1 group-hover/brand:scale-100 group-hover/brand:opacity-100 group-hover/brand:translate-y-0 group-focus-within/brand:scale-100 group-focus-within/brand:opacity-100 group-focus-within/brand:translate-y-0`}
      role="tooltip"
    >
      <p
        className={`text-[12px] font-medium leading-6 text-slate-700 sm:text-[13px] ${
          ayahIsArabicScript ? 'font-quran text-[14px] leading-7 sm:text-[15px]' : ''
        }`}
        dir={ayahDir}
        lang={language || undefined}
      >
        {ayahText}
      </p>
      <p className="mt-1 font-sans text-[10px] font-normal tracking-normal text-slate-400 sm:text-[11px]" dir={ayahDir}>
        {ayahRef}
      </p>
      <span
        className={`absolute -top-1.5 h-3 w-3 rotate-45 border-s border-t border-emerald-100/90 bg-white ${
          layoutRtl ? 'end-5' : 'start-5'
        }`}
        aria-hidden
      />
    </div>
  );

  const titleBlock = (
    <div className={`group/brand relative min-w-0 leading-tight ${layoutRtl ? 'text-right' : 'text-left'}`}>
      <Link
        href="/"
        className="block min-w-0 rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400/50"
        prefetch={true}
        aria-describedby="header-ayah-tooltip"
      >
        <div className={`flex items-baseline gap-1.5 ${layoutRtl ? 'flex-row-reverse justify-end' : 'flex-row'}`}>
          <h1 className="shrink-0 whitespace-nowrap text-lg font-bold text-slate-800 transition-colors group-hover/brand:text-emerald-800 sm:text-2xl">
            {brandName}
          </h1>
          <BreakpointBadge className="text-[10px] leading-none sm:text-xs" />
        </div>
        <div className="mt-0.5 hidden md:block">
          <p className="whitespace-nowrap text-[11px] font-medium leading-snug text-slate-600 sm:text-xs">
            {t('siteTagline')}
          </p>
        </div>
      </Link>
      <div id="header-ayah-tooltip">{ayahTooltip}</div>
    </div>
  );

  // RTL (dir=ltr روی ردیف): لوگو راست‌ترین → سپس عنوان (چسبیده به لوگو)
  // LTR: لوگو → عنوان — آیه فقط با هاور روی نام «زارعون»، نه روی لوگو
  const brandBlock = (
    <div className="flex min-w-0 shrink-0 flex-row items-center gap-0">
      {layoutRtl ? (
        <>
          {titleBlock}
          <Link href="/" className="-ms-1 shrink-0 leading-none" prefetch={true} aria-label={brandName}>
            {logo}
          </Link>
        </>
      ) : (
        <>
          <Link href="/" className="-me-1 shrink-0 leading-none" prefetch={true} aria-label={brandName}>
            {logo}
          </Link>
          {titleBlock}
        </>
      )}
    </div>
  );
  const support = (
    <div key="support" className="hidden lg:block">
      <HeaderSupportContact />
    </div>
  );
  const languageSwitcher = <LanguageSwitcher key="language" buttonClass={headerIconBtnClass} />;
  const notifications = showUser ? (
    <HeaderNotificationBell key="bell" buttonClass={headerIconBtnClass} />
  ) : null;
  const messages = showUser ? (
    <HeaderMessagesIcon key="messages" buttonClass={headerIconBtnClass} />
  ) : null;
  const cart = showUser ? (
    <Link
      key="cart"
      href="/cart"
      className={headerIconBtnClass}
      aria-label={t('cart')}
      title={t('cart')}
      prefetch={true}
    >
      <CartIcon />
    </Link>
  ) : (
    <LoginRequiredMessage key="cart">
      <button type="button" className={headerIconBtnClass} aria-label={t('cart')} title={t('cart')}>
        <CartIcon />
      </button>
    </LoginRequiredMessage>
  );
  const account = (
    <div key="account" className={showUser ? "block" : "hidden lg:block"}>
      <AuthButtons iconButtonClass={headerIconBtnClass} />
    </div>
  );

  const actionItems = (
    layoutRtl
      ? [account, cart, messages, notifications, languageSwitcher, support]
      : [support, languageSwitcher, notifications, messages, cart, account]
  ).filter(Boolean);

  const actionsNav = (
    <nav className="flex shrink-0 items-center gap-1.5 overflow-visible sm:gap-2" aria-label="Header actions">
      {actionItems}
    </nav>
  );

  const headerCenter = (
    <div className="hidden min-w-0 flex-1 self-stretch flex-col items-center justify-center px-3 lg:flex">
      <div className="flex min-h-10 w-full max-w-xl shrink-0 items-center justify-center">
        {showHeaderSearch ? <QuickSearchBox variant="header" className="w-full" /> : null}
      </div>
    </div>
  );
  return (
    <>
      <div
        id="site-header"
        className="fixed inset-x-0 top-0 z-[9999] border-b border-slate-200 bg-white shadow-sm"
        suppressHydrationWarning
      >
        {showUser ? <SlugChangePendingBanner /> : null}
        <header className="overflow-visible">
          <div className="w-full overflow-visible border-b border-slate-100">
            <div
              className="flex min-h-16 items-center justify-between gap-3 overflow-visible px-4 py-2 sm:px-6 lg:min-h-[5.5rem] lg:px-8"
              dir="ltr"
              suppressHydrationWarning
            >
              {layoutRtl ? (
                <>
                  {actionsNav}
                  {headerCenter}
                  {brandBlock}
                </>
              ) : (
                <>
                  {brandBlock}
                  {headerCenter}
                  {actionsNav}
                </>
              )}
            </div>
          </div>
        </header>
        <CurrencyTickerBar />
      </div>
      <div className="h-[var(--site-top-chrome)]" aria-hidden />
    </>
  );
}
