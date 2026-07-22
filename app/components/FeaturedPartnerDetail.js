"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import AuthRequiredButton from "@/app/components/ui/AuthRequiredButton";

/**
 * صفحه جزئیات سرویس ویژه (بسته‌بندی / آریا فولاد)
 */
export default function FeaturedPartnerDetail({
  tone = "emerald",
  logoSrc,
  brandKey,
  badgeKey,
  titleKey,
  descriptionKey,
  itemKeys = [],
  footerKey,
  primaryCta,
  secondaryCta,
}) {
  const { t, isRTL } = useLanguage();
  const isEmerald = tone === "emerald";

  const shell = isEmerald
    ? "from-emerald-50 via-white to-teal-50 border-emerald-200/80"
    : "from-amber-50 via-white to-orange-50 border-amber-200/80";
  const brandColor = isEmerald ? "text-emerald-900" : "text-amber-900";
  const badgeColor = isEmerald ? "text-emerald-800" : "text-amber-800";
  const chipBorder = isEmerald ? "border-emerald-100" : "border-amber-100";
  const chipDot = isEmerald ? "bg-emerald-500" : "bg-amber-500";
  const footerBg = isEmerald ? "bg-emerald-950 border-emerald-900/40" : "bg-[#1a2d4d] border-[#15233d]/40";
  const logoBorder = isEmerald ? "border-emerald-200/80" : "border-amber-200/80";
  const backHover = isEmerald ? "hover:bg-emerald-50 hover:text-emerald-900" : "hover:bg-amber-50 hover:text-amber-950";

  return (
    <main className="page-shell py-4 sm:py-6 lg:py-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-4">
        <Link
          href="/#trade-services"
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition ${backHover}`}
        >
          <svg className={`h-4 w-4 ${isRTL ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {t("back")}
        </Link>
      </div>

      <article className={`overflow-hidden rounded-2xl border bg-gradient-to-b shadow-[0_18px_50px_-24px_rgba(15,23,42,0.2)] sm:rounded-[1.75rem] ${shell}`}>
        <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6 sm:py-7 lg:px-8">
          <div className="min-w-0 flex-1 space-y-3">
            <p className={`text-xs font-semibold sm:text-sm ${badgeColor}`}>{t(badgeKey)}</p>
            <h1 className="text-xl font-extrabold leading-8 text-slate-900 sm:text-2xl sm:leading-9 lg:text-3xl">
              <span className={`block ${brandColor}`}>{t(brandKey)}</span>
              <span className="mt-1 block text-slate-900">{t(titleKey)}</span>
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">{t(descriptionKey)}</p>
          </div>
          <div
            className={`mx-auto flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-white p-2 shadow-md sm:mx-0 sm:h-28 sm:w-28 lg:h-32 lg:w-32 ${logoBorder}`}
          >
            <Image src={logoSrc} alt={t(brandKey)} width={128} height={128} className="h-full w-full object-contain" priority />
          </div>
        </div>

        <div className="border-t border-slate-100/80 px-4 py-5 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-sm font-bold text-slate-900 sm:text-base">{t("featuredServicesHeading")}</h2>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {itemKeys.map((key) => (
              <li
                key={key}
                className={`flex items-start gap-2.5 rounded-2xl border bg-white/90 px-3.5 py-3 text-sm leading-6 text-slate-800 shadow-sm ${chipBorder}`}
              >
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${chipDot}`} />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 lg:px-8 ${footerBg}`}>
          <p className="text-xs leading-6 text-white/90 sm:text-sm sm:leading-7">{t(footerKey)}</p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {secondaryCta ? (
              secondaryCta.external ? (
                <a
                  href={secondaryCta.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  {t(secondaryCta.labelKey)}
                </a>
              ) : (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  {t(secondaryCta.labelKey)}
                </Link>
              )
            ) : null}
            {primaryCta ? (
              primaryCta.authRequired ? (
                <AuthRequiredButton
                  href={primaryCta.href}
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold shadow-md transition ${
                    isEmerald
                      ? "bg-white text-emerald-900 hover:bg-emerald-50"
                      : "bg-white text-[#1a2d4d] hover:bg-amber-50"
                  }`}
                >
                  {t(primaryCta.labelKey)}
                </AuthRequiredButton>
              ) : primaryCta.external ? (
                <a
                  href={primaryCta.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold shadow-md transition ${
                    isEmerald
                      ? "bg-white text-emerald-900 hover:bg-emerald-50"
                      : "bg-white text-[#1a2d4d] hover:bg-amber-50"
                  }`}
                >
                  {t(primaryCta.labelKey)}
                </a>
              ) : (
                <Link
                  href={primaryCta.href}
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold shadow-md transition ${
                    isEmerald
                      ? "bg-white text-emerald-900 hover:bg-emerald-50"
                      : "bg-white text-[#1a2d4d] hover:bg-amber-50"
                  }`}
                >
                  {t(primaryCta.labelKey)}
                </Link>
              )
            ) : null}
          </div>
        </div>
      </article>
    </main>
  );
}
