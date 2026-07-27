"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { pickBlockLocale } from "./registry";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { catalogProductPath } from "@/app/utils/catalogProductPath";
import {
  getLotSupplier,
  getLotSupplierDisplayName,
  getLotSupplierProfileUrl,
  getLotSupplierPageImage,
} from "@/app/utils/catalogLotSupplier";
import OpenChatButton from "@/app/components/messaging/OpenChatButton";

function Section({ children, className = "" }) {
  return (
    <section className={`lp-section w-full ${className}`} style={{ paddingBlock: "var(--lp-section-y)", paddingInline: "var(--lp-pad-x)" }}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

function Display({ children }) {
  return (
    <h2 className="landing-display text-2xl font-bold tracking-tight md:text-3xl" style={{ fontFamily: "inherit", fontSize: "var(--lp-title)" }}>
      {children}
    </h2>
  );
}

function formatPrice(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return null;
  try {
    return new Intl.NumberFormat("fa-IR").format(num);
  } catch {
    return String(num);
  }
}

function formatQty(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  try {
    return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 3 }).format(num);
  } catch {
    return String(num);
  }
}

function EmptyOffer({ title, body, catalogHref }) {
  return (
    <Section>
      {title ? <Display>{title}</Display> : null}
      <div className="lp-card mt-5 border-dashed p-6 text-center">
        <p style={{ color: "var(--lp-muted)" }}>
          {body || "این لندینگ به موجودی متصل نیست. از موجودی لندینگ بسازید تا قیمت و سبد خرید فعال شود."}
        </p>
        {catalogHref ? (
          <Link href={catalogHref} className="lp-btn lp-btn-secondary mt-4 inline-flex">
            مشاهده در کاتالوگ
          </Link>
        ) : null}
      </div>
    </Section>
  );
}

function EditorStub({ label, hint }) {
  return (
    <Section>
      <div className="lp-card border-dashed p-6 text-center">
        <p className="font-bold" style={{ color: "var(--lp-fg)" }}>
          {label}
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--lp-muted)" }}>
          {hint}
        </p>
      </div>
    </Section>
  );
}

export function BuyBlock({ block, locale, product, offer, editorMode }) {
  const copy = pickBlockLocale(block.props, locale);
  const [qty, setQty] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");

  const lot = offer?.lot || null;
  const catalogHref = product ? catalogProductPath(product) : null;

  if (editorMode && !lot) {
    return (
      <EditorStub
        label={copy.title || "سفارش و خرید"}
        hint="در صفحهٔ منتشرشده با اتصال به موجودی، قیمت و دکمهٔ افزودن به سبد نشان داده می‌شود."
      />
    );
  }

  if (!lot) {
    return <EmptyOffer title={copy.title || "سفارش و خرید"} body={copy.body} catalogHref={catalogHref} />;
  }

  const available = Number(
    lot.availableQuantity ?? Math.max(0, Number(lot.totalQuantity || 0) - Number(lot.reservedQuantity || 0))
  );
  const unit = lot.unit || "kg";
  const moq = lot.minimumOrderQuantity != null ? Number(lot.minimumOrderQuantity) : null;
  const compact = block.variant === "compact";
  const sticky = block.variant === "sticky";

  const addToCart = async () => {
    setMsg("");
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      setMsgType("error");
      setMsg("برای افزودن به سبد ابتدا وارد شوید.");
      return;
    }
    const v = parseFloat(String(qty).replace(/,/g, "."));
    if (!Number.isFinite(v) || v <= 0) {
      setMsgType("error");
      setMsg("مقدار معتبر وارد کنید.");
      return;
    }
    if (moq != null && v + 1e-9 < moq) {
      setMsgType("error");
      setMsg(`حداقل سفارش ${formatQty(moq)} ${unit} است.`);
      return;
    }
    if (v > available + 1e-9) {
      setMsgType("error");
      setMsg(`حداکثر موجودی قابل سفارش ${formatQty(available)} ${unit} است.`);
      return;
    }
    setBusy(true);
    try {
      const res = await authFetch(`${API_ENDPOINTS.farmer.cart.base}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: lot.productId || product?.id,
          inventoryLotId: lot.id,
          qualityGrade: lot.qualityGrade,
          quantity: Number(v.toFixed(3)),
          unit: lot.unit || unit,
        }),
      });
      const j = await res.json();
      if (!res.ok || !j?.success) throw new Error(j?.message || "افزودن به سبد ناموفق بود");
      setMsgType("success");
      setMsg("به سبد اضافه شد.");
      setQty("");
    } catch (e) {
      setMsgType("error");
      setMsg(e.message || "خطا در افزودن به سبد");
    } finally {
      setBusy(false);
    }
  };

  const priceLine =
    Array.isArray(lot.tieredPricing) && lot.tieredPricing.length > 0 ? (
      <div className="space-y-2">
        {lot.tieredPricing.slice(0, 4).map((t, i) => (
          <div key={i} className="flex items-center justify-between gap-3 rounded-box bg-primary/10 px-3 py-2 text-sm">
            <span className="opacity-70">
              از {formatQty(t.minQty ?? t.from ?? t.min)} {unit}
            </span>
            <span className="font-bold">
              {formatPrice(t.price)} {lot.priceCurrency === "TOMAN" ? "تومان" : lot.priceCurrency || ""}
            </span>
          </div>
        ))}
      </div>
    ) : lot.price != null ? (
      <p className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
        {formatPrice(lot.price)}
        <span className="ms-1 text-sm font-semibold opacity-80">
          {lot.priceCurrency === "TOMAN" ? "تومان" : lot.priceCurrency || ""}
        </span>
        <span className="ms-1 text-xs font-medium opacity-60">/ {unit}</span>
      </p>
    ) : (
      <p className="text-sm font-semibold opacity-60">قیمت توافقی — پس از هماهنگی</p>
    );

  const form = (
    <div className="flex flex-col gap-3">
      <fieldset className="fieldset">
        <legend className="fieldset-legend">مقدار سفارش</legend>
        <label className="input input-bordered flex w-full items-center gap-2">
          <span className="badge badge-ghost badge-sm">{unit}</span>
          <input
            type="text"
            inputMode="decimal"
            dir="ltr"
            className="grow"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder={moq != null ? String(moq) : "0"}
          />
        </label>
      </fieldset>
      <button type="button" disabled={busy || available <= 0} onClick={addToCart} className="lp-btn lp-btn-primary lp-btn-block disabled:opacity-50">
        {busy ? "در حال ثبت…" : copy.ctaLabel || "افزودن به سبد خرید"}
      </button>
    </div>
  );

  const alertMsg = msg ? (
    <div
      role="alert"
      className="mt-3 rounded-[var(--lp-radius)] border px-3 py-2 text-xs"
      style={{
        background: msgType === "success" ? "var(--lp-accent-soft)" : "color-mix(in srgb, #ef4444 12%, var(--lp-bg-elevated))",
        borderColor: "var(--lp-border)",
        color: "var(--lp-fg)",
      }}
    >
      <span>{msg}</span>
    </div>
  ) : null;

  if (sticky) {
    return (
      <div className="sticky bottom-3 z-30 mx-auto w-full max-w-lg px-4">
        <div className="lp-card p-3 shadow-lg">{form}</div>
        {alertMsg}
      </div>
    );
  }

  return (
    <Section>
      {copy.title ? <Display>{copy.title}</Display> : null}
      {copy.subtitle ? <p className="mt-2 opacity-70">{copy.subtitle}</p> : null}
      <div className={`card mt-6 bg-base-100 shadow-sm ${compact ? "" : ""}`}>
        <div className={`card-body gap-0 p-0 ${compact ? "" : "sm:grid sm:grid-cols-2"}`}>
          <div className="border-b border-base-200 p-5 sm:border-b-0 sm:border-e sm:p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">
              {lot.qualityGrade ? `درجه ${lot.qualityGrade}` : "پیشنهاد فروش"}
            </p>
            {priceLine}
            <div className="mt-5 flex flex-wrap gap-2">
              {moq != null ? (
                <span className="badge badge-soft badge-primary">
                  حداقل {formatQty(moq)} {unit}
                </span>
              ) : null}
              <span className="badge badge-ghost">
                موجود {formatQty(available)} {unit}
              </span>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {form}
            {alertMsg}
            {catalogHref ? (
              <Link href={catalogHref} className="link link-primary mt-4 inline-block text-xs font-bold">
                جزئیات کامل در کاتالوگ
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}

export function ProductStockBlock({ block, locale, offer, editorMode }) {
  const copy = pickBlockLocale(block.props, locale);
  const lot = offer?.lot;

  if (editorMode && !lot) {
    return <EditorStub label={copy.title || "موجودی انبار"} hint="پس از اتصال لندینگ به موجودی، اعداد واقعی نمایش داده می‌شوند." />;
  }
  if (!lot) return null;

  const total = Number(lot.totalQuantity || 0);
  const reserved = Number(lot.reservedQuantity || 0);
  const available = Number(lot.availableQuantity ?? Math.max(0, total - reserved));
  const unit = lot.unit || "";

  return (
    <Section>
      {copy.title ? <Display>{copy.title}</Display> : null}
      <div className="stats mt-5 w-full stats-vertical shadow sm:stats-horizontal">
        <div className="stat place-items-center">
          <div className="stat-title">کل موجودی</div>
          <div className="stat-value text-lg sm:text-2xl">
            {formatQty(total)}
            {unit ? <span className="ms-1 text-xs font-semibold opacity-60">{unit}</span> : null}
          </div>
        </div>
        <div className="stat place-items-center">
          <div className="stat-title">رزرو شده</div>
          <div className="stat-value text-lg sm:text-2xl">
            {formatQty(reserved)}
            {unit ? <span className="ms-1 text-xs font-semibold opacity-60">{unit}</span> : null}
          </div>
        </div>
        <div className="stat place-items-center bg-primary/5">
          <div className="stat-title text-primary">قابل سفارش</div>
          <div className="stat-value text-lg text-primary sm:text-2xl">
            {formatQty(available)}
            {unit ? <span className="ms-1 text-xs font-semibold opacity-60">{unit}</span> : null}
          </div>
        </div>
      </div>
    </Section>
  );
}

export function SellerActionsBlock({ block, locale, shop, offer, editorMode }) {
  const copy = pickBlockLocale(block.props, locale);
  const lotForSupplier = useMemo(() => {
    if (!offer?.lot) return null;
    return { ...offer.lot, supplier: offer.supplier || offer.lot.supplier };
  }, [offer]);

  if (editorMode && !lotForSupplier?.supplier && !shop?.slug) {
    return <EditorStub label={copy.title || "ارتباط با فروشنده"} hint="در صفحهٔ نهایی از دادهٔ موجودی پر می‌شود." />;
  }

  const supplier = getLotSupplier(lotForSupplier);
  const name = getLotSupplierDisplayName(lotForSupplier) || shop?.name || "فروشنده";
  const profileUrl = getLotSupplierProfileUrl(lotForSupplier) || (shop?.slug ? `/${shop.slug}` : null);
  const imageSrc = getLotSupplierPageImage(lotForSupplier) || shop?.coverImage;
  const sellerId = supplier?.id;

  if (!sellerId && !profileUrl) return null;

  return (
    <Section>
      <div className="lp-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt="" className="h-14 w-14 rounded-2xl object-cover ring-1 ring-[var(--lp-border)]" />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold"
              style={{ background: "var(--lp-accent)", color: "var(--lp-accent-fg)" }}
            >
              {(name || "ف").trim().charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--lp-accent)" }}>
              {copy.title || "فروشنده"}
            </p>
            <p className="mt-1 truncate text-lg font-bold tracking-tight" style={{ color: "var(--lp-fg)" }}>
              {name}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {sellerId ? (
            <OpenChatButton
              userId={sellerId}
              label={copy.ctaLabel || "گفتگو با فروشنده"}
              className="lp-btn lp-btn-primary w-full sm:w-auto"
            />
          ) : null}
          {profileUrl ? (
            <Link href={profileUrl} className="lp-btn lp-btn-secondary w-full sm:w-auto">
              صفحه فروشنده
            </Link>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
