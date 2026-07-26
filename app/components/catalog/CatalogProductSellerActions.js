"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import OpenChatButton from "@/app/components/messaging/OpenChatButton";
import {
  getLotSupplier,
  getLotSupplierDisplayName,
  getLotSupplierPageImage,
  getLotSupplierProfileUrl,
} from "@/app/utils/catalogLotSupplier";
import { catalogText } from "./catalogTheme";

function StoreIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a2.25 2.25 0 00-.75 1.661v2.49"
      />
    </svg>
  );
}

function Avatar({ src, label }) {
  const initial = String(label || "ف").trim().charAt(0) || "ف";
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="h-11 w-11 rounded-full object-cover ring-1 ring-slate-200" />
    );
  }
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
      {initial}
    </span>
  );
}

/** نوار اقدام فروشنده روی صفحه محصول — صفحه فروشنده + گفتگو */
export default function CatalogProductSellerActions({ lot, className = "" }) {
  const t = useTranslations("catalog");
  if (!lot) return null;

  const supplierUser = getLotSupplier(lot);
  const name = getLotSupplierDisplayName(lot) || t("supplier");
  const profileUrl = getLotSupplierProfileUrl(lot);
  const imageSrc = getLotSupplierPageImage(lot);
  const sellerId = supplierUser?.id;

  if (!sellerId && !profileUrl) return null;

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
      aria-label={t("sellerSectionTitle")}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {profileUrl ? (
            <Link href={profileUrl} className="shrink-0" aria-label={t("viewSellerPage")}>
              <Avatar src={imageSrc} label={name} />
            </Link>
          ) : (
            <Avatar src={imageSrc} label={name} />
          )}
          <div className="min-w-0">
            <p className={`text-xs font-medium ${catalogText.muted}`}>{t("sellerSectionTitle")}</p>
            <p className={`truncate text-base font-bold ${catalogText.heading}`}>{name}</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {sellerId ? (
            <OpenChatButton
              userId={sellerId}
              label={t("chatWithSeller")}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 sm:w-auto sm:min-w-[10.5rem]"
            />
          ) : null}
          {profileUrl ? (
            <Link
              href={profileUrl}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-50 sm:w-auto sm:min-w-[10.5rem]"
            >
              <StoreIcon className="h-4 w-4 shrink-0" />
              {t("viewSellerPage")}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
