"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import ApplicantRequestForm from "@/app/components/dashboard/ApplicantRequestForm";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";
import { dash } from "@/app/components/dashboard/dashboardTheme";

function SubmitRequestInner() {
  const t = useTranslations("applicant");
  const { setPersona } = useDashboardPersona();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const initialRequestType = typeParam === "service" || typeParam === "product" ? typeParam : "";

  useEffect(() => {
    setPersona(DASHBOARD_PERSONAS.APPLICANT);
  }, [setPersona]);

  return (
    <div className={dash.page}>
      <header className="mb-6">
        <h1 className={dash.pageTitle}>{t("submitPage.title")}</h1>
        <p className={dash.pageSubtitle}>{t("submitPage.subtitle")}</p>
      </header>
      <ApplicantRequestForm compact initialRequestType={initialRequestType} />
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
