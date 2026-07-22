"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { canActAsSeller, DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";
import { useMyTradeServiceProvider } from "@/app/hooks/useMyTradeServiceProvider";
import { useNavigationLoading } from "@/app/context/NavigationLoadingContext";

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

function CloseIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
 * مودال تمام‌صفحه موبایل «درخواست»
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
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-gradient-to-b from-emerald-50 via-white to-teal-50 lg:hidden"
      dir={isRTL ? "rtl" : "ltr"}
      role="dialog"
      aria-modal="true"
      aria-label={t("mobileSheetTitle")}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-emerald-100/90 bg-white/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-wide text-emerald-800/80">{t("mobileSheetEyebrow")}</p>
          <h2 className="truncate text-base font-black text-slate-900">{t("mobileSheetTitle")}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm"
          aria-label={t("close")}
        >
          <CloseIcon className="h-4 w-4" />
          <span>{t("close")}</span>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="mb-4 text-[12px] leading-5 text-slate-600">{t("mobileSheetSubtitle")}</p>

        <div className="space-y-4">
          <section className="rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm">
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

          <section className="rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm">
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
      </div>
    </div>,
    document.body
  );
}
