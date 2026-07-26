"use client";

import { useMemo, useState } from "react";
import {
  PHONE_COUNTRIES,
  getPhoneCountry,
  normalizePhoneNumber,
  isValidEmail,
} from "@/app/config/phoneCountries";
import { authInputClass } from "@/app/components/auth/AuthShell";

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
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => onModeChange("phone")}
            className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              mode === "phone"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            موبایل
          </button>
          <button
            type="button"
            onClick={() => onModeChange("email")}
            className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              mode === "email"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ایمیل
          </button>
        </div>
      ) : null}

      {mode === "email" && emailEnabled ? (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">ایمیل</label>
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
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900 ring-1 ring-amber-100">
            کد به ایمیل می‌آید؛ اگر نبود، Spam را هم چک کنید.
          </p>
        </div>
      ) : null}

      {mode === "phone" && phoneEnabled ? (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">شماره موبایل</label>
          <div className="relative flex gap-2" dir="ltr">
            <div className="relative shrink-0">
              <button
                type="button"
                disabled={!multiCountry}
                onClick={() => multiCountry && setCountryOpen((o) => !o)}
                className={`flex h-12 min-w-[5.5rem] items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-800 shadow-sm ${
                  multiCountry ? "hover:border-emerald-300" : "cursor-default"
                }`}
                aria-label="کد کشور"
              >
                <span className="text-lg leading-none">{country.flag}</span>
                <span dir="ltr">+{country.dial}</span>
                {multiCountry ? <span className="text-[10px] text-slate-400">▾</span> : null}
              </button>
              {countryOpen && multiCountry ? (
                <div className="absolute start-0 top-[calc(100%+4px)] z-30 max-h-56 w-56 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  {allowed.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        onCountryCodeChange(c.code);
                        setCountryOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-emerald-50 ${
                        c.code === country.code ? "bg-emerald-50 font-bold text-emerald-900" : "text-slate-700"
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span className="min-w-0 flex-1 truncate">{c.nameFa}</span>
                      <span className="text-xs text-slate-400" dir="ltr">
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
          <p className="text-[11px] leading-5 text-slate-500">
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
