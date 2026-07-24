"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import SidebarSetupCta from "@/app/components/ui/SidebarSetupCta";
import { SidebarIcon } from "@/app/components/ui/SidebarIcons";

function ServicesNavItem({ href, label, active, onClick, icon, compact = false }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={label}
      className={`flex h-9 items-center rounded-md text-[13px] font-medium transition-colors ${
        compact ? "justify-center px-1.5" : "gap-2.5 px-3"
      } ${active ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
    >
      {icon ? (
        <span className={`shrink-0 ${active ? "text-emerald-700" : "text-slate-400"}`}>
          <SidebarIcon name={icon} />
        </span>
      ) : (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-emerald-600" : "bg-slate-300"}`} />
      )}
      {!compact ? <span className="truncate">{label}</span> : null}
    </Link>
  );
}

/**
 * قبل از عضویت: فقط دکمه ثبت‌نام.
 * بعد از عضویت: منوی خدمات؛ حساب امانی زارعون پایین‌ترین لینک کاربر.
 */
export default function SidebarServicesSection({
  hasProvider,
  isActive,
  onLinkClick,
  escrowHref,
  escrowLabel,
  compact = false,
}) {
  const t = useTranslations("layout.sidebar");
  const membershipPath = "/trade-services/register";

  if (!hasProvider) {
    return (
      <SidebarSetupCta
        href={membershipPath}
        label={t("providerMembership")}
        active={isActive(membershipPath)}
        onClick={onLinkClick}
        tone="emerald"
        compact={compact}
      />
    );
  }

  return (
    <div className={`space-y-0.5 pt-1 ${compact ? "px-0" : "px-2"}`}>
      <ServicesNavItem
        href="/dashboard/service-provider-profile"
        label={t("servicePageSettings")}
        active={isActive("/dashboard/service-provider-profile")}
        onClick={onLinkClick}
        icon="store"
        compact={compact}
      />
      <ServicesNavItem
        href="/dashboard/supplier/orders?scope=own"
        label={t("customerOrders")}
        active={isActive("/dashboard/supplier/orders?scope=own")}
        onClick={onLinkClick}
        icon="orders"
        compact={compact}
      />
      {!compact ? <hr className="mx-1 my-2 border-slate-200" /> : <div className="my-1" />}
      <ServicesNavItem
        href="/dashboard/incoming-requests"
        label={t("incomingServiceRequests")}
        active={isActive("/dashboard/incoming-requests")}
        onClick={onLinkClick}
        icon="inbox"
        compact={compact}
      />
      {escrowHref && escrowLabel ? (
        <>
          {!compact ? <hr className="mx-1 my-2 border-slate-200" /> : <div className="my-1" />}
          <ServicesNavItem
            href={escrowHref}
            label={escrowLabel}
            active={isActive(escrowHref)}
            onClick={onLinkClick}
            icon="escrow"
            compact={compact}
          />
        </>
      ) : null}
    </div>
  );
}
