import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Footer from "./components/ui/Footer/Footer";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import Header from "./components/ui/Header/Header";
import ClientSideWrapper from "./components/ui/ClientSideWrapper";
import StructuredData from "./components/StructuredData";
import GlobalSidebar from "./components/ui/GlobalSidebar";
import MobileBottomBar from "./components/MobileBottomBar";

const vazirmatn = Vazirmatn({ 
  subsets: ["arabic"],
  display: 'swap',
  variable: '--font-vazirmatn',
});

export const metadata = {
  title: {
    default: "زارعون - بازار و پلتفرم آنلاین کشاورزی",
    template: "%s | زارعون"
  },
  description: "زارعون؛ بازار آنلاین خرید و فروش محصولات، نهاده‌ها و تجهیزات کشاورزی. جست‌وجو، مقایسه و سفارش از تأمین‌کنندگان معتبر در سراسر کشور.",
  keywords: ["زارعون", "محصولات کشاورزی", "بازار کشاورزی", "فروش نهاده", "تجهیزات کشاورزی", "خرید عمده", "زراعت", "باغداری", "دام و طیور"],
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
    title: "زارعون - بازار و پلتفرم آنلاین کشاورزی",
    description: "بازار آنلاین برای خرید و فروش محصولات و نهاده‌های کشاورزی.",
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
    title: "زارعون - بازار و پلتفرم آنلاین کشاورزی",
    description: "بازار آنلاین کشاورزی؛ جست‌وجو، مقایسه و سفارش.",
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

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" data-theme="taganeh" className={vazirmatn.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <StructuredData />
      </head>
      <body className={`${vazirmatn.className} min-h-screen flex flex-col bg-gray-50`}>
        <AuthProvider>
          <SidebarProvider>
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 pb-20 md:pb-0 pt-0 md:pt-0">
              {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Global Sidebar - Available on all pages for logged-in users */}
            <ClientSideWrapper>
              <GlobalSidebar />
            </ClientSideWrapper>

            {/* Mobile Bottom Bar - Available on all pages */}
            <ClientSideWrapper>
              <MobileBottomBar />
            </ClientSideWrapper>

          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
