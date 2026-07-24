"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/app/context/LanguageContext";

const ACCENT_STYLES = {
  slate: {
    card: "border-slate-200 bg-slate-50/80",
    badge: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
  },
  emerald: {
    card: "border-emerald-200 bg-emerald-50/50",
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  amber: {
    card: "border-amber-200 bg-amber-50/50",
    badge: "bg-amber-100 text-amber-900",
    dot: "bg-amber-500",
  },
  sky: {
    card: "border-sky-200 bg-sky-50/50",
    badge: "bg-sky-100 text-sky-800",
    dot: "bg-sky-500",
  },
};

function GuideIcon({ name, className = "h-5 w-5" }) {
  const paths = {
    help: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    home: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    ),
    applicant: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    ),
    seller: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    ),
    services: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
  };

  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      {paths[name] || paths.help}
    </svg>
  );
}

function GuideSectionCard({ section }) {
  const styles = ACCENT_STYLES[section.accent] || ACCENT_STYLES.slate;

  return (
    <section className={`rounded-2xl border p-4 sm:p-5 ${styles.card}`}>
      <div className="mb-3 flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.badge}`}
        >
          <GuideIcon name={section.icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 sm:text-base">{section.title}</h3>
          <p className="mt-1.5 text-xs leading-6 text-slate-600 sm:text-sm">{section.summary}</p>
        </div>
      </div>

      {section.items.length > 0 ? (
        <ul className="space-y-2.5 border-t border-white/60 pt-3">
          {section.items.map((item) => (
            <li key={item.label} className="flex gap-2.5">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 sm:text-sm">{item.label}</p>
                <p className="mt-0.5 text-[11px] leading-6 text-slate-600 sm:text-xs">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function useGuideSections() {
  const t = useTranslations("dashboard.guide");

  return useMemo(
    () => [
      {
        id: "intro",
        title: t("sections.intro.title"),
        accent: "slate",
        icon: "home",
        summary: t("sections.intro.summary"),
        items: [],
      },
      {
        id: "applicant",
        title: t("sections.applicant.title"),
        accent: "emerald",
        icon: "applicant",
        summary: t("sections.applicant.summary"),
        items: [
          {
            label: t("sections.applicant.items.submitRequest.label"),
            desc: t("sections.applicant.items.submitRequest.desc"),
          },
          {
            label: t("sections.applicant.items.myRequests.label"),
            desc: t("sections.applicant.items.myRequests.desc"),
          },
          {
            label: t("sections.applicant.items.cart.label"),
            desc: t("sections.applicant.items.cart.desc"),
          },
          {
            label: t("sections.applicant.items.myOrders.label"),
            desc: t("sections.applicant.items.myOrders.desc"),
          },
        ],
      },
      {
        id: "seller",
        title: t("sections.seller.title"),
        accent: "amber",
        icon: "seller",
        summary: t("sections.seller.summary"),
        items: [
          {
            label: t("sections.seller.items.storeUrl.label"),
            desc: t("sections.seller.items.storeUrl.desc"),
          },
          {
            label: t("sections.seller.items.myProducts.label"),
            desc: t("sections.seller.items.myProducts.desc"),
          },
          {
            label: t("sections.seller.items.createInventory.label"),
            desc: t("sections.seller.items.createInventory.desc"),
          },
          {
            label: t("sections.seller.items.customerOrders.label"),
            desc: t("sections.seller.items.customerOrders.desc"),
          },
          {
            label: t("sections.seller.items.incomingProducts.label"),
            desc: t("sections.seller.items.incomingProducts.desc"),
          },
        ],
      },
      {
        id: "services",
        title: t("sections.services.title"),
        accent: "sky",
        icon: "services",
        summary: t("sections.services.summary"),
        items: [
          {
            label: t("sections.services.items.publicPage.label"),
            desc: t("sections.services.items.publicPage.desc"),
          },
          {
            label: t("sections.services.items.register.label"),
            desc: t("sections.services.items.register.desc"),
          },
          {
            label: t("sections.services.items.myPage.label"),
            desc: t("sections.services.items.myPage.desc"),
          },
          {
            label: t("sections.services.items.customerOrders.label"),
            desc: t("sections.services.items.customerOrders.desc"),
          },
          {
            label: t("sections.services.items.incomingServices.label"),
            desc: t("sections.services.items.incomingServices.desc"),
          },
        ],
      },
    ],
    [t]
  );
}

export default function DashboardGuideModal({ open, onClose }) {
  const t = useTranslations("dashboard.guide");
  const tCommon = useTranslations("common");
  const { isRTL } = useLanguage();
  const guideSections = useGuideSections();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10002] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-guide-title"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={tCommon("close")}
      />

      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="shrink-0 border-b border-slate-100 bg-gradient-to-l from-emerald-50 via-white to-sky-50 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <GuideIcon name="help" className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">{t("brand")}</p>
                <h2 id="dashboard-guide-title" className="text-base font-black text-slate-900 sm:text-lg">
                  {t("title")}
                </h2>
                <p className="mt-1 text-xs leading-6 text-slate-600 sm:text-sm">{t("subtitle")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label={tCommon("close")}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:space-y-4 sm:px-6 sm:py-5">
          {guideSections.map((section) => (
            <GuideSectionCard key={section.id} section={section} />
          ))}

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-xs leading-6 text-slate-600">
            <span className="font-bold text-slate-800">{t("tipPrefix")}</span> {t("tipText")}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {t("dismiss")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function DashboardGuideTrigger({ onClick, showIcon = true, className = "", variant = "plain", compact = false }) {
  const t = useTranslations("dashboard.guide");

  const baseClass =
    variant === "box"
      ? compact
        ? "inline-flex h-9 w-full items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-white hover:text-emerald-800 hover:ring-emerald-200"
        : "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-3 text-[13px] font-semibold text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-white hover:text-emerald-800 hover:ring-emerald-200"
      : "inline-flex items-center justify-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-emerald-800";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClass} ${className}`}
      aria-label={t("triggerLabel")}
      title={t("triggerShort")}
    >
      {showIcon ? <GuideIcon name="help" className="h-3.5 w-3.5" /> : null}
      {!compact ? <span>{t("triggerShort")}</span> : null}
    </button>
  );
}
