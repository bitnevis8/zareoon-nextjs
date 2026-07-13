"use client";

import Link from "next/link";

function ServicesNavItem({ href, label, active, onClick, disabled = false }) {
  if (disabled) {
    return (
      <span
        className="flex h-9 cursor-not-allowed items-center rounded-md px-3 text-[13px] font-medium text-slate-300"
        aria-disabled="true"
      >
        <span className="ml-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-200" />
        <span className="truncate">{label}</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex h-9 items-center rounded-md px-3 text-[13px] font-medium transition-colors ${
        active ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <span className={`ml-2 h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-emerald-600" : "bg-slate-300"}`} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function SidebarServicesSection({
  hasProvider,
  loading,
  isActive,
  onLinkClick,
}) {
  const membershipPath = "/trade-services/register";

  return (
    <>
      <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        خدمات بازرگانی
      </p>
      <div className="space-y-0.5 px-2">
        {!hasProvider ? (
          <ServicesNavItem
            href={membershipPath}
            label="عضویت در خدمات‌دهندگان"
            active={isActive(membershipPath)}
            onClick={onLinkClick}
          />
        ) : null}

        <ServicesNavItem
          href="/dashboard/service-provider-profile"
          label="صفحه خدمات من"
          active={isActive("/dashboard/service-provider-profile")}
          onClick={onLinkClick}
          disabled={!hasProvider || loading}
        />
        <ServicesNavItem
          href="/dashboard/supplier/orders?scope=own"
          label="سفارشات مشتری"
          active={isActive("/dashboard/supplier/orders?scope=own")}
          onClick={onLinkClick}
          disabled={!hasProvider || loading}
        />

        <hr className="mx-1 my-2 border-slate-200" />

        <ServicesNavItem
          href="/dashboard/incoming-requests"
          label="مشاهده نیازمندی‌ها به خدمات من"
          active={isActive("/dashboard/incoming-requests")}
          onClick={onLinkClick}
          disabled={!hasProvider || loading}
        />
      </div>
    </>
  );
}
