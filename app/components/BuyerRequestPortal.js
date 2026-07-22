"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import AuthRequiredButton from "@/app/components/ui/AuthRequiredButton";
import { useAuth } from "@/app/context/AuthContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";

/** تصویر نهایی: public/images/buyer-request.jpg */
const BUYER_REQUEST_IMAGE = "/images/buyer-request.jpg";
const BUYER_REQUEST_FALLBACK = "/images/buyer-request-placeholder.svg";

const PRODUCT_HREF = "/dashboard/submit-request?type=product";
const SERVICE_HREF = "/dashboard/submit-request?type=service";

function ProductIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ServiceIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function RequestAction({ href, title, description, icon, tone = "emerald", onNavigate, user, prepare }) {
  const toneClass =
    tone === "teal"
      ? "border-teal-200/80 from-teal-50/90 to-white hover:border-teal-300 hover:shadow-teal-900/10"
      : "border-emerald-200/80 from-emerald-50/90 to-white hover:border-emerald-300 hover:shadow-emerald-900/10";
  const iconWrap =
    tone === "teal"
      ? "bg-teal-600 text-white shadow-teal-700/25"
      : "bg-emerald-700 text-white shadow-emerald-800/25";

  const body = (
    <>
      <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md ${iconWrap}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-start">
        <span className="block text-sm font-bold text-slate-900 sm:text-[15px]">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-5 text-slate-600 sm:text-xs sm:leading-5">
          {description}
        </span>
      </span>
      <ChevronIcon className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-emerald-700 rtl:rotate-180" />
    </>
  );

  const className = `group flex w-full items-center gap-3 rounded-2xl border bg-gradient-to-br p-3.5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:gap-3.5 sm:p-4 ${toneClass}`;

  if (user) {
    return (
      <button type="button" onClick={onNavigate} className={className}>
        {body}
      </button>
    );
  }

  return (
    <AuthRequiredButton href={href} onClick={prepare} className={className}>
      {body}
    </AuthRequiredButton>
  );
}

export default function BuyerRequestPortal({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const auth = useAuth();
  const router = useRouter();
  const { setPersona } = useDashboardPersona();
  const user = auth?.user;
  const [imageSrc, setImageSrc] = useState(BUYER_REQUEST_FALLBACK);

  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) setImageSrc(BUYER_REQUEST_IMAGE);
    };
    img.onerror = () => {
      if (!cancelled) setImageSrc(BUYER_REQUEST_FALLBACK);
    };
    img.src = BUYER_REQUEST_IMAGE;
    return () => {
      cancelled = true;
    };
  }, []);

  const prepareApplicant = () => {
    setPersona(DASHBOARD_PERSONAS.APPLICANT);
  };

  const go = (href) => {
    setPersona(DASHBOARD_PERSONAS.APPLICANT);
    router.push(href);
  };

  return (
    <section
      className={`w-full text-start ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby="buyer-request-portal-title"
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.28)] sm:rounded-[1.75rem]">
        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
          <div className="relative min-h-[11rem] overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 sm:min-h-[14rem] lg:min-h-full">
            <Image
              src={imageSrc}
              alt={t("buyerRequestPortalImageAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-center"
              onError={() => setImageSrc(BUYER_REQUEST_FALLBACK)}
              unoptimized={imageSrc.endsWith(".svg")}
              priority={false}
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:hidden">
              <p className="text-[10px] font-bold tracking-wide text-emerald-100/90">
                {t("buyerRequestPortalEyebrow")}
              </p>
              <p className="mt-1 text-base font-bold text-white">{t("buyerRequestPortalTitle")}</p>
            </div>
          </div>

          <div className="relative flex flex-col justify-center gap-4 px-4 py-5 sm:gap-5 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
            <div
              className="pointer-events-none absolute -end-10 -top-12 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl"
              aria-hidden
            />
            <div className="relative hidden lg:block">
              <p className="text-[10px] font-bold tracking-wide text-emerald-800/80 sm:text-xs">
                {t("buyerRequestPortalEyebrow")}
              </p>
              <h2
                id="buyer-request-portal-title"
                className="mt-1 text-balance text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
              >
                {t("buyerRequestPortalTitle")}
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
                {t("buyerRequestPortalDesc")}
              </p>
            </div>

            <div className="relative lg:hidden">
              <h2 id="buyer-request-portal-title-mobile" className="sr-only">
                {t("buyerRequestPortalTitle")}
              </h2>
              <p className="text-xs leading-6 text-slate-600">{t("buyerRequestPortalDesc")}</p>
            </div>

            <div className="relative grid gap-2.5 sm:gap-3">
              <RequestAction
                href={PRODUCT_HREF}
                title={t("buyerRequestPortalProductTitle")}
                description={t("buyerRequestPortalProductDesc")}
                icon={<ProductIcon className="h-5 w-5" />}
                tone="emerald"
                user={user}
                prepare={prepareApplicant}
                onNavigate={() => go(PRODUCT_HREF)}
              />
              <RequestAction
                href={SERVICE_HREF}
                title={t("buyerRequestPortalServiceTitle")}
                description={t("buyerRequestPortalServiceDesc")}
                icon={<ServiceIcon className="h-5 w-5" />}
                tone="teal"
                user={user}
                prepare={prepareApplicant}
                onNavigate={() => go(SERVICE_HREF)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
