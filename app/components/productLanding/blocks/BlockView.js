"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { pickBlockLocale } from "./registry";
import { looksLikeHtml, sanitizeLandingHtml } from "../builder/sanitizeLandingHtml";
import { BuyBlock, ProductStockBlock, SellerActionsBlock } from "./LandingCommerceBlocks";
import { resolveBlockTypeVariant } from "./registry";
import { resolveBlockFontStack } from "../themes/fonts";
import ProductPageQrCode from "@/app/components/ui/ProductPageQrCode";
import { catalogProductPath } from "@/app/utils/catalogProductPath";
import { landingPageAbsoluteUrl } from "@/app/utils/productQrUrl";
import { getLocalizedText } from "@/app/utils/localize";
import LandingMapPicker from "./LandingMapPicker";
import { LandingMedia } from "./LandingMedia";
import { BlockOwnerToolbar } from "./BlockOwnerControls";
import { useLandingEdit } from "../LandingEditContext";

function Section({ children, className = "", style, narrow = false }) {
  return (
    <section
      className={`lp-section ${className}`}
      style={{ paddingBlock: "var(--lp-section-y)", paddingInline: "var(--lp-pad-x)", ...style }}
    >
      <div className={`lp-container ${narrow ? "max-w-3xl" : ""}`}>{children}</div>
    </section>
  );
}

function SectionHead({ kicker, title, subtitle, center = false }) {
  if (!title && !subtitle && !kicker) return null;
  return (
    <div className={`mb-8 md:mb-10 ${center ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}`}>
      {kicker ? <p className="lp-kicker mb-3">{kicker}</p> : null}
      {title ? <Display>{title}</Display> : null}
      {subtitle ? <p className={`lp-lead mt-3 ${center ? "mx-auto" : ""}`}>{subtitle}</p> : null}
    </div>
  );
}

function Display({ children, className = "", size = "title" }) {
  return (
    <h2
      className={`landing-display ${className}`}
      style={{
        fontFamily: "inherit",
        fontSize: size === "hero" ? "var(--lp-hero-title)" : "var(--lp-title)",
      }}
    >
      {children}
    </h2>
  );
}

/** متن بلوک: plain یا HTML امن‌شده از ویرایشگر */
function RichBody({ value, className = "", style, as: Tag = "div" }) {
  if (!value) return null;
  if (!looksLikeHtml(value)) {
    return (
      <Tag className={`lp-rich-body whitespace-pre-wrap ${className}`} style={style}>
        {value}
      </Tag>
    );
  }
  return (
    <Tag
      className={`lp-rich-body [&_a]:underline [&_li]:ms-5 [&_ol]:list-decimal [&_p+p]:mt-2 [&_ul]:list-disc ${className}`}
      style={style}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: sanitizeLandingHtml(value) }}
    />
  );
}

function Btn({ href, children, secondary = false, block = false }) {
  if (!href && !children) return null;
  const cls = `lp-btn ${secondary ? "lp-btn-secondary" : "lp-btn-primary"} ${block ? "lp-btn-block" : ""}`;
  if (href) {
    return (
      <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <span className={cls}>{children}</span>;
}

function telHref(phone) {
  return phone ? `tel:${String(phone).replace(/\s/g, "")}` : null;
}
function waHref(wa) {
  if (!wa) return null;
  return `https://wa.me/${String(wa).replace(/[^\d+]/g, "").replace(/^\+/, "")}`;
}

function HeroBlock({ block, locale, shop, editorMode }) {
  const p = block.props || {};
  const copy = pickBlockLocale(p, locale);
  const img = p.bgImageUrl || p.imageUrl;
  const phone = p.contactPhone || shop?.phone;
  const wa = p.contactWhatsapp || shop?.whatsapp;
  const primaryHref = p.buttonHref || telHref(phone) || waHref(wa) || (shop?.slug ? `/${shop.slug}` : "#");
  const secondaryHref = p.buttonSecondaryHref || waHref(wa);

  if (block.variant === "split") {
    return (
      <section className="grid overflow-hidden @[1024px]:grid-cols-2" style={{ minHeight: "var(--lp-hero-min)" }}>
        <div className="relative min-h-[16rem] overflow-hidden @[768px]:min-h-[22rem] @[1024px]:min-h-full">
          <LandingMedia
            blockId={block.id}
            field="bgImageUrl"
            src={img}
            fill
            priority
            editorMode={editorMode}
            slotLabel="تصویر هیرو (نیم‌صفحه)"
            slotHint="عکس محصول یا فضای کار را اینجا آپلود کنید"
          />
        </div>
        <div
          className="flex flex-col justify-center gap-1 py-12 @[768px]:py-16"
          style={{ paddingInline: "var(--lp-pad-x)", background: "var(--lp-bg)" }}
        >
          {shop?.name ? <p className="lp-kicker mb-2">{shop.name}</p> : null}
          <Display size="hero">{copy.title}</Display>
          {copy.subtitle ? <p className="lp-lead mt-4">{copy.subtitle}</p> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {copy.ctaLabel ? <Btn href={primaryHref}>{copy.ctaLabel}</Btn> : null}
            {copy.ctaSecondaryLabel ? <Btn href={secondaryHref} secondary>{copy.ctaSecondaryLabel}</Btn> : null}
          </div>
        </div>
      </section>
    );
  }

  if (block.variant === "simple") {
    return (
      <Section className="text-center" narrow>
        {shop?.name ? <p className="lp-kicker mb-4 justify-center">{shop.name}</p> : null}
        <Display size="hero">{copy.title || "محصول"}</Display>
        {copy.subtitle ? <p className="lp-lead mx-auto mt-4">{copy.subtitle}</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {copy.ctaLabel ? <Btn href={primaryHref}>{copy.ctaLabel}</Btn> : null}
        </div>
      </Section>
    );
  }

  // fullscreen / image / with-video / dual-cta / slider / form / search / counters
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "var(--lp-hero-min)" }}>
      <LandingMedia
        blockId={block.id}
        field="bgImageUrl"
        src={img}
        fill
        priority
        editorMode={editorMode}
        slotLabel="تصویر پس‌زمینهٔ هیرو"
        slotHint="عکس بزرگ محصول یا محیط کار را اینجا بگذارید"
      />
      <div className="absolute inset-0 z-[1]" style={{ background: "var(--lp-hero-overlay)", pointerEvents: "none" }} />
      <div
        className="relative z-10 mx-auto flex min-h-[inherit] max-w-5xl flex-col justify-end pb-14 pt-24 text-white @[768px]:pb-20"
        style={{ paddingInline: "var(--lp-pad-x)" }}
      >
        {shop?.name ? <p className="lp-kicker mb-3 !text-white/90">{shop.name}</p> : null}
        <Display size="hero" className="max-w-3xl">
          {copy.title || "محصول"}
        </Display>
        {copy.subtitle ? (
          <p className="mt-4 max-w-xl text-base leading-8 text-white/80 @[768px]:text-lg">{copy.subtitle}</p>
        ) : null}
        {block.variant === "counters" && copy.items?.length ? (
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {copy.items.map((it, i) => (
              <div key={i} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-md">
                <p className="text-xl font-bold text-white @[768px]:text-2xl">{it.value}</p>
                <p className="mt-0.5 text-[11px] text-white/70">{it.title}</p>
              </div>
            ))}
          </div>
        ) : null}
        {(block.variant === "with-video" || block.variant === "slider") && (
          <div className="lp-media-frame mt-6 aspect-video max-w-xl" style={{ background: "#000" }}>
            {p.videoUrl ? (
              <video src={resolveMediaUrl(p.videoUrl)} controls className="h-full w-full object-contain" />
            ) : (
              <LandingMedia
                blockId={block.id}
                field="videoUrl"
                kind="video"
                src={null}
                editorMode={editorMode}
                slotLabel="ویدیوی معرفی محصول"
                slotHint="ویدیو یا لینک معرفی را اینجا بگذارید"
                className="absolute inset-0"
              />
            )}
          </div>
        )}
        {block.variant === "form" || block.variant === "search" ? (
          <form
            className="mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              className="lp-input flex-1"
              placeholder={block.variant === "search" ? "جستجو…" : "ایمیل یا موبایل"}
            />
            <Btn href={primaryHref}>{copy.ctaLabel || "ارسال"}</Btn>
          </form>
        ) : (
          <div className="mt-8 flex flex-wrap gap-3">
            {copy.ctaLabel ? <Btn href={primaryHref}>{copy.ctaLabel}</Btn> : null}
            {(block.variant === "dual-cta" || copy.ctaSecondaryLabel) && copy.ctaSecondaryLabel ? (
              <Btn href={secondaryHref} secondary>{copy.ctaSecondaryLabel}</Btn>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function BannerBlock({ block, locale }) {
  const copy = pickBlockLocale(block.props, locale);
  if (block.variant === "notice" || block.variant === "announcement" || block.variant === "offer") {
    return (
      <div className="px-[var(--lp-pad-x)] py-3">
        <div
          role="alert"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 rounded-[var(--lp-radius)] border px-4 py-3 shadow-sm"
          style={{
            background: "var(--lp-accent-soft)",
            borderColor: "var(--lp-border)",
            color: "var(--lp-fg)",
          }}
        >
          <span className="font-semibold">{copy.title}</span>
          {copy.ctaLabel ? <span className="text-sm opacity-80">{copy.ctaLabel}</span> : null}
        </div>
      </div>
    );
  }
  return (
    <div
      className="relative overflow-hidden py-3.5 text-center text-sm font-semibold tracking-wide"
      style={{ background: "var(--lp-accent)", color: "var(--lp-accent-fg)", paddingInline: "var(--lp-pad-x)" }}
    >
      <span className="relative z-10">
        {copy.title}
        {copy.ctaLabel ? <span className="ms-3 underline decoration-from-font underline-offset-4">{copy.ctaLabel}</span> : null}
      </span>
    </div>
  );
}

function FeaturesBlock({ block, locale, editorMode }) {
  const copy = pickBlockLocale(block.props, locale);
  const items = copy.items || [];
  if (block.variant === "zigzag" || block.variant === "timeline") {
    return (
      <Section>
        <SectionHead title={copy.title} subtitle={copy.body} />
        <div className="space-y-8 md:space-y-12">
          {items.map((it, i) => (
            <div key={`${it.title}-${i}`} className={`grid gap-6 @[768px]:grid-cols-2 ${block.variant === "zigzag" && i % 2 ? "@[768px]:[&>*:first-child]:order-2" : ""}`}>
              <div className="flex flex-col justify-center">
                {block.variant === "timeline" ? (
                  <p className="lp-kicker mb-2">{String(i + 1).padStart(2, "0")}</p>
                ) : null}
                <h3 className="text-lg font-bold tracking-tight sm:text-xl" style={{ color: "var(--lp-fg)" }}>
                  {it.title}
                </h3>
                {it.text ? <RichBody value={it.text} className="mt-3" /> : null}
              </div>
              {block.variant === "zigzag" ? (
                <div className="lp-media-frame relative min-h-[10rem] overflow-hidden">
                  <LandingMedia
                    blockId={block.id}
                    field="itemImage"
                    galleryIndex={i}
                    src={it.imageUrl || it.image}
                    fill
                    editorMode={editorMode}
                    slotLabel={`تصویر «${it.title || `ردیف ${i + 1}`}»`}
                    slotHint="عکس مرتبط با این ویژگی را آپلود کنید"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Section>
    );
  }
  const cols =
    block.variant === "fourCol"
      ? "@[640px]:grid-cols-2 @[1024px]:grid-cols-4"
      : block.variant === "threeCol" || block.variant === "icons"
        ? "@[640px]:grid-cols-3"
        : "@[640px]:grid-cols-2 @[1024px]:grid-cols-3";
  return (
    <Section>
      <SectionHead title={copy.title} subtitle={copy.body} center />
      <ul className={`grid gap-3 sm:gap-4 ${cols}`}>
        {items.map((it, i) => (
          <li key={`${it.title}-${i}`} className="lp-card p-5 sm:p-6 transition hover:-translate-y-0.5">
            <div
              className="mb-3 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: "var(--lp-accent-soft)", color: "var(--lp-accent)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="text-base font-bold tracking-tight sm:text-lg" style={{ color: "var(--lp-fg)" }}>
              {it.title}
            </h3>
            {it.text ? <RichBody value={it.text} className="mt-2 text-sm leading-7" style={{ color: "var(--lp-muted)" }} /> : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function GalleryBlock({ block, locale, editorMode }) {
  const copy = pickBlockLocale(block.props, locale);
  const raw = Array.isArray(block.props?.galleryUrls) ? block.props.galleryUrls : [];
  const fallback = block.props?.imageUrl || block.props?.bgImageUrl;
  const merged = raw.length ? [...raw] : fallback ? [fallback] : [];
  // حداقل ۳ جای عکس برای راهنمای کاربر (هیرو گالری)
  while (merged.length < 3) merged.push(null);
  const displayCount = Math.max(merged.length, editorMode ? 3 : merged.filter(Boolean).length || 3);

  if (block.variant === "fullwidth") {
    return (
      <div className="relative aspect-[21/9] w-full overflow-hidden" style={{ background: "var(--lp-bg-elevated)" }}>
        <LandingMedia
          blockId={block.id}
          field="galleryUrls"
          galleryIndex={0}
          src={merged[0]}
          fill
          editorMode={editorMode}
          slotLabel="تصویر تمام‌عرض گالری"
          slotHint="یک عکس عریض از محصول یا کارخانه آپلود کنید"
        />
      </div>
    );
  }
  if (block.variant === "beforeAfter") {
    return (
      <Section>
        {copy.title ? <Display className="mb-6">{copy.title}</Display> : null}
        <div className="grid gap-3 @[640px]:grid-cols-2">
          {["قبل", "بعد"].map((label, i) => (
            <div
              key={label}
              className="relative aspect-[4/3] overflow-hidden"
              style={{ borderRadius: "var(--lp-radius)", background: "var(--lp-bg-elevated)" }}
            >
              <LandingMedia
                blockId={block.id}
                field="galleryUrls"
                galleryIndex={i}
                src={merged[i]}
                fill
                editorMode={editorMode}
                slotLabel={`تصویر «${label}»`}
                slotHint="عکس قبل/بعد را اینجا آپلود کنید"
              />
              <span className="pointer-events-none absolute bottom-2 start-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                {label}
              </span>
            </div>
          ))}
        </div>
      </Section>
    );
  }
  const gridCls =
    block.variant === "masonry"
      ? "columns-2 gap-3 @[768px]:columns-3 [&>div]:mb-3"
      : block.variant === "carousel"
        ? "grid grid-flow-col auto-cols-[minmax(min(100%,220px),1fr)] gap-3 overflow-x-auto pb-1 snap-x"
        : "grid grid-cols-2 gap-3 @[768px]:grid-cols-3";
  const slots = Array.from({ length: Math.min(Math.max(displayCount, 3), 9) }, (_, i) => merged[i] || null);
  return (
    <Section>
      {copy.title ? <Display className="mb-6">{copy.title}</Display> : null}
      <div className={gridCls}>
        {slots.map((url, i) => (
          <div
            key={`g-${i}`}
            className="relative aspect-[4/3] overflow-hidden break-inside-avoid"
            style={{ borderRadius: "var(--lp-radius)", background: "var(--lp-bg-elevated)" }}
          >
            <LandingMedia
              blockId={block.id}
              field="galleryUrls"
              galleryIndex={i}
              src={url}
              fill
              editorMode={editorMode}
              slotLabel={i === 0 ? "عکس اصلی گالری" : `عکس ${i + 1} گالری`}
              slotHint="کلیک کنید و عکس محصول را آپلود کنید"
            />
          </div>
        ))}
      </div>
    </Section>
  );
}

function SpecsBlock({ block, locale }) {
  const copy = pickBlockLocale(block.props, locale);
  const rows = block.props?.specRows || [];
  return (
    <Section>
      <SectionHead title={copy.title || "مشخصات"} subtitle={copy.subtitle || copy.body} />
      {block.variant === "chips" ? (
        <div className="flex flex-wrap gap-2">
          {rows.map((r, i) => (
            <span
              key={i}
              className="px-3 py-1.5 text-xs font-semibold"
              style={{
                border: "1px solid var(--lp-border)",
                borderRadius: "var(--lp-radius-btn)",
                background: "var(--lp-accent-soft)",
                color: "var(--lp-fg)",
              }}
            >
              {r.key}
              {r.value ? `: ${r.value}` : ""}
            </span>
          ))}
        </div>
      ) : (
        <dl className="lp-card overflow-hidden">
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-1 border-b px-4 py-3.5 last:border-0 sm:grid-cols-[minmax(8rem,0.38fr)_1fr] sm:items-center sm:gap-6 sm:px-5"
              style={{
                borderColor: "var(--lp-border)",
                background: i % 2 ? "var(--lp-accent-soft)" : "transparent",
              }}
            >
              <dt className="text-xs font-bold sm:text-sm" style={{ color: "var(--lp-muted)" }}>
                {r.key}
              </dt>
              <dd className="text-sm font-semibold break-words sm:text-base" style={{ color: "var(--lp-fg)" }}>
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Section>
  );
}

function PricingBlock({ block, locale, shop }) {
  const copy = pickBlockLocale(block.props, locale);
  const href = block.props?.buttonHref || telHref(shop?.phone) || waHref(shop?.whatsapp) || "#";
  return (
    <Section className="text-center" narrow>
      <SectionHead title={copy.title || "قیمت"} center />
      <div className="lp-card mx-auto max-w-md px-6 py-8">
        {copy.subtitle ? (
          <p className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "var(--lp-accent)" }}>
            {copy.subtitle}
          </p>
        ) : null}
        {copy.body ? <RichBody value={copy.body} className="mx-auto mt-3 max-w-sm" /> : null}
        <div className="mt-6 flex justify-center">{copy.ctaLabel ? <Btn href={href}>{copy.ctaLabel}</Btn> : null}</div>
      </div>
    </Section>
  );
}

function CtaBlock({ block, locale, shop }) {
  const copy = pickBlockLocale(block.props, locale);
  const p = block.props || {};
  const primary = p.buttonHref || telHref(p.contactPhone || shop?.phone) || waHref(p.contactWhatsapp || shop?.whatsapp) || "#";
  const secondary = p.buttonSecondaryHref || waHref(p.contactWhatsapp || shop?.whatsapp);
  const inner = (
    <>
      {copy.title ? <Display className="mb-3">{copy.title}</Display> : null}
      {copy.subtitle ? <p className="lp-lead mx-auto mb-7">{copy.subtitle}</p> : null}
      <div className="flex flex-wrap justify-center gap-3">
        {copy.ctaLabel ? <Btn href={primary}>{copy.ctaLabel}</Btn> : null}
        {copy.ctaSecondaryLabel ? <Btn href={secondary} secondary>{copy.ctaSecondaryLabel}</Btn> : null}
      </div>
    </>
  );
  if (block.variant === "floating") {
    return (
      <div className="lp-cta-floating sticky bottom-3 z-30 mx-auto flex w-full max-w-lg justify-center px-4 py-2">
        {copy.ctaLabel ? <Btn href={primary}>{copy.ctaLabel}</Btn> : null}
      </div>
    );
  }
  if (block.variant === "banner" || block.variant === "fullwidth") {
    return (
      <section
        className="relative overflow-hidden py-14 text-center sm:py-16"
        style={{
          background: "var(--lp-surface-2, var(--lp-bg-elevated))",
          borderBlock: "1px solid var(--lp-border)",
          paddingInline: "var(--lp-pad-x)",
        }}
      >
        <div className="relative z-10 mx-auto max-w-3xl">{inner}</div>
      </section>
    );
  }
  return <Section className="text-center">{inner}</Section>;
}

function ContactBlock({ block, locale, shop }) {
  const copy = pickBlockLocale(block.props, locale);
  const p = block.props || {};
  const contacts = Array.isArray(p.contacts) ? p.contacts : [];
  const legacyPhone = p.contactPhone || shop?.phone;
  const legacyWa = p.contactWhatsapp || shop?.whatsapp;

  const entries =
    contacts.length > 0
      ? contacts
      : legacyPhone || legacyWa
        ? [{ label: copy.title || "تماس", phone: legacyPhone, channels: { whatsapp: legacyWa } }]
        : [];

  return (
    <Section>
      {copy.title ? <Display className="mb-6">{copy.title}</Display> : null}
      <div className="space-y-4">
        {entries.map((c, i) => {
          const channels = c.channels || {};
          const phone = c.phone;
          return (
            <div key={c.id || i} className="lp-card p-4 sm:p-5">
              {(c.label || phone) && (
                <p className="mb-2 text-sm font-bold">
                  {c.label || "تماس"}
                  {phone ? <span className="ms-2 font-normal" style={{ color: "var(--lp-muted)" }} dir="ltr">{phone}</span> : null}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {phone ? <Btn href={telHref(phone)}>{copy.ctaLabel || phone}</Btn> : null}
                {Object.entries(channels).map(([key, val]) => {
                  const href =
                    key === "whatsapp"
                      ? waHref(val || phone)
                      : key === "email"
                        ? `mailto:${val}`
                        : key === "telegram"
                          ? String(val).startsWith("http")
                            ? val
                            : `https://t.me/${String(val).replace(/^@/, "")}`
                          : key === "instagram"
                            ? String(val).startsWith("http")
                              ? val
                              : `https://instagram.com/${String(val).replace(/^@/, "")}`
                            : key === "linkedin"
                              ? String(val).startsWith("http")
                                ? val
                                : `https://www.linkedin.com/in/${String(val).replace(/^@/, "")}`
                              : key === "eitaa"
                                ? String(val).startsWith("http")
                                  ? val
                                  : `https://eitaa.com/${String(val).replace(/^@/, "")}`
                                : key === "bale"
                                  ? String(val).startsWith("http")
                                    ? val
                                    : `https://ble.ir/${String(val).replace(/^@/, "")}`
                                  : null;
                  if (!href) return null;
                  const labels = {
                    whatsapp: "واتساپ",
                    telegram: "تلگرام",
                    eitaa: "ایتا",
                    rubika: "روبیکا",
                    bale: "بله",
                    instagram: "اینستاگرام",
                    linkedin: "لینکدین",
                    email: "ایمیل",
                  };
                  return (
                    <Btn key={key} href={href} secondary>
                      {labels[key] || key}
                    </Btn>
                  );
                })}
              </div>
            </div>
          );
        })}
        {shop?.slug ? (
          <Link href={`/${shop.slug}`} className="inline-flex min-h-11 items-center text-sm underline" style={{ color: "var(--lp-muted)" }}>
            صفحه فروشگاه
          </Link>
        ) : null}
      </div>
      {block.variant === "rfq" ? (
        <p className="mt-6 text-sm" style={{ color: "var(--lp-muted)" }}>
          برای RFQ از یکی از راه‌های تماس بالا استفاده کنید.
        </p>
      ) : null}
    </Section>
  );
}

function FaqBlock({ block, locale }) {
  const copy = pickBlockLocale(block.props, locale);
  const [open, setOpen] = useState(0);
  const items = copy.items || [];
  if (block.variant === "twoCol") {
    return (
      <Section>
        {copy.title ? <Display className="mb-6">{copy.title}</Display> : null}
        <div className="grid gap-4 @[640px]:grid-cols-2">
          {items.map((it, i) => (
            <div key={i} className="p-4" style={{ border: "1px solid var(--lp-border)", borderRadius: "var(--lp-radius)" }}>
              <h3 className="text-sm font-bold">{it.title}</h3>
              {it.text ? <RichBody value={it.text} className="mt-2 text-sm leading-7" style={{ color: "var(--lp-muted)" }} /> : null}
            </div>
          ))}
        </div>
      </Section>
    );
  }
  if (block.variant === "tabs") {
    return (
      <Section>
        {copy.title ? <Display className="mb-6">{copy.title}</Display> : null}
        <div className="mb-4 flex flex-wrap gap-2">
          {items.map((it, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(i)}
              className="rounded px-3 py-1.5 text-xs font-bold"
              style={{
                background: open === i ? "var(--lp-accent)" : "var(--lp-bg-elevated)",
                color: open === i ? "var(--lp-accent-fg)" : "var(--lp-fg)",
              }}
            >
              {it.title}
            </button>
          ))}
        </div>
        {items[open]?.text ? <p className="text-sm leading-7" style={{ color: "var(--lp-muted)" }}>{items[open].text}</p> : null}
      </Section>
    );
  }
  return (
    <Section>
      {copy.title ? <Display className="mb-6">{copy.title}</Display> : null}
      <div className="flex w-full flex-col gap-2">
        {items.map((it, i) => (
          <details
            key={i}
            className="lp-card group open:shadow-md"
            open={i === 0 ? true : undefined}
          >
            <summary className="cursor-pointer list-none px-4 py-3.5 text-sm font-bold marker:content-none" style={{ color: "var(--lp-fg)" }}>
              <span className="flex items-center justify-between gap-3">
                {it.title}
                <span className="text-lg leading-none text-[var(--lp-muted)] transition group-open:rotate-45">+</span>
              </span>
            </summary>
            {it.text ? (
              <div className="border-t px-4 pb-4 pt-2" style={{ borderColor: "var(--lp-border)" }}>
                <RichBody value={it.text} className="text-sm leading-7" style={{ color: "var(--lp-muted)" }} />
              </div>
            ) : null}
          </details>
        ))}
      </div>
    </Section>
  );
}

function ReviewsBlock({ block, locale }) {
  const copy = pickBlockLocale(block.props, locale);
  return (
    <Section>
      {copy.title ? <Display className="mb-6">{copy.title}</Display> : null}
      <div className="grid gap-4 @[640px]:grid-cols-2 @[1024px]:grid-cols-3">
        {(copy.items || []).map((it, i) => (
          <article key={i} className="p-4" style={{ background: "var(--lp-bg-elevated)", borderRadius: "var(--lp-radius)", border: "1px solid var(--lp-border)" }}>
            {it.value ? <p className="text-xs font-bold" style={{ color: "var(--lp-accent)" }}>{"★".repeat(Math.min(5, Number(it.value) || 5))}</p> : null}
            <p className="mt-2 text-sm font-bold">{it.title}</p>
            {it.text ? <RichBody value={it.text} className="mt-1 text-sm leading-7" style={{ color: "var(--lp-muted)" }} /> : null}
          </article>
        ))}
      </div>
    </Section>
  );
}

function StatsBlock({ block, locale }) {
  const copy = pickBlockLocale(block.props, locale);
  const items = copy.items || [];
  if (block.variant === "progress" || block.variant === "percent") {
    return (
      <Section>
        {copy.title ? <Display className="mb-8">{copy.title}</Display> : null}
        <div className="space-y-4">
          {items.map((it, i) => {
            const pct = Math.min(100, parseInt(String(it.value).replace(/\D/g, ""), 10) || 0);
            return (
              <div key={i}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{it.title}</span>
                  <span style={{ color: "var(--lp-accent)" }}>{it.value}</span>
                </div>
                <div className="h-2 overflow-hidden" style={{ background: "var(--lp-bg-elevated)", borderRadius: "var(--lp-radius)" }}>
                  <div className="h-full" style={{ width: `${pct}%`, background: "var(--lp-accent)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    );
  }
  if (block.variant === "chart") {
    const max = Math.max(...items.map((it) => Number(it.value) || 0), 1);
    return (
      <Section>
        {copy.title ? <Display className="mb-8 text-center">{copy.title}</Display> : null}
        <div className="flex h-40 items-end justify-center gap-3">
          {items.map((it, i) => (
            <div key={i} className="flex w-12 flex-col items-center gap-2">
              <div className="w-full" style={{ height: `${((Number(it.value) || 0) / max) * 100}%`, background: "var(--lp-accent)", borderRadius: "var(--lp-radius)" }} />
              <span className="text-[10px]" style={{ color: "var(--lp-muted)" }}>{it.title}</span>
            </div>
          ))}
        </div>
      </Section>
    );
  }
  return (
    <Section>
      <SectionHead title={copy.title} center />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div key={i} className="lp-card px-5 py-6 text-center">
            <p className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "var(--lp-accent)" }}>
              {it.value}
            </p>
            <p className="mt-2 text-sm font-bold" style={{ color: "var(--lp-fg)" }}>
              {it.title}
            </p>
            {it.text ? (
              <p className="mt-1 text-xs leading-5" style={{ color: "var(--lp-muted)" }}>
                {it.text}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}

function VideoBlock({ block, locale, editorMode }) {
  const copy = pickBlockLocale(block.props, locale);
  const url = resolveMediaUrl(block.props?.videoUrl);
  const embedRaw = block.props?.mapEmbedUrl || block.props?.videoUrl || "";
  const isEmbed = ["youtube", "aparat", "vimeo", "embed"].includes(block.variant);
  let embedSrc = embedRaw;
  if (block.variant === "youtube" && embedRaw && !embedRaw.includes("embed")) {
    const id = String(embedRaw).match(/(?:v=|youtu\.be\/)([\w-]+)/)?.[1];
    if (id) embedSrc = `https://www.youtube.com/embed/${id}`;
  }
  const hasMedia = (isEmbed && embedSrc && String(embedSrc).includes("http")) || Boolean(url);
  return (
    <Section>
      {copy.title ? <Display className="mb-6">{copy.title}</Display> : null}
      <div className="relative aspect-video overflow-hidden" style={{ background: "#0a0a0a", borderRadius: "var(--lp-radius)" }}>
        {isEmbed && embedSrc && String(embedSrc).includes("http") ? (
          <iframe title={copy.title || "video"} src={embedSrc} className="h-full w-full" allowFullScreen />
        ) : url ? (
          <video src={url} controls className="h-full w-full object-contain" />
        ) : (
          <LandingMedia
            blockId={block.id}
            field="videoUrl"
            kind="video"
            src={null}
            fill
            editorMode={editorMode}
            slotLabel="ویدیو اینجا پخش می‌شود"
            slotHint="ویدیوی معرفی محصول را آپلود کنید"
          />
        )}
      </div>
    </Section>
  );
}

function CardsListBlock({ block, locale, titleFallback, editorMode }) {
  const copy = pickBlockLocale(block.props, locale);
  const urls = (block.props?.galleryUrls || []).map(resolveMediaUrl).filter(Boolean);
  return (
    <Section>
      <SectionHead title={copy.title || titleFallback} subtitle={copy.subtitle} />
      {(copy.items || []).length ? (
        <ul className="grid gap-3 sm:gap-4 @[640px]:grid-cols-2 @[1024px]:grid-cols-3">
          {copy.items.map((it, i) => (
            <li key={i} className="lp-card p-4 sm:p-5">
              <h3 className="text-base font-bold tracking-tight" style={{ color: "var(--lp-fg)" }}>
                {it.title}
              </h3>
              {it.text ? <RichBody value={it.text} className="mt-2 text-sm" /> : null}
              {it.value ? (
                <p className="mt-3 text-xl font-extrabold" style={{ color: "var(--lp-accent)" }}>
                  {it.value}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {urls.length || editorMode ? (
        <div className="mt-6 grid grid-cols-2 gap-3 @[768px]:grid-cols-3">
          {Array.from({ length: Math.max(urls.length, 3) }, (_, i) => (
            <div key={`c-${i}`} className="lp-media-frame relative aspect-[4/3]">
              <LandingMedia
                blockId={block.id}
                field="galleryUrls"
                galleryIndex={i}
                src={block.props?.galleryUrls?.[i] || null}
                fill
                editorMode={editorMode}
                slotLabel={`تصویر ${i + 1}`}
                slotHint="عکس این بخش را آپلود کنید"
              />
            </div>
          ))}
        </div>
      ) : null}
      {copy.body ? <RichBody value={copy.body} className="mt-6" /> : null}
    </Section>
  );
}

function MapBlock({ block, locale, editorMode }) {
  const copy = pickBlockLocale(block.props, locale);
  const p = block.props || {};
  const address = p.mapAddress;
  const place = p.mapPlaceName || copy.title;
  const lat = p.mapLat != null && p.mapLat !== "" ? Number(p.mapLat) : null;
  const lng = p.mapLng != null && p.mapLng !== "" ? Number(p.mapLng) : null;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const mapsOpenUrl = hasCoords
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : null;

  return (
    <Section>
      <SectionHead title={copy.title || "موقعیت"} subtitle={copy.subtitle} />
      <div className="lp-card overflow-hidden">
        <div className="space-y-4 p-4 sm:p-5">
          {(place || address || hasCoords) && (
            <div className="space-y-1">
              {place ? (
                <p className="text-base font-bold" style={{ color: "var(--lp-fg)" }}>
                  {place}
                </p>
              ) : null}
              {address ? (
                <p className="text-sm leading-7" style={{ color: "var(--lp-muted)" }}>
                  {address}
                </p>
              ) : null}
              {hasCoords ? (
                <p className="font-mono text-xs opacity-60" dir="ltr">
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </p>
              ) : null}
            </div>
          )}
          <LandingMapPicker
            lat={hasCoords ? lat : null}
            lng={hasCoords ? lng : null}
            placeName={place}
            address={address}
            editable={false}
            height="320px"
          />
          {editorMode && !hasCoords ? (
            <p className="text-center text-xs" style={{ color: "var(--lp-muted)" }}>
              برای نمایش مارکر، در تنظیمات بلوک روی نقشه کلیک کنید و موقعیت را ذخیره کنید.
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2">
            {mapsOpenUrl ? (
              <a href={mapsOpenUrl} target="_blank" rel="noopener noreferrer" className="lp-btn lp-btn-primary">
                {copy.ctaLabel || "باز کردن در نقشه"}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}

function TimelineStepsBlock({ block, locale }) {
  const copy = pickBlockLocale(block.props, locale);
  const items = copy.items || [];
  return (
    <Section>
      <SectionHead title={copy.title} subtitle={copy.subtitle || copy.body} center />
      <ol className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <li key={i} className="lp-card relative p-4 sm:p-5">
            <span
              className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: "var(--lp-accent)", color: "var(--lp-accent-fg)" }}
            >
              {i + 1}
            </span>
            <p className="text-sm font-bold" style={{ color: "var(--lp-fg)" }}>
              {it.title}
            </p>
            {it.text ? (
              <p className="mt-1.5 text-xs leading-5" style={{ color: "var(--lp-muted)" }}>
                {it.text}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}

function FactoryBlock(props) {
  if (props.block?.variant === "capacity" && props.block?.props?.specRows?.length) {
    return <SpecsBlock {...props} />;
  }
  return <CardsListBlock {...props} titleFallback="کارخانه" />;
}

function QrCodeBlock({ block, locale, shop, product, landing, editorMode }) {
  const copy = pickBlockLocale(block.props, locale);
  const compact = block.variant === "compact";
  const shopSlug = shop?.slug;
  const landingSlug = landing?.slug;
  const landingAbs = landingPageAbsoluteUrl(shopSlug, landingSlug);
  const catalogPath = product ? catalogProductPath(product) : null;
  const pathOrUrl = landingAbs || catalogPath;
  const title =
    copy.title ||
    product?.name ||
    (product ? getLocalizedText(product, locale) : "") ||
    landingSlug ||
    "محصول";

  if (!pathOrUrl) {
    if (!editorMode) return null;
    return (
      <Section>
        <div className="card border border-dashed border-base-300 bg-base-100">
          <div className="card-body items-center text-center">
            <p className="font-bold">{copy.title || "QR کد محصول"}</p>
            <p className="text-xs opacity-60">
              پس از انتشار لندینگ (با اسلاگ فروشگاه) یا اتصال محصول، QR اینجا نمایش داده می‌شود.
            </p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className={`mx-auto ${compact ? "max-w-xs" : "max-w-sm"}`}>
        <ProductPageQrCode
          pathOrUrl={pathOrUrl}
          title={title}
          heading={copy.title || "QR کد این صفحه"}
          scanHint="اسکن کنید تا صفحهٔ محصول / لندینگ باز شود"
          slugHint={landingSlug || product?.slug || product?.id || "product"}
          compact={compact}
        />
        {copy.subtitle ? <p className="mt-3 text-center text-sm opacity-70">{copy.subtitle}</p> : null}
      </div>
    </Section>
  );
}

function FooterBlock({ block, locale, shop }) {
  const copy = pickBlockLocale(block.props, locale);
  return (
    <footer className="py-10 text-center text-xs" style={{ borderTop: "1px solid var(--lp-border)", color: "var(--lp-muted)", paddingInline: "var(--lp-pad-x)" }}>
      <p className="font-semibold" style={{ color: "var(--lp-fg)" }}>{copy.title || shop?.name || "Zareoon"}</p>
      {(block.variant === "columns" || block.variant === "corporate") && copy.items?.length ? (
        <ul className="mt-4 flex flex-wrap justify-center gap-4">
          {copy.items.map((it, i) => (
            <li key={i}>{it.title}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-4">
        <Link href="/" className="hover:underline">
          Powered by Zareoon
        </Link>
      </p>
    </footer>
  );
}

function columnGridClass(variant, stackOnMobile) {
  const stack = stackOnMobile !== false;
  if (variant === "three") return stack ? "grid-cols-1 md:grid-cols-3" : "grid-cols-3";
  if (variant === "aside") return stack ? "grid-cols-1 md:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]" : "grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]";
  if (variant === "aside-start") return stack ? "grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)]" : "grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)]";
  return stack ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2";
}

function ColumnLayoutBlock({ block, locale, shop, product, offer, landing, editorMode, pageFonts }) {
  const props = block.props || {};
  const columns = Array.isArray(props.columns) ? props.columns : [];
  const gap = { sm: "gap-3 md:gap-4", md: "gap-4 md:gap-6", lg: "gap-6 md:gap-8" }[props.columnGap || "md"] || "gap-4 md:gap-6";
  const gridClass = columnGridClass(block.variant, props.stackOnMobile);
  const copy = pickBlockLocale(props, locale);

  return (
    <section className="lp-section" style={{ paddingBlock: "var(--lp-section-y)", paddingInline: "var(--lp-pad-x)" }}>
      <div className="lp-container">
        {copy.title ? (
          <div className="mb-6 max-w-3xl">
            <Display>{copy.title}</Display>
            {copy.subtitle ? <p className="lp-lead mt-2">{copy.subtitle}</p> : null}
          </div>
        ) : null}
        <div className={`grid ${gridClass} ${gap}`}>
          {columns.map((col, colIdx) => {
            const nested = (col.blocks || []).filter((b) => b && !b.hidden);
            return (
              <div
                key={col.id || `col-${colIdx}`}
                className="lp-column-cell min-w-0 space-y-3 [&_.lp-section]:!px-0 [&_.lp-section]:!py-3 [&_.lp-container]:!mx-0 [&_.lp-container]:!max-w-none [&_.lp-container]:!px-0 [&_.lp-block-shell]:!ring-0"
              >
                {nested.length ? (
                  nested.map((nb) => (
                    <BlockView
                      key={nb.id}
                      block={nb}
                      locale={locale}
                      shop={shop}
                      product={product}
                      offer={offer}
                      landing={landing}
                      editorMode={editorMode}
                      pageFonts={pageFonts}
                      nested
                    />
                  ))
                ) : editorMode ? (
                  <div
                    className="flex min-h-[88px] items-center justify-center rounded-xl border border-dashed text-center text-[11px]"
                    style={{ borderColor: "var(--lp-border)", color: "var(--lp-muted)" }}
                  >
                    ستون {colIdx + 1} خالی — از تنظیمات بلوک اضافه کنید
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const RENDERERS = {
  columnLayout: ColumnLayoutBlock,
  hero: HeroBlock,
  banner: BannerBlock,
  productShowcase: (props) => <CardsListBlock {...props} titleFallback="محصولات" />,
  features: FeaturesBlock,
  gallery: GalleryBlock,
  specifications: SpecsBlock,
  pricing: PricingBlock,
  buy: BuyBlock,
  productStock: ProductStockBlock,
  sellerActions: SellerActionsBlock,
  cta: CtaBlock,
  contact: ContactBlock,
  faq: FaqBlock,
  reviews: ReviewsBlock,
  statistics: StatsBlock,
  team: (props) => <CardsListBlock {...props} titleFallback="تیم" />,
  company: (props) => <CardsListBlock {...props} titleFallback="درباره ما" />,
  factory: FactoryBlock,
  certificates: (props) => <CardsListBlock {...props} titleFallback="گواهی‌ها" />,
  downloads: (props) => <CardsListBlock {...props} titleFallback="دانلودها" />,
  video: VideoBlock,
  timeline: TimelineStepsBlock,
  logistics: (props) => <CardsListBlock {...props} titleFallback="لجستیک" />,
  payment: (props) => <CardsListBlock {...props} titleFallback="پرداخت" />,
  map: MapBlock,
  qrCode: QrCodeBlock,
  blog: (props) => <CardsListBlock {...props} titleFallback="مقالات" />,
  social: (props) => <CardsListBlock {...props} titleFallback="شبکه‌ها" />,
  b2b: (props) => <CardsListBlock {...props} titleFallback="B2B" />,
  footer: FooterBlock,
};

function BlockView({ block, locale, shop, product, offer, landing = null, editorMode = false, pageFonts = null, nested = false }) {
  const { editMode } = useLandingEdit();
  if (!block || block.hidden) return null;
  const resolved = resolveBlockTypeVariant(block.type, block.variant);
  const Comp = RENDERERS[resolved.type] || RENDERERS[block.type];
  if (!Comp) {
    return (
      <Section>
        <p className="text-xs" style={{ color: "var(--lp-muted)" }}>
          بلوک ناشناخته: {block.type}/{block.variant}
        </p>
      </Section>
    );
  }
  const normalizedBlock =
    resolved.type !== block.type || resolved.variant !== block.variant
      ? { ...block, type: resolved.type, variant: resolved.variant }
      : block;
  const m = block.responsive?.mobile || {};
  const d = block.responsive?.desktop || {};
  const fontStack = resolveBlockFontStack(block, pageFonts || {}, locale);
  const shellStyle = {
    fontFamily: fontStack,
    "--lp-bm-w": m.widthPct != null ? `${m.widthPct}%` : "100%",
    "--lp-bm-mh": m.minHeight != null ? `${m.minHeight}px` : "unset",
    "--lp-bm-mt": m.marginTop != null ? `${m.marginTop}px` : "0px",
    "--lp-bm-mb": m.marginBottom != null ? `${m.marginBottom}px` : "0px",
    "--lp-bm-py": m.paddingY != null ? `${m.paddingY}px` : "0px",
    "--lp-bd-w": d.widthPct != null ? `${d.widthPct}%` : null,
    "--lp-bd-mh": d.minHeight != null ? `${d.minHeight}px` : null,
    "--lp-bd-mt": d.marginTop != null ? `${d.marginTop}px` : null,
    "--lp-bd-mb": d.marginBottom != null ? `${d.marginBottom}px` : null,
    "--lp-bd-py": d.paddingY != null ? `${d.paddingY}px` : null,
  };
  return (
    <div
      className={`lp-block-shell relative ${editMode && !nested ? "pt-11 ring-1 ring-emerald-200/70 ring-offset-0" : ""} ${nested && editMode ? "rounded-lg ring-1 ring-emerald-100" : ""}`}
      style={shellStyle}
      lang={locale}
      data-block-type={normalizedBlock.type}
      data-nested={nested ? "1" : undefined}
    >
      {!nested ? <BlockOwnerToolbar block={normalizedBlock} landing={landing} product={product} shop={shop} locale={locale} /> : null}
      <Comp
        block={normalizedBlock}
        locale={locale}
        shop={shop}
        product={product}
        offer={offer}
        landing={landing}
        editorMode={editorMode}
        pageFonts={pageFonts}
      />
    </div>
  );
}

export default memo(BlockView);
