import { toJalaali } from "jalaali-js";

const JALAALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const WEEKDAYS_FA = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

function toDate(input) {
  return input instanceof Date ? input : new Date(input);
}

export function formatShamsi(date = new Date()) {
  const d = toDate(date);
  const { jy, jm, jd } = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const weekday = WEEKDAYS_FA[d.getDay()];
  return {
    label: "شمسی",
    short: `${jd.toLocaleString("fa-IR")} ${JALAALI_MONTHS[jm - 1]}`,
    full: `${weekday}، ${jd.toLocaleString("fa-IR")} ${JALAALI_MONTHS[jm - 1]} ${jy.toLocaleString("fa-IR")}`,
  };
}

export function formatGregorian(date = new Date()) {
  const d = toDate(date);
  const full = new Intl.DateTimeFormat("fa-IR-u-ca-gregory", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
  const short = new Intl.DateTimeFormat("fa-IR-u-ca-gregory", {
    month: "short",
    day: "numeric",
  }).format(d);
  return { label: "میلادی", short, full };
}

export function formatHijri(date = new Date()) {
  const d = toDate(date);
  const full = new Intl.DateTimeFormat("fa-IR-u-ca-islamic", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
  const short = new Intl.DateTimeFormat("fa-IR-u-ca-islamic", {
    month: "short",
    day: "numeric",
  }).format(d);
  return { label: "قمری", short, full };
}

export const CALENDAR_MODES = ["shamsi", "gregorian", "hijri"];

export function formatCalendar(mode, date = new Date()) {
  if (mode === "gregorian") return formatGregorian(date);
  if (mode === "hijri") return formatHijri(date);
  return formatShamsi(date);
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
