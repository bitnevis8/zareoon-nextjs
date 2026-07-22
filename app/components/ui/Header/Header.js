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
      className="h-[3.3rem] w-[3.3rem] shrink-0 rounded border border-slate-200 object-contain"
      priority
    />
  );

  const ayahText = t('headerAyahText');
  const ayahRef = t('headerAyahRef');
  const ayahIsArabicScript = language === 'ar';

  const titleBlock = (
    <div className={`min-w-0 leading-tight ${layoutRtl ? 'ps-0.5 text-right' : 'pe-0.5 text-left'}`}>
      <h1 className="shrink-0 whitespace-nowrap text-lg font-bold text-slate-800 sm:text-2xl">{brandName}</h1>
      <div className="mt-0.5 hidden md:block">
        <p className="whitespace-nowrap text-[11px] font-medium leading-snug text-slate-600 sm:text-xs">
          {t('siteTagline')}
        </p>
      </div>
    </div>
  );

  // RTL (dir=ltr روی ردیف): لوگو راست‌ترین → سپس عنوان
  // LTR: لوگو → عنوان
  const brandBlock = (
    <div className="flex min-w-0 shrink-0 flex-row items-center">
      <Link
        href="/"
        className="flex min-w-0 items-center gap-2 sm:gap-2.5"
        prefetch={true}
      >
        {layoutRtl ? (
          <>
            {titleBlock}
            {logo}
          </>
        ) : (
          <>
            {logo}
            {titleBlock}
          </>
        )}
      </Link>
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
    <div key="account" className="hidden lg:block">
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
    <div className="hidden min-w-0 flex-1 self-stretch flex-col items-center px-3 pt-1.5 lg:flex">
      <p
        className={`max-w-full shrink-0 truncate text-center text-[11px] font-normal leading-snug tracking-wide text-slate-400 xl:text-[12px] ${
          ayahIsArabicScript ? 'font-quran' : ''
        }`}
        dir={ayahIsArabicScript || isRTL ? 'rtl' : 'ltr'}
        lang={language || undefined}
        title={`${ayahText} ${ayahRef}`}
      >
        <span>{ayahText}</span>
        <span className="ms-1.5 font-sans text-[10px] font-normal tracking-normal text-slate-400 xl:text-[11px]">
          {ayahRef}
        </span>
      </p>
      <div className="mt-1 flex min-h-10 w-full max-w-xl shrink-0 items-center justify-center">
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
        <header>
          <div className="w-full border-b border-slate-100">
            <div
              className="flex min-h-16 items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:min-h-[5.5rem] lg:px-8"
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
      <div className="max-lg:h-[var(--site-mobile-top-chrome)] lg:h-[var(--site-desktop-top-chrome)]" aria-hidden />
    </>
  );
}
