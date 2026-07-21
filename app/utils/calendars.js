import jalaali from "jalaali-js";
import i18nData from "./i18nFaData";
import { toPersianDigits } from "./persianNumberUtils";

const JALAALI_MONTHS = i18nData.calendars.months;
const WEEKDAYS_FA = i18nData.calendars.weekdays;

/** fa / ar / ur → ارقام فارسی در نمایش تاریخ ناوبار */
export function calendarUsesPersianDigits(language) {
  return language === "fa" || language === "ar" || language === "ur";
}

function shapeCalendarDigits(text, language) {
  if (!calendarUsesPersianDigits(language)) return String(text ?? "");
  return toPersianDigits(text);
}

export function formatShamsiDate(date = new Date(), language = "fa") {
  const d = date instanceof Date ? date : new Date(date);
  const { jy, jm, jd } = jalaali.toJalaali(d);
  const weekday = WEEKDAYS_FA[d.getDay()];
  const shortWestern = `${jd}/${jm}/${jy}`;
  const fullWestern = `${weekday}${i18nData.calendars.dateComma} ${jd} ${JALAALI_MONTHS[jm - 1]} ${jy}`;
  return {
    label: i18nData.calendars.shamsi,
    short: shapeCalendarDigits(shortWestern, language),
    full: shapeCalendarDigits(fullWestern, language),
  };
}

export function formatGregorianDate(date = new Date(), language = "fa") {
  const d = date instanceof Date ? date : new Date(date);
  const locale = calendarUsesPersianDigits(language) ? "fa-IR" : "en-GB";
  const short = d.toLocaleDateString(locale);
  const full = d.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return {
    label: i18nData.calendars.gregorian,
    short: shapeCalendarDigits(short, language),
    full: shapeCalendarDigits(full, language),
  };
}

export function formatHijriDate(date = new Date(), language = "fa") {
  const d = date instanceof Date ? date : new Date(date);
  const locale = calendarUsesPersianDigits(language) ? "fa-IR-u-ca-islamic" : "en-u-ca-islamic";
  let short = "";
  let full = "";
  try {
    short = new Intl.DateTimeFormat(locale, { day: "numeric", month: "numeric", year: "numeric" }).format(d);
    full = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    short = d.toLocaleDateString(calendarUsesPersianDigits(language) ? "fa-IR" : "en-GB");
    full = short;
  }
  return {
    label: i18nData.calendars.hijri,
    short: shapeCalendarDigits(short, language),
    full: shapeCalendarDigits(full, language),
  };
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

export const CALENDAR_MODES = ["shamsi", "gregorian", "hijri"];

export function formatCalendar(mode, date = new Date(), language = "fa") {
  return formatByCalendar(mode, date, language);
}

export function formatFetchedAt(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
