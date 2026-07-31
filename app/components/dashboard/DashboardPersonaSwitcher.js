"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useWorkspace } from "@/app/context/WorkspaceContext";
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
    gate: "shop",
    noBusinessHint:
      "برای داشتن فروشگاه، ابتدا باید کسب‌وکار خود را بسازید. بعد از ایجاد کسب‌وکار می‌توانید فعالیت فروش را فعال کنید.",
    disabledHint:
      "برای این کسب‌وکار فروشگاه فعال نیست. از بخش «مدیریت کسب‌وکار» نوع فعالیت فروشنده را روشن کنید.",
    tone: {
      idle: "text-emerald-700 ring-1 ring-emerald-200/80 hover:bg-emerald-50/80",
      selected: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-300",
      iconIdle: "text-emerald-600",
      iconSelected: "text-emerald-700",
      disabled: "cursor-help text-slate-400 ring-1 ring-slate-200/80 bg-slate-50/80",
      iconDisabled: "text-slate-300",
    },
  },
  {
    id: DASHBOARD_PERSONAS.SERVICES,
    labelKey: "dashboardPersonaProvider",
    Icon: IconServices,
    gate: "services",
    noBusinessHint:
      "برای ارائه خدمات، ابتدا باید کسب‌وکار خود را بسازید. بعد از ایجاد کسب‌وکار می‌توانید فعالیت خدمات را فعال کنید.",
    disabledHint:
      "برای این کسب‌وکار خدمات فعال نیست. از بخش «مدیریت کسب‌وکار» نوع فعالیت خدمات‌دهنده را روشن کنید.",
    tone: {
      idle: "text-sky-700 ring-1 ring-sky-200/80 hover:bg-sky-50/80",
      selected: "bg-sky-50 text-sky-900 ring-1 ring-sky-300",
      iconIdle: "text-sky-600",
      iconSelected: "text-sky-700",
      disabled: "cursor-help text-slate-400 ring-1 ring-slate-200/80 bg-slate-50/80",
      iconDisabled: "text-slate-300",
    },
  },
  {
    id: DASHBOARD_PERSONAS.POSTS,
    labelKey: "dashboardPersonaPosts",
    Icon: IconPosts,
    gate: "posts",
    noBusinessHint:
      "برای انتشار پست، ابتدا باید کسب‌وکار خود را بسازید. پست‌ها پس از فعال‌شدن فروش یا خدمات در دسترس‌اند.",
    disabledHint:
      "برای پست‌ها باید فروش یا خدمات این کسب‌وکار فعال باشد. از بخش «مدیریت کسب‌وکار» تنظیم کنید.",
    tone: {
      idle: "text-amber-800 ring-1 ring-amber-200/80 hover:bg-amber-50/80",
      selected: "bg-amber-50 text-amber-950 ring-1 ring-amber-300",
      iconIdle: "text-amber-600",
      iconSelected: "text-amber-700",
      disabled: "cursor-help text-slate-400 ring-1 ring-slate-200/80 bg-slate-50/80",
      iconDisabled: "text-slate-300",
    },
  },
];

function firstEnabledPersona({ canUseShop, canUseServices, canUsePosts }) {
  if (canUseShop) return DASHBOARD_PERSONAS.SELLER;
  if (canUseServices) return DASHBOARD_PERSONAS.SERVICES;
  if (canUsePosts) return DASHBOARD_PERSONAS.POSTS;
  return DASHBOARD_PERSONAS.SELLER;
}

/** باکس راهنما با portal تا توسط overflow سایدبار بریده نشود */
function DisabledHintPortal({ anchorRef, open, title, hint, ctaLabel, onClose, onKeepOpen, onLinkClick }) {
  const boxRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 240 });

  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) return;
    const update = () => {
      const r = anchorRef.current.getBoundingClientRect();
      const width = Math.min(280, Math.max(220, window.innerWidth - 24));
      let left = r.left + r.width / 2 - width / 2;
      left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
      let top = r.bottom + 8;
      const estimatedH = 130;
      if (top + estimatedH > window.innerHeight - 12) {
        top = Math.max(12, r.top - estimatedH - 8);
      }
      setPos({ top, left, width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (boxRef.current?.contains(e.target) || anchorRef?.current?.contains(e.target)) return;
      onClose?.();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose, anchorRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={boxRef}
      role="tooltip"
      id={`persona-hint-box`}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 10050 }}
      className="rounded-xl border border-slate-200 bg-white p-3 text-right shadow-xl ring-1 ring-slate-900/5"
      dir="rtl"
      onMouseEnter={onKeepOpen}
      onMouseLeave={onClose}
    >
      <p className="text-[12px] font-bold leading-5 text-slate-800">{title}</p>
      <p className="mt-1.5 text-[11px] leading-5 text-slate-600 whitespace-normal break-words">{hint}</p>
      <Link
        href="/dashboard/workspace"
        className="mt-2.5 inline-flex text-[11px] font-semibold text-emerald-700 hover:underline"
        onClick={() => {
          onLinkClick?.();
          onClose?.();
        }}
      >
        {ctaLabel || "رفتن به مدیریت کسب‌وکار"}
      </Link>
    </div>,
    document.body
  );
}

function DisabledPersonaTab({ tab, label, tone, compact, hint, ctaLabel, onLinkClick }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <div
      ref={anchorRef}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hideSoon}
      onFocus={show}
      onBlur={hideSoon}
    >
      <button
        type="button"
        role="tab"
        aria-selected={false}
        aria-disabled="true"
        className={`flex min-w-0 w-full items-center justify-center rounded-lg transition ${
          compact
            ? "h-9 px-1"
            : "flex-col gap-1 px-1 py-2 text-[10px] font-medium leading-tight sm:text-[11px]"
        } ${tone.disabled}`}
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
      >
        <tab.Icon className={`h-4 w-4 shrink-0 ${tone.iconDisabled}`} />
        {!compact ? <span className="w-full truncate text-center">{label}</span> : null}
      </button>
      <DisabledHintPortal
        anchorRef={anchorRef}
        open={open}
        title={label}
        hint={hint}
        ctaLabel={ctaLabel}
        onKeepOpen={show}
        onClose={() => setOpen(false)}
        onLinkClick={onLinkClick}
      />
    </div>
  );
}

export default function DashboardPersonaSwitcher({ onLinkClick, compact = false }) {
  const router = useRouter();
  const { persona, setPersona, canSwitchPersona, hydrated } = useDashboardPersona();
  const { t } = useLanguage();
  const { canUseShop, canUseServices, canUsePosts, ready, workspace, loading } = useWorkspace();

  const activePersona = persona === DASHBOARD_PERSONAS.BUYER ? DASHBOARD_PERSONAS.APPLICANT : persona;
  const hasBusiness = Boolean(workspace);

  // بدون کسب‌وکار یا با فعالیت خاموش → غیرفعال؛ هنگام لود فلاش نده
  const gateOk = {
    shop: loading || (hasBusiness && canUseShop),
    services: loading || (hasBusiness && canUseServices),
    posts: loading || (hasBusiness && canUsePosts),
  };

  useEffect(() => {
    if (!ready || !hydrated) return;
    const ok =
      (activePersona === DASHBOARD_PERSONAS.SELLER && canUseShop) ||
      (activePersona === DASHBOARD_PERSONAS.SERVICES && canUseServices) ||
      (activePersona === DASHBOARD_PERSONAS.POSTS && canUsePosts);
    if (!ok) {
      setPersona(firstEnabledPersona({ canUseShop, canUseServices, canUsePosts }));
    }
  }, [
    ready,
    hydrated,
    activePersona,
    canUseShop,
    canUseServices,
    canUsePosts,
    setPersona,
    workspace?.id,
  ]);

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
        const enabled = gateOk[tab.gate];

        if (!enabled) {
          return (
            <DisabledPersonaTab
              key={tab.id}
              tab={tab}
              label={label}
              tone={tone}
              compact={compact}
              hint={hasBusiness ? tab.disabledHint : tab.noBusinessHint}
              ctaLabel={hasBusiness ? "رفتن به مدیریت کسب‌وکار" : "ایجاد کسب‌وکار"}
              onLinkClick={onLinkClick}
            />
          );
        }

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
            {!compact ? <span className="w-full truncate text-center">{label}</span> : null}
            </button>
          );
        })}
    </div>
  );
}
