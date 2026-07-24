"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import TieredPricingDisplay from "../ui/TieredPricingDisplay";
import {
  formatLocalizedNumber,
  formatLocalizedPrice,
  formatQuantityForInput,
  formatQuantityWithUnit,
  getLocalizedLotLabel,
  localizeStatus,
  localizeUnit,
  parseLocalizedNumberInput,
} from "../../utils/localize";
import { getLotDisplayForLanguage } from "@/app/dashboard/supplier/inventory/utils/inventoryDisplayLocales";
import Link from "next/link";
import { getLotSupplierDisplay, getLotSupplierProfileUrl, getLotSupplierProfileSlug, getLotSupplierPageImage, getLotSupplier, lotSupplierHasPhone } from "../../utils/catalogLotSupplier";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import { getAllowedMeasurementUnits } from "../../utils/productCatalogSchema";
import { buildHashtagSearchHref } from "../../utils/mobileSearchUtils";
import { buildDirectMessageHref } from "../../utils/safeAuthRedirect";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import CatalogPdfDownload from "./CatalogPdfDownload";
import CatalogMediaSlider, { buildMediaSlides } from "./CatalogMediaSlider";
import { GradeMediaBadge } from "./CatalogGradeMediaPanel";
import {
  catalogBtn,
  catalogStatusClass,
  catalogSurface,
  catalogText,
} from "./catalogTheme";
import { providerPublicDisplayUrl } from "@/app/utils/providerPublicPath";

function DetailRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <span className={`text-sm ${catalogText.muted}`}>{label}</span>
      <span className={`text-sm font-bold ${highlight ? catalogText.accentStrong : catalogText.heading}`}>{value}</span>
    </div>
  );
}

function PhoneIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

function StoreIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9l1-4h16l1 4M4 9v10a1 1 0 001 1h4V13h6v7h4a1 1 0 001-1V9"
      />
    </svg>
  );
}

function ChatIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h8M8 14h5M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function SupplierAvatar({ imageSrc, label }) {
  const avatar = resolveMediaUrl(imageSrc);
  const initial = (label || "?").trim().charAt(0) || "?";
  if (avatar) {
    return (
      <Image
        src={avatar}
        alt={label || ""}
        width={48}
        height={48}
        unoptimized
        className="h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ring-white"
      />
    );
  }
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-sm font-bold text-white ring-2 ring-white">
      {initial}
    </span>
  );
}

function SectionCard({ title, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white ${className}`}>
      {title ? (
        <header className="border-b border-slate-100 px-4 py-2.5">
          <h3 className={`text-xs font-bold tracking-wide ${catalogText.muted}`}>{title}</h3>
        </header>
      ) : null}
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

export default function CatalogLotOfferCard({
  lot,
  language,
  lotMediaPreview,
  openMediaGallery,
  lotQtyById,
  setLotQtyById,
  placingLotId,
  onAddToCart,
  productUnit,
  product = null,
  productId,
  showMedia = true,
  embedded = false,
}) {
  const t = useTranslations("catalog");
  const auth = useAuth();
  const preview = lotMediaPreview.get(lot.id) || [];
  const coverUrl = resolveMediaUrl(lot.coverImageUrl);
  const available = Math.max(0, parseFloat(lot.totalQuantity || 0) - parseFloat(lot.reservedQuantity || 0));
  const gradeLabel = getLocalizedLotLabel(lot, language, t);
  const statusLabel = localizeStatus(lot.status, t);
  const display = getLotDisplayForLanguage(lot, language);
  const lotDescription = display.description;
  const lotHashtags = display.hashtags;
  const customTitle = display.title;
  const supplier = getLotSupplierDisplay(lot, t);
  const supplierUser = getLotSupplier(lot);
  const supplierProfileUrl = getLotSupplierProfileUrl(lot);
  const supplierSlug = getLotSupplierProfileSlug(lot);
  const supplierPageImage = getLotSupplierPageImage(lot);
  const canRevealPhone = lotSupplierHasPhone(lot);
  const messageHref = buildDirectMessageHref(supplierUser?.id, { isLoggedIn: Boolean(auth?.user) });
  const commercialDisplayUrl = supplierSlug ? providerPublicDisplayUrl(supplierSlug) : null;

  const unitOptions = useMemo(() => {
    const allowed = getAllowedMeasurementUnits(product);
    const lotUnit = lot.unit || productUnit || getAllowedMeasurementUnits(product)[0] || "kg";
    const list = allowed.length ? [...allowed] : [lotUnit];
    if (lotUnit && !list.includes(lotUnit)) list.unshift(lotUnit);
    return [...new Set(list.filter(Boolean))];
  }, [product, lot.unit, productUnit]);

  const [orderUnit, setOrderUnit] = useState(lot.unit || productUnit || unitOptions[0] || "kg");
  const [phone, setPhone] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    const next = lot.unit || productUnit || unitOptions[0] || "kg";
    setOrderUnit(next);
    setPhone("");
    setPhoneError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lot.id]);

  const unitLabel = localizeUnit(orderUnit || "-", language);

  const slides = useMemo(
    () => buildMediaSlides({ coverUrl: coverUrl || undefined, media: preview, title: gradeLabel }),
    [coverUrl, preview, gradeLabel]
  );

  const openAt = (index) => {
    const slide = slides[index];
    if (!slide) return;
    openMediaGallery({
      module: "inventory",
      entityId: lot.id,
      startIndex: index,
      galleryTitle: gradeLabel,
    });
  };

  const revealPhone = async () => {
    if (phoneLoading) return;
    if (phone) {
      window.location.href = `tel:${String(phone).replace(/\s/g, "")}`;
      return;
    }
    setPhoneLoading(true);
    setPhoneError("");
    try {
      const res = await fetch(API_ENDPOINTS.farmer.inventoryLots.supplierContact(lot.id), {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data?.phone) {
        throw new Error(json.message || t("phoneLoadError"));
      }
      const nextPhone = String(json.data.phone);
      setPhone(nextPhone);
      window.location.href = `tel:${nextPhone.replace(/\s/g, "")}`;
    } catch (e) {
      setPhoneError(e.message || t("phoneLoadError"));
    } finally {
      setPhoneLoading(false);
    }
  };

  const supplierBlock =
    supplierUser && (supplier.name || messageHref || canRevealPhone || supplierProfileUrl) ? (
      <SectionCard title={t("supplier")}>
        <div className="flex items-start gap-3">
          {supplierProfileUrl ? (
            <Link href={supplierProfileUrl} className="shrink-0" aria-label={t("viewCommercialPage")}>
              <SupplierAvatar imageSrc={supplierPageImage} label={supplier.label} />
            </Link>
          ) : (
            <SupplierAvatar imageSrc={supplierPageImage} label={supplier.label} />
          )}
          <div className="min-w-0 flex-1">
            <p className={`truncate text-base font-bold ${catalogText.heading}`}>{supplier.label}</p>
            {supplierProfileUrl && commercialDisplayUrl ? (
              <Link
                href={supplierProfileUrl}
                className="mt-1 inline-flex max-w-full items-center gap-1.5 text-[12px] font-semibold text-emerald-800 hover:underline"
                dir="ltr"
                title={t("viewCommercialPage")}
              >
                <StoreIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{commercialDisplayUrl}</span>
              </Link>
            ) : (
              <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{t("supplierChatHint")}</p>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {messageHref ? (
            <Link
              href={messageHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-[13px] font-bold text-emerald-900 transition hover:bg-emerald-100"
            >
              <ChatIcon className="h-4 w-4" />
              {t("sendMessage")}
            </Link>
          ) : null}
          {canRevealPhone ? (
            <button
              type="button"
              onClick={revealPhone}
              disabled={phoneLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
              title={phone ? phone : t("showPhone")}
            >
              <PhoneIcon className="h-4 w-4" />
              {phone ? phone : t("showPhone")}
            </button>
          ) : null}
          {supplierProfileUrl ? (
            <Link
              href={supplierProfileUrl}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-800 transition hover:bg-slate-50"
            >
              <StoreIcon className="h-4 w-4" />
              {t("viewCommercialPage")}
            </Link>
          ) : null}
        </div>
        {phoneError ? <p className="mt-2 text-[11px] text-rose-600">{phoneError}</p> : null}
        {supplierProfileUrl ? (
          <p className="mt-2.5 text-[11px] leading-5 text-slate-500">{t("supplierChatHint")}</p>
        ) : null}
      </SectionCard>
    ) : null;

  const productBlock = (
    <SectionCard title={t("product")}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-xs ${catalogText.muted}`}>{t("lotGradeLabel")}</p>
          <p className={`text-base font-bold ${catalogText.heading}`}>{customTitle || gradeLabel}</p>
        </div>
        <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${catalogStatusClass(lot.status)}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mb-3 border-t border-slate-100 pt-3">
        <p className={`mb-1 text-xs font-medium ${catalogText.muted}`}>{t("priceSectionTitle")}</p>
        {lot.tieredPricing?.length > 0 ? (
          <TieredPricingDisplay tieredPricing={lot.tieredPricing} unit={lot.unit} />
        ) : lot.price ? (
          <p className={`text-xl font-extrabold ${catalogText.accentStrong}`}>
            {formatLocalizedPrice(lot.price, language, t)}
          </p>
        ) : (
          <p className={`text-sm ${catalogText.muted}`}>{t("priceNotSet")}</p>
        )}
        {lot.minimumOrderQuantity && !lot.tieredPricing?.length ? (
          <p className={`mt-1.5 text-xs ${catalogText.body}`}>
            {t("minimumOrder")}: {formatQuantityWithUnit(lot.minimumOrderQuantity, language, unitLabel)}
          </p>
        ) : null}
      </div>

      {lotDescription ? (
        <div className="mb-3 border-t border-slate-100 pt-3">
          <p className={`mb-1.5 text-xs font-semibold ${catalogText.body}`}>{t("lotDescriptionTitle")}</p>
          <p className={`whitespace-pre-wrap text-sm leading-relaxed ${catalogText.body}`}>{lotDescription}</p>
        </div>
      ) : null}

      {Array.isArray(lotHashtags) && lotHashtags.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          {lotHashtags.map((tag) => (
            <Link
              key={tag}
              href={buildHashtagSearchHref(tag)}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}

      {Array.isArray(lot.attributes) && lot.attributes.length > 0 ? (
        <div className="border-t border-slate-100 pt-1">
          <p className={`py-2 text-xs font-semibold ${catalogText.body}`}>{t("technicalSpecsTitle")}</p>
          {lot.attributes.map((a) => (
            <DetailRow key={a.id} label={a.definition?.name || `#${a.attributeDefinitionId}`} value={a.value ?? "—"} />
          ))}
        </div>
      ) : null}

      {(lot.packagingType || lot.hsCode || (lot.filterValues && Object.keys(lot.filterValues).length > 0)) ? (
        <div className="border-t border-slate-100 pt-1">
          <p className={`py-2 text-xs font-semibold ${catalogText.body}`}>{t("lotTradeDetailsTitle")}</p>
          {lot.packagingType ? <DetailRow label={t("packagingType")} value={lot.packagingType} /> : null}
          {lot.hsCode ? <DetailRow label={t("hsCode")} value={lot.hsCode} /> : null}
          {lot.filterValues &&
            Object.entries(lot.filterValues)
              .filter(([k, v]) => v && k !== "hsCode")
              .map(([k, v]) => (
                <DetailRow
                  key={k}
                  label={(() => {
                    try {
                      const tr = t(`filterKeys.${k}`);
                      return tr && tr !== `filterKeys.${k}` ? tr : k;
                    } catch {
                      return k;
                    }
                  })()}
                  value={String(v)}
                />
              ))}
        </div>
      ) : null}

      {productId ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <CatalogPdfDownload
            scope="lot"
            productId={productId}
            lotId={lot.id}
            lot={lot}
            product={product}
            label={t("downloadSupplierCatalogPdf")}
            compact
            block
            className="w-full"
          />
        </div>
      ) : null}
    </SectionCard>
  );

  const orderBlock = (
    <SectionCard title={t("orderSectionTitle")} className="border-emerald-200/80 bg-emerald-50/30">
      <p className={`mb-3 text-sm leading-relaxed ${catalogText.body}`}>
        {t("orderMaxHint", {
          quantity: formatLocalizedNumber(available, language, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
            useGrouping: false,
          }),
          unit: localizeUnit(lot.unit || orderUnit || "", language),
        })}
      </p>
      <label className={`mb-1.5 block text-sm font-semibold ${catalogText.heading}`} htmlFor={`lot-qty-${lot.id}`}>
        {t("orderQuantityLabel")}
      </label>
      <div className="mb-3 flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
        {unitOptions.length > 1 ? (
          <select
            id={`lot-unit-${lot.id}`}
            value={orderUnit}
            onChange={(e) => setOrderUnit(e.target.value)}
            className={`max-w-[40%] shrink-0 border-0 border-l border-slate-200 bg-slate-50 px-2.5 py-3.5 text-sm font-semibold outline-none ${catalogText.body}`}
          >
            {unitOptions.map((u) => (
              <option key={u} value={u}>
                {localizeUnit(u, language)}
              </option>
            ))}
          </select>
        ) : (
          <span className={`flex shrink-0 items-center border-l border-slate-200 bg-slate-50 px-3 text-sm font-semibold ${catalogText.body}`}>
            {unitLabel}
          </span>
        )}
        <input
          id={`lot-qty-${lot.id}`}
          type="text"
          inputMode="decimal"
          dir="ltr"
          className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          placeholder={t("qtyPlaceholder")}
          value={formatQuantityForInput(lotQtyById[lot.id] ?? "", language)}
          onChange={(e) =>
            setLotQtyById((prev) => ({
              ...prev,
              [lot.id]: parseLocalizedNumberInput(e.target.value),
            }))
          }
        />
      </div>
      <button
        type="button"
        className={catalogBtn.primaryBlock}
        disabled={placingLotId === lot.id}
        onClick={() => onAddToCart(lot, orderUnit)}
      >
        {placingLotId === lot.id ? "…" : t("addToCartAction")}
      </button>
      <div className="mt-3 rounded-xl border border-emerald-100 bg-white/80 px-3 py-2.5">
        <p className={`text-[11px] font-bold ${catalogText.accentStrong}`}>{t("cartProcessTitle")}</p>
        <p className={`mt-1 text-[11px] leading-6 ${catalogText.body}`}>{t("cartProcessSteps")}</p>
      </div>
    </SectionCard>
  );

  if (embedded) {
    return (
      <div className="flex flex-col gap-3">
        {supplierBlock}
        {productBlock}
        {orderBlock}
      </div>
    );
  }

  return (
    <article className={`overflow-hidden ${catalogSurface.card}`}>
      {showMedia && slides.length > 0 ? (
        <CatalogMediaSlider
          slides={slides}
          aspectClass="aspect-[2/1] max-h-56 sm:aspect-[16/9] sm:max-h-none"
          onSlideTap={openAt}
          expandAriaLabel={t("viewGallery")}
          cornerTopStart={<GradeMediaBadge>{gradeLabel}</GradeMediaBadge>}
        />
      ) : null}
      <div className="space-y-3 p-3 sm:p-4">
        {supplierBlock}
        {productBlock}
        {orderBlock}
      </div>
    </article>
  );
}
