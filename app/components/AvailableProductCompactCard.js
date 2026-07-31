"use client";

import Link from "next/link";
import ProductCardMedia from "./ui/ProductCardMedia";
import { formatLocalizedNumber, getLocalizedText, localizeUnit } from "../utils/localize";
import { catalogProductPath } from "../utils/catalogProductPath";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { LEVEL_ORDER } from "../utils/verification";
import { VerificationLevelBadge } from "./verification/VerificationLevelIcon";
import { formatCatalogAncestorBreadcrumb } from "../utils/mobileSearchUtils";
import { countryCodeToFlag, countryCodeToFlagUrl } from "../utils/supplySource";
import { useState } from "react";

/** ارتفاع ثابت ردیف‌های متا — همه کارت‌ها یکسان */
const META_ROW_H = "h-5";

function CompactFlag({ countryCode = "IR" }) {
  const [imgFailed, setImgFailed] = useState(false);
  const flagUrl = countryCodeToFlagUrl(countryCode, 40);
  return (
    <span className="inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] border border-white/40 bg-white/90">
      {flagUrl && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={flagUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[9px] leading-none">
          {countryCodeToFlag(countryCode)}
        </span>
      )}
    </span>
  );
}

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

function pickHighestLevel(rawLevels) {
  let best = "none";
  let bestIdx = -1;
  for (const raw of rawLevels) {
    const lv = normalizeLevel(raw);
    const idx = LEVEL_ORDER.indexOf(lv);
    if (idx > bestIdx) {
      bestIdx = idx;
      best = lv;
    }
  }
  return best;
}

function levelFromLot(lot) {
  if (!lot) return "none";
  const fv = lot.filterValues && typeof lot.filterValues === "object" ? lot.filterValues : {};
  const listed = Boolean(fv.listingVerified || lot.listingVerified);
  return normalizeLevel(
    lot.verificationLevel ||
      fv.verificationLevel ||
      fv.businessVerificationLevel ||
      fv.verifiedLevel ||
      (listed ? "basic" : "none")
  );
}

/**
 * سطح احراز فروشنده/کسب‌وکار از دادهٔ لات یا آبجکت فروشنده
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

  const sellerId = seller?.id ?? lots?.[0]?.supplier?.id ?? lots?.[0]?.farmerId ?? null;
  const fromMap =
    sellerId != null && overrides.sellerVerificationMap
      ? overrides.sellerVerificationMap.get?.(Number(sellerId)) ??
        overrides.sellerVerificationMap[Number(sellerId)]
      : null;
  if (fromMap) return fromMap;

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

  const lotLevels = (lots || []).map(levelFromLot).filter((lv) => lv !== "none");
  const level = pickHighestLevel(lotLevels.length ? lotLevels : ["none"]);
  const status = level !== "none" ? "verified" : "none";

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
 * نشان احراز کنار نام فروشگاه؛ محل کنار پرچم؛ بردکرامب روی گرادیانت تصویر
 */
export default function AvailableProductCompactCard({
  product,
  lots,
  totalAvailable,
  language,
  className = "",
  isRTL = true,
  href = null,
  sellerName: sellerNameProp = null,
  sellerAvatar: sellerAvatarProp = null,
  showSellerHeader = true,
  verificationLevel: verificationLevelProp = null,
  verificationStatus: verificationStatusProp = null,
  verificationKind: verificationKindProp = null,
  sellerVerificationMap = null,
  productById = null,
  hideCategory = false,
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
    sellerVerificationMap,
  });

  const categoryBreadcrumb =
    !hideCategory && productById
      ? formatCatalogAncestorBreadcrumb(product, productById, language, {
          separator: " / ",
          maxLevels: 3,
        })
      : "";

  return (
    <Link
      href={href || catalogProductPath(product)}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_18px_-10px_rgba(15,23,42,0.28)] transition-[border-color,box-shadow] duration-200 hover:border-emerald-300 hover:shadow-[0_12px_28px_-14px_rgba(16,185,129,0.45)] ${className}`}
    >
      {showSellerHeader ? (
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-emerald-100/80 bg-gradient-to-l from-emerald-50/90 via-white to-slate-50/80 px-2.5">
          <span className="relative flex h-[1.95rem] w-[3rem] shrink-0 items-center justify-center overflow-hidden sm:h-8 sm:w-[3.25rem]">
            {sellerAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sellerAvatar}
                alt=""
                className="h-full w-full object-contain"
                draggable={false}
              />
            ) : (
              <span className="text-[10px] font-bold text-emerald-800">{sellerInitial}</span>
            )}
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-[8px] font-normal leading-none tracking-wide text-slate-400">فروشگاه</p>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
              <p className="min-w-0 flex-1 truncate text-[12px] font-bold leading-tight text-emerald-950">
                {sellerName}
              </p>
              <VerificationLevelBadge
                kind={verification.kind || "business"}
                level={verification.level}
                status={verification.status}
                size="sm"
                variant="plain"
                className="shrink-0"
              />
            </div>
          </div>
        </div>
      ) : null}

      <figure className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        <ProductCardMedia
          product={{ ...product, supplyCountry: countryCode }}
          lots={lots}
          alt={title}
          width={200}
          height={160}
          className="h-full w-full object-cover"
          showFlag={false}
        />

        <div className="pointer-events-none absolute inset-x-0 start-1.5 top-1.5 z-[2] end-1.5 flex items-start justify-between gap-1.5">
          <span className="inline-flex max-w-full items-center gap-1">
            <CompactFlag countryCode={countryCode} />
            <span
              className="min-w-0 truncate text-[9px] font-semibold leading-tight text-black sm:text-[10px]"
              style={{
                textShadow:
                  "0 0 2px #fff, 0 0 2px #fff, 1px 0 0 #fff, -1px 0 0 #fff, 0 1px 0 #fff, 0 -1px 0 #fff, 1px 1px 0 #fff, -1px -1px 0 #fff",
              }}
              title={location || undefined}
            >
              {location || "—"}
            </span>
          </span>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[55%] bg-gradient-to-t from-black/75 via-black/35 to-transparent"
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] px-2 pb-1.5 pt-6">
          <p
            className="line-clamp-2 min-h-[1.75rem] text-[9px] font-medium leading-[0.875rem] text-white/90 sm:min-h-[1.875rem] sm:text-[10px] sm:leading-[0.95rem]"
            title={categoryBreadcrumb || undefined}
          >
            {categoryBreadcrumb || "\u00A0"}
          </p>
        </div>
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
          <MetaRow label="موجودی" valueClassName="text-emerald-700">
            {qtyLabel}
          </MetaRow>

          <MetaRow label="قیمت" valueClassName={priceLine ? "text-slate-900" : "text-amber-700"}>
            {priceLine ? (
              <span className="inline-flex max-w-full items-baseline justify-end gap-1">
                <span className="shrink-0 text-[9px] font-medium text-slate-400 sm:text-[10px]">
                  {perUnitHint}
                </span>
                <span className="truncate font-bold">{priceLine}</span>
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
