"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import ApplicantRequestForm from "@/app/components/dashboard/ApplicantRequestForm";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";
import { dash } from "@/app/components/dashboard/dashboardTheme";

function SubmitRequestInner() {
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
        <h1 className={dash.pageTitle}>ثبت درخواست</h1>
        <p className={dash.pageSubtitle}>
          نوع نیاز خود (محصول یا خدمات) را انتخاب کنید، دسته مناسب را مشخص کنید و جزئیات را وارد کنید.
          فروشندگان یا ارائه‌دهندگان مرتبط از طریق اعلان مطلع می‌شوند.
        </p>
      </header>
      <ApplicantRequestForm compact initialRequestType={initialRequestType} />
    </div>
  );
}

export default function SubmitRequestPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className={`${dash.page} animate-pulse`}>در حال بارگذاری…</div>}>
        <SubmitRequestInner />
      </Suspense>
    </ProtectedRoute>
  );
}
