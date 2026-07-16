"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import AuthRequiredButton from "@/app/components/ui/AuthRequiredButton";
import { useAuth } from "@/app/context/AuthContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { canActAsSeller, DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";

function ShopPreviewMock({ t, isRTL }) {
  return (
    <div
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-[0_20px_50px_rgba(6,78,59,0.12)] backdrop-blur-sm"
      aria-hidden
    >
      <div className="relative h-28 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 sm:h-32">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_60%,#a7f3d0,transparent_40%)]" />
        <div className="absolute bottom-0 start-0 end-0 h-10 bg-gradient-to-t from-white/90 to-transparent" />
        <div
          className={`absolute -bottom-7 ${isRTL ? "right-5" : "left-5"} flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-emerald-50 text-2xl shadow-md`}
        >
          🌾
        </div>
      </div>

      <div className={`px-5 pb-5 pt-10 ${isRTL ? "text-right" : "text-left"}`}>
        <p className="text-[11px] font-semibold tracking-wide text-emerald-700">{t("buyerSellerPortalPreviewEyebrow")}</p>
        <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">{t("buyerSellerPortalPreviewName")}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{t("buyerSellerPortalPreviewBio")}</p>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[10px] text-slate-600 dir-ltr">
          <span className="text-emerald-600">zareoon.ir</span>
          <span>/tamin/</span>
          <span className="font-semibold text-slate-800">your-shop</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { value: "۱۲۸", label: t("buyerSellerPortalPreviewStatFollowers") },
            { value: "۲۴", label: t("buyerSellerPortalPreviewStatProducts") },
            { value: "۱٫۲هزار", label: t("buyerSellerPortalPreviewStatViews") },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-emerald-50/80 px-2 py-2 text-center">
              <p className="text-sm font-bold text-emerald-900">{stat.value}</p>
              <p className="text-[10px] font-medium text-emerald-800">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <span className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
            {t("buyerSellerPortalPreviewFollow")}
          </span>
          <span className="inline-flex flex-1 items-center justify-center rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800">
            {t("buyerSellerPortalPreviewContact")}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {["🥜", "🌿", "📦"].map((emoji, i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-xl"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
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

  const benefits = [
    t("buyerSellerPortalBenefit1"),
    t("buyerSellerPortalBenefit2"),
    t("buyerSellerPortalBenefit3"),
    t("buyerSellerPortalBenefit4"),
  ];

  const sellerCtaClass =
    "inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-900/15 transition hover:bg-emerald-800 active:scale-[0.99] sm:w-auto sm:min-w-[12rem]";
  const buyerCtaClass =
    "inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-emerald-200/80 bg-white/80 px-5 py-2.5 text-sm font-semibold text-emerald-900 backdrop-blur transition hover:border-emerald-300 hover:bg-white active:scale-[0.99] sm:w-auto sm:min-w-[12rem]";

  return (
    <section
      className={`w-full ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby="buyer-seller-portal-title"
    >
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 shadow-[0_12px_40px_rgba(6,78,59,0.08)] sm:rounded-3xl">
        <div
          className="pointer-events-none absolute -start-16 -top-20 h-56 w-56 rounded-full bg-emerald-300/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -end-10 h-64 w-64 rounded-full bg-teal-200/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(6,95,70,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(6,95,70,0.04)_1px,transparent_1px)] [background-size:28px_28px]"
          aria-hidden
        />

        <div className="relative grid items-center gap-8 p-5 sm:gap-10 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:p-10">
          <div className={`${isRTL ? "text-right" : "text-left"}`}>
            <p className="mb-2 inline-flex items-center rounded-full border border-emerald-200/80 bg-white/70 px-3 py-1 text-[11px] font-semibold text-emerald-800 backdrop-blur">
              {t("buyerSellerPortalBadge")}
            </p>

            <h2
              id="buyer-seller-portal-title"
              className="text-balance text-xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-2xl lg:text-[1.75rem] lg:leading-snug"
            >
              {t("buyerSellerPortalSectionTitle")}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-[15px] sm:leading-8">
              {t("buyerSellerPortalSectionDesc")}
            </p>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:leading-8">
              {t("buyerSellerPortalFriendlyNote")}
            </p>

            <ul className="mt-5 space-y-2.5">
              {benefits.map((text) => (
                <li key={text} className="flex items-start gap-2.5 text-sm leading-6 text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    ✓
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
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

            <p className="mt-4 text-xs leading-6 text-slate-500">
              {t("buyerSellerPortalHint")}{" "}
              <Link href="/pricing" className="font-semibold text-emerald-700 underline-offset-2 hover:underline">
                {t("buyerSellerPortalPricingLink")}
              </Link>
            </p>
          </div>

          <div className="relative">
            <p className={`mb-3 text-center text-xs font-semibold text-emerald-800/80 lg:mb-4 ${isRTL ? "lg:text-right" : "lg:text-left"}`}>
              {t("buyerSellerPortalPreviewCaption")}
            </p>
            <div className="origin-center transition duration-500 hover:-translate-y-1 hover:rotate-[-0.5deg]">
              <ShopPreviewMock t={t} isRTL={isRTL} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
