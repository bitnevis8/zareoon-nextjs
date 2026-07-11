"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import AuthRequiredButton from "@/app/components/ui/AuthRequiredButton";
import { useAuth } from "@/app/context/AuthContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { canActAsSeller, DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";

const cardShell =
  "group relative flex h-full w-full min-h-[11.25rem] flex-col overflow-hidden rounded-xl border border-emerald-100/90 bg-white p-3 text-right shadow-[0_2px_12px_rgba(6,78,59,0.06)] transition duration-300 active:scale-[0.99] sm:min-h-0 sm:rounded-2xl sm:border-slate-200/80 sm:p-5 sm:shadow-[0_4px_20px_rgba(15,23,42,0.04)] md:p-6 md:hover:-translate-y-1 md:hover:border-emerald-200 md:hover:shadow-[0_12px_32px_rgba(6,95,70,0.1)]";

function ApplicantIcon({ className = "h-5 w-5 sm:h-6 sm:w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h6m-6 4h4"
      />
    </svg>
  );
}

function SellerIcon({ className = "h-5 w-5 sm:h-6 sm:w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 11v.01"
      />
    </svg>
  );
}

function PortalCardContent({ badge, icon: Icon, title, description, cta, variant }) {
  const isApplicant = variant === "applicant";

  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition group-hover:opacity-100"
        aria-hidden
      />

      <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-4 sm:items-start sm:gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 sm:h-12 sm:w-12 sm:rounded-xl sm:bg-gradient-to-br sm:from-emerald-50 sm:to-white sm:shadow-sm">
          <Icon />
        </div>
        <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 sm:px-2.5 sm:py-1 sm:text-[11px]">
          {badge}
        </span>
      </div>

      <h3 className="text-xs font-bold leading-5 text-slate-900 sm:text-base sm:leading-7 sm:font-bold lg:text-lg">
        {title}
      </h3>
      <p className="mt-1 flex-1 text-[11px] leading-[1.35rem] text-slate-600 line-clamp-3 sm:mt-2 sm:text-sm sm:leading-7 sm:line-clamp-none">
        {description}
      </p>

      <span
        className={`mt-2.5 inline-flex min-h-9 w-full items-center justify-center rounded-lg px-2 py-1.5 text-[11px] font-semibold transition sm:mt-5 sm:min-h-11 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm ${
          isApplicant
            ? "border border-emerald-600/15 bg-emerald-600 text-white group-hover:bg-emerald-700"
            : "border border-emerald-200 bg-emerald-50 text-emerald-800 group-hover:border-emerald-300 group-hover:bg-emerald-100 sm:border-emerald-600/30 sm:bg-white sm:group-hover:bg-emerald-50"
        }`}
      >
        {cta}
      </span>
    </>
  );
}

function PortalCard({ badge, title, description, cta, href, icon, variant, useAuth, onBeforeNavigate, onClick }) {
  const content = (
    <PortalCardContent
      badge={badge}
      icon={icon}
      title={title}
      description={description}
      cta={cta}
      variant={variant}
    />
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cardShell}>
        {content}
      </button>
    );
  }

  if (useAuth) {
    return (
      <AuthRequiredButton href={href} onClick={onBeforeNavigate} className={cardShell}>
        {content}
      </AuthRequiredButton>
    );
  }

  return (
    <Link href={href} onClick={onBeforeNavigate} className={cardShell}>
      {content}
    </Link>
  );
}

export default function BuyerSellerPortal({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const auth = useAuth();
  const router = useRouter();
  const { setPersona } = useDashboardPersona();
  const user = auth?.user;
  const seller = canActAsSeller(user);

  const sellerHref = seller
    ? "/dashboard/supplier/inventory/create?scope=own"
    : "/dashboard/supplier-profile";

  const goApplicantForm = () => {
    setPersona(DASHBOARD_PERSONAS.APPLICANT);
    router.push("/dashboard/submit-request");
  };

  const prepareApplicant = () => {
    setPersona(DASHBOARD_PERSONAS.APPLICANT);
  };

  return (
    <section
      className={`w-full space-y-3 sm:space-y-4 ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby="buyer-seller-portal-title"
    >
      <div className="hidden space-y-1 text-center sm:block">
        <h2 id="buyer-seller-portal-title" className="text-base font-bold text-slate-800 sm:text-lg">
          {t("buyerSellerPortalSectionTitle")}
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-500">{t("buyerSellerPortalSectionDesc")}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-[0_2px_16px_rgba(6,78,59,0.07)] sm:border-0 sm:bg-transparent sm:shadow-none">
        <div className="border-b border-emerald-50 bg-emerald-50/60 px-3 py-2.5 sm:hidden">
          <h2 className="text-xs font-bold text-emerald-800">
            {t("buyerSellerPortalSectionTitle")}
          </h2>
          <p className="mt-0.5 text-[11px] leading-5 text-emerald-700/80">{t("buyerSellerPortalSectionDesc")}</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 p-2.5 sm:grid-cols-2 sm:gap-4 sm:p-0">
          <PortalCard
            variant="applicant"
            badge={t("buyerSellerPortalApplicantBadge")}
            icon={ApplicantIcon}
            title={t("buyerSellerPortalBuyerTitle")}
            description={t("buyerSellerPortalBuyerDesc")}
            cta={t("buyerSellerPortalBuyerCta")}
            href="/dashboard/submit-request"
            useAuth={!user}
            onClick={user ? goApplicantForm : undefined}
            onBeforeNavigate={prepareApplicant}
          />
          <PortalCard
            variant="seller"
            badge={t("buyerSellerPortalSellerBadge")}
            icon={SellerIcon}
            title={t("buyerSellerPortalSellerTitle")}
            description={t("buyerSellerPortalSellerDesc")}
            cta={t("buyerSellerPortalSellerCta")}
            href={sellerHref}
            useAuth={!seller}
          />
        </div>
      </div>

      <p className="text-center text-[11px] leading-5 text-slate-400 sm:text-xs sm:leading-6">
        {t("buyerSellerPortalHint")}
      </p>
    </section>
  );
}
