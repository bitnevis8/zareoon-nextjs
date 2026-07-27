/**
 * Blocks → Sections → Templates → Themes → Landing
 * کتابخانهٔ جمع‌وجور برای لندینگ B2B بین‌المللی — فقط بلوک‌های کاربردی
 */

function emptyLang(cta = "") {
  return { title: "", subtitle: "", body: "", ctaLabel: cta, ctaSecondaryLabel: "", items: [] };
}

export function defaultProps(extra = {}) {
  return {
    fa: emptyLang(),
    en: emptyLang(),
    ar: emptyLang(),
    imageUrl: null,
    videoUrl: null,
    galleryUrls: [],
    contactPhone: null,
    contactWhatsapp: null,
    contactEmail: null,
    contactTelegram: null,
    mapEmbedUrl: null,
    mapAddress: null,
    mapLat: null,
    mapLng: null,
    mapPlaceName: null,
    buttonHref: null,
    buttonSecondaryHref: null,
    bgImageUrl: null,
    specRows: [],
    extra: {},
    ...extra,
  };
}

function v(labelFa, propsFactory) {
  return {
    labelFa,
    defaultProps: typeof propsFactory === "function" ? propsFactory : () => defaultProps(propsFactory || {}),
  };
}

function withTitle(title, cta = "", items = []) {
  return () => defaultProps({ fa: { ...emptyLang(cta), title, items } });
}

function emptyColumn() {
  return {
    id: `col_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    blocks: [],
  };
}

function makeColumns(count) {
  return Array.from({ length: count }, () => emptyColumn());
}

function columnLayoutDefaults(count, title = "ردیف چندستونه") {
  return () =>
    defaultProps({
      fa: { ...emptyLang(), title },
      stackOnMobile: true,
      columnGap: "md",
      columns: makeColumns(count),
    });
}

/** گروه‌های معنایی — بدون دستهٔ جدا برای daisyUI */
export const BLOCK_GROUPS = [
  { id: "hero", labelFa: "هیرو" },
  { id: "content", labelFa: "محتوا" },
  { id: "media", labelFa: "رسانه" },
  { id: "commerce", labelFa: "فروش" },
  { id: "trust", labelFa: "اعتماد" },
  { id: "action", labelFa: "اقدام و تماس" },
  { id: "layout", labelFa: "چیدمان" },
];

/**
 * type → variants
 * هر variant باید UI متمایز داشته باشد؛ واریانت‌های الکی حذف شده‌اند.
 */
export const BLOCK_LIBRARY = {
  columnLayout: {
    group: "layout",
    labelFa: "ردیف چندستونه",
    variants: {
      two: v("دو ستون مساوی", columnLayoutDefaults(2, "دو ستون")),
      three: v("سه ستون", columnLayoutDefaults(3, "سه ستون")),
      aside: v("اصلی + کناری", columnLayoutDefaults(2, "اصلی و کناری")),
      "aside-start": v("کناری + اصلی", columnLayoutDefaults(2, "کناری و اصلی")),
    },
  },
  hero: {
    group: "hero",
    labelFa: "هیرو",
    variants: {
      fullscreen: v("تمام‌صفحه", withTitle("عنوان محصول", "درخواست قیمت")),
      split: v("دو ستونه", withTitle("عنوان محصول", "تماس")),
      simple: v("ساده", withTitle("عنوان محصول", "ادامه")),
    },
  },
  banner: {
    group: "hero",
    labelFa: "بنر / اعلان",
    variants: {
      notice: v("اعلان", withTitle("پیام مهم برای خریداران")),
    },
  },
  features: {
    group: "content",
    labelFa: "ویژگی‌ها",
    variants: {
      cards: v("کارت‌ها", withTitle("مزایا", "", [
        { title: "کیفیت صادراتی", text: "استاندارد بین‌المللی" },
        { title: "تحویل به‌موقع", text: "برنامهٔ لجستیک مشخص" },
        { title: "پشتیبانی", text: "هماهنگی مستقیم با فروشنده" },
      ])),
    },
  },
  specifications: {
    group: "content",
    labelFa: "مشخصات",
    variants: {
      table: v("جدول", () =>
        defaultProps({
          fa: { ...emptyLang(), title: "مشخصات فنی و تجاری" },
          specRows: [
            { key: "MOQ", value: "—" },
            { key: "Incoterms", value: "FOB / CIF / EXW" },
            { key: "HS Code", value: "—" },
            { key: "کشور مبدأ", value: "ایران" },
          ],
        })
      ),
    },
  },
  pricing: {
    group: "commerce",
    labelFa: "قیمت",
    variants: {
      simple: v("ساده", withTitle("قیمت", "درخواست قیمت")),
      rfq: v("درخواست قیمت", withTitle("استعلام قیمت", "ارسال RFQ")),
    },
  },
  buy: {
    group: "commerce",
    labelFa: "خرید / سبد",
    variants: {
      card: v("کارت سفارش", withTitle("سفارش و خرید", "افزودن به سبد")),
      sticky: v("چسبان پایین", withTitle("سفارش سریع", "افزودن به سبد")),
    },
  },
  productStock: {
    group: "commerce",
    labelFa: "موجودی",
    variants: {
      overview: v("نمای کلی", withTitle("موجودی انبار")),
    },
  },
  sellerActions: {
    group: "commerce",
    labelFa: "فروشنده",
    variants: {
      bar: v("نوار ارتباط", withTitle("ارتباط با فروشنده", "گفتگو با فروشنده")),
    },
  },
  productShowcase: {
    group: "media",
    labelFa: "نمایش محصول",
    variants: {
      grid: v("گرید", withTitle("محصولات مرتبط")),
      featured: v("ویژه", withTitle("محصول ویژه", "مشاهده")),
    },
  },
  gallery: {
    group: "media",
    labelFa: "گالری",
    variants: {
      grid: v("گرید", withTitle("گالری تصاویر")),
      carousel: v("اسلایدر", withTitle("گالری")),
    },
  },
  video: {
    group: "media",
    labelFa: "ویدیو",
    variants: {
      embed: v("جاسازی", withTitle("ویدیو معرفی")),
    },
  },
  statistics: {
    group: "trust",
    labelFa: "آمار",
    variants: {
      counters: v("شمارنده", withTitle("در یک نگاه", "", [
        { title: "سال تجربه", value: "۱۰+" },
        { title: "بازار هدف", value: "۲۰" },
        { title: "مشتری فعال", value: "۵۰۰+" },
      ])),
    },
  },
  timeline: {
    group: "trust",
    labelFa: "مراحل",
    variants: {
      steps: v("گام‌ها", withTitle("فرآیند همکاری", "", [
        { title: "درخواست" },
        { title: "نمونه / تأیید" },
        { title: "تولید" },
        { title: "ارسال" },
      ])),
    },
  },
  certificates: {
    group: "trust",
    labelFa: "گواهی‌ها",
    variants: {
      grid: v("شبکه", withTitle("گواهی‌ها و مجوزها", "", [
        { title: "ISO" },
        { title: "صادرات" },
        { title: "سلامت" },
      ])),
    },
  },
  reviews: {
    group: "trust",
    labelFa: "نظرات",
    variants: {
      grid: v("کارت‌ها", withTitle("نظر خریداران", "", [
        { title: "خریدار", text: "کیفیت و بسته‌بندی عالی بود.", value: "5" },
      ])),
    },
  },
  team: {
    group: "trust",
    labelFa: "تیم",
    variants: {
      members: v("اعضا", withTitle("تیم فروش", "", [
        { title: "کارشناس صادرات", text: "هماهنگی سفارش" },
      ])),
    },
  },
  company: {
    group: "content",
    labelFa: "درباره شرکت",
    variants: {
      about: v("معرفی", withTitle("درباره ما", "", [])),
    },
  },
  logistics: {
    group: "content",
    labelFa: "لجستیک",
    variants: {
      cards: v("کارت‌ها", withTitle("حمل و تحویل", "", [
        { title: "Incoterms", text: "FOB / CIF / EXW" },
        { title: "Lead time", text: "۷–۱۴ روز" },
        { title: "بندر", text: "—" },
      ])),
    },
  },
  payment: {
    group: "content",
    labelFa: "پرداخت",
    variants: {
      methods: v("روش‌ها", withTitle("شرایط پرداخت", "", [
        { title: "TT" },
        { title: "LC" },
        { title: "Escrow" },
      ])),
    },
  },
  downloads: {
    group: "media",
    labelFa: "دانلود",
    variants: {
      list: v("فهرست", withTitle("فایل‌ها", "", [
        { title: "کاتالوگ PDF", text: "#" },
        { title: "دیتاشیت", text: "#" },
      ])),
    },
  },
  map: {
    group: "action",
    labelFa: "نقشه و مکان",
    variants: {
      location: v("موقعیت", () =>
        defaultProps({
          fa: { ...emptyLang("مسیریابی"), title: "موقعیت ما", subtitle: "آدرس و نقشه" },
          mapPlaceName: "دفتر / انبار",
          mapAddress: "",
          mapEmbedUrl: null,
          mapLat: null,
          mapLng: null,
        })
      ),
    },
  },
  qrCode: {
    group: "action",
    labelFa: "QR کد محصول",
    variants: {
      card: v("کارت", withTitle("QR کد این صفحه", "", [])),
      compact: v("فشرده", withTitle("QR کد", "", [])),
    },
  },
  cta: {
    group: "action",
    labelFa: "فراخوان اقدام",
    variants: {
      banner: v("بنر", withTitle("آماده همکاری هستید؟", "تماس با فروشنده")),
      dual: v("دو دکمه", withTitle("گام بعدی", "تماس", [{ title: "واتساپ" }])),
    },
  },
  contact: {
    group: "action",
    labelFa: "تماس",
    variants: {
      quick: v("سریع", withTitle("تماس", "تماس")),
      form: v("فرم", withTitle("فرم تماس", "ارسال")),
    },
  },
  faq: {
    group: "action",
    labelFa: "سوالات متداول",
    variants: {
      accordion: v("آکاردئون", withTitle("سوالات متداول", "", [
        { title: "حداقل سفارش چقدر است؟", text: "بسته به محصول متفاوت است." },
        { title: "نمونه دارید؟", text: "پس از هماهنگی امکان‌پذیر است." },
      ])),
    },
  },
  footer: {
    group: "layout",
    labelFa: "فوتر",
    variants: {
      simple: v("ساده", withTitle("Zareoon")),
      columns: v("چندستونه", withTitle("Zareoon", "", [
        { title: "محصولات" },
        { title: "تماس" },
        { title: "درباره" },
      ])),
    },
  },
};

/** انواع مجاز داخل ستون (بدون تودرتوی بی‌نهایت) */
export const NESTABLE_BLOCK_TYPES = Object.keys(BLOCK_LIBRARY).filter((t) => t !== "columnLayout");

/** نگاشت نوع/واریانت قدیمی → جدید (سازگاری لندینگ‌های ذخیره‌شده) */
export const BLOCK_TYPE_ALIASES = {
  factory: { type: "gallery", variant: "grid" },
  blog: { type: "features", variant: "cards" },
  social: { type: "footer", variant: "simple" },
  b2b: { type: "features", variant: "cards" },
  duiHero: { type: "hero", variant: "fullscreen" },
  duiAlert: { type: "banner", variant: "notice" },
  duiStats: { type: "statistics", variant: "counters" },
  duiSteps: { type: "timeline", variant: "steps" },
  duiCollapse: { type: "faq", variant: "accordion" },
  duiFooter: { type: "footer", variant: "columns" },
  duiForm: { type: "contact", variant: "form" },
  duiCarousel: { type: "gallery", variant: "carousel" },
  duiTable: { type: "specifications", variant: "table" },
  duiButton: { type: "cta", variant: "banner" },
  duiCard: { type: "features", variant: "cards" },
  duiTimeline: { type: "timeline", variant: "steps" },
};

const VARIANT_ALIASES = {
  hero: {
    image: "split",
    "with-video": "fullscreen",
    slider: "fullscreen",
    form: "simple",
    search: "simple",
    counters: "fullscreen",
    "dual-cta": "split",
  },
  banner: {
    announcement: "notice",
    offer: "notice",
    discount: "notice",
    topbar: "notice",
    breaking: "notice",
  },
  features: { icons: "cards", threeCol: "cards", fourCol: "cards", timeline: "cards", zigzag: "cards" },
  gallery: { masonry: "grid", lightbox: "grid", beforeAfter: "grid", fullwidth: "carousel" },
  video: { youtube: "embed", aparat: "embed", vimeo: "embed", local: "embed" },
  map: { google: "location", osm: "location", branches: "location" },
  timeline: { production: "steps", order: "steps", shipping: "steps" },
  logistics: { shipping: "cards", incoterms: "cards", methods: "cards", ports: "cards", leadtime: "cards" },
  payment: { lc: "methods", escrow: "methods", wire: "methods" },
  downloads: { pdf: "list", catalog: "list", brochure: "list", cad: "list", datasheet: "list" },
  certificates: { iso: "grid", ce: "grid", fda: "grid", export: "grid", licenses: "grid" },
  company: { history: "about", mission: "about", vision: "about" },
  team: { managers: "members", experts: "members" },
  cta: { simple: "banner", fullwidth: "banner", floating: "dual" },
  contact: { rfq: "form", order: "form", whatsapp: "quick", telegram: "quick", email: "quick", phone: "quick" },
  faq: { tabs: "accordion", twoCol: "accordion" },
  reviews: { slider: "grid", stars: "grid", video: "grid", text: "grid" },
  statistics: { chart: "counters", percent: "counters", progress: "counters" },
  pricing: { table: "simple", plans: "simple", discount: "simple" },
  productShowcase: { single: "featured", multi: "grid", list: "grid", slider: "grid", tabs: "grid", related: "grid" },
  buy: { compact: "card" },
  footer: { corporate: "columns", minimal: "simple" },
  columnLayout: { "2col": "two", "3col": "three", split: "aside", sidebar: "aside" },
};

export function resolveBlockTypeVariant(type, variant) {
  let t = String(type || "hero");
  let vName = String(variant || "");
  const alias = BLOCK_TYPE_ALIASES[t];
  if (alias) {
    t = alias.type;
    if (!vName || vName === "default") vName = alias.variant;
  }
  const vMap = VARIANT_ALIASES[t];
  if (vMap && vMap[vName]) vName = vMap[vName];
  const def = BLOCK_LIBRARY[t];
  if (!def) return { type: t, variant: vName || "default" };
  if (!def.variants[vName]) {
    vName = Object.keys(def.variants)[0];
  }
  return { type: t, variant: vName };
}

export function createBlockInstance(type, variant, id) {
  const resolved = resolveBlockTypeVariant(type, variant);
  const def = BLOCK_LIBRARY[resolved.type];
  if (!def) return null;
  const vDef = def.variants[resolved.variant];
  if (!vDef) return null;
  return {
    id: id || `blk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    type: resolved.type,
    variant: resolved.variant,
    hidden: false,
    props: vDef.defaultProps(),
    responsive: { desktop: {}, tablet: {}, mobile: {} },
  };
}

export function listPaletteItems() {
  const items = [];
  for (const [type, def] of Object.entries(BLOCK_LIBRARY)) {
    for (const [variant, vDef] of Object.entries(def.variants)) {
      items.push({
        type,
        variant,
        labelFa: `${def.labelFa} · ${vDef.labelFa}`,
        group: def.group,
        groupLabelFa: BLOCK_GROUPS.find((g) => g.id === def.group)?.labelFa || def.labelFa,
      });
    }
  }
  return items;
}

export function pickBlockLocale(props = {}, locale = "fa") {
  const lang = props?.[locale] || props?.fa || props?.en || {};
  return {
    title: lang.title || "",
    subtitle: lang.subtitle || "",
    body: lang.body || "",
    ctaLabel: lang.ctaLabel || "",
    ctaSecondaryLabel: lang.ctaSecondaryLabel || "",
    items: Array.isArray(lang.items) ? lang.items : [],
  };
}
