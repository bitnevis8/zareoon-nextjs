"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import AuthRequiredButton from "@/app/components/ui/AuthRequiredButton";
import { useAuth } from "@/app/context/AuthContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { canActAsSeller, DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";

const cardShell =
  "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 text-right shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_12px_32px_rgba(6,95,70,0.1)] sm:p-6";

function ApplicantIcon({ className = "h-6 w-6" }) {
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

function SellerIcon({ className = "h-6 w-6" }) {
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

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white text-emerald-700 shadow-sm transition group-hover:border-emerald-200">
          <Icon />
        </div>
        <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50/90 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
          {badge}
        </span>
      </div>

      <h3 className="text-base font-bold leading-7 text-slate-900 sm:text-lg">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{description}</p>

      <span
        className={`mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
          isApplicant
            ? "border border-emerald-600/20 bg-emerald-600 text-white group-hover:bg-emerald-700"
            : "border border-emerald-600/30 bg-white text-emerald-800 group-hover:border-emerald-300 group-hover:bg-emerald-50"
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
      className={`w-full space-y-4 ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby="buyer-seller-portal-title"
    >
      <div className="space-y-1 text-center">
        <h2 id="buyer-seller-portal-title" className="text-base font-bold text-slate-800 sm:text-lg">
          {t("buyerSellerPortalSectionTitle")}
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-500">{t("buyerSellerPortalSectionDesc")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <p className="text-center text-xs leading-6 text-slate-400">{t("buyerSellerPortalHint")}</p>
    </section>
  );
}
