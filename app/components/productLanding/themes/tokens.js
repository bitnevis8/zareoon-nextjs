/**
 * ۳ تم ساختاری + پالت‌های با کنتراست بالا (متن / پس‌زمینه / دکمه)
 * استاندارد: کنتراست خوانا روی همه سطوح — نزدیک Material / WCAG AA
 */

import {
  resolveFontFa,
  resolveFontEn,
  resolveLandingFontStack,
  DEFAULT_FONT_FA,
  DEFAULT_FONT_EN,
} from "./fonts";

export { LANDING_FONTS_FA, LANDING_FONTS_EN, DEFAULT_FONT_FA, DEFAULT_FONT_EN } from "./fonts";
export {
  resolveFontFa,
  resolveFontEn,
  resolveLandingFontStack,
  resolveBlockFontStack,
} from "./fonts";

export const LANDING_THEMES = [
  {
    id: "atelier",
    nameFa: "حرفه‌ای",
    nameEn: "Professional",
    descFa: "تایپوگرافی قوی و فاصلهٔ لوکس — مناسب صادرات و B2B",
    daisyTheme: "corporate",
    vars: {
      "--lp-radius": "16px",
      "--lp-radius-btn": "999px",
      "--lp-radius-card": "18px",
      "--lp-font-display": '"Vazirmatn Variable", Vazirmatn, IRANSans, sans-serif',
      "--lp-font-body": '"Vazirmatn Variable", Vazirmatn, IRANSans, sans-serif',
      "--lp-shadow": "0 18px 50px -28px rgba(15, 23, 42, 0.35)",
      "--lp-shadow-soft": "0 1px 0 rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.18)",
      "--lp-hero-overlay":
        "linear-gradient(160deg, rgba(8,12,18,0.78) 0%, rgba(8,12,18,0.32) 55%, rgba(8,12,18,0.62) 100%)",
    },
  },
  {
    id: "soft",
    nameFa: "نرم",
    nameEn: "Soft",
    descFa: "کارت‌های گرد — غذایی، کشاورزی و مصرفی",
    daisyTheme: "emerald",
    vars: {
      "--lp-radius": "24px",
      "--lp-radius-btn": "999px",
      "--lp-radius-card": "28px",
      "--lp-font-display": '"Vazirmatn Variable", Vazirmatn, IRANSans, sans-serif',
      "--lp-font-body": '"Vazirmatn Variable", Vazirmatn, IRANSans, sans-serif',
      "--lp-shadow": "0 24px 60px -32px rgba(15, 23, 42, 0.28)",
      "--lp-shadow-soft": "0 10px 30px -18px rgba(15,23,42,0.16)",
      "--lp-hero-overlay": "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(15,23,42,0.62))",
    },
  },
  {
    id: "tech",
    nameFa: "صنعتی",
    nameEn: "Industrial",
    descFa: "دقیق و فنی — ماشین‌آلات و الکترونیک",
    daisyTheme: "business",
    vars: {
      "--lp-radius": "10px",
      "--lp-radius-btn": "10px",
      "--lp-radius-card": "12px",
      "--lp-font-display": '"Vazirmatn Variable", Vazirmatn, IRANSans, sans-serif',
      "--lp-font-body": '"Vazirmatn Variable", Vazirmatn, IRANSans, sans-serif',
      "--lp-shadow": "0 12px 40px -20px rgba(0,0,0,0.45)",
      "--lp-shadow-soft": "0 0 0 1px rgba(15,23,42,0.08)",
      "--lp-hero-overlay": "linear-gradient(135deg, rgba(0,0,0,0.78), rgba(0,0,0,0.38))",
    },
  },
];

/** پالت‌ها — ترکیب‌های با تمایز واضح متن/پس‌زمینه/اکسنت (swatches یکتا برای key) */
export const LANDING_PALETTES = [
  {
    id: "forest",
    nameFa: "جنگل",
    nameEn: "Forest",
    swatches: ["#F4F7F5", "#0B1A12", "#166534", "#FFFFFF"],
    vars: {
      "--lp-bg": "#F4F7F5",
      "--lp-bg-elevated": "#FFFFFF",
      "--lp-fg": "#0B1A12",
      "--lp-muted": "#3D5248",
      "--lp-accent": "#166534",
      "--lp-accent-fg": "#FFFFFF",
      "--lp-accent-soft": "#DCFCE7",
      "--lp-border": "#C5D5CB",
      "--lp-surface-2": "#E6EEE9",
    },
  },
  {
    id: "ink",
    nameFa: "مرکب",
    nameEn: "Ink",
    swatches: ["#F5F7FB", "#0B1220", "#1D4ED8", "#FFFFFF"],
    vars: {
      "--lp-bg": "#F5F7FB",
      "--lp-bg-elevated": "#FFFFFF",
      "--lp-fg": "#0B1220",
      "--lp-muted": "#475569",
      "--lp-accent": "#1D4ED8",
      "--lp-accent-fg": "#FFFFFF",
      "--lp-accent-soft": "#DBEAFE",
      "--lp-border": "#CBD5E1",
      "--lp-surface-2": "#E8EEF6",
    },
  },
  {
    id: "ocean",
    nameFa: "اقیانوس",
    nameEn: "Ocean",
    swatches: ["#F0F9FB", "#042F2E", "#0F766E", "#FFFFFF"],
    vars: {
      "--lp-bg": "#F0F9FB",
      "--lp-bg-elevated": "#FFFFFF",
      "--lp-fg": "#042F2E",
      "--lp-muted": "#315E5B",
      "--lp-accent": "#0F766E",
      "--lp-accent-fg": "#FFFFFF",
      "--lp-accent-soft": "#CCFBF1",
      "--lp-border": "#A5D4D0",
      "--lp-surface-2": "#D9F0F2",
    },
  },
  {
    id: "slate-night",
    nameFa: "شب",
    nameEn: "Night",
    swatches: ["#0B0F14", "#F1F5F9", "#2DD4BF", "#151B24"],
    vars: {
      "--lp-bg": "#0B0F14",
      "--lp-bg-elevated": "#151B24",
      "--lp-fg": "#F1F5F9",
      "--lp-muted": "#94A3B8",
      "--lp-accent": "#2DD4BF",
      "--lp-accent-fg": "#042F2E",
      "--lp-accent-soft": "rgba(45,212,191,0.16)",
      "--lp-border": "rgba(241,245,249,0.14)",
      "--lp-surface-2": "#1C2430",
    },
  },
  {
    id: "sand",
    nameFa: "شن",
    nameEn: "Sand",
    swatches: ["#FAF7F2", "#1C1917", "#B45309", "#FFFFFF"],
    vars: {
      "--lp-bg": "#FAF7F2",
      "--lp-bg-elevated": "#FFFFFF",
      "--lp-fg": "#1C1917",
      "--lp-muted": "#57534E",
      "--lp-accent": "#B45309",
      "--lp-accent-fg": "#FFFFFF",
      "--lp-accent-soft": "#FFEDD5",
      "--lp-border": "#E7E0D5",
      "--lp-surface-2": "#F3EEE6",
    },
  },
  {
    id: "berry",
    nameFa: "توت",
    nameEn: "Berry",
    swatches: ["#FBF7FA", "#1F0A1A", "#9D174D", "#FFFFFF"],
    vars: {
      "--lp-bg": "#FBF7FA",
      "--lp-bg-elevated": "#FFFFFF",
      "--lp-fg": "#1F0A1A",
      "--lp-muted": "#6B3A56",
      "--lp-accent": "#9D174D",
      "--lp-accent-fg": "#FFFFFF",
      "--lp-accent-soft": "#FCE7F3",
      "--lp-border": "#E8D5DF",
      "--lp-surface-2": "#F5EAF1",
    },
  },
  {
    id: "citrus",
    nameFa: "مرکبات",
    nameEn: "Citrus",
    swatches: ["#FFFBEB", "#1C1917", "#CA8A04", "#FFFFFF"],
    vars: {
      "--lp-bg": "#FFFBEB",
      "--lp-bg-elevated": "#FFFFFF",
      "--lp-fg": "#1C1917",
      "--lp-muted": "#78716C",
      "--lp-accent": "#CA8A04",
      "--lp-accent-fg": "#1C1917",
      "--lp-accent-soft": "#FEF3C7",
      "--lp-border": "#F5E6B8",
      "--lp-surface-2": "#FEF9C3",
    },
  },
  {
    id: "graphite",
    nameFa: "گرافیت",
    nameEn: "Graphite",
    swatches: ["#F4F4F5", "#18181B", "#3F3F46", "#FFFFFF"],
    vars: {
      "--lp-bg": "#F4F4F5",
      "--lp-bg-elevated": "#FFFFFF",
      "--lp-fg": "#18181B",
      "--lp-muted": "#52525B",
      "--lp-accent": "#3F3F46",
      "--lp-accent-fg": "#FAFAFA",
      "--lp-accent-soft": "#E4E4E7",
      "--lp-border": "#D4D4D8",
      "--lp-surface-2": "#E4E4E7",
    },
  },
  {
    id: "olive",
    nameFa: "زیتون",
    nameEn: "Olive",
    swatches: ["#F7F8F3", "#1A1F14", "#4D7C0F", "#FFFFFF"],
    vars: {
      "--lp-bg": "#F7F8F3",
      "--lp-bg-elevated": "#FFFFFF",
      "--lp-fg": "#1A1F14",
      "--lp-muted": "#4B5563",
      "--lp-accent": "#4D7C0F",
      "--lp-accent-fg": "#FFFFFF",
      "--lp-accent-soft": "#ECFCCB",
      "--lp-border": "#D4D9C8",
      "--lp-surface-2": "#EEF1E6",
    },
  },
  {
    id: "royal",
    nameFa: "رویال",
    nameEn: "Royal",
    swatches: ["#F5F3FF", "#1E1B4B", "#6D28D9", "#FFFFFF"],
    vars: {
      "--lp-bg": "#F5F3FF",
      "--lp-bg-elevated": "#FFFFFF",
      "--lp-fg": "#1E1B4B",
      "--lp-muted": "#5B567A",
      "--lp-accent": "#6D28D9",
      "--lp-accent-fg": "#FFFFFF",
      "--lp-accent-soft": "#EDE9FE",
      "--lp-border": "#DDD6FE",
      "--lp-surface-2": "#EDE9FE",
    },
  },
];

export const LANDING_PATTERNS = [
  { id: "none", nameFa: "بدون پترن", nameEn: "None", preview: "none", css: "none" },
  {
    id: "dots",
    nameFa: "نقطه",
    nameEn: "Dots",
    preview: "dots",
    css: "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--lp-fg) 14%, transparent) 1.2px, transparent 0)",
    size: "18px 18px",
  },
  {
    id: "grid",
    nameFa: "شبکه",
    nameEn: "Grid",
    preview: "grid",
    css: "linear-gradient(to right, color-mix(in srgb, var(--lp-fg) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--lp-fg) 8%, transparent) 1px, transparent 1px)",
    size: "28px 28px",
  },
  {
    id: "mesh",
    nameFa: "مش نرم",
    nameEn: "Soft mesh",
    preview: "mesh",
    css: "radial-gradient(at 20% 20%, color-mix(in srgb, var(--lp-accent) 16%, transparent), transparent 45%), radial-gradient(at 80% 10%, color-mix(in srgb, var(--lp-accent) 12%, transparent), transparent 40%), radial-gradient(at 50% 80%, color-mix(in srgb, var(--lp-accent) 8%, transparent), transparent 42%)",
    size: "auto",
  },
  {
    id: "diagonal",
    nameFa: "مورب",
    nameEn: "Diagonal",
    preview: "diagonal",
    css: "repeating-linear-gradient(135deg, color-mix(in srgb, var(--lp-fg) 7%, transparent) 0 1px, transparent 1px 14px)",
    size: "auto",
  },
  {
    id: "waves",
    nameFa: "موج",
    nameEn: "Waves",
    preview: "waves",
    css: "radial-gradient(ellipse 120% 40% at 50% -10%, color-mix(in srgb, var(--lp-accent) 18%, transparent), transparent), radial-gradient(ellipse 100% 50% at 0% 100%, color-mix(in srgb, var(--lp-accent) 10%, transparent), transparent)",
    size: "auto",
  },
  {
    id: "noise",
    nameFa: "دانه‌ای",
    nameEn: "Grain",
    preview: "noise",
    css: "radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--lp-fg) 6%, transparent) 0.6px, transparent 0.7px), radial-gradient(circle at 70% 60%, color-mix(in srgb, var(--lp-fg) 5%, transparent) 0.5px, transparent 0.6px), radial-gradient(circle at 40% 80%, color-mix(in srgb, var(--lp-fg) 4%, transparent) 0.45px, transparent 0.55px)",
    size: "12px 12px",
  },
  {
    id: "hex",
    nameFa: "شش‌ضلعی",
    nameEn: "Hex",
    preview: "hex",
    css: "radial-gradient(circle at 50% 0, transparent 48%, color-mix(in srgb, var(--lp-fg) 8%, transparent) 49% 51%, transparent 52%), radial-gradient(circle at 0 50%, transparent 48%, color-mix(in srgb, var(--lp-fg) 8%, transparent) 49% 51%, transparent 52%)",
    size: "24px 42px",
  },
];

/** سازگاری idهای قدیمی → یکی از ۳ تم */
const THEME_ALIASES = {
  editorial: "atelier",
  heritage: "atelier",
  export: "atelier",
  modern: "soft",
  minimal: "atelier",
  industrial: "tech",
  dark: "tech",
};

const THEME_BY_ID = Object.fromEntries(LANDING_THEMES.map((t) => [t.id, t]));
const PALETTE_BY_ID = Object.fromEntries(LANDING_PALETTES.map((p) => [p.id, p]));
const PATTERN_BY_ID = Object.fromEntries(LANDING_PATTERNS.map((p) => [p.id, p]));

const LEGACY_THEME_PALETTE = {
  atelier: "forest",
  soft: "ocean",
  tech: "slate-night",
  editorial: "ink",
  heritage: "forest",
  modern: "ocean",
  export: "ink",
  minimal: "ink",
  industrial: "slate-night",
  dark: "slate-night",
};

export function resolveThemeId(themeId) {
  const raw = String(themeId || "atelier");
  if (THEME_ALIASES[raw]) return THEME_ALIASES[raw];
  if (THEME_BY_ID[raw]) return raw;
  return "atelier";
}

export function getTheme(themeId) {
  return THEME_BY_ID[resolveThemeId(themeId)] || LANDING_THEMES[0];
}

export function getPalette(paletteId, themeId) {
  if (paletteId && PALETTE_BY_ID[paletteId]) return PALETTE_BY_ID[paletteId];
  const tid = resolveThemeId(themeId);
  const fallback = LEGACY_THEME_PALETTE[themeId] || LEGACY_THEME_PALETTE[tid] || "forest";
  return PALETTE_BY_ID[fallback] || LANDING_PALETTES[0];
}

export function getPattern(patternId) {
  return PATTERN_BY_ID[patternId] || LANDING_PATTERNS[0];
}

/** تم daisyUI وابسته به تم صفحه (دیگر انتخاب جدا نیست) */
export function resolveDaisyTheme(themeId, metaDaisyTheme) {
  if (metaDaisyTheme && ["corporate", "emerald", "business", "light", "dark"].includes(metaDaisyTheme)) {
    return metaDaisyTheme;
  }
  return getTheme(themeId).daisyTheme || "corporate";
}

/** پل daisyUI 5 — تا btn/card/alert هم از پالت لندینگ تبعیت کنند */
function daisyBridgeFromPalette(palette) {
  const v = palette.vars || {};
  return {
    "--color-primary": v["--lp-accent"],
    "--color-primary-content": v["--lp-accent-fg"],
    "--color-secondary": v["--lp-muted"],
    "--color-secondary-content": v["--lp-bg-elevated"],
    "--color-accent": v["--lp-accent"],
    "--color-accent-content": v["--lp-accent-fg"],
    "--color-neutral": v["--lp-fg"],
    "--color-neutral-content": v["--lp-bg-elevated"],
    "--color-base-100": v["--lp-bg-elevated"],
    "--color-base-200": v["--lp-surface-2"],
    "--color-base-300": v["--lp-border"],
    "--color-base-content": v["--lp-fg"],
    "--color-info": v["--lp-accent"],
    "--color-info-content": v["--lp-accent-fg"],
    "--color-success": v["--lp-accent"],
    "--color-success-content": v["--lp-accent-fg"],
  };
}

export function composeLandingStyle({
  themeId = "atelier",
  paletteId = null,
  patternId = "none",
  fontFa = DEFAULT_FONT_FA,
  fontEn = DEFAULT_FONT_EN,
  locale = "fa",
} = {}) {
  const theme = getTheme(themeId);
  const palette = getPalette(paletteId, themeId);
  const pattern = getPattern(patternId);

  const fa = resolveFontFa(fontFa);
  const en = resolveFontEn(fontEn);
  const bodyStack = resolveLandingFontStack({ fontFa, fontEn, locale });

  const style = {
    ...theme.vars,
    ...palette.vars,
    ...daisyBridgeFromPalette(palette),
    "--lp-font-fa": fa.stack,
    "--lp-font-en": en.stack,
    "--lp-font-display": bodyStack,
    "--lp-font-body": bodyStack,
    backgroundColor: palette.vars["--lp-bg"],
    color: palette.vars["--lp-fg"],
    fontFamily: bodyStack,
  };

  if (pattern.id !== "none" && pattern.css && pattern.css !== "none") {
    style["--lp-pattern"] = pattern.css;
    style["--lp-pattern-size"] = pattern.size || "auto";
    style["--lp-pattern-opacity"] = pattern.extraOpacity != null ? String(pattern.extraOpacity) : "1";
  } else {
    style["--lp-pattern"] = "none";
    style["--lp-pattern-size"] = "auto";
    style["--lp-pattern-opacity"] = "1";
  }

  return style;
}

export function themeStyle(themeId, opts = {}) {
  return composeLandingStyle({ themeId, ...opts });
}

/** حالت‌های نمایش محصول در کاتالوگ / کارت */
export const PRODUCT_DISPLAY_MODES = [
  {
    id: "catalog",
    nameFa: "کاتالوگ + لینک صفحه حرفه‌ای",
    descFa: "کارت به صفحهٔ کاتالوگ می‌رود؛ در هدر کاتالوگ لینک ورود به لندینگ نمایش داده می‌شود (پیش‌فرض).",
  },
  {
    id: "landing",
    nameFa: "ورود مستقیم به لندینگ",
    descFa: "با کلیک روی کارت محصول، مستقیماً وارد صفحهٔ لندینگ می‌شوید.",
  },
  {
    id: "catalog_only",
    nameFa: "فقط کاتالوگ",
    descFa: "فقط صفحهٔ کاتالوگ؛ لینک لندینگ در هدر نشان داده نمی‌شود.",
  },
];

export const THEME_IDS = LANDING_THEMES.map((t) => t.id);
export const PALETTE_IDS = LANDING_PALETTES.map((p) => p.id);
export const PATTERN_IDS = LANDING_PATTERNS.map((p) => p.id);
