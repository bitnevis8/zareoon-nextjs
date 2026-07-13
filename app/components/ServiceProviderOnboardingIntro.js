"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

export default function ServiceProviderOnboardingIntro({
  onAccept,
  onDecline,
  declineHref,
  compact = false,
  showBrowseLink = true,
  showDeclineButton = false,
}) {
  const { t, isRTL } = useLanguage();

  const declineClassName =
    "inline-flex rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

  return (
    <div
      className={`rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-slate-50 shadow-sm ${
        compact ? "p-4 sm:p-5" : "p-5 sm:p-7"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700/90">
        {t("tradeServicesJoinBadge")}
      </p>
      <h2 className={`mt-2 font-black text-slate-900 ${compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}>
        {t("tradeProviderIntroQuestion")}
      </h2>
      <p className={`mt-2 leading-7 text-slate-600 ${compact ? "text-xs sm:text-sm" : "text-sm"}`}>
        {t("tradeProviderIntroDesc")}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="inline-flex rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
        >
          {t("tradeProviderIntroYes")}
        </button>
        {showDeclineButton ? (
          declineHref ? (
            <Link href={declineHref} className={declineClassName}>
              {t("tradeProviderIntroDecline")}
            </Link>
          ) : (
            <button type="button" onClick={onDecline} className={declineClassName}>
              {t("tradeProviderIntroDecline")}
            </button>
          )
        ) : null}
        {showBrowseLink ? (
          <Link href="/trade-services" className={declineClassName}>
            {t("tradeProviderIntroNo")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
