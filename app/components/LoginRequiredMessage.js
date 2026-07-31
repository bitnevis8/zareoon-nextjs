"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

function CartGlyph({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function UserGlyph({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

/**
 * وقتی کاربر لاگین نیست و روی اکشن محافظت‌شده (مثل سبد) می‌زند —
 * شیت پایین در موبایل / دیالوگ وسط در دسکتاپ.
 */
export default function LoginRequiredMessage({
  children,
  className = "",
  returnUrl = "/cart",
  intent = "cart",
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t, isRTL } = useLanguage();
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const loginHref = `/auth/login?returnUrl=${encodeURIComponent(returnUrl || "/")}`;
  const title =
    intent === "cart"
      ? t("cart") || "سبد خرید"
      : t("pleaseLoginFirst") || "ابتدا وارد شوید";
  const body =
    intent === "cart"
      ? t("loginRequiredCartBody") ||
        "برای مشاهده سبد خرید و ادامه سفارش، ابتدا وارد حساب کاربری شوید."
      : t("pleaseLoginFirst") || "ابتدا وارد شوید";

  const panel = open && mounted
    ? createPortal(
        <div className="fixed inset-0 z-[10060]" dir={isRTL ? "rtl" : "ltr"} role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            aria-label={t("close") || "بستن"}
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={[
              "absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col overflow-hidden",
              "rounded-t-2xl border border-slate-200 bg-white shadow-2xl",
              "pb-[max(1rem,env(safe-area-inset-bottom))]",
              "sm:bottom-auto sm:top-1/2 sm:max-w-sm sm:-translate-y-1/2 sm:rounded-2xl sm:pb-0",
            ].join(" ")}
          >
            <div className="flex justify-center pt-3 sm:hidden" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 pb-3 pt-3 sm:px-5 sm:pt-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                  {intent === "cart" ? <CartGlyph /> : <UserGlyph />}
                </span>
                <div className="min-w-0">
                  <h2 id={titleId} className="text-base font-bold text-slate-900">
                    {title}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {t("pleaseLoginFirst") || "ابتدا وارد شوید"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                {t("close") || "بستن"}
                <span className="text-base leading-none" aria-hidden>
                  ×
                </span>
              </button>
            </div>

            <div className="space-y-4 px-4 py-4 sm:px-5">
              <p className="text-sm leading-6 text-slate-600">{body}</p>

              <div className="flex flex-col gap-2">
                <Link
                  href={loginHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  {t("loginRegister") || "ورود / ثبت نام"}
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  {t("loginRequiredContinueGuest") || "فعلاً نه"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div
        className={`relative inline-flex ${className}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {children}
      </div>
      {panel}
    </>
  );
}
