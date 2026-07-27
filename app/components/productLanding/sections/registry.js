/**
 * Sections = ترکیب چند Block کاربردی
 */

import { createBlockInstance, defaultProps } from "../blocks/registry";

function seed(type, variant, propsPatch = {}) {
  const inst = createBlockInstance(type, variant);
  if (!inst) return null;
  inst.props = {
    ...inst.props,
    ...propsPatch,
    fa: { ...(inst.props.fa || {}), ...(propsPatch.fa || {}) },
    en: { ...(inst.props.en || {}), ...(propsPatch.en || {}) },
    ar: { ...(inst.props.ar || {}), ...(propsPatch.ar || {}) },
  };
  if (propsPatch.specRows) inst.props.specRows = propsPatch.specRows;
  return inst;
}

export const SECTION_LIBRARY = [
  {
    id: "sec-hero-product",
    labelFa: "هیرو محصول",
    group: "hero",
    blocks: [{ type: "hero", variant: "fullscreen" }],
  },
  {
    id: "sec-hero-export",
    labelFa: "هیرو صادراتی",
    group: "hero",
    blocks: [
      { type: "banner", variant: "notice" },
      { type: "hero", variant: "split" },
    ],
  },
  {
    id: "sec-commerce",
    labelFa: "خرید و موجودی",
    group: "commerce",
    blocks: [
      { type: "buy", variant: "card" },
      { type: "productStock", variant: "overview" },
      { type: "sellerActions", variant: "bar" },
    ],
  },
  {
    id: "sec-specs-trade",
    labelFa: "مشخصات تجاری",
    group: "content",
    blocks: [
      { type: "specifications", variant: "table" },
      { type: "logistics", variant: "cards" },
      { type: "payment", variant: "methods" },
    ],
  },
  {
    id: "sec-trust",
    labelFa: "اعتماد",
    group: "trust",
    blocks: [
      { type: "statistics", variant: "counters" },
      { type: "certificates", variant: "grid" },
      { type: "reviews", variant: "grid" },
    ],
  },
  {
    id: "sec-media",
    labelFa: "رسانه محصول",
    group: "media",
    blocks: [
      { type: "gallery", variant: "grid" },
      { type: "video", variant: "embed" },
      { type: "downloads", variant: "list" },
    ],
  },
  {
    id: "sec-process",
    labelFa: "فرآیند همکاری",
    group: "trust",
    blocks: [
      { type: "timeline", variant: "steps" },
      { type: "features", variant: "cards" },
    ],
  },
  {
    id: "sec-seo-content",
    labelFa: "محتوای سئو کاتالوگ",
    group: "content",
    blocks: [
      { type: "company", variant: "about" },
      { type: "features", variant: "cards" },
      { type: "faq", variant: "accordion" },
    ],
  },
  {
    id: "sec-contact-close",
    labelFa: "تماس پایانی",
    group: "action",
    blocks: [
      { type: "sellerActions", variant: "bar" },
      { type: "map", variant: "location" },
      { type: "qrCode", variant: "card" },
      { type: "cta", variant: "banner" },
      { type: "contact", variant: "quick" },
      { type: "faq", variant: "accordion" },
      { type: "footer", variant: "columns" },
    ],
  },
  {
    id: "sec-qr",
    labelFa: "QR کد محصول",
    group: "action",
    blocks: [{ type: "qrCode", variant: "card" }],
  },
  {
    id: "sec-columns-media-text",
    labelFa: "ردیف دوستونه (رسانه + متن)",
    group: "layout",
    blocks: [
      {
        type: "columnLayout",
        variant: "two",
        props: {
          fa: { title: "", subtitle: "", body: "", ctaLabel: "", ctaSecondaryLabel: "", items: [] },
        },
      },
    ],
  },
];

export function expandSection(sectionId) {
  const sec = SECTION_LIBRARY.find((s) => s.id === sectionId);
  if (!sec) return [];
  return sec.blocks
    .map((b) => seed(b.type, b.variant, b.props || {}))
    .filter(Boolean)
    .map((b, i) => ({
      ...b,
      id: `blk_${sectionId}_${Date.now().toString(36)}_${i}`,
    }));
}

export function listSections() {
  return SECTION_LIBRARY.map((s) => ({
    id: s.id,
    labelFa: s.labelFa,
    group: s.group,
    blockCount: s.blocks.length,
  }));
}

export function expandRecipeSections(recipe = {}) {
  const out = [];
  if (Array.isArray(recipe.sections)) {
    for (const s of recipe.sections) {
      if (s.sectionId) out.push(...expandSection(s.sectionId));
      else if (s.type) {
        const inst = seed(s.type, s.variant || "default", s.props || {});
        if (inst) out.push(inst);
      }
    }
  }
  if (Array.isArray(recipe.blocks)) {
    for (const b of recipe.blocks) {
      if (b.sectionId) out.push(...expandSection(b.sectionId));
      else {
        const inst = seed(b.type, b.variant || "default", b.props || {});
        if (inst) {
          if (b.hidden) inst.hidden = true;
          out.push(inst);
        }
      }
    }
  }
  return out;
}

export { defaultProps };
