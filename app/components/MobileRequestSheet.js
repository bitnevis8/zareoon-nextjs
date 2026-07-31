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
    className: "h-[18px] w-[18px]",
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

function Chevron({ isRTL }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-400 ${isRTL ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ActionRow({ title, desc, icon, onClick, isRTL, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 px-3.5 py-3 text-start transition active:bg-slate-50 disabled:opacity-55 ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
        <SheetIcon name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold leading-snug text-slate-900">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-5 text-slate-500">{desc}</span>
      </span>
      <Chevron isRTL={isRTL} />
    </button>
  );
}

/**
 * مودال موبایل «درخواست» — رسمی، خلوت، استاندارد
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
      className="fixed inset-0 z-[9999] flex flex-col bg-white lg:hidden"
      dir={isRTL ? "rtl" : "ltr"}
      role="dialog"
      aria-modal="true"
      aria-label={t("mobileSheetTitle")}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-slate-900">{t("mobileSheetTitle")}</h2>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{t("mobileSheetSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
          aria-label={t("close") || "بستن"}
        >
          <span>{t("close") || "بستن"}</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/80 px-3 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-3.5 py-2.5">
            <p className="text-[11px] font-bold tracking-wide text-slate-500">{t("mobileSheetBuyHeading")}</p>
          </div>
          <div className="divide-y divide-slate-100">
            <ActionRow
              icon="product"
              title={t("mobileSheetRequestProduct")}
              desc={t("mobileSheetRequestProductDesc")}
              onClick={onBuyProduct}
              isRTL={isRTL}
            />
            <ActionRow
              icon="service"
              title={t("mobileSheetRequestService")}
              desc={t("mobileSheetRequestServiceDesc")}
              onClick={onBuyService}
              isRTL={isRTL}
            />
          </div>
        </section>

        <section className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-3.5 py-2.5">
            <p className="text-[11px] font-bold tracking-wide text-slate-500">{t("mobileSheetSellHeading")}</p>
          </div>
          <div className="divide-y divide-slate-100">
            <ActionRow
              icon="sell"
              title={sellProductTitle}
              desc={sellProductDesc}
              onClick={onSellProduct}
              isRTL={isRTL}
            />
            <ActionRow
              icon="service"
              title={sellServiceTitle}
              desc={sellServiceDesc}
              onClick={onSellService}
              isRTL={isRTL}
              disabled={!!user && providerLoading}
            />
          </div>
        </section>
      </div>
    </div>,
    document.body
  );
}
