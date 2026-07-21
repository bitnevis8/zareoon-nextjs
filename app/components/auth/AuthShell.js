"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

/** پوسته مشترک فرم‌های احراز هویت — موبایل‌اول */
export default function AuthShell({ title, subtitle, children, footer }) {
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-[100dvh] items-start justify-center bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white px-4 pb-10 pt-6 sm:items-center sm:pt-4">
      <div className="w-full max-w-[26rem]">
        <div className="overflow-hidden rounded-[1.35rem] border border-emerald-100/80 bg-white shadow-[0_16px_48px_-20px_rgba(6,95,70,0.22)]">
          <div className="relative overflow-hidden border-b border-emerald-50 bg-gradient-to-l from-emerald-50/90 via-white to-white px-5 py-5 sm:px-6">
            <div
              className="pointer-events-none absolute -left-8 -top-10 h-28 w-28 rounded-full bg-emerald-200/30 blur-2xl"
              aria-hidden
            />
            <div className="relative flex items-center justify-between gap-3">
              <div className="min-w-0 text-right">
                <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-[1.35rem]">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1.5 text-[13px] leading-6 text-slate-500">{subtitle}</p>
                ) : null}
              </div>
              <Link href="/" className="shrink-0" aria-label={t("logoAlt")}>
                <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                  <Image
                    src="/images/logo.png"
                    alt=""
                    width={44}
                    height={44}
                    className="h-10 w-10 object-contain"
                  />
                </span>
              </Link>
            </div>
          </div>
          <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
          {footer ? (
            <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 sm:px-6">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AuthField({ label, hint, children, error }) {
  return (
    <div className="space-y-1.5">
      {label ? <label className="block text-sm font-semibold text-slate-700">{label}</label> : null}
      {children}
      {hint ? <p className="text-[11px] leading-5 text-slate-500">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function Spinner({ className = "h-5 w-5" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function ArrowIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

/** دکمه اصلی ورود / ثبت‌نام */
export function AuthPrimaryButton({
  children,
  loading = false,
  loadingText,
  showArrow = true,
  className = "",
  type = "submit",
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        "group relative inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl",
        "bg-gradient-to-l from-emerald-700 via-emerald-600 to-teal-600",
        "px-5 text-[15px] font-bold tracking-tight text-white",
        "shadow-[0_10px_28px_-10px_rgba(5,150,105,0.65)]",
        "transition duration-200",
        "hover:from-emerald-800 hover:via-emerald-700 hover:to-teal-700 hover:shadow-[0_14px_32px_-10px_rgba(5,150,105,0.75)]",
        "active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
        className,
      ].join(" ")}
      {...props}
    >
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-40"
        aria-hidden
      />
      {loading ? (
        <>
          <Spinner />
          <span className="relative">{loadingText || children}</span>
        </>
      ) : (
        <>
          {showArrow ? (
            <ArrowIcon className="relative h-[1.15rem] w-[1.15rem] transition group-hover:-translate-x-0.5" />
          ) : null}
          <span className="relative">{children}</span>
        </>
      )}
    </button>
  );
}

export const authInputClass =
  "w-full min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600";

export const authPrimaryBtnClass =
  "inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl bg-gradient-to-l from-emerald-700 via-emerald-600 to-teal-600 px-5 text-[15px] font-bold text-white shadow-[0_10px_28px_-10px_rgba(5,150,105,0.65)] transition hover:from-emerald-800 hover:via-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60";

export const authGhostBtnClass =
  "inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-900";
