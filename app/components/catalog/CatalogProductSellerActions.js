"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useMessaging } from "@/app/context/MessagingContext";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { buildLoginHref } from "@/app/utils/safeAuthRedirect";
import { showToast } from "@/app/utils/toast";
import {
  getLotSupplier,
  getLotSupplierDisplayName,
  getLotSupplierPageImage,
  getLotSupplierProfileUrl,
  lotSupplierHasPhone,
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

function PhoneIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}

function ChatIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 9.75h.008v.008H8.625V9.75zm3.375 0h.008v.008H12V9.75zm3.375 0h.008v.008H15.375V9.75z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.5-3c-.54.035-1.085.052-1.63.052-4.418 0-8-2.239-8-5s3.582-5 8-5c.852 0 1.672.086 2.44.248"
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

/** آیکن که با هاور/فوکس به دکمه کامل با متن باز می‌شود */
function ExpandingIconButton({
  icon,
  label,
  onClick,
  disabled = false,
  href,
  tone = "neutral",
  expandedForce = false,
  title,
}) {
  const [expanded, setExpanded] = useState(false);
  const open = expandedForce || expanded;

  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50";

  const className = [
    "group inline-flex h-11 max-w-full items-center overflow-hidden rounded-xl border transition-all duration-200",
    toneClass,
    disabled ? "cursor-wait opacity-60" : "",
    open ? "gap-2 px-3.5" : "w-11 justify-center px-0",
  ].join(" ");

  const body = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center">{icon}</span>
      <span
        className={[
          "whitespace-nowrap text-[13px] font-bold transition-all duration-200",
          open ? "max-w-[14rem] opacity-100 pe-1" : "max-w-0 overflow-hidden opacity-0",
        ].join(" ")}
      >
        {label}
      </span>
    </>
  );

  const handlers = {
    onMouseEnter: () => setExpanded(true),
    onMouseLeave: () => setExpanded(false),
    onFocus: () => setExpanded(true),
    onBlur: () => setExpanded(false),
    title: title || label,
    "aria-label": label,
  };

  if (href) {
    return (
      <Link href={href} className={className} {...handlers}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className} {...handlers}>
      {body}
    </button>
  );
}

/** نوار فروشنده زیر هدر محصول — لوگو، نام، آیکن گفتگو/تماس، رفتن به فروشگاه */
export default function CatalogProductSellerActions({ lot, className = "" }) {
  const t = useTranslations("catalog");
  const { t: tLegacy } = useLanguage();
  const auth = useAuth();
  const { openMessaging } = useMessaging();
  const router = useRouter();
  const tipId = useId();

  const [phone, setPhone] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    setPhone("");
    setPhoneError("");
  }, [lot?.id]);

  if (!lot) return null;

  const supplierUser = getLotSupplier(lot);
  const name = getLotSupplierDisplayName(lot) || t("supplier");
  const profileUrl = getLotSupplierProfileUrl(lot);
  const imageSrc = getLotSupplierPageImage(lot);
  const sellerId = supplierUser?.id ? Number(supplierUser.id) : null;
  const canRevealPhone = lotSupplierHasPhone(lot);
  const shopLabel = t("goToShop", { name });
  const loggedIn = Boolean(auth?.user);

  if (!sellerId && !profileUrl && !canRevealPhone) return null;

  const requireLogin = () => {
    showToast.warning(tLegacy("toastLoginRequired") || t("pleaseLoginFirst"));
    router.push(buildLoginHref(typeof window !== "undefined" ? window.location.pathname : "/"));
  };

  const revealPhone = async () => {
    if (phoneLoading) return;

    if (!loggedIn) {
      requireLogin();
      return;
    }

    if (phone) {
      window.location.href = `tel:${String(phone).replace(/\s/g, "")}`;
      return;
    }

    setPhoneLoading(true);
    setPhoneError("");
    try {
      const res = await authFetch(API_ENDPOINTS.farmer.inventoryLots.supplierContact(lot.id), {
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        requireLogin();
        return;
      }
      if (!res.ok || !json.success || !json.data?.phone) {
        throw new Error(json.message || t("phoneLoadError"));
      }
      setPhone(String(json.data.phone));
    } catch (e) {
      setPhoneError(e.message || t("phoneLoadError"));
    } finally {
      setPhoneLoading(false);
    }
  };

  const openChat = () => {
    if (!sellerId) return;
    if (!loggedIn) {
      requireLogin();
      return;
    }
    openMessaging({ userId: sellerId });
  };

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
      aria-label={t("sellerSectionTitle")}
      aria-describedby={tipId}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {profileUrl ? (
            <Link href={profileUrl} className="shrink-0" aria-label={shopLabel}>
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

        <div className="flex flex-wrap items-center gap-2">
          {sellerId ? (
            <ExpandingIconButton
              icon={<ChatIcon className="h-5 w-5" />}
              label={t("chatWithSeller")}
              onClick={openChat}
              tone="emerald"
            />
          ) : null}

          {canRevealPhone ? (
            <ExpandingIconButton
              icon={<PhoneIcon className="h-5 w-5" />}
              label={phone ? phone : t("showPhone")}
              onClick={revealPhone}
              disabled={phoneLoading}
              tone="neutral"
              expandedForce={Boolean(phone)}
              title={phone ? phone : t("showPhone")}
            />
          ) : null}

          {profileUrl ? (
            <Link
              href={profileUrl}
              className="inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-bold text-slate-800 transition hover:bg-slate-50"
            >
              <StoreIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{shopLabel}</span>
            </Link>
          ) : null}
        </div>
      </div>

      {phoneError ? <p className="mt-2 text-[11px] text-rose-600">{phoneError}</p> : null}
      <p id={tipId} className="sr-only">
        {t("sellerActionsHint")}
      </p>
    </section>
  );
}
