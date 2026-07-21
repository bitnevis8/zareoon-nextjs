"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import SidebarSetupCta from "@/app/components/ui/SidebarSetupCta";
import { SidebarIcon } from "@/app/components/ui/SidebarIcons";

function SellerNavItem({ href, label, active, onClick, icon }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex h-9 items-center gap-2.5 rounded-md px-3 text-[13px] font-medium transition-colors ${
        active ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {icon ? (
        <span className={`shrink-0 ${active ? "text-emerald-700" : "text-slate-400"}`}>
          <SidebarIcon name={icon} />
        </span>
      ) : (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-emerald-600" : "bg-slate-300"}`} />
      )}
      <span className="truncate">{label}</span>
    </Link>
  );
}

/**
 * قبل از عضویت: فقط دکمه ایجاد فروشگاه.
 * بعد از عضویت: منوی فروشگاه (بدون برچسب «فروشنده»).
 */
export default function SidebarSellerSection({
  canSell,
  isActive,
  onLinkClick,
  primaryLinks = [],
  secondaryLinks = [],
  escrowHref,
  escrowLabel,
}) {
  const t = useTranslations("layout.sidebar");
  const membershipPath = "/dashboard/seller/join";

  if (!canSell) {
    return (
      <SidebarSetupCta
        href={membershipPath}
        label={t("sellerMembership")}
        active={isActive(membershipPath)}
        onClick={onLinkClick}
        tone="emerald"
      />
    );
  }

  return (
    <div className="space-y-0.5 px-2 pt-1">
      {primaryLinks.map((item) => (
        <SellerNavItem
          key={item.path}
          href={item.path}
          label={item.title}
          active={isActive(item.path)}
          onClick={onLinkClick}
          icon={item.icon}
        />
      ))}

      {secondaryLinks.length > 0 ? (
        <>
          <hr className="mx-1 my-2 border-slate-200" />
          {secondaryLinks.map((item) => (
            <SellerNavItem
              key={item.path}
              href={item.path}
              label={item.title}
              active={isActive(item.path)}
              onClick={onLinkClick}
              icon={item.icon}
            />
          ))}
        </>
      ) : null}

      <hr className="mx-1 my-2 border-slate-200" />
      <SellerNavItem
        href={escrowHref}
        label={escrowLabel}
        active={isActive(escrowHref)}
        onClick={onLinkClick}
        icon="escrow"
      />
    </div>
  );
}
