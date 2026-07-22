"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import AuthRequiredButton from "@/app/components/ui/AuthRequiredButton";
import { useAuth } from "@/app/context/AuthContext";
import { canActAsSeller } from "@/app/utils/dashboardPersona";
import { API_ENDPOINTS } from "@/app/config/api";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { providerPublicPath } from "@/app/utils/providerPublicPath";

const SAMPLE_SLUG = "your-page";

function SoftMeshPattern({ patternId }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]" aria-hidden>
      <defs>
        <pattern id={patternId} width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M0 18h36M18 0v36" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.7" />
          <circle cx="18" cy="18" r="1.4" fill="#6ee7b7" fillOpacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function PageCard({ href, name, subtitle, avatar, badges = [], accent }) {
  const initial = (name?.[0] || "?").toUpperCase();
  const img = resolveMediaUrl(avatar);
  const isService = accent === "teal";
  const slug = href.replace(/^\//, "");
  const isLogoAvatar = typeof avatar === "string" && avatar.includes("logo.png");

  return (
    <Link
      href={href}
      className={`group relative flex w-[9.75rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_10px_28px_-16px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-16px_rgba(15,23,42,0.5)] sm:w-[12.5rem] ${
        isService
          ? "border-teal-100/90 hover:border-teal-300"
          : "border-emerald-100/90 hover:border-emerald-300"
      }`}
    >
      <div
        className={`relative h-[4.25rem] overflow-hidden sm:h-[5.25rem] ${
          isService
            ? "bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800"
            : "bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.18), transparent 40%)",
          }}
          aria-hidden
        />
        <div className="absolute start-2 top-2 flex max-w-[calc(100%-2.75rem)] flex-wrap gap-1">
          {badges.map((label) => (
            <span
              key={label}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-sm backdrop-blur-sm sm:text-[10px] ${
                isService ? "bg-teal-950/40 ring-1 ring-white/25" : "bg-emerald-950/40 ring-1 ring-white/25"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
        <span className="absolute end-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white opacity-0 ring-1 ring-white/20 transition group-hover:opacity-100">
          <svg className="h-3.5 w-3.5 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

      <div className="relative -mt-7 flex flex-col items-center px-3 pb-3 pt-0 text-center sm:-mt-8 sm:px-3.5 sm:pb-3.5">
        <div
          className={`relative h-[3.25rem] w-[3.25rem] overflow-hidden rounded-2xl border-[3px] border-white bg-white shadow-md sm:h-16 sm:w-16 ${
            isService ? "ring-2 ring-teal-100" : "ring-2 ring-emerald-100"
          }`}
        >
          {img ? (
            <Image
              src={img}
              alt=""
              fill
              unoptimized
              className={isLogoAvatar ? "object-contain p-1.5" : "object-cover"}
              sizes="64px"
            />
          ) : (
            <span
              className={`flex h-full w-full items-center justify-center text-base font-bold text-white sm:text-lg ${
                isService
                  ? "bg-gradient-to-br from-teal-500 to-teal-700"
                  : "bg-gradient-to-br from-emerald-500 to-emerald-700"
              }`}
            >
              {initial}
            </span>
          )}
        </div>

        <p className="mt-2.5 line-clamp-2 min-h-[2.25rem] text-xs font-semibold leading-snug tracking-tight text-slate-900 sm:mt-3 sm:min-h-[2.5rem] sm:text-sm">
          {name}
        </p>

        {subtitle ? (
          <p className="mt-1 line-clamp-2 min-h-[2rem] text-[10px] leading-4 text-slate-500 sm:text-xs sm:leading-5">
            {subtitle}
          </p>
        ) : (
          <p className="mt-1 min-h-[2rem]" aria-hidden />
        )}

        <p
          className={`mt-2 inline-flex max-w-full items-center gap-0.5 truncate rounded-full px-2 py-1 font-mono text-[9px] font-semibold sm:text-[10px] ${
            isService
              ? "bg-teal-50 text-teal-800 ring-1 ring-teal-100"
              : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
          }`}
          dir="ltr"
        >
          <span className="opacity-60">zareoon.ir/</span>
          <span className="truncate">{slug}</span>
        </p>
      </div>
    </Link>
  );
}

function CardsRail({ items, emptyLabel, type, t }) {
  if (!items?.length) {
    return (
      <p className="rounded-xl border border-dashed border-white/20 bg-white/5 px-3 py-5 text-center text-[11px] text-emerald-100/75 sm:px-4 sm:py-6 sm:text-xs">
        {emptyLabel}
      </p>
    );
  }

  const shopLabel = t("buyerSellerPortalShopBadge");
  const serviceLabel = t("buyerSellerPortalServiceBadge");

  return (
    <div className="-mx-0.5 flex gap-2.5 overflow-x-auto px-0.5 pb-1.5 pt-1 [scrollbar-width:thin] snap-x snap-mandatory sm:gap-3.5 sm:pb-2">
      {items.map((item) => {
        const badges = [];
        if (type === "shop" || item.hasShop) badges.push(shopLabel);
        if (type === "service" || item.hasServices) badges.push(serviceLabel);

        return (
          <PageCard
            key={`${type}-${item.id || item.profileSlug}`}
            href={item.href}
            name={item.name}
            subtitle={item.subtitle}
            avatar={item.avatar}
            badges={[...new Set(badges)]}
            accent={type === "shop" ? "emerald" : "teal"}
          />
        );
      })}
    </div>
  );
}

export default function BuyerSellerPortal({ className = "" }) {
  const { t, isRTL } = useLanguage();
  const auth = useAuth();
  const patternId = useId().replace(/:/g, "");
  const user = auth?.user;
  const seller = canActAsSeller(user);

  const [tab, setTab] = useState("shops");
  const [shops, setShops] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      try {
        const [shopsRes, svcRes] = await Promise.all([
          fetch(`${API_ENDPOINTS.tamin.recentShops}?limit=10`, { cache: "no-store" }),
          fetch(`${API_ENDPOINTS.tradeServiceProviders.getPublic}?limit=10`, { cache: "no-store" }),
        ]);
        const [shopsJson, svcJson] = await Promise.all([shopsRes.json(), svcRes.json()]);
        if (cancelled) return;

        const shopRows = Array.isArray(shopsJson?.data) ? shopsJson.data : [];
        const svcRows = Array.isArray(svcJson?.data) ? svcJson.data.slice(0, 10) : [];

        const resolveAvatar = (avatar, slug) => {
          if (avatar) return avatar;
          if (String(slug || "").toLowerCase() === "zareoon") return "/images/logo.png";
          return null;
        };

        setShops(
          shopRows.map((s) => ({
            id: s.id,
            profileSlug: s.profileSlug,
            href: s.profileUrl || `/${s.profileSlug}`,
            name: s.displayName || s.profileSlug,
            subtitle: s.headline || "",
            avatar: resolveAvatar(s.avatar, s.profileSlug),
            hasShop: true,
            hasServices: !!s.hasServices,
          }))
        );

        setServices(
          svcRows
            .filter((p) => p.profileSlug)
            .map((p) => ({
              id: p.id,
              profileSlug: p.profileSlug,
              href: providerPublicPath(p.profileSlug) || `/${p.profileSlug}`,
              name: p.displayName || p.companyName || p.profileSlug,
              subtitle: p.routes || p.selectedServices?.[0] || "",
              avatar: resolveAvatar(p.logoUrl || null, p.profileSlug),
              hasShop: !!p.hasShop,
              hasServices: true,
            }))
        );
      } catch {
        if (!cancelled) {
          setShops([]);
          setServices([]);
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sellerHref = seller
    ? "/dashboard/supplier/inventory/create?scope=own"
    : "/dashboard/seller/join";

  const sellerCtaClass =
    "inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-center text-sm font-bold leading-snug text-emerald-900 shadow-sm transition hover:bg-emerald-50 sm:min-h-11 sm:w-auto sm:min-w-[14rem] sm:rounded-lg sm:px-5";

  const listTitle = useMemo(
    () => (tab === "shops" ? t("buyerSellerPortalRecentShops") : t("buyerSellerPortalRecentServices")),
    [tab, t]
  );

  return (
    <section
      className={`relative w-full ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby="buyer-seller-portal-title"
    >
      {/* موبایل: داخل page-shell · دسکتاپ: full-bleed */}
      <div className="page-shell lg:px-0">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-900/20 bg-emerald-950 text-white shadow-[0_16px_48px_-28px_rgba(6,78,59,0.45)] sm:rounded-[1.75rem] lg:rounded-none lg:border-x-0 lg:border-y lg:border-emerald-900/15 lg:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900" />
          <SoftMeshPattern patternId={`${patternId}-mesh`} />
          <div
            className="pointer-events-none absolute -start-10 -top-12 h-36 w-36 rounded-full bg-emerald-400/15 blur-3xl sm:-start-16 sm:-top-16 sm:h-48 sm:w-48"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-14 -end-8 h-40 w-40 rounded-full bg-teal-300/10 blur-3xl sm:-bottom-20 sm:-end-10 sm:h-56 sm:w-56"
            aria-hidden
          />

          <div className="relative mx-auto w-full max-w-[90rem] px-3.5 py-4 sm:px-6 sm:py-7 lg:px-10 lg:py-8">
            <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <div className="min-w-0 max-w-2xl">
                <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold text-emerald-50 sm:px-2.5 sm:text-xs">
                  {t("buyerSellerPortalBadge")}
                </p>
                <h2
                  id="buyer-seller-portal-title"
                  className="mt-1.5 text-balance text-base font-bold tracking-tight text-white sm:mt-2 sm:text-lg"
                >
                  {t("buyerSellerPortalSectionTitle")}
                </h2>
                <p className="mt-1 line-clamp-3 text-xs leading-6 text-emerald-50/90 sm:mt-1.5 sm:line-clamp-none sm:text-sm sm:leading-7">
                  {t("buyerSellerPortalSectionDesc")}
                </p>
                <p
                  className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-white/15 bg-black/20 px-2 py-1.5 font-mono text-[10px] text-emerald-50 sm:gap-2 sm:px-2.5 sm:text-xs"
                  dir="ltr"
                >
                  <span className="text-emerald-200/90">zareoon.ir</span>
                  <span className="text-white/50">/</span>
                  <span className="font-semibold text-white">{SAMPLE_SLUG}</span>
                </p>
              </div>

              <div className="flex w-full shrink-0 lg:w-auto">
                {seller ? (
                  <Link href={sellerHref} className={sellerCtaClass}>
                    {t("buyerSellerPortalSellerCta")}
                  </Link>
                ) : (
                  <AuthRequiredButton href={sellerHref} className={sellerCtaClass}>
                    {t("buyerSellerPortalSellerCta")}
                  </AuthRequiredButton>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/15 bg-black/20 p-2.5 backdrop-blur-sm sm:mt-6 sm:rounded-2xl sm:p-4">
              <div className="mb-2.5 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{listTitle}</p>
                  {!loadingList ? (
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-100">
                      {(tab === "shops" ? shops.length : services.length).toLocaleString("fa-IR")}
                    </span>
                  ) : null}
                </div>
                <div className="inline-flex w-full rounded-lg border border-white/15 bg-white/5 p-0.5 sm:w-auto" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "shops"}
                    onClick={() => setTab("shops")}
                    className={`min-h-8 flex-1 rounded-md px-3 py-1.5 text-[11px] font-bold transition sm:flex-none sm:text-xs ${
                      tab === "shops" ? "bg-white text-emerald-900" : "text-emerald-100/80 hover:text-white"
                    }`}
                  >
                    {t("buyerSellerPortalTabShops")}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "services"}
                    onClick={() => setTab("services")}
                    className={`min-h-8 flex-1 rounded-md px-3 py-1.5 text-[11px] font-bold transition sm:flex-none sm:text-xs ${
                      tab === "services" ? "bg-white text-teal-900" : "text-emerald-100/80 hover:text-white"
                    }`}
                  >
                    {t("buyerSellerPortalTabServices")}
                  </button>
                </div>
              </div>

              {loadingList ? (
                <div className="flex gap-2.5 overflow-hidden sm:gap-3.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[11.5rem] w-[9.75rem] shrink-0 animate-pulse rounded-2xl bg-white/10 sm:h-[13.5rem] sm:w-[12.5rem]"
                    />
                  ))}
                </div>
              ) : tab === "shops" ? (
                <CardsRail type="shop" items={shops} t={t} emptyLabel={t("buyerSellerPortalEmptyShops")} />
              ) : (
                <CardsRail type="service" items={services} t={t} emptyLabel={t("buyerSellerPortalEmptyServices")} />
              )}
            </div>

            <p className="mt-2.5 text-center text-[10px] leading-5 text-emerald-100/65 sm:mt-3 sm:text-[11px] lg:text-start">
              {t("buyerSellerPortalHint")}{" "}
              <Link href="/pricing" className="font-semibold text-white underline-offset-2 hover:underline">
                {t("buyerSellerPortalPricingLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
