"use client";

import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";

const TABS = [
  { id: DASHBOARD_PERSONAS.APPLICANT, label: "متقاضی" },
  { id: DASHBOARD_PERSONAS.SELLER, label: "فروشنده" },
  { id: DASHBOARD_PERSONAS.SERVICES, label: "خدمات" },
];

export default function DashboardPersonaSwitcher() {
  const { persona, setPersona, canSwitchPersona, hydrated } = useDashboardPersona();

  if (!hydrated || !canSwitchPersona) return null;

  const base =
    "min-w-0 flex-1 rounded-md px-1.5 py-2 text-[11px] font-bold transition sm:px-2 sm:text-xs";
  const active = "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200";
  const idle = "text-slate-600 hover:text-slate-900";

  const activePersona = persona === DASHBOARD_PERSONAS.BUYER ? DASHBOARD_PERSONAS.APPLICANT : persona;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPersona(tab.id)}
            className={`${base} ${activePersona === tab.id ? active : idle}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
