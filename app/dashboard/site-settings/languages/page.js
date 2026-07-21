"use client";

import { useEffect, useState } from "react";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { API_ENDPOINTS } from "@/app/config/api";
import { SITE_LANGUAGES } from "@/app/config/siteLanguages";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";
import LanguageFlag from "@/app/components/ui/LanguageFlag";

export default function SiteLanguagesSettingsPage() {
  const { allowed, loading: authLoading } = useRequireAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(() => SITE_LANGUAGES.map((l) => l.code));

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(API_ENDPOINTS.siteSettings.getLanguages, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.success && Array.isArray(data.data?.codes)) {
          setSelected(data.data.codes);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) showToast.error("خطا در دریافت زبان‌ها");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  const toggle = (code) => {
    if (code === "fa") return;
    setSelected((prev) => {
      if (prev.includes(code)) return prev.filter((c) => c !== code);
      return [...prev, code];
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const codes = selected.includes("fa") ? selected : ["fa", ...selected];
      const res = await authFetch(API_ENDPOINTS.siteSettings.updateLanguages, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "خطا در ذخیره");
      }
      setSelected(data.data?.codes || codes);
      showToast.success(data.message || "ذخیره شد");
    } catch (err) {
      showToast.error(err.message || "خطا در ذخیره زبان‌ها");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !allowed) {
    return (
      <div className={`${dash.page} animate-pulse`}>
        <div className="h-8 w-48 rounded bg-slate-200" />
      </div>
    );
  }

  return (
    <div className={dash.page}>
      <div className="mb-6">
        <h1 className={dash.pageTitle}>زبان‌های سایت</h1>
        <p className="mt-1 text-sm text-slate-600">
          مشخص کنید کاربر در صفحه اصلی و هدر کدام زبان‌ها را بتواند انتخاب کند. فارسی همیشه فعال است.
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {SITE_LANGUAGES.map((item) => {
            const checked = selected.includes(item.code);
            const locked = item.code === "fa";
            return (
              <label
                key={item.code}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  checked
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-slate-200 bg-white hover:border-slate-300"
                } ${locked ? "cursor-default" : ""}`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={checked}
                  disabled={locked || saving}
                  onChange={() => toggle(item.code)}
                />
                <LanguageFlag countryCode={item.countryCode} className="h-4 w-6" />
                <span className="flex-1 text-sm font-medium text-slate-800">
                  {item.label}
                  <span className="ms-2 text-xs font-normal text-slate-500">({item.code})</span>
                </span>
                {locked ? (
                  <span className="text-xs text-emerald-700">همیشه فعال</span>
                ) : null}
              </label>
            );
          })}

          <div className="pt-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className={dash.btnPrimary}
            >
              {saving ? "در حال ذخیره…" : "ذخیره"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
