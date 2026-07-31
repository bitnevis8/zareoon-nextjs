"use client";

import { useEffect, useMemo, useState } from "react";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { API_ENDPOINTS } from "@/app/config/api";
import { PHONE_COUNTRIES, DEFAULT_AUTH_SIGNUP_CONFIG } from "@/app/config/phoneCountries";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";
import { Bone } from "@/app/components/ui/Skeleton";

export default function AuthSignupSettingsPage() {
  const { allowed, loading: authLoading } = useRequireAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState(DEFAULT_AUTH_SIGNUP_CONFIG);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(API_ENDPOINTS.siteSettings.getAuthSignup, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.success && data.data) {
          setCfg({ ...DEFAULT_AUTH_SIGNUP_CONFIG, ...data.data });
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) showToast.error("خطا در دریافت تنظیمات");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter(
      (c) =>
        c.code.toLowerCase().includes(s) ||
        c.nameFa.includes(q.trim()) ||
        c.nameEn.toLowerCase().includes(s) ||
        c.dial.includes(s)
    );
  }, [q]);

  const toggleCountry = (code) => {
    setCfg((prev) => {
      const set = new Set(prev.allowedPhoneCountries || []);
      if (set.has(code)) {
        if (code === "IR") return prev;
        set.delete(code);
      } else set.add(code);
      const allowed = [...set];
      let defaultPhoneCountry = prev.defaultPhoneCountry;
      if (!allowed.includes(defaultPhoneCountry)) defaultPhoneCountry = allowed[0] || "IR";
      return { ...prev, allowedPhoneCountries: allowed, defaultPhoneCountry };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await authFetch(API_ENDPOINTS.siteSettings.updateAuthSignup, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailEnabled: cfg.emailEnabled,
          phoneEnabled: cfg.phoneEnabled,
          allowedPhoneCountries: cfg.allowedPhoneCountries,
          defaultPhoneCountry: cfg.defaultPhoneCountry,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "خطا در ذخیره");
      setCfg({ ...DEFAULT_AUTH_SIGNUP_CONFIG, ...data.data });
      showToast.success(data.message || "ذخیره شد");
    } catch (err) {
      showToast.error(err.message || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !allowed) {
    return (
      <div className={dash.page}>
        <Bone className="h-8 w-48" rounded="rounded-lg" />
      </div>
    );
  }

  return (
    <div className={dash.page}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className={dash.pageTitle}>ثبت‌نام — ایمیل و موبایل</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            تعیین کنید کاربر بتواند با ایمیل و/یا موبایل ثبت‌نام کند. کشورهای موبایل را از قبل آماده کنید؛
            فعلاً پیامک فقط برای ایران فعال است. با فعال‌کردن کشور دیگر، انتخابگر پرچم در فرم ورود ظاهر می‌شود.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "در حال ذخیره…" : "ذخیره"}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Bone className="h-24 w-full" rounded="rounded-xl" />
          <Bone className="h-64 w-full" rounded="rounded-xl" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span>
                <span className="block text-sm font-bold text-slate-800">ثبت‌نام با ایمیل</span>
                <span className="text-[11px] text-slate-500">مناسب کاربران خارج از ایران</span>
              </span>
              <input
                type="checkbox"
                checked={cfg.emailEnabled}
                onChange={(e) => setCfg((p) => ({ ...p, emailEnabled: e.target.checked }))}
                className="h-5 w-5 rounded border-slate-300 text-emerald-600"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span>
                <span className="block text-sm font-bold text-slate-800">ثبت‌نام با موبایل</span>
                <span className="text-[11px] text-slate-500">با پرچم و کد کشور</span>
              </span>
              <input
                type="checkbox"
                checked={cfg.phoneEnabled}
                onChange={(e) => setCfg((p) => ({ ...p, phoneEnabled: e.target.checked }))}
                className="h-5 w-5 rounded border-slate-300 text-emerald-600"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-800">کشورهای مجاز برای موبایل</h2>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجو: ایران، Germany، 98…"
                className="h-9 w-full max-w-xs rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 sm:w-64"
              />
            </div>
            <p className="mb-3 text-[11px] text-slate-500">
              فعال: {(cfg.allowedPhoneCountries || []).length} کشور — ایران همیشه قابل نگه‌داشتن است.
            </p>
            <div className="max-h-[28rem] space-y-1 overflow-auto pr-1">
              {filtered.map((c) => {
                const on = (cfg.allowedPhoneCountries || []).includes(c.code);
                return (
                  <label
                    key={c.code}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                      on ? "bg-emerald-50 ring-1 ring-emerald-100" : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={c.code === "IR" && on && (cfg.allowedPhoneCountries || []).length === 1}
                      onChange={() => toggleCountry(c.code)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                    />
                    <span className="text-lg">{c.flag}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-800">{c.nameFa}</span>
                      <span className="text-[10px] text-slate-400">
                        {c.nameEn} · {c.code}
                      </span>
                    </span>
                    <span className="text-xs font-bold text-slate-500" dir="ltr">
                      +{c.dial}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
