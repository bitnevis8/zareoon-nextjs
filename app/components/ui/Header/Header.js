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
  const { t, isRTL, isHydrated } = useLanguage();
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
      width={64}
      height={64}
      className="h-10 w-10 shrink-0 rounded object-contain sm:h-11 sm:w-11 md:h-12 md:w-12 lg:h-[3.25rem] lg:w-[3.25rem] xl:h-14 xl:w-14 2xl:h-[3.75rem] 2xl:w-[3.75rem] 3xl:h-16 3xl:w-16"
      priority
    />
  );

  const titleBlock = (
    <div className={`relative min-w-0 leading-tight ${layoutRtl ? 'text-right' : 'text-left'}`}>
      <Link
        href="/"
        className="group/brand block min-w-0 rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400/50"
        prefetch={true}
      >
        <div
          className={`flex items-baseline gap-1 sm:gap-1.5 md:gap-2 ${
            layoutRtl ? 'flex-row-reverse justify-start' : 'flex-row'
          }`}
        >
          <h1 className="shrink-0 whitespace-nowrap text-base font-bold tracking-tight text-slate-800 transition-colors group-hover/brand:text-emerald-800 sm:text-lg md:text-xl lg:text-2xl xl:text-[1.65rem] 2xl:text-3xl 3xl:text-[2rem]">
            {brandName}
          </h1>
          <BreakpointBadge className="text-[9px] leading-none sm:text-[10px] md:text-xs" />
        </div>
        <div className="mt-0.5 hidden min-w-0 sm:mt-1 sm:block md:mt-1.5">
          <p className="max-w-[11rem] truncate text-[10px] font-medium leading-snug text-slate-600 sm:max-w-[14rem] sm:text-[11px] md:max-w-none md:whitespace-nowrap md:text-xs lg:text-[13px] xl:text-sm 2xl:text-[15px] 3xl:text-base">
            {t('siteTagline')}
          </p>
        </div>
      </Link>
    </div>
  );

  // فاصلهٔ ثابت و مقیاس‌پذیر بین لوگو و عنوان/زیرعنوان در همه بریک‌پوینت‌ها
  const brandBlock = (
    <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 xl:gap-4 2xl:gap-5 3xl:gap-6">
      {layoutRtl ? (
        <>
          {titleBlock}
          <Link href="/" className="shrink-0 leading-none" prefetch={true} aria-label={brandName}>
            {logo}
          </Link>
        </>
      ) : (
        <>
          <Link href="/" className="shrink-0 leading-none" prefetch={true} aria-label={brandName}>
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
    <LoginRequiredMessage key="cart" returnUrl="/cart" intent="cart">
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
    <nav
      className="flex shrink-0 items-center gap-1 overflow-visible sm:gap-1.5 md:gap-2 lg:gap-2.5 xl:gap-3"
      aria-label="Header actions"
    >
      {actionItems}
    </nav>
  );

  const headerCenter = (
    <div className="hidden min-w-0 flex-1 self-stretch flex-col items-center justify-center px-2 md:px-3 lg:flex xl:px-5 2xl:px-6 3xl:px-8">
      <div className="flex min-h-9 w-full max-w-md shrink-0 items-center justify-center lg:min-h-10 xl:max-w-xl 2xl:max-w-2xl 3xl:max-w-3xl">
        {showHeaderSearch ? <QuickSearchBox variant="header" className="w-full" /> : null}
      </div>
    </div>
  );
  return (
    <>
      <div
        id="site-header"
        className="fixed inset-x-0 top-0 z-[9999] overflow-visible border-b border-slate-200 bg-white shadow-sm"
        suppressHydrationWarning
      >
        {showUser ? <SlugChangePendingBanner /> : null}
        <header className="overflow-visible">
          <div className="w-full overflow-visible border-b border-slate-100">
            <div
              className="flex min-h-14 items-center justify-between gap-2 overflow-visible px-3 py-1.5 sm:min-h-16 sm:gap-3 sm:px-4 sm:py-2 md:gap-4 md:px-5 lg:min-h-[4.75rem] lg:gap-5 lg:px-6 lg:py-2.5 xl:min-h-[5.25rem] xl:gap-6 xl:px-8 2xl:min-h-[5.75rem] 2xl:px-10 3xl:min-h-24 3xl:gap-8 3xl:px-12"
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
