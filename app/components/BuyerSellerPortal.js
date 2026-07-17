"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import AuthRequiredButton from "@/app/components/ui/AuthRequiredButton";
import { useAuth } from "@/app/context/AuthContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { canActAsSeller, DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";
import { providerPublicDisplayUrl } from "@/app/utils/providerPublicPath";

const SAMPLE_SHOP_SLUG = "your-username";
const SAMPLE_SERVICE_SLUG = "your-username";

/** Soft storefront mesh — grid + connection nodes (sellers / providers), not leaf motifs. */
function SoftMeshPattern({ patternId }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.22]" aria-hidden>
      <defs>
        <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M0 20h40M20 0v40"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.28"
            strokeWidth="0.8"
          />
          <circle cx="20" cy="20" r="1.6" fill="#6ee7b7" fillOpacity="0.55" />
          <circle cx="0" cy="0" r="1.1" fill="#ffffff" fillOpacity="0.22" />
          <circle cx="40" cy="40" r="1.1" fill="#ffffff" fillOpacity="0.22" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function CapabilityCard({ tone, icon, title, points, urlExample, urlLabel }) {
  const isService = tone === "teal";
  const border = isService ? "border-teal-200/80" : "border-emerald-200/80";
  const surface = isService ? "bg-gradient-to-b from-white to-teal-50/50" : "bg-gradient-to-b from-white to-emerald-50/55";
  const iconBg = isService ? "bg-teal-700" : "bg-emerald-800";
  const check = isService ? "bg-teal-600/12 text-teal-800" : "bg-emerald-600/12 text-emerald-800";

  return (
    <article className={`relative flex h-full flex-col overflow-hidden rounded-2xl border ${border} ${surface} p-5 shadow-[0_10px_32px_-18px_rgba(6,78,59,0.3)] sm:p-6`}>
      <div className="relative flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${iconBg}`}>
          {icon}
        </span>
        <h3 className="text-base font-bold leading-snug tracking-tight text-slate-900 sm:text-lg">{title}</h3>
      </div>

      <ul className="relative mt-4 flex-1 space-y-2.5">
        {points.map((text) => (
          <li key={text} className="flex gap-2.5 text-sm leading-6 text-slate-700">
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${check}`}>
              ✓
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-3">
        <p className="text-[11px] font-semibold text-slate-500">{urlLabel}</p>
        <p className="mt-1 truncate font-mono text-xs font-semibold text-slate-800 sm:text-sm" dir="ltr" title={urlExample}>
          {urlExample}
        </p>
      </div>
    </article>
  );
}

function ShopIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16l-1.2 9.2a2 2 0 01-2 1.8H7.2a2 2 0 01-2-1.8L4 10zM4 10l1.5-4.2A2 2 0 017.4 4.5h9.2a2 2 0 011.9 1.3L20 10M9 14v3M15 14v3" />
    </svg>
  );
}

function ServiceIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 4.5-3.4 7.8-8 8.5-4.6-.7-8-4-8-8.5V7l8-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.2l1.8 1.8 3.5-3.6" />
    </svg>
  );
}

export default function BuyerSellerPortal({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const auth = useAuth();
  const router = useRouter();
  const { setPersona } = useDashboardPersona();
  const patternId = useId().replace(/:/g, "");
  const user = auth?.user;
  const seller = canActAsSeller(user);

  const shopExample = providerPublicDisplayUrl(SAMPLE_SHOP_SLUG);
  const serviceExample = providerPublicDisplayUrl(SAMPLE_SERVICE_SLUG);

  const sellerHref = seller
    ? "/dashboard/supplier/inventory/create?scope=own"
    : "/dashboard/seller/join";

  const goApplicantForm = () => {
    setPersona(DASHBOARD_PERSONAS.APPLICANT);
    router.push("/dashboard/submit-request");
  };

  const prepareApplicant = () => {
    setPersona(DASHBOARD_PERSONAS.APPLICANT);
  };

  const shopPoints = [
    t("buyerSellerPortalShopPoint1"),
    t("buyerSellerPortalShopPoint2"),
    t("buyerSellerPortalShopPoint3"),
  ];
  const servicePoints = [
    t("buyerSellerPortalServicePoint1"),
    t("buyerSellerPortalServicePoint2"),
    t("buyerSellerPortalServicePoint3"),
  ];

  const sellerCtaClass =
    "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-900 shadow-md shadow-emerald-950/15 transition hover:bg-emerald-50 active:scale-[0.99] sm:w-auto sm:min-w-[12.5rem]";
  const buyerCtaClass =
    "inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.99] sm:w-auto sm:min-w-[12.5rem]";

  return (
    <section
      className={`relative w-full ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby="buyer-seller-portal-title"
    >
      <div className="relative overflow-hidden border-y border-emerald-900/15 bg-gradient-to-br from-emerald-950 via-emerald-850 to-teal-900 text-white shadow-[0_20px_56px_-28px_rgba(6,78,59,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-900" />
        <SoftMeshPattern patternId={`${patternId}-mesh`} />
        <div
          className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 -right-12 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[90rem] px-4 py-9 sm:px-6 sm:py-11 lg:px-10 lg:py-12 xl:px-12">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-start">
            <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-emerald-50 backdrop-blur-sm sm:text-xs">
              {t("buyerSellerPortalBadge")}
            </p>
            <h2
              id="buyer-seller-portal-title"
              className="mt-3.5 text-balance text-2xl font-black leading-snug tracking-tight text-white sm:text-[1.85rem] lg:text-[2.1rem] lg:leading-tight"
            >
              {t("buyerSellerPortalSectionTitle")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-emerald-50/95 sm:text-[15px] sm:leading-8">
              {t("buyerSellerPortalSectionDesc")}
            </p>
            <p className="mt-2 text-xs leading-6 text-emerald-100/80 sm:text-sm sm:leading-7">
              {t("buyerSellerPortalFriendlyNote")}
            </p>

            <div
              className="mt-5 inline-flex max-w-full items-center gap-2 rounded-xl border border-white/15 bg-black/25 px-3.5 py-2.5 font-mono text-xs text-emerald-50 sm:text-sm"
              dir="ltr"
            >
              <span className="shrink-0 rounded-md bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-100">
                URL
              </span>
              <span className="truncate">
                <span className="text-emerald-200">zareoon.ir</span>
                <span className="text-white/65">/providers/</span>
                <span className="font-semibold text-white">{SAMPLE_SHOP_SLUG}</span>
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:mt-9 sm:gap-4 lg:grid-cols-2 lg:gap-5">
            <CapabilityCard
              tone="emerald"
              icon={<ShopIcon />}
              title={t("buyerSellerPortalShopTitle")}
              points={shopPoints}
              urlExample={shopExample}
              urlLabel={t("buyerSellerPortalUrlLabel")}
            />
            <CapabilityCard
              tone="teal"
              icon={<ServiceIcon />}
              title={t("buyerSellerPortalServiceTitle")}
              points={servicePoints}
              urlExample={serviceExample}
              urlLabel={t("buyerSellerPortalUrlLabel")}
            />
          </div>

          <div className="mt-7 flex flex-col items-stretch gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center lg:justify-start">
            {seller ? (
              <Link href={sellerHref} className={sellerCtaClass}>
                {t("buyerSellerPortalSellerCta")}
              </Link>
            ) : (
              <AuthRequiredButton href={sellerHref} className={sellerCtaClass}>
                {t("buyerSellerPortalSellerCta")}
              </AuthRequiredButton>
            )}

            {user ? (
              <button type="button" onClick={goApplicantForm} className={buyerCtaClass}>
                {t("buyerSellerPortalBuyerCta")}
              </button>
            ) : (
              <AuthRequiredButton
                href="/dashboard/submit-request"
                onClick={prepareApplicant}
                className={buyerCtaClass}
              >
                {t("buyerSellerPortalBuyerCta")}
              </AuthRequiredButton>
            )}
          </div>

          <p className="mt-3.5 text-center text-xs leading-6 text-emerald-100/70 lg:text-start">
            {t("buyerSellerPortalHint")}{" "}
            <Link href="/pricing" className="font-semibold text-white underline-offset-2 hover:underline">
              {t("buyerSellerPortalPricingLink")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
