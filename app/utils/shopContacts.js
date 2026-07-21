/** نرمال‌سازی تماس فروشگاه (فرانت) */

export const MAX_PHONES = 3;
export const MAX_EMAILS = 3;

export const MESSENGER_META = [
  {
    key: "whatsapp",
    label: "واتساپ",
    placeholder: "09xxxxxxxxx",
    hint: "شماره واتساپ فروشگاه",
  },
  {
    key: "telegram",
    label: "تلگرام",
    placeholder: "@username یا شماره",
    hint: "آیدی یا شماره تلگرام",
  },
  {
    key: "eitaa",
    label: "ایتا",
    placeholder: "آیدی یا شماره",
    hint: "آیدی یا شماره ایتا",
  },
  {
    key: "rubika",
    label: "روبیکا",
    placeholder: "آیدی یا شماره",
    hint: "آیدی یا شماره روبیکا",
  },
];

export function emptyShopContacts() {
  return {
    phones: [""],
    emails: [""],
    messengers: {},
  };
}

export function normalizeShopContacts(raw, legacy = {}) {
  const src = raw && typeof raw === "object" ? raw : {};
  let phones = Array.isArray(src.phones) ? src.phones.map((p) => String(p || "").trim()) : [];
  let emails = Array.isArray(src.emails) ? src.emails.map((e) => String(e || "").trim()) : [];

  phones = phones.filter(Boolean);
  emails = emails.filter(Boolean);

  if (!phones.length) {
    [legacy.publicPhone, legacy.publicLandline].forEach((p) => {
      if (p && phones.length < MAX_PHONES) phones.push(String(p).trim());
    });
  }
  if (!emails.length && legacy.publicEmail) emails.push(String(legacy.publicEmail).trim());

  const mIn = src.messengers && typeof src.messengers === "object" ? src.messengers : {};
  const messengers = {};
  for (const { key } of MESSENGER_META) {
    const v = String(mIn[key] || src[key] || "").trim();
    if (v) messengers[key] = v;
  }

  return {
    phones: phones.length ? phones.slice(0, MAX_PHONES) : [""],
    emails: emails.length ? emails.slice(0, MAX_EMAILS) : [""],
    messengers,
  };
}

/** برای ارسال به API — خالی‌ها حذف می‌شوند */
export function serializeShopContacts(formContacts) {
  const phones = (formContacts.phones || []).map((p) => String(p || "").trim()).filter(Boolean).slice(0, MAX_PHONES);
  const emails = (formContacts.emails || []).map((e) => String(e || "").trim()).filter(Boolean).slice(0, MAX_EMAILS);
  const messengers = {};
  for (const { key } of MESSENGER_META) {
    const v = String(formContacts.messengers?.[key] || "").trim();
    if (v) messengers[key] = v.slice(0, 80);
  }
  return { phones, emails, messengers };
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

/** لینک تماس برای پیام‌رسان‌ها */
export function messengerHref(key, value) {
  const v = String(value || "").trim();
  if (!v) return null;
  if (key === "whatsapp") {
    let d = digitsOnly(v);
    if (d.startsWith("0")) d = `98${d.slice(1)}`;
    if (!d) return null;
    return `https://wa.me/${d}`;
  }
  if (key === "telegram") {
    if (v.startsWith("@")) return `https://t.me/${v.slice(1)}`;
    if (/^https?:\/\//i.test(v)) return v;
    if (/^[a-zA-Z][\w\d_]{3,}$/.test(v)) return `https://t.me/${v}`;
    const d = digitsOnly(v);
    if (d) return `https://t.me/+${d}`;
    return `https://t.me/${v.replace(/^@/, "")}`;
  }
  if (key === "eitaa") {
    if (/^https?:\/\//i.test(v)) return v;
    const id = v.replace(/^@/, "");
    return `https://eitaa.com/${id}`;
  }
  if (key === "rubika") {
    if (/^https?:\/\//i.test(v)) return v;
    return null;
  }
  return null;
}
