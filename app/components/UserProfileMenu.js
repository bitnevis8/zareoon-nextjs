"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { useWorkspace } from "../context/WorkspaceContext";

function MenuIcon({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-800",
    violet: "bg-violet-50 text-violet-700",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg ${tones[tone] || tones.slate}`}
      aria-hidden
    >
      {children}
    </span>
  );
}

function SvgIcon({ d, className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function MenuRow({
  href,
  onClick,
  icon,
  label,
  hint,
  tone = "slate",
  danger = false,
  asButton = false,
  isRTL = true,
}) {
  const className = `flex w-full flex-row items-center gap-2.5 px-3 py-2.5 text-[13px] leading-5 transition-colors ${
    danger
      ? "text-rose-600 hover:bg-rose-50"
      : tone === "primary"
        ? "font-semibold text-emerald-900 hover:bg-emerald-50"
        : "text-slate-700 hover:bg-slate-50"
  }`;
  const dir = isRTL ? "rtl" : "ltr";

  const body = (
    <>
      {icon}
      <span className="min-w-0 flex-1 text-start">
        <span className="block truncate">{label}</span>
        {hint ? <span className="mt-0.5 block truncate text-[11px] font-normal text-slate-400">{hint}</span> : null}
      </span>
    </>
  );

  if (asButton) {
    return (
      <button type="button" role="menuitem" onClick={onClick} className={className} dir={dir}>
        {body}
      </button>
    );
  }

  return (
    <Link href={href} role="menuitem" onClick={onClick} className={className} dir={dir}>
      {body}
    </Link>
  );
}

function MenuDivider() {
  return <div className="border-t border-slate-100" role="separator" />;
}

export default function UserProfileMenu({ onClose, onLogout }) {
  const { t, isRTL } = useLanguage();
  const { workspace } = useWorkspace();

  const workspaceName = workspace?.displayName || workspace?.name || null;
  const hasBusiness = Boolean(workspace);

  return (
    <div className="py-1">
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
        label={t("accountMenuDashboard") || t("dashboard") || "داشبورد"}
      />

      <MenuRow
        href="/dashboard/workspace"
        onClick={onClose}
        isRTL={isRTL}
        icon={
          <MenuIcon tone="violet">
            <SvgIcon d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </MenuIcon>
        }
        label={t("accountMenuWorkspace") || "مدیریت کسب‌وکار"}
        hint={
          workspaceName ||
          (hasBusiness
            ? t("accountMenuWorkspaceHint")
            : t("accountMenuWorkspaceCreateHint") || "برای فروشگاه و خدمات، اول کسب‌وکار بسازید")
        }
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
        label={t("accountMenuEscrow") || "حساب امانی زارعون"}
        hint={t("accountMenuEscrowHint") || "تضمین معاملات و توافق‌ها"}
      />

      <MenuDivider />

      <MenuRow
        href="/cart"
        onClick={onClose}
        isRTL={isRTL}
        icon={
          <MenuIcon tone="amber">
            <SvgIcon d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </MenuIcon>
        }
        label={t("accountMenuCart") || t("myCart") || "سبد خرید"}
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
        label={t("accountMenuOrders") || t("myOrders") || "سفارشات من"}
      />

      <MenuDivider />

      <MenuRow
        href="/dashboard/account"
        onClick={onClose}
        isRTL={isRTL}
        icon={
          <MenuIcon tone="sky">
            <SvgIcon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </MenuIcon>
        }
        label={t("accountMenuProfile") || "ویرایش نمایه شخصی"}
      />

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
        label={t("accountMenuLogout") || "خروج از حساب کاربری"}
      />
    </div>
  );
}
