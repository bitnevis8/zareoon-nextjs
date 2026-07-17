"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

function SellerNavItem({ href, label, active, onClick, disabled = false }) {
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

/**
 * مثل خدمات‌دهندگان: تا عضویت فروشنده فعال نشود، فقط لینک عضویت دیده می‌شود.
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
  const tNav = useTranslations("nav");
  const membershipPath = "/dashboard/seller/join";

  return (
    <>
      <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {tNav("sections.seller")}
      </p>
      <div className="space-y-0.5 px-2">
        {!canSell ? (
          <SellerNavItem
            href={membershipPath}
            label={t("sellerMembership")}
            active={isActive(membershipPath)}
            onClick={onLinkClick}
          />
        ) : null}

        {primaryLinks.map((item) => (
          <SellerNavItem
            key={item.path}
            href={item.path}
            label={item.title}
            active={isActive(item.path)}
            onClick={onLinkClick}
            disabled={!canSell}
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
                disabled={!canSell}
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
        />
      </div>
    </>
  );
}
