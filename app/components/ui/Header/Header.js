'use client';

import Link from 'next/link';
import Image from 'next/image';
import AuthButtons from '../../AuthButtons';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import LoginRequiredMessage from '../../LoginRequiredMessage';
import MobileHeaderActions from '../../MobileHeaderActions';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencyTickerBar from '../CurrencyTickerBar';
import HeaderNotificationBell from './HeaderNotificationBell';
import HeaderMessagesIcon from './HeaderMessagesIcon';

const headerIconBtnClass =
  'inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors';

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

  return (
    <div
      id="site-header"
      className="sticky top-0 z-[9999] max-lg:fixed max-lg:inset-x-0 lg:sticky bg-white border-b border-slate-200 shadow-sm"
      suppressHydrationWarning
    >
      <header>
        <div className="w-full border-b border-slate-100">
          <div
            className={`flex justify-between items-center min-h-16 px-4 sm:px-6 lg:px-8 py-2 gap-3 ${layoutRtl ? "" : "flex-row-reverse"}`}
            suppressHydrationWarning
          >
            <div className="flex flex-row items-center shrink-0 min-w-0">
              <Link
                href="/"
                className={`flex items-center gap-0 min-w-0 ${layoutRtl ? "flex-row" : "flex-row"}`}
                prefetch={true}
              >
                {layoutRtl ? (
                  <>
                    <Image
                      src="/images/logo.png"
                      alt={t('siteName')}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain border border-slate-200 rounded shrink-0"
                      priority
                    />
                    <div className="text-right leading-tight ps-0.5 min-w-0">
                      <h1 className="text-lg sm:text-2xl font-bold text-slate-800 whitespace-nowrap">
                        {t('siteName')}
                      </h1>
                      <div className="mt-0.5 hidden md:block">
                        {!showUser ? (
                          <p className="text-xs text-gray-600 font-medium max-w-[11rem] sm:max-w-none">
                            {t('siteTagline')}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-left leading-tight pe-0.5 min-w-0">
                      <h1 className="text-lg sm:text-2xl font-bold text-slate-800 whitespace-nowrap">
                        {t('siteName')}
                      </h1>
                      <div className="mt-0.5 hidden md:block">
                        {!showUser ? (
                          <p className="text-xs text-gray-600 font-medium max-w-[11rem] sm:max-w-none">
                            {t('siteTagline')}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <Image
                      src="/images/logo.png"
                      alt={t('siteName')}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain border border-slate-200 rounded shrink-0"
                      priority
                    />
                  </>
                )}
              </Link>
            </div>

            <nav className="flex items-center gap-2 shrink-0 overflow-visible ms-auto">
              <LanguageSwitcher buttonClass={headerIconBtnClass} />
              <MobileHeaderActions />

              <div className="hidden md:flex items-center gap-2">
                {showUser ? (
                  <>
                    <HeaderMessagesIcon buttonClass={headerIconBtnClass} />
                    <HeaderNotificationBell buttonClass={headerIconBtnClass} />
                    <Link
                      href="/cart"
                      className={headerIconBtnClass}
                      aria-label={t('cart')}
                      title={t('cart')}
                      prefetch={true}
                    >
                      <CartIcon />
                    </Link>
                  </>
                ) : (
                  <LoginRequiredMessage>
                    <button type="button" className={headerIconBtnClass} aria-label={t('cart')} title={t('cart')}>
                      <CartIcon />
                    </button>
                  </LoginRequiredMessage>
                )}

                <AuthButtons iconButtonClass={headerIconBtnClass} />
              </div>
            </nav>
          </div>
        </div>
      </header>
      <CurrencyTickerBar />
    </div>
  );
}
