"use client";

import Link from "next/link";
import ProductCardMedia from "./ui/ProductCardMedia";
import { VerificationLevelBadge } from "./verification/VerificationLevelIcon";
import { formatLocalizedNumber, getLocalizedText, localizeUnit } from "../utils/localize";
import { catalogProductPath } from "../utils/catalogProductPath";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { LEVEL_ORDER } from "../utils/verification";

/** ارتفاع ثابت ردیف‌های متا — همه کارت‌ها یکسان */
const META_ROW_H = "h-5";

function MetaRow({ label, children, valueClassName = "text-slate-800" }) {
  return (
    <div className={`flex w-full items-center justify-between gap-2 ${META_ROW_H}`}>
      <span className="shrink-0 text-[10px] font-medium leading-5 text-slate-400 sm:text-[11px]">
        {label}
      </span>
      <span
        className={`min-w-0 max-w-[70%] truncate text-end text-[11px] font-semibold leading-5 tabular-nums sm:text-xs ${valueClassName}`}
      >
        {children}
      </span>
    </div>
  );
}

function resolveOfferTitle(product, lots, language) {
  const lot = lots?.[0];
  const dc = lot?.displayContent;
  if (dc && typeof dc === "object") {
    const preferred = [language, "fa", "en", "ar", "tr", "ru", "ur", "es", "nl", "fi"];
    for (const code of preferred) {
      const title = dc[code]?.title;
      if (title && String(title).trim()) return String(title).trim();
    }
  }
  if (lot?.englishName && (language === "en" || !language)) return lot.englishName;
  return getLocalizedText(product, language);
}

function formatStockLabel(totalAvailable, unit, language) {
  const qty = Number(totalAvailable) || 0;
  const u = String(unit || "kg").toLowerCase();
  if (u === "kg" && qty >= 1000) {
    const tons = qty / 1000;
    const rounded = tons >= 10 ? Math.round(tons) : Math.round(tons * 10) / 10;
    return `${formatLocalizedNumber(rounded, language)} تن`;
  }
  if (qty <= 0) return "—";
  return `${formatLocalizedNumber(qty, language)} ${localizeUnit(unit || "kg", language)}`;
}

function formatPriceLine(price, currency, language) {
  if (price == null || price === "") return null;
  const n = Number(price);
  if (!Number.isFinite(n)) return null;
  const formatted = formatLocalizedNumber(Math.round(n), language);
  const cur = String(currency || "TOMAN").toUpperCase();
  if (cur === "TOMAN" || cur === "IRT" || cur === "IRR") {
    return `${formatted} تومان`;
  }
  return `${formatted} ${currency}`;
}

function resolveLocationLabel(lots) {
  const lot = lots?.[0];
  if (!lot) return "";
  if (lot.locationLabel && String(lot.locationLabel).trim()) return String(lot.locationLabel).trim();
  const fv = lot.filterValues && typeof lot.filterValues === "object" ? lot.filterValues : {};
  const city = fv.originCity || fv.city || lot.supplyCity || "";
  const province = fv.originProvince || fv.province || "";
  if (city && province) return `${city}، ${province}`;
  return city || province || "";
}

function resolveOriginCountry(lots, product) {
  const lot = lots?.[0];
  const fv = lot?.filterValues && typeof lot.filterValues === "object" ? lot.filterValues : {};
  return (
    fv.originCountry ||
    fv.supplyCountry ||
    lot?.supplyCountry ||
    product?.supplyCountry ||
    "IR"
  );
}

function normalizeLevel(raw) {
  const lv = String(raw || "none").toLowerCase();
  if (LEVEL_ORDER.includes(lv)) return lv;
  return "none";
}

/**
 * سطح احراز فروشنده/کسب‌وکار از دادهٔ لات یا آبجکت فروشنده
 * آیکون‌های سطح از VerificationLevelIcon (سپر/تیک/ستاره و …) استفاده می‌شود
 */
export function resolveSellerVerification(lots, seller, overrides = {}) {
  if (overrides.level != null || overrides.status != null) {
    const level = normalizeLevel(overrides.level);
    const status = overrides.status || (level !== "none" ? "verified" : "none");
    return {
      kind: overrides.kind === "person" ? "person" : "business",
      level: status === "verified" ? level : "none",
      status,
    };
  }

  const fromSeller =
    seller?.verification ||
    seller?.businessVerification ||
    seller?.account?.verification ||
    null;
  if (fromSeller && typeof fromSeller === "object") {
    const status = String(fromSeller.overall || fromSeller.status || "none").toLowerCase();
    const level = normalizeLevel(fromSeller.level);
    return {
      kind: fromSeller.kind === "person" ? "person" : "business",
      level: status === "verified" ? level : "none",
      status: status === "verified" || status === "pending" ? status : "none",
    };
  }

  const lot = lots?.[0];
  const fv = lot?.filterValues && typeof lot.filterValues === "object" ? lot.filterValues : {};
  const listed = Boolean(fv.listingVerified || lot?.listingVerified);
  const level = normalizeLevel(
    lot?.verificationLevel ||
      fv.verificationLevel ||
      fv.businessVerificationLevel ||
      fv.verifiedLevel ||
      (listed ? "basic" : "none")
  );
  const status = listed || level !== "none" ? "verified" : "none";

  return {
    kind: "business",
    level: status === "verified" ? level : "none",
    status,
  };
}

export function resolveSellerDisplayName(seller, fallback = "فروشنده") {
  if (!seller) return fallback;
  const fromAccount = seller.account?.displayName || seller.account?.profileSlug;
  if (fromAccount && String(fromAccount).trim()) return String(fromAccount).trim();
  const full = [seller.firstName, seller.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (seller.username) return String(seller.username);
  return fallback;
}

/**
 * کارت فشردهٔ محصول موجود —
 * احراز کنار نام فروشنده؛ متا: محل / موجودی / قیمت (کلید یک سمت، مقدار سمت دیگر)
 */
export default function AvailableProductCompactCard({
  product,
  lots,
  totalAvailable,
  language,
  className = "",
  isRTL = true,
  sellerName: sellerNameProp = null,
  sellerAvatar: sellerAvatarProp = null,
  showSellerHeader = true,
  verificationLevel: verificationLevelProp = null,
  verificationStatus: verificationStatusProp = null,
  verificationKind: verificationKindProp = null,
}) {
  const title = resolveOfferTitle(product, lots, language);
  const unit = lots?.[0]?.unit || product?.unit || "kg";
  const qtyLabel = formatStockLabel(totalAvailable, unit, language);
  const location = resolveLocationLabel(lots);
  const priceLine = formatPriceLine(lots?.[0]?.price, lots?.[0]?.priceCurrency, language);
  const countryCode = resolveOriginCountry(lots, product);
  const perUnitHint =
    String(unit || "kg").toLowerCase() === "kg"
      ? "هر کیلوگرم"
      : `هر ${localizeUnit(unit, language)}`;

  const seller =
    lots?.find((l) => l?.supplier || l?.farmer)?.supplier ||
    lots?.find((l) => l?.supplier || l?.farmer)?.farmer ||
    null;
  const sellerName = sellerNameProp || resolveSellerDisplayName(seller);
  const sellerAvatar =
    sellerAvatarProp ||
    resolveMediaUrl(seller?.avatar || seller?.account?.coverImage || null);
  const sellerInitial = (sellerName?.[0] || "ف").toUpperCase();

  const verification = resolveSellerVerification(lots, seller, {
    level: verificationLevelProp,
    status: verificationStatusProp,
    kind: verificationKindProp,
  });

  return (
    <Link
      href={catalogProductPath(product)}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_18px_-10px_rgba(15,23,42,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_12px_28px_-14px_rgba(16,185,129,0.45)] ${className}`}
    >
      {showSellerHeader ? (
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-emerald-100/80 bg-gradient-to-l from-emerald-50/90 via-white to-slate-50/80 px-2.5">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200/80">
            {sellerAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sellerAvatar} alt="" className="h-full w-full object-cover" />
            ) : (
              sellerInitial
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium leading-none text-slate-400">فروشنده</p>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
              <p className="min-w-0 truncate text-[12px] font-bold leading-tight text-emerald-950">
                {sellerName}
              </p>
              <VerificationLevelBadge
                kind={verification.kind}
                level={verification.level}
                status={verification.status}
                size="sm"
                className="shrink-0"
              />
            </div>
          </div>
        </div>
      ) : null}

      <figure className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        <ProductCardMedia
          product={{ ...product, supplyCountry: countryCode }}
          alt={title}
          width={200}
          height={160}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          showFlag
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-900/35 to-transparent"
          aria-hidden
        />
      </figure>

      <div
        className={`flex flex-1 flex-col px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3 sm:pt-2.5 ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        <h3 className="mb-1.5 line-clamp-2 min-h-[2.5rem] text-[12px] font-bold leading-5 text-slate-900 sm:min-h-[2.625rem] sm:text-[13px] sm:leading-[1.3125rem]">
          {title || "—"}
        </h3>

        <div className="mt-auto flex flex-col gap-0.5 border-t border-slate-100 pt-1.5">
          <MetaRow label="محل" valueClassName={location ? "text-slate-700" : "text-slate-300"}>
            {location || "—"}
          </MetaRow>

          <MetaRow label="موجودی" valueClassName="text-emerald-700">
            {qtyLabel}
          </MetaRow>

          <MetaRow label="قیمت" valueClassName={priceLine ? "text-slate-900" : "text-amber-700"}>
            {priceLine ? (
              <span className="inline-flex max-w-full items-baseline justify-end gap-1">
                <span className="truncate font-bold">{priceLine}</span>
                <span className="shrink-0 text-[9px] font-medium text-slate-400 sm:text-[10px]">
                  {perUnitHint}
                </span>
              </span>
            ) : (
              "استعلام قیمت"
            )}
          </MetaRow>
        </div>
      </div>
    </Link>
  );
}
