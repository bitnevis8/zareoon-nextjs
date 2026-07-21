"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { canActAsSeller, DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";
import { useMyTradeServiceProvider } from "@/app/hooks/useMyTradeServiceProvider";
import { useNavigationLoading } from "@/app/context/NavigationLoadingContext";
import { ZAREOON_LOGO } from "@/app/data/tradeProviderBranding";

function SheetIcon({ name }) {
  const props = {
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };
  if (name === "product") {
    return (
      <svg {...props}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    );
  }
  if (name === "service") {
    return (
      <svg {...props}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    );
  }
  if (name === "sell") {
    return (
      <svg {...props}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.1-.786 2.331-1.882L21.75 6H5.25M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function ActionTile({ title, desc, tone, icon, onClick }) {
  const tones = {
    emerald: "border-emerald-200/80 from-emerald-50 to-white text-emerald-950 hover:border-emerald-300",
    sky: "border-sky-200/80 from-sky-50 to-white text-sky-950 hover:border-sky-300",
    amber: "border-amber-200/80 from-amber-50 to-white text-amber-950 hover:border-amber-300",
    teal: "border-teal-200/80 from-teal-50 to-white text-teal-950 hover:border-teal-300",
  };
  const iconTone = {
    emerald: "bg-emerald-600 text-white",
    sky: "bg-sky-600 text-white",
    amber: "bg-amber-600 text-white",
    teal: "bg-teal-700 text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-2xl border bg-gradient-to-br px-3.5 py-3.5 text-start shadow-sm transition active:scale-[0.99] ${tones[tone]}`}
    >
      <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconTone[tone]}`}>
        <SheetIcon name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-extrabold leading-snug">{title}</span>
        <span className="mt-1 block text-[11px] font-medium leading-5 opacity-80">{desc}</span>
      </span>
    </button>
  );
}

/**
 * کشوی موبایل «درخواست» — خرید (درخواست محصول/خدمات) + فروش (محصول/خدمات)
 */
export default function MobileRequestSheet({ open, onClose }) {
  const { t, isRTL } = useLanguage();
  const auth = useAuth();
  const router = useRouter();
  const { setPersona } = useDashboardPersona();
  const { start: startNavLoading } = useNavigationLoading();
  const user = auth?.user;
  const hasShop = canActAsSeller(user);
  const { hasProvider, loading: providerLoading } = useMyTradeServiceProvider(open && !!user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const go = (href, persona) => {
    onClose();
    startNavLoading();
    if (!user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(href)}`);
      return;
    }
    if (persona) setPersona(persona);
    router.push(href);
  };

  const onBuyProduct = () => go("/dashboard/submit-request?type=product", DASHBOARD_PERSONAS.APPLICANT);
  const onBuyService = () => go("/dashboard/submit-request?type=service", DASHBOARD_PERSONAS.APPLICANT);

  const onSellProduct = () => {
    if (!user) {
      go("/dashboard/seller/join", DASHBOARD_PERSONAS.SELLER);
      return;
    }
    if (!hasShop) {
      go("/dashboard/seller/join", DASHBOARD_PERSONAS.SELLER);
      return;
    }
    go("/dashboard/supplier/inventory/create?scope=own", DASHBOARD_PERSONAS.SELLER);
  };

  const onSellService = () => {
    if (!user) {
      go("/trade-services/register", DASHBOARD_PERSONAS.SERVICES);
      return;
    }
    if (providerLoading) return;
    if (!hasProvider) {
      go("/trade-services/register", DASHBOARD_PERSONAS.SERVICES);
      return;
    }
    go("/dashboard/service-provider-profile", DASHBOARD_PERSONAS.SERVICES);
  };

  if (!open || !mounted) return null;

  const sellProductTitle = hasShop ? t("mobileSheetSellProduct") : t("mobileSheetCreateShopFirst");
  const sellProductDesc = hasShop ? t("mobileSheetSellProductDesc") : t("mobileSheetCreateShopFirstDesc");
  const sellServiceTitle = hasProvider ? t("mobileSheetOfferService") : t("mobileSheetCreateServiceFirst");
  const sellServiceDesc = hasProvider ? t("mobileSheetOfferServiceDesc") : t("mobileSheetCreateServiceFirstDesc");

  return createPortal(
    <div className="fixed inset-0 z-[9999] lg:hidden" dir={isRTL ? "rtl" : "ltr"}>
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        aria-label={t("close")}
        onClick={onClose}
      />

      {/* فضای شفاف بالای شیت — لوگوی زارعون */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] flex h-[min(28dvh,12rem)] items-center justify-center pt-[env(safe-area-inset-top)]">
        <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
          <div className="absolute inset-0 rounded-full bg-white/15 blur-xl" aria-hidden />
          <Image
            src={ZAREOON_LOGO}
            alt={t("siteName")}
            width={96}
            height={96}
            className="relative h-16 w-16 object-contain opacity-90 drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:h-20 sm:w-20"
            priority
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[2] flex max-h-[min(88dvh,40rem)] flex-col pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] border border-emerald-200/40 bg-gradient-to-b from-emerald-50 via-white to-teal-50/80 shadow-[0_-20px_60px_-20px_rgba(6,78,59,0.35)]">
          <div className="flex flex-col items-center px-4 pt-3">
            <span className="h-1.5 w-10 rounded-full bg-emerald-900/15" aria-hidden />
            <div className="mt-3 w-full text-center">
              <p className="text-[11px] font-bold tracking-wide text-emerald-800/80">{t("mobileSheetEyebrow")}</p>
              <h2 className="mt-1 text-base font-black text-slate-900 sm:text-lg">{t("mobileSheetTitle")}</h2>
              <p className="mt-1 text-[12px] leading-5 text-slate-600">{t("mobileSheetSubtitle")}</p>
            </div>
          </div>

          <div className="mt-4 space-y-4 overflow-y-auto px-3.5 pb-4">
            <section className="rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm backdrop-blur-sm">
              <div className="mb-2.5 flex items-center gap-2">
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-900">
                  {t("mobileSheetBuyBadge")}
                </span>
                <p className="text-[12px] font-bold text-slate-700">{t("mobileSheetBuyHeading")}</p>
              </div>
              <div className="grid gap-2.5">
                <ActionTile
                  tone="emerald"
                  icon="product"
                  title={t("mobileSheetRequestProduct")}
                  desc={t("mobileSheetRequestProductDesc")}
                  onClick={onBuyProduct}
                />
                <ActionTile
                  tone="sky"
                  icon="service"
                  title={t("mobileSheetRequestService")}
                  desc={t("mobileSheetRequestServiceDesc")}
                  onClick={onBuyService}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm backdrop-blur-sm">
              <div className="mb-2.5 flex items-center gap-2">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-950">
                  {t("mobileSheetSellBadge")}
                </span>
                <p className="text-[12px] font-bold text-slate-700">{t("mobileSheetSellHeading")}</p>
              </div>
              <div className="grid gap-2.5">
                <ActionTile
                  tone="amber"
                  icon="sell"
                  title={sellProductTitle}
                  desc={sellProductDesc}
                  onClick={onSellProduct}
                />
                <ActionTile
                  tone="teal"
                  icon="service"
                  title={sellServiceTitle}
                  desc={sellServiceDesc}
                  onClick={onSellService}
                />
              </div>
            </section>
          </div>

          <div className="border-t border-emerald-100/80 bg-white/80 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
