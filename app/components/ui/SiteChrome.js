"use client";

import { Suspense } from "react";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import GlobalSidebar from "./GlobalSidebar";
import MobileBottomBar from "../MobileBottomBar";
import ClientSideWrapper from "./ClientSideWrapper";
import { useIsDashboardRoute } from "@/app/hooks/useIsDashboardRoute";

export default function SiteChrome({ children }) {
  const isDashboard = useIsDashboardRoute();

  return (
    <>
      <Header />
      {isDashboard ? (
        <div className="flex min-h-0 flex-1 flex-col max-lg:pt-[var(--site-mobile-top-chrome)] max-lg:pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </div>
      ) : (
        <main className="flex flex-1 flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] max-lg:pt-[var(--site-mobile-top-chrome)] lg:pb-0 lg:pt-0">
          {children}
        </main>
      )}
      {!isDashboard ? <Footer className="hidden lg:block" /> : null}
      <ClientSideWrapper>
        <GlobalSidebar />
      </ClientSideWrapper>
      <ClientSideWrapper>
        <Suspense fallback={null}>
          <MobileBottomBar />
        </Suspense>
      </ClientSideWrapper>
    </>
  );
}
