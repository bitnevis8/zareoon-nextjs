"use client";

import { useMemo, useState } from "react";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { DASHBOARD_PERSONAS, canActAsSeller } from "@/app/utils/dashboardPersona";
import { useMyTradeServiceProvider } from "@/app/hooks/useMyTradeServiceProvider";
import DashboardGuideModal, { DashboardGuideTrigger } from "@/app/components/dashboard/DashboardGuideModal";

const TABS = [
  {
    id: DASHBOARD_PERSONAS.APPLICANT,
    emoji: "🛒",
    labelKey: "dashboardPersonaApplicant",
    hintKey: "dashboardPersonaApplicantHint",
    activeBox: "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm",
  },
  {
    id: DASHBOARD_PERSONAS.SELLER,
    emoji: "🏪",
    labelKey: "dashboardPersonaSeller",
    hintBeforeKey: "dashboardPersonaSellerHintBefore",
    hintAfterKey: "dashboardPersonaSellerHintAfter",
    activeBox: "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm",
  },
  {
    id: DASHBOARD_PERSONAS.SERVICES,
    emoji: "🛠️",
    labelKey: "dashboardPersonaProvider",
    hintBeforeKey: "dashboardPersonaProviderHintBefore",
    hintAfterKey: "dashboardPersonaProviderHintAfter",
    activeBox: "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm",
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
  const { hasProvider } = useMyTradeServiceProvider();
  const [guideOpen, setGuideOpen] = useState(false);

  const hasShop = canActAsSeller(auth?.user);
  const displayName = userDisplayName(auth?.user);
  const activePersona = persona === DASHBOARD_PERSONAS.BUYER ? DASHBOARD_PERSONAS.APPLICANT : persona;
  const activeTab = TABS.find((tab) => tab.id === activePersona) || TABS[0];

  const hintText = useMemo(() => {
    if (activeTab.id === DASHBOARD_PERSONAS.SELLER) {
      return t(hasShop ? activeTab.hintAfterKey : activeTab.hintBeforeKey);
    }
    if (activeTab.id === DASHBOARD_PERSONAS.SERVICES) {
      return t(hasProvider ? activeTab.hintAfterKey : activeTab.hintBeforeKey);
    }
    return t(activeTab.hintKey);
  }, [activeTab, hasShop, hasProvider, t]);

  if (!hydrated || !canSwitchPersona) return null;

  return (
    <div className="space-y-2.5">
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

      <div className="grid grid-cols-3 gap-1.5" role="tablist" aria-label={t("dashboardPersonaSectionTitle")}>
        {TABS.map((tab) => {
          const selected = activePersona === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setPersona(tab.id);
                onLinkClick?.();
              }}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2.5 text-center transition ${
                selected
                  ? tab.activeBox
                  : "border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-base leading-none" aria-hidden>
                {tab.emoji}
              </span>
              <span className="text-[10px] font-bold leading-tight sm:text-[11px]">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5">
        <p className="text-[11px] leading-5 text-slate-600">{hintText}</p>
      </div>

      <DashboardGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
