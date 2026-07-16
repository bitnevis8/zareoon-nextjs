"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { dash } from "./dashboardTheme";

export default function BuyerDashboardHome({ user }) {
  const t = useTranslations("dashboard");

  const cards = [
    {
      href: "/catalog/browse",
      title: t("buyerHome.browseProducts.title"),
      desc: t("buyerHome.browseProducts.desc"),
      hover: "hover:border-sky-200 hover:bg-sky-50/30",
    },
    {
      href: "/cart",
      title: t("buyerHome.cart.title"),
      desc: t("buyerHome.cart.desc"),
      hover: "hover:border-sky-200 hover:bg-sky-50/30",
    },
    {
      href: "/dashboard/messages",
      title: t("buyerHome.messages.title"),
      desc: t("buyerHome.messages.desc"),
      hover: "hover:border-sky-200 hover:bg-sky-50/30",
    },
    {
      href: "/trade-services",
      title: t("buyerHome.tradeServices.title"),
      desc: t("buyerHome.tradeServices.desc"),
      hover: "hover:border-emerald-200 hover:bg-emerald-50/30",
    },
  ];

  return (
    <div className={dash.page}>
      <header>
        <h1 className={dash.pageTitle}>{t("buyerHome.title")}</h1>
        <p className={dash.pageSubtitle}>{t("buyerHome.subtitle", { name: user?.firstName || "" })}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`${dash.card} ${dash.cardBody} transition ${card.hover}`}
          >
            <p className="text-sm font-bold text-slate-900">{card.title}</p>
            <p className="mt-1 text-xs leading-6 text-slate-600">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
