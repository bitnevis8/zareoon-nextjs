"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import AndroidAppPromo, { PHONE_PREVIEW_PARAM } from "../AndroidAppPromo";
import GlobalSidebar from "./GlobalSidebar";
import MobileBottomBar from "../MobileBottomBar";
import ClientSideWrapper from "./ClientSideWrapper";
import { useIsDashboardRoute } from "@/app/hooks/useIsDashboardRoute";
import { NavigationLoadingProvider } from "@/app/context/NavigationLoadingContext";
import { useSiteCatalogWarmup } from "@/app/hooks/useCatalogProducts";
import { useSiteHomeWarmup } from "@/app/hooks/useSiteHomeWarmup";

function CatalogWarmupBoot() {
  useSiteCatalogWarmup();
  useSiteHomeWarmup();
  return null;
}

function useIsPhonePreview() {
  const searchParams = useSearchParams();
  return searchParams.get(PHONE_PREVIEW_PARAM) === "1";
}

function PhonePreviewHtmlFlag({ enabled }) {
  useEffect(() => {
    const root = document.documentElement;
    // در اپ نیتیو هرگز اسکرول را قفل نکن (حتی اگر ?phonePreview=1 باشد)
    const native =
      root.classList.contains("capacitor-native") ||
      (typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.());
    if (enabled && !native) root.classList.add("phone-preview");
    else root.classList.remove("phone-preview");
    return () => root.classList.remove("phone-preview");
  }, [enabled]);
  return null;
}

function SiteChromeInner({ children }) {
  const isDashboard = useIsDashboardRoute();
  const isPhonePreview = useIsPhonePreview();

  return (
    <NavigationLoadingProvider>
      <PhonePreviewHtmlFlag enabled={isPhonePreview} />
      {!isPhonePreview ? <CatalogWarmupBoot /> : null}
      {!isPhonePreview ? <Header /> : null}
      {isDashboard ? (
        <div className="flex h-[calc(100dvh-var(--site-top-chrome,0px))] max-h-[calc(100dvh-var(--site-top-chrome,0px))] min-h-0 flex-1 flex-col overflow-hidden max-lg:pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </div>
      ) : (
        <main className="flex flex-1 flex-col">{children}</main>
      )}
      {!isDashboard && !isPhonePreview ? (
        <>
          <AndroidAppPromo />
          <Footer />
        </>
      ) : null}
      {!isPhonePreview ? (
        <ClientSideWrapper>
          <GlobalSidebar />
        </ClientSideWrapper>
      ) : null}
      {!isPhonePreview ? (
        <ClientSideWrapper>
          <Suspense fallback={null}>
            <MobileBottomBar />
          </Suspense>
        </ClientSideWrapper>
      ) : null}
    </NavigationLoadingProvider>
  );
}

export default function SiteChrome({ children }) {
  return (
    <Suspense fallback={null}>
      <SiteChromeInner>{children}</SiteChromeInner>
    </Suspense>
  );
}
