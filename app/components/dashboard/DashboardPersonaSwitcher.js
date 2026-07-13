"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";
import DashboardGuideModal, { DashboardGuideTrigger } from "@/app/components/dashboard/DashboardGuideModal";

const TABS = [
  {
    id: DASHBOARD_PERSONAS.APPLICANT,
    labelKey: "buyerSellerPortalApplicantBadge",
    activeClass: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200 shadow-sm",
  },
  {
    id: DASHBOARD_PERSONAS.SELLER,
    labelKey: "buyerSellerPortalSellerBadge",
    activeClass: "bg-amber-50 text-amber-950 ring-1 ring-amber-200 shadow-sm",
  },
  {
    id: DASHBOARD_PERSONAS.SERVICES,
    labelKey: "mobileServicesTab",
    activeClass: "bg-sky-50 text-sky-900 ring-1 ring-sky-200 shadow-sm",
  },
];

export default function DashboardPersonaSwitcher({ onLinkClick }) {
  const { persona, setPersona, canSwitchPersona, hydrated } = useDashboardPersona();
  const { t } = useLanguage();
  const [guideOpen, setGuideOpen] = useState(false);

  if (!hydrated || !canSwitchPersona) return null;

  const base =
    "min-w-0 flex-1 rounded-lg px-1.5 py-2 text-[11px] font-bold transition sm:px-2 sm:text-xs";
  const idle = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

  const activePersona = persona === DASHBOARD_PERSONAS.BUYER ? DASHBOARD_PERSONAS.APPLICANT : persona;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <Link
          href="/dashboard"
          onClick={onLinkClick}
          className="text-[11px] font-semibold text-slate-500 transition hover:text-emerald-800"
        >
          {t("dashboard")}
        </Link>
        <DashboardGuideTrigger onClick={() => setGuideOpen(true)} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-1.5">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPersona(tab.id)}
              className={`${base} ${activePersona === tab.id ? tab.activeClass : idle}`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <DashboardGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
