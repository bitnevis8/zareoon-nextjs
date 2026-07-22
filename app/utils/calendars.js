import { toPersianDigits } from "./persianNumberUtils";

export const CALENDAR_MODES = ["shamsi", "gregorian", "hijri"];

const LOCALE_BY_LANG = {
  fa: "fa-IR",
  ar: "ar",
  ur: "ur-PK",
  en: "en-GB",
  es: "es",
  nl: "nl",
  tr: "tr",
  ru: "ru",
  fi: "fi",
};

/** تقویم پیش‌فرض بر اساس زبان رابط */
export function getDefaultCalendarMode(language) {
  if (language === "fa") return "shamsi";
  if (language === "ar" || language === "ur") return "hijri";
  return "gregorian";
}

export function getBcp47Locale(language) {
  return LOCALE_BY_LANG[language] || "en-GB";
}

export function calendarUsesPersianDigits(language) {
  return language === "fa" || language === "ar" || language === "ur";
}

function shapeCalendarDigits(text, language) {
  if (!calendarUsesPersianDigits(language)) return String(text ?? "");
  return toPersianDigits(text);
}

function calendarIdForMode(mode) {
  if (mode === "shamsi") return "persian";
  if (mode === "hijri") return "islamic-umalqura";
  return "gregory";
}

function buildLocaleWithCalendar(language, mode) {
  const base = getBcp47Locale(language);
  const cal = calendarIdForMode(mode);
  if (cal === "gregory") return base;
  return `${base}-u-ca-${cal}`;
}

function formatWithIntl(date, language, mode) {
  const d = date instanceof Date ? date : new Date(date);
  const locale = buildLocaleWithCalendar(language, mode);
  const shortOpts = { day: "numeric", month: "numeric", year: "numeric" };
  const fullOpts = { weekday: "long", day: "numeric", month: "long", year: "numeric" };

  try {
    const short = new Intl.DateTimeFormat(locale, shortOpts).format(d);
    const full = new Intl.DateTimeFormat(locale, fullOpts).format(d);
    return {
      short: shapeCalendarDigits(short, language),
      full: shapeCalendarDigits(full, language),
    };
  } catch {
    const fallback = getBcp47Locale(language);
    const short = d.toLocaleDateString(fallback, shortOpts);
    const full = d.toLocaleDateString(fallback, fullOpts);
    return {
      short: shapeCalendarDigits(short, language),
      full: shapeCalendarDigits(full, language),
    };
  }
}

export function formatShamsiDate(date = new Date(), language = "fa") {
  return { mode: "shamsi", ...formatWithIntl(date, language, "shamsi") };
}

export function formatGregorianDate(date = new Date(), language = "fa") {
  return { mode: "gregorian", ...formatWithIntl(date, language, "gregorian") };
}

export function formatHijriDate(date = new Date(), language = "fa") {
  return { mode: "hijri", ...formatWithIntl(date, language, "hijri") };
}

export function cycleCalendar(current) {
  if (current === "shamsi") return "gregorian";
  if (current === "gregorian") return "hijri";
  return "shamsi";
}

export function formatByCalendar(type, date = new Date(), language = "fa") {
  if (type === "gregorian") return formatGregorianDate(date, language);
  if (type === "hijri") return formatHijriDate(date, language);
  return formatShamsiDate(date, language);
}

export function formatCalendar(mode, date = new Date(), language = "fa") {
  return formatByCalendar(mode, date, language);
}

/** هر سه گاه‌شماری با برچسب ترجمه‌شده */
export function formatAllCalendars(date = new Date(), language = "fa", labels = {}) {
  return CALENDAR_MODES.map((mode) => {
    const formatted = formatByCalendar(mode, date, language);
    const label =
      mode === "gregorian"
        ? labels.gregorian || "Gregorian"
        : mode === "hijri"
          ? labels.hijri || "Hijri"
          : labels.shamsi || "Solar Hijri";
    return { ...formatted, mode, label };
  });
}

export function formatFetchedAt(iso, language = "fa") {
  if (!iso) return "—";
  const d = new Date(iso);
  const locale = getBcp47Locale(language);
  const text = d.toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return shapeCalendarDigits(text, language);
}
