"use client";
import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from 'next/image';
import { API_ENDPOINTS } from './config/api';
import { useAuth } from './context/AuthContext';
import { useLanguage, siteIntroByLang } from './context/LanguageContext';
import { authFetch } from './utils/authHeaders';
import MainCategoryGrid from './components/MainCategoryGrid';
import MarketplaceDisclaimer from './components/MarketplaceDisclaimer';
import QuickSearchBox from './components/QuickSearchBox';
import LanguageFlag from './components/ui/LanguageFlag';
import LazyWhenVisible from './components/ui/LazyWhenVisible';
import SectionSkeleton from './components/ui/SectionSkeleton';
import { SITE_LANGUAGES, SITE_INTRO_ORDER, isRtlLanguage } from './config/siteLanguages';

const LatestAvailableProductsSection = dynamic(
  () => import('./components/LatestAvailableProductsSection'),
  { loading: () => <SectionSkeleton minHeight="14rem" variant="products" /> }
);
const BuyerSellerPortal = dynamic(() => import('./components/BuyerSellerPortal'), {
  loading: () => <SectionSkeleton minHeight="22rem" className="mt-2" variant="portal" />,
});
const ZareoonExclusiveServices = dynamic(() => import('./components/ZareoonExclusiveServices'), {
  loading: () => <SectionSkeleton minHeight="20rem" className="mt-2" variant="services" />,
});

export default function Home() {
  return (
    <Suspense fallback={<main className="page-shell py-8 animate-pulse min-h-[40vh]" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const auth = useAuth();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const r = await authFetch(`${API_ENDPOINTS.supplier.cart.base}/me`, { cache: 'no-store' });
        const j = await r.json();
        const items = j?.data?.items || [];
        let sum = 0;
        for (const it of items) {
          const qty = parseFloat(it.quantity || 0);
          if (Number.isFinite(qty)) sum += qty;
        }
      } catch {}
    };
    fetchCart();
  }, [auth?.user]);

  return (
    <main className="pb-6 sm:pt-4 sm:pb-8 lg:pb-10 lg:pt-4">
      <section className="page-shell section-stack text-center space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="mx-auto w-full max-w-xl px-1 sm:px-2">
          <div
            className="flex w-full flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white/95 px-1 py-2 shadow-sm sm:gap-2 sm:rounded-full sm:px-3"
            role="group"
            aria-label="Language"
          >
            {SITE_LANGUAGES.map((option) => {
              const isActive = language === option.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setLanguage(option.code)}
                  className={`inline-flex min-h-[3.12rem] min-w-[3.12rem] flex-col items-center justify-center gap-0.5 rounded-xl border px-1.5 py-1 text-[9px] font-semibold leading-none transition-all sm:min-h-0 sm:min-w-0 sm:flex-1 sm:flex-row sm:gap-1.5 sm:rounded-full sm:px-2 sm:py-2 sm:text-sm ${
                    isActive
                      ? "border-green-600 bg-green-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  aria-pressed={isActive}
                  aria-label={option.label}
                  title={option.label}
                >
                  <LanguageFlag countryCode={option.countryCode} className="h-[1.2rem] w-[1.68rem] sm:h-4 sm:w-6" />
                  <span className="tracking-wide">{option.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-2">
          <Image
            src="/images/logo.png"
            alt={t("siteName")}
            width={800}
            height={800}
            className="mx-auto h-auto w-40 object-contain sm:w-56 md:w-64 lg:w-72"
            priority
          />
        </div>

        <QuickSearchBox variant="homepage" />

        <div className="mx-auto grid w-full max-w-3xl justify-items-center gap-1.5 px-2 text-center" suppressHydrationWarning>
          {SITE_INTRO_ORDER.map((code) => {
            const isActive = language === code;
            const rtl = isRtlLanguage(code);
            return (
              <p
                key={code}
                dir={rtl ? "rtl" : "ltr"}
                lang={code}
                className={`w-full max-w-2xl text-balance leading-relaxed ${
                  rtl ? "max-lg:!text-center" : "text-center"
                } ${
                  isActive
                    ? "text-sm font-medium text-slate-700 sm:text-base"
                    : "text-xs text-slate-500 sm:text-sm"
                }`}
                suppressHydrationWarning
              >
                {siteIntroByLang[code]}
              </p>
            );
          })}
        </div>

        <MainCategoryGrid className="w-full" id="product-categories" />

        <MarketplaceDisclaimer className="mt-2" />

        <LazyWhenVisible
          id="latest-available"
          className="w-full scroll-mt-20"
          minHeight="14rem"
          fallback={<SectionSkeleton minHeight="14rem" variant="products" />}
        >
          <LatestAvailableProductsSection autoFetch variant="homepage" className="w-full" />
        </LazyWhenVisible>
      </section>

      <LazyWhenVisible
        className="mt-5 w-full sm:mt-6 lg:mt-8"
        minHeight="22rem"
        fallback={<SectionSkeleton minHeight="22rem" className="mx-4 mt-2 sm:mx-6" variant="portal" />}
      >
        <BuyerSellerPortal />
      </LazyWhenVisible>

      <section className="page-shell section-stack mt-5 sm:mt-6 lg:mt-8">
        <LazyWhenVisible
          minHeight="20rem"
          fallback={<SectionSkeleton minHeight="20rem" className="mt-2" variant="services" />}
        >
          <ZareoonExclusiveServices className="w-full" />
        </LazyWhenVisible>
      </section>
    </main>
  );
}
