"use client";

import { useState } from "react";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";
import DashboardGuideModal, { DashboardGuideTrigger } from "@/app/components/dashboard/DashboardGuideModal";

const TABS = [
  {
    id: DASHBOARD_PERSONAS.APPLICANT,
    labelKey: "dashboardPersonaApplicant",
    hintKey: "dashboardPersonaApplicantHint",
    activeClass: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200 shadow-sm",
  },
  {
    id: DASHBOARD_PERSONAS.SELLER,
    labelKey: "dashboardPersonaSeller",
    hintKey: "dashboardPersonaSellerHint",
    activeClass: "bg-amber-50 text-amber-950 ring-1 ring-amber-200 shadow-sm",
  },
  {
    id: DASHBOARD_PERSONAS.SERVICES,
    labelKey: "dashboardPersonaProvider",
    hintKey: "dashboardPersonaProviderHint",
    activeClass: "bg-sky-50 text-sky-900 ring-1 ring-sky-200 shadow-sm",
  },
];

function userDisplayName(user) {
  if (!user) return "";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  return user.username || user.email || "";
}

export default function DashboardPersonaSwitcher({ onLinkClick }) {
  const { persona, setPersona, canSwitchPersona, hydrated } = useDashboardPersona();
  const { t } = useLanguage();
  const auth = useAuth();
  const [guideOpen, setGuideOpen] = useState(false);

  if (!hydrated || !canSwitchPersona) return null;

  const displayName = userDisplayName(auth?.user);
  const base =
    "min-w-0 flex-1 rounded-lg px-1.5 py-2 text-[11px] font-bold transition sm:px-2 sm:text-xs";
  const idle = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

  const activePersona = persona === DASHBOARD_PERSONAS.BUYER ? DASHBOARD_PERSONAS.APPLICANT : persona;
  const activeTab = TABS.find((tab) => tab.id === activePersona) || TABS[0];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 px-0.5">
        {displayName ? (
          <p className="min-w-0 truncate text-sm font-bold leading-5 text-slate-900" title={displayName}>
            {displayName}
          </p>
        ) : (
          <span />
        )}
        <DashboardGuideTrigger onClick={() => setGuideOpen(true)} />
      </div>

      {/* «در نقش» sits on the top border (fieldset legend style) */}
      <div className="relative rounded-xl border border-slate-200 bg-slate-50/80 p-1.5 pt-3.5">
        <span className="absolute start-3 top-0 z-[1] -translate-y-1/2 bg-white px-1.5 text-[11px] font-bold leading-none text-slate-600">
          {t("dashboardPersonaSectionTitle")}
        </span>

        <div className="flex gap-1" role="tablist" aria-label={t("dashboardPersonaSectionTitle")}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activePersona === tab.id}
              onClick={() => {
                setPersona(tab.id);
                onLinkClick?.();
              }}
              className={`${base} ${activePersona === tab.id ? tab.activeClass : idle}`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        <p className="mt-2 px-1 text-[11px] leading-5 text-slate-500">
          {t(activeTab.hintKey)}
        </p>
      </div>

      <DashboardGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
