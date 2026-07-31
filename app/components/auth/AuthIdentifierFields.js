"use client";

import { useMemo, useState } from "react";
import {
  PHONE_COUNTRIES,
  getPhoneCountry,
  normalizePhoneNumber,
  isValidEmail,
} from "@/app/config/phoneCountries";
import { authInputClass } from "@/app/components/auth/AuthShell";

function PhoneModeIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    </svg>
  );
}

function EmailModeIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function ModeTab({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 transition sm:py-3 ${
        active
          ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-100"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${
          active ? "bg-emerald-50 text-emerald-700" : "bg-transparent text-slate-400"
        }`}
      >
        {icon}
      </span>
      <span className="text-[11px] font-bold leading-none sm:text-xs">{label}</span>
    </button>
  );
}

/**
 * تب موبایل / ایمیل + ورودی شماره با پرچم و کد کشور
 */
export default function AuthIdentifierFields({
  mode,
  onModeChange,
  email,
  onEmailChange,
  countryCode,
  onCountryCodeChange,
  nationalNumber,
  onNationalNumberChange,
  allowedPhoneCountries = ["IR"],
  emailEnabled = true,
  phoneEnabled = true,
  error = null,
}) {
  const [countryOpen, setCountryOpen] = useState(false);

  const allowed = useMemo(() => {
    const set = new Set((allowedPhoneCountries || []).map((c) => String(c).toUpperCase()));
    const list = PHONE_COUNTRIES.filter((c) => set.has(c.code));
    return list.length ? list : PHONE_COUNTRIES.filter((c) => c.code === "IR");
  }, [allowedPhoneCountries]);

  const country = getPhoneCountry(countryCode) || allowed[0];
  const multiCountry = allowed.length > 1;

  const showModeTabs = emailEnabled && phoneEnabled;

  return (
    <div className="space-y-3">
      {showModeTabs ? (
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 sm:rounded-2xl">
          <ModeTab
            active={mode === "phone"}
            onClick={() => onModeChange("phone")}
            icon={<PhoneModeIcon className="h-[1.125rem] w-[1.125rem]" />}
            label="موبایل"
          />
          <ModeTab
            active={mode === "email"}
            onClick={() => onModeChange("email")}
            icon={<EmailModeIcon className="h-[1.125rem] w-[1.125rem]" />}
            label="ایمیل"
          />
        </div>
      ) : null}

      {mode === "email" && emailEnabled ? (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 sm:text-sm">ایمیل</label>
          <input
            type="email"
            autoComplete="email"
            dir="ltr"
            value={email}
            onChange={(e) => onEmailChange(e.target.value.trim())}
            placeholder="name@example.com"
            className={`${authInputClass} text-left`}
            required
          />
          <p className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] leading-4 text-amber-900 ring-1 ring-amber-100 sm:rounded-xl sm:px-3 sm:py-2 sm:text-[11px] sm:leading-5">
            کد به ایمیل می‌آید؛ اگر نبود، Spam را هم چک کنید.
          </p>
        </div>
      ) : null}

      {mode === "phone" && phoneEnabled ? (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 sm:text-sm">شماره موبایل</label>
          <div className="relative flex gap-1.5 sm:gap-2" dir="ltr">
            <div className="relative shrink-0">
              <button
                type="button"
                disabled={!multiCountry}
                onClick={() => multiCountry && setCountryOpen((o) => !o)}
                className={`flex h-11 min-w-[4.75rem] items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-800 shadow-sm sm:h-12 sm:min-w-[5.5rem] sm:rounded-2xl sm:gap-1.5 sm:px-2.5 sm:text-sm ${
                  multiCountry ? "hover:border-emerald-300" : "cursor-default"
                }`}
                aria-label="کد کشور"
              >
                <span className="text-base leading-none sm:text-lg">{country.flag}</span>
                <span dir="ltr">+{country.dial}</span>
                {multiCountry ? <span className="text-[10px] text-slate-400">▾</span> : null}
              </button>
              {countryOpen && multiCountry ? (
                <div className="absolute start-0 top-[calc(100%+4px)] z-30 max-h-56 w-52 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg sm:w-56">
                  {allowed.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        onCountryCodeChange(c.code);
                        setCountryOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-start text-xs hover:bg-emerald-50 sm:text-sm ${
                        c.code === country.code ? "bg-emerald-50 font-bold text-emerald-900" : "text-slate-700"
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span className="min-w-0 flex-1 truncate">{c.nameFa}</span>
                      <span className="text-[11px] text-slate-400 sm:text-xs" dir="ltr">
                        +{c.dial}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              dir="ltr"
              value={nationalNumber}
              onChange={(e) => {
                const max = (country.nationalMax || 12) + (country.code === "IR" ? 1 : 0);
                onNationalNumberChange(e.target.value.replace(/\D/g, "").slice(0, max));
              }}
              placeholder={country.example || country.nationalHint || "9…"}
              className={`${authInputClass} flex-1 text-left tracking-wide`}
              required
            />
          </div>
          <p className="text-[10px] leading-4 text-slate-500 sm:text-[11px] sm:leading-5">
            {country.code === "IR"
              ? "شماره را بدون صفر اول یا با ۰۹ وارد کنید؛ کد ایران +۹۸ است."
              : `کد کشور +${country.dial} — فقط ارقام ملی را وارد کنید.`}
          </p>
        </div>
      ) : null}

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

export function buildAuthIdentifier({ mode, email, countryCode, nationalNumber }) {
  if (mode === "email") {
    const e = String(email || "").trim().toLowerCase();
    if (!isValidEmail(e)) return { ok: false, message: "ایمیل معتبر وارد کنید" };
    return { ok: true, identifier: e, isEmail: true, isMobile: false, countryCode: null };
  }
  const phone = normalizePhoneNumber(countryCode, nationalNumber);
  if (!phone) {
    return {
      ok: false,
      message:
        countryCode === "IR"
          ? "شماره موبایل ایران باید ۱۰ رقم و با ۹ شروع شود (مثال: ۹۱۲۳۴۵۶۷۸۹)"
          : "شماره موبایل معتبر نیست",
    };
  }
  return {
    ok: true,
    identifier: phone,
    isEmail: false,
    isMobile: true,
    countryCode,
  };
}
