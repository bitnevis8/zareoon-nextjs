'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  const showUser = isHydrated && !loading ? user : null;
  const layoutRtl = !isHydrated || isRTL;

  const brandName = layoutRtl ? t('siteName') : 'Zareoon';

  const logo = (
    <Image
      src="/images/logo.png"
      alt={brandName}
      width={48}
      height={48}
      className="h-12 w-12 shrink-0 rounded border border-slate-200 object-contain"
      priority
    />
  );

  const titleBlock = (
    <div className={`min-w-0 leading-tight ${layoutRtl ? 'ps-0.5 text-right' : 'pe-0.5 text-left'}`}>
      <h1 className="whitespace-nowrap text-lg font-bold text-slate-800 sm:text-2xl">{brandName}</h1>
      <div className="mt-0.5 hidden md:block">
        {!showUser ? (
          <p className="max-w-[11rem] text-xs font-medium text-gray-600 sm:max-w-none">{t('siteTagline')}</p>
        ) : null}
      </div>
    </div>
  );

  /**
   * هدر با dir=ltr است؛ در RTL برند سمت راست است.
   * ترتیب DOM: عنوان سپس لوگو → در خواندن RTL اول لوگو (لبه راست)، بعد عنوان.
   * LTR: عنوان سپس لوگو (برند سمت چپ).
   */
  const brandBlock = (
    <div className="flex shrink-0 min-w-0 flex-row items-center">
      <Link href="/" className="flex min-w-0 items-center gap-0" prefetch={true}>
        {titleBlock}
        {logo}
      </Link>
    </div>
  );

  const support = <HeaderSupportContact key="support" />;
  const language = <LanguageSwitcher key="language" buttonClass={headerIconBtnClass} />;
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
  const account = <AuthButtons key="account" iconButtonClass={headerIconBtnClass} />;

  // RTL (fa/ar/ur): کاربر → سبد → … → تلفن — تأییدشده
  // LTR: فقط چینش آیکن‌ها برعکس می‌شود؛ جای لوگو عوض نمی‌شود
  const actionItems = (
    layoutRtl
      ? [account, cart, messages, notifications, language, support]
      : [support, language, notifications, messages, cart, account]
  ).filter(Boolean);

  const actionsNav = (
    <nav className="flex shrink-0 items-center gap-1.5 overflow-visible sm:gap-2" aria-label="Header actions">
      {actionItems}
    </nav>
  );

  return (
    <div
      id="site-header"
      className="sticky top-0 z-[9999] max-lg:fixed max-lg:inset-x-0 border-b border-slate-200 bg-white shadow-sm lg:sticky"
      suppressHydrationWarning
    >
      {showUser ? <SlugChangePendingBanner /> : null}
      <header>
        <div className="w-full border-b border-slate-100">
          {/*
            RTL: آیکن‌ها چپ · برند راست
            LTR: برند چپ · آیکن‌ها راست (جابه‌جایی کامل بخش‌ها)
          */}
          <div
            className="flex min-h-16 items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8"
            dir="ltr"
            suppressHydrationWarning
          >
            {layoutRtl ? (
              <>
                {actionsNav}
                {brandBlock}
              </>
            ) : (
              <>
                {brandBlock}
                {actionsNav}
              </>
            )}
          </div>
        </div>
      </header>
      <CurrencyTickerBar />
    </div>
  );
}
