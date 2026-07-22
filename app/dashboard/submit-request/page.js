"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import ApplicantRequestForm from "@/app/components/dashboard/ApplicantRequestForm";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";
import { dash } from "@/app/components/dashboard/dashboardTheme";

function SubmitRequestInner() {
  const t = useTranslations("applicant");
  const { t: tSite } = useLanguage();
  const { setPersona } = useDashboardPersona();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const categoryParam = searchParams.get("category") || "";
  const noteParam = searchParams.get("note") || "";
  const initialRequestType = typeParam === "service" || typeParam === "product" ? typeParam : "";
  const isPackagingRequest = categoryParam === "packaging-prep";
  const serviceCategoryId =
    categoryParam === "packaging-prep" || categoryParam === "intl-logistics" ? categoryParam : "";

  useEffect(() => {
    setPersona(DASHBOARD_PERSONAS.APPLICANT);
  }, [setPersona]);

  return (
    <div className={dash.page}>
      <header className="mb-6">
        <h1 className={dash.pageTitle}>
          {isPackagingRequest ? tSite("packagingAdCta") : t("submitPage.title")}
        </h1>
        <p className={dash.pageSubtitle}>
          {isPackagingRequest ? tSite("packagingAdDescription") : t("submitPage.subtitle")}
        </p>
      </header>
      <ApplicantRequestForm
        compact
        initialRequestType={initialRequestType}
        initialServiceCategoryId={serviceCategoryId}
        initialDescription={noteParam}
      />
    </div>
  );
}

function SubmitRequestFallback() {
  const tCommon = useTranslations("common");
  return <div className={`${dash.page} animate-pulse`}>{tCommon("loading")}</div>;
}

export default function SubmitRequestPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<SubmitRequestFallback />}>
        <SubmitRequestInner />
      </Suspense>
    </ProtectedRoute>
  );
}
