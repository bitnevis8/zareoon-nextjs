/**
 * تولید پرامپت سئو برای بلوک‌های متنی لندینگ
 * کاربر پرامپت را کپی می‌کند و به ChatGPT/Claude می‌دهد.
 */

import { BLOCK_LIBRARY } from "./blocks/registry";
import { BLOCK_HELP } from "./builder/builderMeta";

/** بلوک‌هایی که محتوای متنی سئو می‌خواهند */
export const SEO_PROMPT_BLOCK_TYPES = new Set([
  "hero",
  "banner",
  "features",
  "company",
  "faq",
  "reviews",
  "cta",
  "specifications",
  "logistics",
  "payment",
  "certificates",
  "timeline",
  "team",
  "statistics",
  "pricing",
  "contact",
  "productShowcase",
  "blog",
  "b2b",
  "social",
  "downloads",
]);

/** بلوک‌هایی که فقط ویرایش دارند و پرامپت سئو لازم نیست */
export const NO_SEO_PROMPT_TYPES = new Set([
  "map",
  "qrCode",
  "buy",
  "productStock",
  "sellerActions",
  "gallery",
  "video",
  "footer",
  "columnLayout",
]);

export function blockSupportsSeoPrompt(type) {
  if (!type) return false;
  if (NO_SEO_PROMPT_TYPES.has(type)) return false;
  return SEO_PROMPT_BLOCK_TYPES.has(type);
}

function blockLabel(type) {
  return BLOCK_LIBRARY[type]?.labelFa || BLOCK_HELP[type] || type;
}

function outputShape(type) {
  switch (type) {
    case "hero":
      return `خروجی را دقیقاً با این قالب بده (بدون توضیح اضافه):
عنوان: ...
زیرعنوان: ...
متن کوتاه (۱–۲ جمله): ...
متن دکمه: ...`;
    case "banner":
      return `خروجی:
عنوان اعلان کوتاه (حداکثر ۱۲ کلمه): ...`;
    case "features":
      return `خروجی:
عنوان بخش: ...
سپس ۴ مورد به این شکل:
۱) عنوان | توضیح یک جمله‌ای
۲) عنوان | توضیح یک جمله‌ای
۳) عنوان | توضیح یک جمله‌ای
۴) عنوان | توضیح یک جمله‌ای`;
    case "faq":
      return `خروجی:
عنوان بخش: سوالات متداول
سپس ۵ پرسش و پاسخ به این شکل:
س: ...
ج: ...
(هر پاسخ ۲–۴ جمله، شفاف و مفید برای خریدار عمده)`;
    case "company":
      return `خروجی فقط متن نهایی:
عنوان بخش: ...
زیرعنوان کوتاه: ...
بدنه: ۳ تا ۵ پاراگراف کامل فارسی (هر پاراگراف ۳–۵ جمله)`;
    case "cta":
      return `خروجی:
عنوان: ...
زیرعنوان: ...
متن دکمه اصلی: ...
متن دکمه فرعی (اختیاری): ...`;
    case "specifications":
      return `خروجی:
عنوان جدول: مشخصات فنی و تجاری
سپس ۸ تا ۱۰ ردیف به شکل:
کلید | مقدار
مثال: MOQ | ...
Incoterms | ...
HS Code | ...
بسته‌بندی | ...
کشور مبدأ | ...
زمان تحویل | ...`;
    case "reviews":
      return `خروجی:
عنوان بخش: ...
سپس ۳ نظر کوتاه:
نام/نقش | امتیاز ۱–۵ | متن نظر (۱–۲ جمله)`;
    case "timeline":
      return `خروجی:
عنوان بخش: ...
سپس ۴ مرحله:
۱) عنوان | توضیح کوتاه
۲) عنوان | توضیح کوتاه
۳) عنوان | توضیح کوتاه
۴) عنوان | توضیح کوتاه`;
    case "logistics":
    case "payment":
    case "certificates":
    case "team":
    case "statistics":
    case "pricing":
    case "contact":
    case "downloads":
    case "productShowcase":
    case "blog":
    case "b2b":
    case "social":
      return `خروجی:
عنوان بخش: ...
زیرعنوان (اختیاری): ...
۳ تا ۵ آیتم به شکل: عنوان | توضیح کوتاه`;
    default:
      return `خروجی را ساخت‌یافته، کوتاه و قابل کپی در لندینگ بده.`;
  }
}

function blockMission(type) {
  const map = {
    hero: "هیرو صفحه — عنوان جذاب، زیرعنوان سئو و یک جمله ارزش پیشنهادی برای خریدار عمده/صادرکننده",
    banner: "یک اعلان کوتاه اعتمادساز یا مزیت B2B",
    features: "نکات کلیدی و مزایای رقابتی محصول برای اسکن سریع",
    company: "متن «درباره محصول» کاملاً سئو‌شده برای گوگل و خریداران B2B",
    faq: "سوالات پرتکرار خریداران عمده درباره MOQ، صادرات، قیمت، کیفیت و هماهنگی",
    reviews: "نظرات نمونهٔ حرفه‌ای و باورپذیر (نه اغراق‌آمیز)",
    cta: "فراخوان اقدام قوی برای استعلام قیمت / تماس / سفارش",
    specifications: "جدول مشخصات تجاری و فنی شفاف برای RFQ و صادرات",
    logistics: "حمل، اینکوترمز، زمان تحویل و بسته‌بندی",
    payment: "روش‌های پرداخت رایج تجارت بین‌المللی",
    certificates: "گواهی‌ها و استانداردهای مرتبط با محصول",
    timeline: "مراحل سفارش از مشاهده تا تحویل",
    team: "معرفی کوتاه تیم فروش/صادرات",
    statistics: "آمار کلیدی باورپذیر ظرفیت/بازار/تجربه",
    pricing: "پیام قیمت‌گذاری یا دعوت به استعلام",
    contact: "متن دعوت به تماس حرفه‌ای",
    downloads: "عناوین فایل‌های قابل دانلود (کاتالوگ، دیتاشیت)",
    productShowcase: "معرفی کوتاه محصولات مرتبط",
    blog: "عناوین و خلاصهٔ کوتاه مقالات مرتبط",
    b2b: "پیام همکاری B2B",
    social: "متن دعوت به شبکه‌های اجتماعی برند",
  };
  return map[type] || BLOCK_HELP[type] || "محتوای متنی حرفه‌ای برای لندینگ محصول";
}

/**
 * @param {{ type: string, productName?: string, shopName?: string, categoryPath?: string, locale?: string, blockTitle?: string }} opts
 */
export function buildSeoContentPrompt(opts = {}) {
  const type = opts.type || "company";
  const productName = String(opts.productName || "محصول").trim() || "محصول";
  const shopName = String(opts.shopName || "").trim();
  const categoryPath = String(opts.categoryPath || "").trim();
  const locale = opts.locale === "en" ? "en" : "fa";
  const label = blockLabel(type);
  const currentTitle = String(opts.blockTitle || "").trim();

  if (locale === "en") {
    return [
      `You are an expert B2B SEO copywriter for an international wholesale marketplace (Zareoon).`,
      `Product name: "${productName}"`,
      shopName ? `Seller/brand: "${shopName}"` : null,
      categoryPath ? `Category path: ${categoryPath}` : null,
      `Landing block: ${label} (${type})`,
      currentTitle ? `Current block title (may refine): ${currentTitle}` : null,
      `Goal: ${blockMission(type)}`,
      ``,
      `Write SEO-optimized English content for Google:`,
      `- Natural keywords (no stuffing)`,
      `- Clear for wholesale buyers, exporters, importers`,
      `- Trustworthy, specific, export-ready tone`,
      `- No markdown fences, no preamble`,
      ``,
      outputShape(type),
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `تو یک متخصص سئوی فارسی و کپی‌رایتر B2B بازار عمده‌فروشی بین‌المللی (زارعون) هستی.`,
    `نام محصول: «${productName}»`,
    shopName ? `نام فروشنده/برند: «${shopName}»` : null,
    categoryPath ? `مسیر دسته: ${categoryPath}` : null,
    `بلوک لندینگ: ${label} (${type})`,
    currentTitle ? `عنوان فعلی بلوک (می‌توانی بهترش کنی): ${currentTitle}` : null,
    `هدف بلوک: ${blockMission(type)}`,
    ``,
    `یک محتوای سئو‌شده و مناسب گوگل به زبان فارسی بنویس که:`,
    `- کلمات کلیدی مرتبط با «${productName}» را طبیعی و بدون تکرار اجباری به کار ببرد`,
    `- برای خریدار عمده، صادرکننده و واردکننده شفاف و قانع‌کننده باشد`,
    `- لحن حرفه‌ای، قابل اعتماد و صادرات‌محور داشته باشد`,
    `- از اغراق، ایموجی و جملات کلیشه‌ای خالی پرهیز کند`,
    `- جزئیات کاربردی (کیفیت، بسته‌بندی، سفارش عمده، صادرات، هماهنگی با فروشنده) را در صورت تناسب ذکر کند`,
    `- هیچ توضیح اضافه‌ای قبل/بعد از خروجی ننویسی؛ فقط خروجی قابل کپی`,
    ``,
    outputShape(type),
  ]
    .filter(Boolean)
    .join("\n");
}

export function resolveLandingProductName({ landing, product, shop } = {}) {
  const blocks = landing?.content?.blocks || [];
  const hero = blocks.find((b) => b?.type === "hero");
  return (
    hero?.props?.fa?.title ||
    product?.translations?.fa?.name ||
    product?.name ||
    product?.englishName ||
    shop?.name ||
    "محصول"
  );
}

export function resolveLandingCategoryPath(product) {
  const tr = product?.translations?.fa || {};
  return tr.categoryPath || product?.path || "";
}
