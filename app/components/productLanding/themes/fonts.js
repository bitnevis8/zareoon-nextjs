/**
 * فونت‌های لندینگ — فارسی / انگلیسی جدا
 * پیش‌فرض: fa=Vazirmatn ، en=Inter
 * بقیهٔ سایت (غیر از لندینگ) = IRANSans
 */

export const LANDING_FONTS_FA = [
  {
    id: "vazirmatn",
    nameFa: "وزیرمتن",
    nameEn: "Vazirmatn",
    stack: '"Vazirmatn Variable", Vazirmatn, IRANSans, Tahoma, sans-serif',
    default: true,
  },
  {
    id: "iransans",
    nameFa: "ایران‌سنس",
    nameEn: "IRANSans",
    stack: 'IRANSans, "Vazirmatn Variable", Tahoma, sans-serif',
  },
  {
    id: "bnazanin",
    nameFa: "بی‌نازنین",
    nameEn: "B Nazanin",
    stack: '"B Nazanin", BNazanin, IRANSans, Tahoma, serif',
  },
];

export const LANDING_FONTS_EN = [
  {
    id: "inter",
    nameFa: "اینتر",
    nameEn: "Inter",
    stack: 'Inter, "Plus Jakarta Sans", system-ui, sans-serif',
    default: true,
  },
  {
    id: "geist",
    nameFa: "گایست",
    nameEn: "Geist",
    stack: 'Geist, Inter, system-ui, sans-serif',
  },
  {
    id: "jakarta",
    nameFa: "جاکارتا",
    nameEn: "Plus Jakarta Sans",
    stack: '"Plus Jakarta Sans", Inter, system-ui, sans-serif',
  },
];

export const DEFAULT_FONT_FA = "vazirmatn";
export const DEFAULT_FONT_EN = "inter";

const FA_BY_ID = Object.fromEntries(LANDING_FONTS_FA.map((f) => [f.id, f]));
const EN_BY_ID = Object.fromEntries(LANDING_FONTS_EN.map((f) => [f.id, f]));

export function resolveFontFa(id) {
  return FA_BY_ID[id] || FA_BY_ID[DEFAULT_FONT_FA];
}

export function resolveFontEn(id) {
  return EN_BY_ID[id] || EN_BY_ID[DEFAULT_FONT_EN];
}

/**
 * استک فونت بر اساس زبان صفحه + انتخاب کاربر
 * locale=en → فونت انگلیسی؛ otherwise فارسی
 */
export function resolveLandingFontStack({ fontFa, fontEn, locale = "fa" } = {}) {
  if (locale === "en") return resolveFontEn(fontEn).stack;
  return resolveFontFa(fontFa).stack;
}

/** برای یک بلوک: اگر override داشته باشد همان؛ وگرنه از صفحه */
export function resolveBlockFontStack(block, pageFonts = {}, locale = "fa") {
  const props = block?.props || {};
  const blockFa = props.fontFa || null;
  const blockEn = props.fontEn || null;
  return resolveLandingFontStack({
    fontFa: blockFa || pageFonts.fontFa || DEFAULT_FONT_FA,
    fontEn: blockEn || pageFonts.fontEn || DEFAULT_FONT_EN,
    locale,
  });
}
