"use client";

import { useRouter } from "next/navigation";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { DASHBOARD_PERSONAS } from "@/app/utils/dashboardPersona";

function IconShop({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 5.5 5h13L20 10.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 10.5h15v8a1.5 1.5 0 0 1-1.5 1.5h-12a1.5 1.5 0 0 1-1.5-1.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 20v-4.5h5V20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconServices({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.5 7.25V5.75A2.25 2.25 0 0 1 10.75 3.5h2.5A2.25 2.25 0 0 1 15.5 5.75v1.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <rect x="4.5" y="7.25" width="15" height="12.25" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.25 12h5.5M9.25 15.25h3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconPosts({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const TABS = [
  {
    id: DASHBOARD_PERSONAS.SELLER,
    labelKey: "dashboardPersonaSeller",
    Icon: IconShop,
    tone: {
      idle: "text-emerald-700 ring-1 ring-emerald-200/80 hover:bg-emerald-50/80",
      selected: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-300",
      iconIdle: "text-emerald-600",
      iconSelected: "text-emerald-700",
    },
  },
  {
    id: DASHBOARD_PERSONAS.SERVICES,
    labelKey: "dashboardPersonaProvider",
    Icon: IconServices,
    tone: {
      idle: "text-sky-700 ring-1 ring-sky-200/80 hover:bg-sky-50/80",
      selected: "bg-sky-50 text-sky-900 ring-1 ring-sky-300",
      iconIdle: "text-sky-600",
      iconSelected: "text-sky-700",
    },
  },
  {
    id: DASHBOARD_PERSONAS.POSTS,
    labelKey: "dashboardPersonaPosts",
    Icon: IconPosts,
    tone: {
      idle: "text-amber-800 ring-1 ring-amber-200/80 hover:bg-amber-50/80",
      selected: "bg-amber-50 text-amber-950 ring-1 ring-amber-300",
      iconIdle: "text-amber-600",
      iconSelected: "text-amber-700",
    },
  },
];

export default function DashboardPersonaSwitcher({ onLinkClick, compact = false }) {
  const router = useRouter();
  const { persona, setPersona, canSwitchPersona, hydrated } = useDashboardPersona();
  const { t } = useLanguage();

  const activePersona = persona === DASHBOARD_PERSONAS.BUYER ? DASHBOARD_PERSONAS.APPLICANT : persona;

  if (!hydrated || !canSwitchPersona) return null;

  return (
    <div
      className={compact ? "flex flex-col gap-1.5" : "grid grid-cols-3 gap-1.5"}
      role="tablist"
      aria-label={t("dashboardPersonaSectionTitle")}
    >
      {TABS.map((tab) => {
        const selected = activePersona === tab.id;
        const TabIcon = tab.Icon;
        const label = t(tab.labelKey);
        const tone = tab.tone;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            title={label}
            onClick={() => {
              setPersona(tab.id);
              router.push("/dashboard");
              onLinkClick?.();
            }}
            className={`flex min-w-0 items-center justify-center rounded-lg transition ${
              compact
                ? "h-9 w-full px-1"
                : "flex-col gap-1 px-1 py-2 text-[10px] font-medium leading-tight sm:text-[11px]"
            } ${selected ? tone.selected : tone.idle}`}
          >
            <TabIcon className={`h-4 w-4 shrink-0 ${selected ? tone.iconSelected : tone.iconIdle}`} />
            {!compact ? <span className="truncate text-center">{label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
