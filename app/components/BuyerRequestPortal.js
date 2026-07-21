"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import AuthRequiredButton from "@/app/components/ui/AuthRequiredButton";
import { useAuth } from "@/app/context/AuthContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";

const CTA_CLASS =
  "inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 sm:w-auto sm:min-w-[11.5rem]";

export default function BuyerRequestPortal({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const auth = useAuth();
  const router = useRouter();
  const { setPersona } = useDashboardPersona();
  const user = auth?.user;

  const goApplicantForm = () => {
    setPersona(DASHBOARD_PERSONAS.APPLICANT);
    router.push("/dashboard/submit-request");
  };

  const prepareApplicant = () => {
    setPersona(DASHBOARD_PERSONAS.APPLICANT);
  };

  const cta = user ? (
    <button type="button" onClick={goApplicantForm} className={CTA_CLASS}>
      {t("buyerSellerPortalBuyerCta")}
    </button>
  ) : (
    <AuthRequiredButton href="/dashboard/submit-request" onClick={prepareApplicant} className={CTA_CLASS}>
      {t("buyerSellerPortalBuyerCta")}
    </AuthRequiredButton>
  );

  return (
    <section
      className={`w-full text-start ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby="buyer-request-portal-title"
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-teal-50/50 shadow-[0_16px_48px_-28px_rgba(15,23,42,0.22)] sm:rounded-[1.75rem]">
        <div
          className="pointer-events-none absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-teal-600 via-emerald-600 to-teal-700 sm:w-1.5"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-16 -top-20 h-44 w-44 rounded-full bg-teal-400/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -start-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-3.5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-7 sm:py-6 lg:gap-8 lg:px-8 lg:py-7">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3 sm:contents">
              <div className="relative h-14 w-14 shrink-0 sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                <Image
                  src="/images/need.png"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 56px, (max-width: 1024px) 96px, 112px"
                  className="object-contain object-center"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-wide text-teal-800/80 sm:text-[11px]">
                  {t("buyerSellerPortalApplicantBadge")}
                </p>
                <h2
                  id="buyer-request-portal-title"
                  className="mt-0.5 text-balance text-[15px] font-black leading-snug tracking-tight text-slate-900 sm:mt-1 sm:text-lg lg:text-xl"
                >
                  {t("buyerSellerPortalBuyerTitle")}
                </h2>
                <p className="mt-1.5 hidden max-w-xl text-sm leading-7 text-slate-600 sm:block">
                  {t("buyerSellerPortalBuyerDesc")}
                </p>
              </div>
            </div>
            <p className="text-[12.5px] leading-6 text-slate-600 sm:hidden">{t("buyerSellerPortalBuyerDesc")}</p>
          </div>

          <div className="w-full shrink-0 sm:w-auto">{cta}</div>
        </div>
      </div>
    </section>
  );
}
