"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { useDashboardPersona } from "@/app/context/DashboardPersonaContext";
import { DASHBOARD_PERSONAS, canActAsSeller } from "@/app/utils/dashboardPersona";
import { getRoleLabel } from "@/app/utils/roles";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { formatLocalizedDigits } from "@/app/utils/persianNumberUtils";
import { useLanguage } from "@/app/context/LanguageContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useMyTradeServiceProvider } from "@/app/hooks/useMyTradeServiceProvider";
import { useExistingPublicSlug } from "@/app/hooks/useExistingPublicSlug";
import { providerPublicDisplayUrl } from "@/app/utils/providerPublicPath";
import { SidebarIcon } from "@/app/components/ui/SidebarIcons";
import { getLocalizedText } from "@/app/utils/localize";

const BUYER_ACTIONS = [
  { id: "submit", href: "/dashboard/submit-request", icon: "request", labelKey: "actions.submitRequest" },
  { id: "requests", href: "/dashboard/applicant-requests", icon: "list", labelKey: "actions.myRequests" },
  { id: "orders", href: "/dashboard/my-orders", icon: "orders", labelKey: "actions.myOrders" },
  { id: "cart", href: "/cart", icon: "cart", labelKey: "actions.cart" },
  { id: "escrow", href: "/dashboard/escrow", icon: "escrow", labelKey: "actions.escrow" },
];

const SELLER_ACTIONS = [
  { id: "products", href: "/dashboard/supplier/inventory?scope=own", icon: "products", labelKey: "actions.myProducts" },
  { id: "newLot", href: "/dashboard/supplier/inventory/create?scope=own", icon: "plus", labelKey: "actions.newInventory" },
  { id: "orders", href: "/dashboard/supplier/orders?scope=own", icon: "orders", labelKey: "actions.customerOrders" },
  { id: "settings", href: "/dashboard/supplier-profile", icon: "settings", labelKey: "actions.shopSettings" },
  { id: "incoming", href: "/dashboard/incoming-requests", icon: "inbox", labelKey: "actions.incoming" },
  { id: "escrow", href: "/dashboard/escrow", icon: "escrow", labelKey: "actions.escrow" },
];

const PROVIDER_ACTIONS = [
  { id: "settings", href: "/dashboard/service-provider-profile", icon: "settings", labelKey: "actions.serviceSettings" },
  { id: "orders", href: "/dashboard/supplier/orders?scope=own", icon: "orders", labelKey: "actions.customerOrders" },
  { id: "incoming", href: "/dashboard/incoming-requests", icon: "inbox", labelKey: "actions.incomingServices" },
];

function StatCell({ label, value }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1">
      <span className="text-base font-extrabold tabular-nums text-slate-900">{value}</span>
      <span className="mt-0.5 text-[11px] font-medium text-slate-500">{label}</span>
    </div>
  );
}

function ActionIconGrid({ items, t }) {
  return (
    <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-1.5 py-3 text-center shadow-sm transition active:scale-[0.98] hover:border-emerald-200 hover:bg-emerald-50/40"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
            <SidebarIcon name={item.icon} className="h-5 w-5" />
          </span>
          <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-slate-700">
            {t(item.labelKey)}
          </span>
        </Link>
      ))}
    </div>
  );
}

function HorizontalMenu({ items, activeId, onSelect, t }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-bold transition ${
              active
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"
            }`}
          >
            <SidebarIcon name={item.icon} className="h-3.5 w-3.5" />
            {t(item.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

function SetupCard({ href, title, hint }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 px-4 py-5 transition hover:bg-emerald-50"
    >
      <span className="text-sm font-extrabold text-emerald-950">{title}</span>
      {hint ? <span className="text-xs leading-6 text-emerald-900/80">{hint}</span> : null}
    </Link>
  );
}

function SellerProductsStrip({ lots, language, t, loading }) {
  if (loading) {
    return (
      <div className="mt-3 grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-slate-200/70" />
        ))}
      </div>
    );
  }

  if (!lots.length) {
    return (
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center">
        <p className="text-sm text-slate-600">{t("emptyProducts")}</p>
        <Link
          href="/dashboard/supplier/inventory/create?scope=own"
          className="mt-3 inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white"
        >
          {t("actions.newInventory")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {lots.slice(0, 9).map((lot) => {
        const product = lot.product || lot.Product || {};
        const name = getLocalizedText(product, language) || product.name || t("productFallback");
        const img = resolveMediaUrl(product.imageUrl || product.image || lot.imageUrl);
        return (
          <Link
            key={lot.id}
            href="/dashboard/supplier/inventory?scope=own"
            className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
          >
            {img ? (
              <Image src={img} alt="" fill unoptimized className="object-cover transition group-hover:scale-105" sizes="33vw" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-slate-400">
                <SidebarIcon name="products" className="h-7 w-7" />
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1.5 pt-6 text-[9px] font-semibold leading-tight text-white line-clamp-2">
              {name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default function MobileDashboardHome() {
  const { user } = useAuth();
  const { language, isRTL } = useLanguage();
  const t = useTranslations("dashboard.mobileProfile");
  const tShared = useTranslations("shared");
  const { setPersona, isApplicantView, isSellerView, isServicesView } = useDashboardPersona();
  const canSell = canActAsSeller(user);
  const { hasProvider, loading: providerLoading } = useMyTradeServiceProvider(true);
  const { slug, publicPath, hasSlug } = useExistingPublicSlug();
  const dedicatedDisplayUrl = hasSlug && slug ? providerPublicDisplayUrl(slug) : null;

  const [bioOpen, setBioOpen] = useState(false);
  const [stats, setStats] = useState({ products: 0, followers: 0, following: 0 });
  const [lots, setLots] = useState([]);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [sellerMenu, setSellerMenu] = useState("products");
  const [providerMenu, setProviderMenu] = useState("settings");

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.accountNav?.navTitle ||
    user?.username ||
    t("userFallback");

  const phone = user?.mobile || user?.phone || "";
  const roleLabels = useMemo(() => {
    const roles = user?.roles || [];
    const labels = roles.map((r) => getRoleLabel(r, tShared)).filter(Boolean);
    return [...new Set(labels)];
  }, [user?.roles, tShared]);

  const rolesLine = roleLabels.join(" | ");
  const rolesNeedMore = rolesLine.length > 42 || roleLabels.length > 3;

  const avatarUrl = resolveMediaUrl(user?.avatar);
  const initial = (displayName?.[0] || "؟").toUpperCase();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, lotsRes] = await Promise.all([
          authFetch(API_ENDPOINTS.tamin.socialStats, { cache: "no-store" }).catch(() => null),
          canSell
            ? authFetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" })
            : Promise.resolve(null),
        ]);

        let followers = 0;
        let following = 0;
        let products = 0;

        if (statsRes?.ok) {
          const statsJson = await statsRes.json();
          const data = statsJson?.data || {};
          followers = Number(data.followerCount) || 0;
          following = Number(data.followingCount) || 0;
          products = Number(data.productCount) || 0;
        }

        if (lotsRes?.ok) {
          const lotsJson = await lotsRes.json();
          const allLots = lotsJson?.data || [];
          const userId = user?.id ?? user?.userId;
          const mine = allLots.filter((l) => Number(l.farmerId) === Number(userId));
          if (!cancelled) {
            setLots(mine);
            if (mine.length) products = mine.length;
          }
        }

        if (!cancelled) setStats({ products, followers, following });
      } catch {
        if (!cancelled) setStats({ products: 0, followers: 0, following: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canSell, user?.id, user?.userId]);

  useEffect(() => {
    if (!isSellerView || !canSell) return;
    let cancelled = false;
    setLotsLoading(true);
    (async () => {
      try {
        const res = await authFetch(API_ENDPOINTS.supplier.inventoryLots.getAll, { cache: "no-store" });
        const json = await res.json();
        const allLots = json?.data || [];
        const userId = user?.id ?? user?.userId;
        const mine = allLots.filter((l) => Number(l.farmerId) === Number(userId));
        if (!cancelled) setLots(mine);
      } catch {
        if (!cancelled) setLots([]);
      } finally {
        if (!cancelled) setLotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSellerView, canSell, user?.id, user?.userId]);

  const fmt = (n) => formatLocalizedDigits(Number(n || 0).toLocaleString("en-US"), language);

  const tabs = [
    { id: DASHBOARD_PERSONAS.APPLICANT, label: t("tabs.buyer"), active: isApplicantView },
    { id: DASHBOARD_PERSONAS.SELLER, label: t("tabs.seller"), active: isSellerView },
    { id: DASHBOARD_PERSONAS.SERVICES, label: t("tabs.provider"), active: isServicesView },
  ];

  const rolesDisplay = bioOpen || !rolesNeedMore ? rolesLine : `${roleLabels.slice(0, 2).join(" | ")}${roleLabels.length > 2 ? " | …" : ""}`;

  return (
    <div className="md:hidden" dir={isRTL ? "rtl" : "ltr"}>
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/account"
            className="relative h-[4.75rem] w-[4.75rem] shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100"
            aria-label={t("editProfile")}
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill unoptimized className="object-cover" sizes="76px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-500">
                {initial}
              </span>
            )}
          </Link>
          <div className="flex min-w-0 flex-1 items-stretch justify-around">
            <StatCell label={t("stats.products")} value={fmt(stats.products)} />
            <StatCell label={t("stats.followers")} value={fmt(stats.followers)} />
            <StatCell label={t("stats.following")} value={fmt(stats.following)} />
          </div>
        </div>

        {dedicatedDisplayUrl && publicPath ? (
          <Link
            href={publicPath}
            className="mt-2.5 flex min-w-0 items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-2.5 py-1.5 text-emerald-800 transition hover:bg-emerald-50"
            dir="ltr"
          >
            <svg className="h-3.5 w-3.5 shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a.75.75 0 001.061 1.06l3-3z" />
              <path d="M11.603 7.963a.75.75 0 00-1.061-1.06l-3 3a4 4 0 105.656 5.656l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a2.5 2.5 0 11-3.536-3.536l3-3z" />
            </svg>
            <span className="min-w-0 truncate text-[11px] font-semibold tabular-nums tracking-tight">
              {dedicatedDisplayUrl}
            </span>
          </Link>
        ) : null}

        <div className="mt-3">
          <p className="text-sm font-extrabold text-slate-900">{displayName}</p>
          {phone ? (
            <p className="mt-1 text-[13px] tabular-nums text-slate-600" dir="ltr">
              {formatLocalizedDigits(phone, language)}
            </p>
          ) : null}
          {rolesLine ? (
            <div className="mt-1.5">
              <p className="text-[12px] font-medium leading-5 text-slate-500">{rolesDisplay}</p>
              {rolesNeedMore ? (
                <button
                  type="button"
                  onClick={() => setBioOpen((v) => !v)}
                  className="mt-0.5 text-[12px] font-bold text-slate-500"
                >
                  {bioOpen ? t("bioLess") : t("bioMore")}
                </button>
              ) : null}
            </div>
          ) : !phone ? (
            <p className="mt-1 text-[13px] text-slate-500">{t("bioEmpty")}</p>
          ) : null}
        </div>

        <Link
          href="/dashboard/account"
          className="mt-3.5 flex min-h-10 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-[13px] font-bold text-emerald-900 transition hover:bg-emerald-100"
        >
          {t("editProfile")}
        </Link>
      </section>

      <div
        className="mt-3 grid grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"
        role="tablist"
        aria-label={t("tabsAria")}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.active}
            onClick={() => setPersona(tab.id)}
            className={`rounded-xl px-2 py-2.5 text-[12px] font-bold transition ${
              tab.active ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 shadow-sm">
        {isApplicantView ? (
          <ActionIconGrid items={BUYER_ACTIONS} t={t} />
        ) : null}

        {isSellerView ? (
          canSell ? (
            <div>
              <HorizontalMenu
                items={SELLER_ACTIONS}
                activeId={sellerMenu}
                onSelect={setSellerMenu}
                t={t}
              />
              {sellerMenu === "products" ? (
                <SellerProductsStrip lots={lots} language={language} t={t} loading={lotsLoading} />
              ) : (
                <div className="mt-3">
                  <Link
                    href={SELLER_ACTIONS.find((a) => a.id === sellerMenu)?.href || "/dashboard"}
                    className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-900"
                  >
                    {t(SELLER_ACTIONS.find((a) => a.id === sellerMenu)?.labelKey || "actions.myProducts")}
                    <span aria-hidden>←</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <SetupCard href="/dashboard/seller/join" title={t("createShop")} hint={t("createShopHint")} />
          )
        ) : null}

        {isServicesView ? (
          providerLoading ? (
            <div className="h-24 animate-pulse rounded-xl bg-slate-200/70" />
          ) : hasProvider ? (
            <div>
              <HorizontalMenu
                items={PROVIDER_ACTIONS}
                activeId={providerMenu}
                onSelect={setProviderMenu}
                t={t}
              />
              <div className="mt-3">
                <Link
                  href={PROVIDER_ACTIONS.find((a) => a.id === providerMenu)?.href || "/dashboard"}
                  className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-900"
                >
                  {t(PROVIDER_ACTIONS.find((a) => a.id === providerMenu)?.labelKey || "actions.serviceSettings")}
                  <span aria-hidden>←</span>
                </Link>
              </div>
            </div>
          ) : (
            <SetupCard
              href="/trade-services/register"
              title={t("createServices")}
              hint={t("createServicesHint")}
            />
          )
        ) : null}
      </div>
    </div>
  );
}
