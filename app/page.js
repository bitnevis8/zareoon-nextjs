"use client";
import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { API_ENDPOINTS } from './config/api';
import { useAuth } from './context/AuthContext';
import { useLanguage, siteIntroByLang } from './context/LanguageContext';
import { authFetch } from './utils/authHeaders';
import MainCategoryGrid from './components/MainCategoryGrid';
import MarketplaceDisclaimer from './components/MarketplaceDisclaimer';
import QuickSearchBox from './components/QuickSearchBox';
import HomeLanguageLogo from './components/HomeLanguageLogo';
import HomeIntroLines from './components/HomeIntroLines';
import LazyWhenVisible from './components/ui/LazyWhenVisible';
import SectionSkeleton from './components/ui/SectionSkeleton';
import { SITE_INTRO_ORDER } from './config/siteLanguages';

const LatestAvailableProductsSection = dynamic(
  () => import('./components/LatestAvailableProductsSection'),
  { loading: () => <SectionSkeleton minHeight="14rem" variant="products" /> }
);
const BuyerRequestPortal = dynamic(() => import('./components/BuyerRequestPortal'), {
  loading: () => <SectionSkeleton minHeight="7rem" variant="portal" />,
});
const BuyerSellerPortal = dynamic(() => import('./components/BuyerSellerPortal'), {
  loading: () => <SectionSkeleton minHeight="16rem" className="mt-2" variant="portal" />,
});
const ZareoonExclusiveServices = dynamic(() => import('./components/ZareoonExclusiveServices'), {
  loading: () => <SectionSkeleton minHeight="20rem" className="mt-2" variant="services" />,
});
const TradeToolsPanel = dynamic(() => import('./components/TradeToolsPanel'), {
  loading: () => <SectionSkeleton minHeight="16rem" variant="portal" />,
});
const HomeSectionNav = dynamic(() => import('./components/HomeSectionNav'), { ssr: false });

export default function Home() {
  return (
    <Suspense fallback={<main className="page-shell py-8 animate-pulse min-h-[40vh]" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const auth = useAuth();
  const { language, enabledLanguageCodes, isRTL } = useLanguage();
  const introOrder = (() => {
    const base = SITE_INTRO_ORDER.filter((code) => enabledLanguageCodes.includes(code));
    if (!language || !base.includes(language)) return base;
    return [language, ...base.filter((code) => code !== language)];
  })();

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
    <main className="pb-6 sm:pt-4 sm:pb-8 lg:pb-10 lg:pt-4" dir={isRTL ? "rtl" : "ltr"}>
      <HomeSectionNav />
      <section className="page-shell section-stack space-y-4 text-start sm:space-y-6 lg:space-y-8">
        <div className="mt-3 space-y-1.5 text-center sm:mt-4 sm:space-y-2 lg:mt-5">
          <HomeLanguageLogo />
          <QuickSearchBox variant="homepage" />
          <HomeIntroLines
            introOrder={introOrder}
            language={language}
            siteIntroByLang={siteIntroByLang}
          />
        </div>

        <MainCategoryGrid className="w-full scroll-mt-20" id="product-categories" />

        <MarketplaceDisclaimer className="mt-2" />

        <LazyWhenVisible
          id="latest-available"
          className="w-full scroll-mt-20"
          minHeight="14rem"
          fallback={<SectionSkeleton minHeight="14rem" variant="products" />}
        >
          <LatestAvailableProductsSection autoFetch variant="homepage" className="w-full" />
        </LazyWhenVisible>

        <LazyWhenVisible
          id="buyer-request"
          className="w-full scroll-mt-20"
          minHeight="16rem"
          fallback={<SectionSkeleton minHeight="16rem" variant="portal" />}
        >
          <BuyerRequestPortal />
        </LazyWhenVisible>
      </section>

      <LazyWhenVisible
        id="buyer-seller"
        className="mt-5 w-full scroll-mt-20 sm:mt-6 lg:mt-8"
        minHeight="16rem"
        fallback={<SectionSkeleton minHeight="16rem" className="page-shell mt-2" variant="portal" />}
      >
        <BuyerSellerPortal />
      </LazyWhenVisible>

      <section className="page-shell section-stack mt-5 text-start sm:mt-6 lg:mt-8">
        <LazyWhenVisible
          id="trade-services"
          className="w-full scroll-mt-20"
          minHeight="20rem"
          fallback={<SectionSkeleton minHeight="20rem" className="mt-2" variant="services" />}
        >
          <ZareoonExclusiveServices className="w-full" />
        </LazyWhenVisible>

        <LazyWhenVisible
          id="trade-tools"
          className="mt-10 w-full scroll-mt-20 sm:mt-12 lg:mt-14"
          minHeight="8rem"
          fallback={<SectionSkeleton minHeight="8rem" variant="portal" />}
        >
          <TradeToolsPanel />
        </LazyWhenVisible>
      </section>
    </main>
  );
}
