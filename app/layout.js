import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import { LanguageProvider } from "./context/LanguageContext";
import StructuredData from "./components/StructuredData";
import AppToaster from "./components/ui/AppToaster";
import SiteChrome from "./components/ui/SiteChrome";

export const metadata = {
  title: {
    default: "زارعون - بازار آنلاین خرید و فروش",
    template: "%s | زارعون"
  },
  description: "زارعون؛ بازار آنلاین خرید و فروش انواع محصولات و کالاها. جست‌وجو، مقایسه و سفارش از تأمین‌کنندگان معتبر در سراسر کشور.",
  keywords: ["زارعون", "بازار آنلاین", "خرید و فروش", "تأمین‌کننده", "خرید عمده", "فروش عمده", "بازار کالا"],
  authors: [{ name: "زارعون" }],
  creator: "زارعون",
  publisher: "زارعون",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "زارعون - بازار آنلاین خرید و فروش",
    description: "بازار آنلاین برای خرید و فروش انواع محصولات و کالاها.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'زارعون',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/logo.png',
        width: 1200,
        height: 630,
        alt: 'زارعون',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "زارعون - بازار آنلاین خرید و فروش",
    description: "بازار آنلاین؛ جست‌وجو، مقایسه و سفارش.",
    images: [(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" data-theme="taganeh" suppressHydrationWarning>
      <body className="min-h-dvh flex flex-col bg-slate-50 antialiased">
        <StructuredData />
        <LanguageProvider>
          <AppToaster />
          <AuthProvider>
            <SidebarProvider>
              <SiteChrome>{children}</SiteChrome>
            </SidebarProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
