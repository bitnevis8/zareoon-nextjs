import jalaali from "jalaali-js";
import i18nData from "./i18nFaData";

const JALAALI_MONTHS = i18nData.calendars.months;
const WEEKDAYS_FA = i18nData.calendars.weekdays;

export function formatShamsiDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const { jy, jm, jd } = jalaali.toJalaali(d);
  const weekday = WEEKDAYS_FA[d.getDay()];
  return {
    label: i18nData.calendars.shamsi,
    short: `${jd}/${jm}/${jy}`,
    full: `${weekday}${i18nData.calendars.dateComma} ${jd.toLocaleString("fa-IR")} ${JALAALI_MONTHS[jm - 1]} ${jy.toLocaleString("fa-IR")}`,
  };
}

export function formatGregorianDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const short = d.toLocaleDateString("fa-IR");
  const full = d.toLocaleDateString("fa-IR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return { label: i18nData.calendars.gregorian, short, full };
}

export function formatHijriDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  let short = "";
  let full = "";
  try {
    short = new Intl.DateTimeFormat("fa-IR-u-ca-islamic", { day: "numeric", month: "numeric", year: "numeric" }).format(d);
    full = new Intl.DateTimeFormat("fa-IR-u-ca-islamic", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
  } catch {
    short = d.toLocaleDateString("fa-IR");
    full = short;
  }
  return { label: i18nData.calendars.hijri, short, full };
}

export function cycleCalendar(current) {
  if (current === "shamsi") return "gregorian";
  if (current === "gregorian") return "hijri";
  return "shamsi";
}

export function formatByCalendar(type, date = new Date()) {
  if (type === "gregorian") return formatGregorianDate(date);
  if (type === "hijri") return formatHijriDate(date);
  return formatShamsiDate(date);
}

export const CALENDAR_MODES = ["shamsi", "gregorian", "hijri"];

export function formatCalendar(mode, date = new Date()) {
  return formatByCalendar(mode, date);
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
