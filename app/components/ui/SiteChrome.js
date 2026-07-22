"use client";

import { Suspense } from "react";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import GlobalSidebar from "./GlobalSidebar";
import MobileBottomBar from "../MobileBottomBar";
import ClientSideWrapper from "./ClientSideWrapper";
import { useIsDashboardRoute } from "@/app/hooks/useIsDashboardRoute";
import { NavigationLoadingProvider } from "@/app/context/NavigationLoadingContext";
import { useSiteCatalogWarmup } from "@/app/hooks/useCatalogProducts";

function CatalogWarmupBoot() {
  useSiteCatalogWarmup();
  return null;
}

export default function SiteChrome({ children }) {
  const isDashboard = useIsDashboardRoute();

  return (
    <Suspense fallback={null}>
      <NavigationLoadingProvider>
        <CatalogWarmupBoot />
        <Header />
        {isDashboard ? (
          <div className="flex min-h-0 flex-1 flex-col max-lg:pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0">
            {children}
          </div>
        ) : (
          <main className="flex flex-1 flex-col">
            {children}
          </main>
        )}
        {!isDashboard ? <Footer /> : null}
        <ClientSideWrapper>
          <GlobalSidebar />
        </ClientSideWrapper>
        <ClientSideWrapper>
          <Suspense fallback={null}>
            <MobileBottomBar />
          </Suspense>
        </ClientSideWrapper>
      </NavigationLoadingProvider>
    </Suspense>
  );
}
