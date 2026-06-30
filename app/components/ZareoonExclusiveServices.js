"use client";

import Link from "next/link";
import { useId } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getExclusiveServicesContent } from "../data/zareoonExclusiveServices";
function ServiceIcon({ name }) {
  const className = "h-5 w-5 text-emerald-700";

  switch (name) {
    case "trade":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2M7 11h10M9 15h6M12 7v12" />
        </svg>
      );
    case "logistics":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16h2l2-7h11l2 5h2M7 16a2 2 0 104 0M15 16a2 2 0 104 0" />
        </svg>
      );
    case "customs":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-8 8h10a2 2 0 002-2V8l-4-4H8L4 8v10a2 2 0 002 2z" />
        </svg>
      );
    case "finance":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 14h.01M11 14h.01M15 14h.01M6 6h12v12H6z" />
        </svg>
      );
    case "inspection":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.2 20.2l-4.1-1.1a1 1 0 01-.6-1.3l1.1-4.1 9.9-9.9a2 2 0 012.8 0l1.1 1.1a2 2 0 010 2.8l-9.9 9.9-4.1 1.1z" />
        </svg>
      );
    case "insurance":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v6c0 4.4-3.4 7.7-8 8-4.6-.3-8-3.6-8-8V7l8-4z" />
        </svg>
      );
    case "consulting":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M12 20a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h8M8 10h8M8 14h5M6 4h12v16H6z" />
        </svg>
      );
  }
}

function HeaderPattern({ gridId, dotsId }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.14]"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={gridId} width="32" height="32" patternUnits="userSpaceOnUse">
          <path
            d="M32 0H0V32"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            className="text-white"
          />
          <circle cx="16" cy="16" r="1.25" fill="currentColor" className="text-white" />
        </pattern>
        <pattern id={dotsId} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" className="text-emerald-200" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${gridId})`} />
      <rect width="100%" height="100%" fill={`url(#${dotsId})`} opacity="0.55" />
    </svg>
  );
}

export default function ZareoonExclusiveServices({ className = "" }) {
  const { language, isRTL, t } = useLanguage();
  const content = getExclusiveServicesContent(language);
  const patternBaseId = useId();
  const gridId = `${patternBaseId}-grid`;
  const dotsId = `${patternBaseId}-dots`;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white/80 via-emerald-50/30 to-slate-50/50 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-md sm:p-6 ${className}`}
      aria-labelledby="zareoon-exclusive-services-title"
    >
      <div
        className="pointer-events-none absolute -left-10 top-8 h-36 w-36 rounded-full bg-emerald-200/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 bottom-0 h-40 w-40 rounded-full bg-slate-200/30 blur-3xl"
        aria-hidden
      />

      <div className="relative space-y-5">
        <div
          className={`relative overflow-hidden rounded-2xl border border-emerald-700/20 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_32px_rgba(6,78,59,0.28)] sm:px-7 sm:py-8 ${isRTL ? "text-right" : "text-left"}`}
        >
          <HeaderPattern gridId={gridId} dotsId={dotsId} />
          <div
            className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-teal-300/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 end-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent"
            aria-hidden
          />

          <div className="relative space-y-3 sm:space-y-4">
            <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-emerald-50 backdrop-blur-sm sm:text-xs">
              {content.eyebrow}
            </p>
            <h2
              id="zareoon-exclusive-services-title"
              className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-[2rem]"
            >
              {content.title}
            </h2>
            <p className="max-w-3xl text-sm font-medium leading-7 text-emerald-50/95 sm:text-base sm:leading-8">
              {content.subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {content.items.map((item, index) => (
            <article
              key={item.id}
              className="group relative flex h-full flex-col rounded-2xl border border-white/80 bg-white/65 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200/80 hover:bg-white/90 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm transition-colors group-hover:border-emerald-200 group-hover:from-emerald-100/80">
                  <ServiceIcon name={item.icon} />
                </div>
                <span className="text-[10px] font-bold text-emerald-700/50 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mb-2 text-sm font-bold leading-6 text-slate-900 sm:text-[15px]">{item.title}</h3>
              <p className="mb-3 flex-1 text-xs leading-6 text-slate-600 sm:text-[13px]">{item.description}</p>
              <Link
                href={`/service-request/${item.id}`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-600/25 bg-emerald-600/90 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                {t("serviceRequestCta")}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
