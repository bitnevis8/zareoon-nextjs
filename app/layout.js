import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { isRtlLanguage } from "./config/siteLanguages";
import IntlHtmlAttributes from "./components/IntlHtmlAttributes";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import { LanguageProvider } from "./context/LanguageContext";
import { DashboardPersonaProvider } from "./context/DashboardPersonaContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { MessagingProvider } from "./context/MessagingContext";
import StructuredData from "./components/StructuredData";
import AppToaster from "./components/ui/AppToaster";
import SiteChrome from "./components/ui/SiteChrome";
import MessagingModalHost from "./components/messaging/MessagingModalHost";
import CapacitorNativeBoot from "./components/CapacitorNativeBoot";

export async function generateMetadata() {
  const t = await getTranslations("layout.metadata");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: {
      default: t("titleDefault"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    keywords: t.raw("keywords"),
    authors: [{ name: t("creator") }],
    creator: t("creator"),
    publisher: t("creator"),
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: siteUrl,
      siteName: t("creator"),
      locale: "fa_IR",
      type: "website",
      images: [
        {
          url: `${siteUrl}/logo.png`,
          width: 1200,
          height: 630,
          alt: t("openGraphImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      images: [`${siteUrl}/logo.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      enamad: "759645",
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#064e3b",
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = isRtlLanguage(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} data-theme="taganeh" suppressHydrationWarning>
      <body className="min-h-dvh flex flex-col bg-slate-50 antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CapacitorNativeBoot />
          <IntlHtmlAttributes locale={locale} dir={dir} />
          <StructuredData />
          <LanguageProvider>
            <AppToaster />
            <AuthProvider>
              <WorkspaceProvider>
                <DashboardPersonaProvider>
                  <SidebarProvider>
                    <MessagingProvider>
                      <SiteChrome>{children}</SiteChrome>
                      <MessagingModalHost />
                    </MessagingProvider>
                  </SidebarProvider>
                </DashboardPersonaProvider>
              </WorkspaceProvider>
            </AuthProvider>
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
