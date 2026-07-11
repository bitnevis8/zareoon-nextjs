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

  if (isDashboard) {
    return (
      <>
        <Header />
        <div className="flex min-h-0 flex-1 flex-col max-lg:pt-[4.25rem]">{children}</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col pb-[4.25rem] max-lg:pt-[4.25rem] lg:pb-0 lg:pt-0">
        {children}
      </main>
      <Footer />
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
