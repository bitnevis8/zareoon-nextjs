"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../context/LanguageContext";
import { useExistingPublicSlug } from "../hooks/useExistingPublicSlug";
import { resolveMediaUrl } from "../utils/mediaUrl";

function MenuIcon({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-800",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md ${tones[tone] || tones.slate}`}
      aria-hidden
    >
      {children}
    </span>
  );
}

function SvgIcon({ d, className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function DedicatedPageIcon({ src, title }) {
  const url = resolveMediaUrl(src);
  const initial = (title?.[0] || "ص").toUpperCase();

  if (url) {
    return (
      <span className="relative inline-flex h-6 w-6 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200">
        <Image src={url} alt="" width={24} height={24} className="h-full w-full object-cover" unoptimized />
      </span>
    );
  }

  return (
    <MenuIcon tone="emerald">
      <span className="text-[10px] font-black">{initial}</span>
    </MenuIcon>
  );
}

function MenuRow({ href, onClick, icon, label, tone = "slate", danger = false, asButton = false, isRTL = true }) {
  const className = `flex w-full flex-row items-center gap-2 px-3 py-1.5 text-[13px] leading-5 transition-colors ${
    danger ? "text-rose-600 hover:bg-rose-50" : tone === "primary" ? "font-semibold text-emerald-800 hover:bg-emerald-50" : "text-slate-700 hover:bg-slate-50"
  }`;
  const dir = isRTL ? "rtl" : "ltr";

  const body = (
    <>
      {icon}
      <span className="min-w-0 flex-1 text-start">{label}</span>
    </>
  );

  if (asButton) {
    return (
      <button type="button" onClick={onClick} className={className} dir={dir}>
        {body}
      </button>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className} dir={dir}>
      {body}
    </Link>
  );
}

function MenuDivider() {
  return <div className="my-0.5 border-t border-slate-100" role="separator" />;
}

export default function UserProfileMenu({ onClose, onLogout }) {
  const { t, isRTL } = useLanguage();
  const { publicPath, hasSlug, pageTitle, pageImage } = useExistingPublicSlug();
  const dedicatedHref = hasSlug && publicPath ? publicPath : "/dashboard/dedicated-page";
  const dedicatedLabel = t("myCommercialPages") || "صفحات تجاری من";

  return (
    <div className="py-0.5">
      <MenuRow
        href="/dashboard"
        onClick={onClose}
        isRTL={isRTL}
        tone="primary"
        icon={
          <MenuIcon tone="emerald">
            <SvgIcon d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </MenuIcon>
        }
        label={t("zareoonMe")}
      />

      <MenuRow
        href="/dashboard/account"
        onClick={onClose}
        isRTL={isRTL}
        icon={
          <MenuIcon tone="sky">
            <SvgIcon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </MenuIcon>
        }
        label={t("editProfile")}
      />

      <MenuRow
        href={dedicatedHref}
        onClick={onClose}
        isRTL={isRTL}
        icon={<DedicatedPageIcon src={hasSlug ? pageImage : null} title={pageTitle || dedicatedLabel} />}
        label={dedicatedLabel}
      />

      <MenuDivider />

      <MenuRow
        href="/cart"
        onClick={onClose}
        isRTL={isRTL}
        icon={
          <MenuIcon>
            <SvgIcon d="M3 3h2l.4 2M7 13h10l3-7H6.4M7 13L5.4 5M7 13l-2.3 2.3c-.4.4-.1 1.1.4 1.1H19M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
          </MenuIcon>
        }
        label={t("myCart") || "سبد خرید من"}
      />

      <MenuRow
        href="/dashboard/my-orders"
        onClick={onClose}
        isRTL={isRTL}
        icon={
          <MenuIcon>
            <SvgIcon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </MenuIcon>
        }
        label={t("myOrders") || "سفارشات من"}
      />

      <MenuRow
        href="/dashboard/escrow"
        onClick={onClose}
        isRTL={isRTL}
        icon={
          <MenuIcon tone="amber">
            <SvgIcon d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </MenuIcon>
        }
        label={t("myPayments") || "پرداختی‌های من"}
      />

      <MenuDivider />

      <MenuRow
        asButton
        onClick={onLogout}
        isRTL={isRTL}
        danger
        icon={
          <MenuIcon tone="rose">
            <SvgIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </MenuIcon>
        }
        label={t("logout")}
      />
    </div>
  );
}
