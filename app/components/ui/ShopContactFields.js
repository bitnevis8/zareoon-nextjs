"use client";

import {
  MAX_EMAILS,
  MAX_PHONES,
  MESSENGER_META,
} from "@/app/utils/shopContacts";

function PhoneIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.528-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}

function MailIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

function MessengerGlyph({ type, className = "h-5 w-5" }) {
  if (type === "whatsapp") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 2C6.486 2 2 6.318 2 11.85c0 1.74.47 3.37 1.29 4.79L2 22l5.55-1.45A10.1 10.1 0 0012 21.7C17.514 21.7 22 17.382 22 11.85 22 6.318 17.514 2 12 2zm0 17.95c-1.61 0-3.11-.43-4.41-1.18l-.32-.18-3.29.86.88-3.2-.2-.33A7.7 7.7 0 014.3 11.85c0-4.17 3.46-7.55 7.7-7.55s7.7 3.38 7.7 7.55-3.46 7.55-7.7 7.55z" />
      </svg>
    );
  }
  if (type === "telegram") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M9.78 14.65l-.37 5.21c.53 0 .76-.23 1.04-.5l2.5-2.39 5.18 3.8c.95.53 1.63.25 1.89-.88l3.42-16.07h.01c.3-1.41-.51-1.96-1.44-1.62L2.3 9.17c-1.37.53-1.35 1.29-.23 1.63l4.98 1.55 11.56-7.28c.54-.33 1.04-.15.63.21" />
      </svg>
    );
  }
  if (type === "eitaa") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M8 12h8M12 8v8" />
      </svg>
    );
  }
  // rubika
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path strokeLinecap="round" d="M8 12h8M8 8.5h5M8 15.5h5" />
    </svg>
  );
}

const MESSENGER_COLORS = {
  whatsapp: "bg-emerald-50 text-emerald-700 border-emerald-200",
  telegram: "bg-sky-50 text-sky-700 border-sky-200",
  eitaa: "bg-orange-50 text-orange-700 border-orange-200",
  rubika: "bg-violet-50 text-violet-700 border-violet-200",
};

/**
 * ویرایشگر تماس فروشگاه: تا ۳ تلفن، چند ایمیل، پیام‌رسان‌ها
 */
export default function ShopContactFields({ value, onChange, inputClassName = "" }) {
  const contacts = value || { phones: [""], emails: [""], messengers: {} };
  const phones = contacts.phones?.length ? contacts.phones : [""];
  const emails = contacts.emails?.length ? contacts.emails : [""];
  const messengers = contacts.messengers || {};

  const patch = (next) => onChange?.({ ...contacts, ...next });

  const setPhone = (idx, v) => {
    const next = [...phones];
    next[idx] = v;
    patch({ phones: next });
  };
  const addPhone = () => {
    if (phones.length >= MAX_PHONES) return;
    patch({ phones: [...phones, ""] });
  };
  const removePhone = (idx) => {
    if (phones.length <= 1) {
      patch({ phones: [""] });
      return;
    }
    patch({ phones: phones.filter((_, i) => i !== idx) });
  };

  const setEmail = (idx, v) => {
    const next = [...emails];
    next[idx] = v;
    patch({ emails: next });
  };
  const addEmail = () => {
    if (emails.length >= MAX_EMAILS) return;
    patch({ emails: [...emails, ""] });
  };
  const removeEmail = (idx) => {
    if (emails.length <= 1) {
      patch({ emails: [""] });
      return;
    }
    patch({ emails: emails.filter((_, i) => i !== idx) });
  };

  const setMessenger = (key, v) => {
    patch({ messengers: { ...messengers, [key]: v } });
  };

  const enableMessenger = (key) => {
    patch({ messengers: { ...messengers, [key]: messengers[key] || "" } });
  };
  const disableMessenger = (key) => {
    const next = { ...messengers };
    delete next[key];
    patch({ messengers: next });
  };

  return (
    <div className="space-y-6">
      {/* Phones */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <PhoneIcon />
            </span>
            موبایل / تلفن
          </div>
          <span className="text-[11px] text-slate-400">حداکثر {MAX_PHONES} شماره</span>
        </div>
        <div className="space-y-2">
          {phones.map((phone, idx) => (
            <div key={`phone-${idx}`} className="flex gap-2">
              <input
                className={inputClassName}
                value={phone}
                onChange={(e) => setPhone(idx, e.target.value)}
                dir="ltr"
                placeholder={idx === 0 ? "09xxxxxxxxx" : "شماره دیگر"}
                inputMode="tel"
              />
              {phones.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removePhone(idx)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="حذف شماره"
                >
                  <TrashIcon />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        {phones.length < MAX_PHONES ? (
          <button
            type="button"
            onClick={addPhone}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-dashed border-emerald-300 px-3 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            <PlusIcon />
            افزودن شماره
          </button>
        ) : null}
      </div>

      {/* Emails */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <MailIcon />
            </span>
            ایمیل فروشگاه
          </div>
          <span className="text-[11px] text-slate-400">حداکثر {MAX_EMAILS} ایمیل</span>
        </div>
        <div className="space-y-2">
          {emails.map((email, idx) => (
            <div key={`email-${idx}`} className="flex gap-2">
              <input
                type="email"
                className={inputClassName}
                value={email}
                onChange={(e) => setEmail(idx, e.target.value)}
                dir="ltr"
                placeholder="shop@example.com"
              />
              {emails.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeEmail(idx)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="حذف ایمیل"
                >
                  <TrashIcon />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        {emails.length < MAX_EMAILS ? (
          <button
            type="button"
            onClick={addEmail}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-dashed border-sky-300 px-3 text-sm font-medium text-sky-700 hover:bg-sky-50"
          >
            <PlusIcon />
            افزودن ایمیل
          </button>
        ) : null}
      </div>

      {/* Messengers */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">پیام‌رسان‌ها</p>
          <p className="mt-0.5 text-xs text-slate-500">اگر واتساپ، تلگرام، ایتا یا روبیکا دارید، فعال کنید و شماره/آیدی را بنویسید.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {MESSENGER_META.map(({ key, label, placeholder }) => {
            const open = typeof messengers[key] === "string";
            return (
              <div
                key={key}
                className={`rounded-xl border p-3 transition ${
                  open ? "border-slate-200 bg-white shadow-sm" : "border-slate-100 bg-slate-50/80"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border ${MESSENGER_COLORS[key]}`}
                    >
                      <MessengerGlyph type={key} className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{label}</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={open}
                    onClick={() => (open ? disableMessenger(key) : enableMessenger(key))}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      open ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        open ? "end-0.5" : "start-0.5"
                      }`}
                    />
                  </button>
                </div>
                {open ? (
                  <input
                    className={`${inputClassName} mt-2.5`}
                    value={messengers[key] || ""}
                    onChange={(e) => setMessenger(key, e.target.value)}
                    dir="ltr"
                    placeholder={placeholder}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { MessengerGlyph, MESSENGER_COLORS };
