/** ساعت کاری پیش‌فرض فروشگاه / خدمات */
export const WEEK_DAY_KEYS = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export const DEFAULT_BUSINESS_HOURS = {
  saturday: { closed: false, open: "08:00", close: "18:00" },
  sunday: { closed: false, open: "08:00", close: "18:00" },
  monday: { closed: false, open: "08:00", close: "18:00" },
  tuesday: { closed: false, open: "08:00", close: "18:00" },
  wednesday: { closed: false, open: "08:00", close: "18:00" },
  thursday: { closed: false, open: "08:00", close: "18:00" },
  friday: { closed: true, open: "", close: "" },
};

export const DAY_LABELS_FA = {
  saturday: "شنبه",
  sunday: "یکشنبه",
  monday: "دوشنبه",
  tuesday: "سه‌شنبه",
  wednesday: "چهارشنبه",
  thursday: "پنجشنبه",
  friday: "جمعه",
};

export function mergeBusinessHours(raw) {
  const base = { ...DEFAULT_BUSINESS_HOURS };
  if (!raw || typeof raw !== "object") return base;
  for (const key of WEEK_DAY_KEYS) {
    if (raw[key]) base[key] = { ...base[key], ...raw[key] };
  }
  return base;
}

/** مرکز پیش‌فرض نقشه: تهران */
export const DEFAULT_MAP_CENTER = { latitude: 35.6892, longitude: 51.389 };

export function parseLatLng(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}
