import { SITE_LANGUAGES, SITE_LANGUAGE_CODES, isRtlLanguage } from "@/app/config/siteLanguages";

export const DISPLAY_LOCALE_CODES = SITE_LANGUAGE_CODES;

export const DISPLAY_LOCALES = SITE_LANGUAGES.map((item) => ({
  code: item.code,
  label: item.label,
  nativeLabel: item.shortLabel,
  dir: isRtlLanguage(item.code) ? "rtl" : "ltr",
  default: item.code === "fa",
}));

export const EMPTY_DISPLAY_LOCALE = () => ({
  title: "",
  description: "",
  hashtags: [],
});

export function createEmptyDisplayContent() {
  return DISPLAY_LOCALE_CODES.reduce((acc, code) => {
    acc[code] = EMPTY_DISPLAY_LOCALE();
    return acc;
  }, {});
}

export function hydrateDisplayContent(lot) {
  if (lot?.displayContent && typeof lot.displayContent === "object") {
    const base = createEmptyDisplayContent();
    for (const code of DISPLAY_LOCALE_CODES) {
      const src = lot.displayContent[code] || {};
      base[code] = {
        title: src.title || "",
        description: src.description || "",
        hashtags: Array.isArray(src.hashtags) ? src.hashtags : [],
      };
    }
    return base;
  }

  const legacy = createEmptyDisplayContent();
  legacy.fa = {
    title: "",
    description: lot?.description || "",
    hashtags: Array.isArray(lot?.hashtags) ? lot.hashtags : [],
  };
  legacy.en = { title: lot?.englishName || "", description: "", hashtags: [] };
  legacy.ar = { title: lot?.arabicName || "", description: "", hashtags: [] };
  legacy.ru = { title: lot?.russianName || "", description: "", hashtags: [] };
  return legacy;
}

export function displayContentToApiPayload(displayContent) {
  const dc = displayContent || createEmptyDisplayContent();
  const fa = dc.fa || EMPTY_DISPLAY_LOCALE();
  const en = dc.en || EMPTY_DISPLAY_LOCALE();
  const ar = dc.ar || EMPTY_DISPLAY_LOCALE();
  const ru = dc.ru || EMPTY_DISPLAY_LOCALE();

  return {
    displayContent: dc,
    description: fa.description?.trim() || null,
    hashtags: fa.hashtags?.length ? fa.hashtags : null,
    englishName: en.title?.trim() || null,
    arabicName: ar.title?.trim() || null,
    russianName: ru.title?.trim() || null,
  };
}

export function getDisplayLocale(code) {
  return DISPLAY_LOCALES.find((l) => l.code === code) || DISPLAY_LOCALES[0];
}

export function resolveDisplayLocaleCode(language) {
  return DISPLAY_LOCALE_CODES.includes(language) ? language : "fa";
}

/** Resolved title, description, hashtags for a lot in the visitor's language (falls back to fa). */
export function getLotDisplayForLanguage(lot, language) {
  const content = hydrateDisplayContent(lot);
  const code = resolveDisplayLocaleCode(language);
  const row = content[code] || EMPTY_DISPLAY_LOCALE();
  const fallback = content.fa || EMPTY_DISPLAY_LOCALE();

  const pickText = (field) => {
    const val = row[field];
    const trimmed = typeof val === "string" ? val.trim() : "";
    if (trimmed) return trimmed;
    if (code === "fa") return "";
    const fb = typeof fallback[field] === "string" ? fallback[field].trim() : "";
    return fb;
  };

  const pickHashtags = () => {
    if (Array.isArray(row.hashtags) && row.hashtags.length) return row.hashtags;
    if (code === "fa") return [];
    return Array.isArray(fallback.hashtags) ? fallback.hashtags : [];
  };

  return {
    title: pickText("title"),
    description: pickText("description"),
    hashtags: pickHashtags(),
  };
}

export function countFilledDisplayLocales(displayContent) {
  if (!displayContent) return 0;
  return DISPLAY_LOCALE_CODES.filter((code) => {
    const row = displayContent[code];
    if (!row) return false;
    return Boolean(row.title?.trim() || row.description?.trim() || row.hashtags?.length);
  }).length;
}

const TITLE_PLACEHOLDERS = {
  fa: "مثلاً خرمای مضافتی درجه یک — برداشت تازه",
  en: "e.g. Premium Mazafati dates — fresh harvest",
  ar: "مثال: تمر مضافي درجة أولى",
  ru: "например: финики Мазафати премиум",
  tr: "ör. Premium Mazafati hurması — taze hasat",
  fi: "esim. Premium Mazafati -tuore sato",
};

const DESCRIPTION_PLACEHOLDERS = {
  fa: "توضیح کوتاه برای نمایش در صفحه این عرضه…",
  en: "Short description for this listing…",
  ar: "وصف قصير لهذا العرض…",
  ru: "Краткое описание для этой позиции…",
  tr: "Bu ilan için kısa açıklama…",
  fi: "Lyhyt kuvaus tälle tarjoukselle…",
};

export function getDisplayTitlePlaceholder(code) {
  return TITLE_PLACEHOLDERS[code] || TITLE_PLACEHOLDERS.en;
}

export function getDisplayDescriptionPlaceholder(code) {
  return DESCRIPTION_PLACEHOLDERS[code] || DESCRIPTION_PLACEHOLDERS.en;
}
