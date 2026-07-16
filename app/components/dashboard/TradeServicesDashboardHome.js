"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { dash } from "./dashboardTheme";
import { useMyTradeServiceProvider } from "@/app/hooks/useMyTradeServiceProvider";
import ServiceProviderOnboardingIntro from "@/app/components/ServiceProviderOnboardingIntro";

export default function TradeServicesDashboardHome({ user }) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const { provider, hasProvider, loading } = useMyTradeServiceProvider(!!user);

  return (
    <div className={dash.page}>
      <header>
        <h1 className={dash.pageTitle}>{t("tradeServicesHome.title")}</h1>
        <p className={dash.pageSubtitle}>{t("tradeServicesHome.subtitle", { name: user?.firstName || "" })}</p>
      </header>

      {!loading && !hasProvider ? (
        <div className="mb-6">
          <ServiceProviderOnboardingIntro
            compact
            onAccept={() => router.push("/trade-services/register?start=1")}
          />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {!loading && hasProvider ? (
          <>
            <Link
              href="/dashboard/service-provider-profile"
              className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
            >
              <p className="text-sm font-bold text-slate-900">{t("tradeServicesHome.myServicesPage.title")}</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">
                {t("tradeServicesHome.myServicesPage.desc", { name: provider.displayName })}
              </p>
            </Link>
            {provider.status === "approved" ? (
              <Link
                href={`/trade-services/provider/${provider.id}`}
                className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
              >
                <p className="text-sm font-bold text-slate-900">{t("tradeServicesHome.publicProfile.title")}</p>
                <p className="mt-1 text-xs leading-6 text-slate-600">{t("tradeServicesHome.publicProfile.desc")}</p>
              </Link>
            ) : null}
            <Link
              href="/dashboard/supplier/orders?scope=own"
              className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
            >
              <p className="text-sm font-bold text-slate-900">{t("tradeServicesHome.customerOrders.title")}</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">{t("tradeServicesHome.customerOrders.desc")}</p>
            </Link>
            <Link
              href="/dashboard/incoming-requests"
              className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
            >
              <p className="text-sm font-bold text-slate-900">{t("tradeServicesHome.incomingRequests.title")}</p>
              <p className="mt-1 text-xs leading-6 text-slate-600">{t("tradeServicesHome.incomingRequests.desc")}</p>
            </Link>
          </>
        ) : null}

        <Link
          href="/trade-services"
          className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
        >
          <p className="text-sm font-bold text-slate-900">{t("tradeServicesHome.catalog.title")}</p>
          <p className="mt-1 text-xs leading-6 text-slate-600">{t("tradeServicesHome.catalog.desc")}</p>
        </Link>
        <Link
          href="/dashboard/messages"
          className={`${dash.card} ${dash.cardBody} transition hover:border-emerald-200 hover:bg-emerald-50/30`}
        >
          <p className="text-sm font-bold text-slate-900">{t("tradeServicesHome.messages.title")}</p>
          <p className="mt-1 text-xs leading-6 text-slate-600">{t("tradeServicesHome.messages.desc")}</p>
        </Link>
      </div>
    </div>
  );
}
