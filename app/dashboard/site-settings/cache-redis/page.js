"use client";

import { useCallback, useEffect, useState } from "react";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";

const DEFAULT_FORM = {
  enabled: true,
  ttlProducts: 120,
  ttlInventory: 60,
  ttlHomepage: 45,
  ttlSearch: 30,
  ttlSettings: 300,
};

const FLUSH_OPTIONS = [
  { id: "all", label: "همهٔ کش‌ها" },
  { id: "products", label: "محصولات / کاتالوگ" },
  { id: "inventory", label: "موجودی" },
  { id: "homepage", label: "صفحه اصلی" },
  { id: "search", label: "جستجو" },
  { id: "settings", label: "تنظیمات" },
];

export default function CacheRedisSettingsPage() {
  const { allowed, loading: authLoading } = useRequireAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flushing, setFlushing] = useState(null);
  const [pinging, setPinging] = useState(false);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const load = useCallback(async () => {
    try {
      const res = await authFetch(API_ENDPOINTS.siteSettings.getCache, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "خطا در دریافت");
      setStatus(data.data);
      const cfg = data.data?.cacheConfig || DEFAULT_FORM;
      setForm({
        enabled: cfg.enabled !== false,
        ttlProducts: cfg.ttlProducts ?? 120,
        ttlInventory: cfg.ttlInventory ?? 60,
        ttlHomepage: cfg.ttlHomepage ?? 45,
        ttlSearch: cfg.ttlSearch ?? 30,
        ttlSettings: cfg.ttlSettings ?? 300,
      });
    } catch (e) {
      console.error(e);
      showToast.error(e.message || "خطا در دریافت وضعیت کش");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    load();
  }, [allowed, load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await authFetch(API_ENDPOINTS.siteSettings.updateCache, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "خطا در ذخیره");
      setForm({ ...DEFAULT_FORM, ...data.data });
      showToast.success(data.message || "ذخیره شد");
      await load();
    } catch (e) {
      showToast.error(e.message || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const flush = async (namespace) => {
    setFlushing(namespace);
    try {
      const res = await authFetch(API_ENDPOINTS.siteSettings.flushCache, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "خطا در پاک‌سازی");
      showToast.success(data.message || "کش پاک شد");
      await load();
    } catch (e) {
      showToast.error(e.message || "خطا در پاک‌سازی کش");
    } finally {
      setFlushing(null);
    }
  };

  const ping = async () => {
    setPinging(true);
    try {
      const res = await authFetch(API_ENDPOINTS.siteSettings.pingCache, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) showToast.success(`Redis: ${data.message || "OK"}`);
      else showToast.error(data.message || "Redis در دسترس نیست");
      await load();
    } catch (e) {
      showToast.error(e.message || "خطا در تست Redis");
    } finally {
      setPinging(false);
    }
  };

  if (authLoading || !allowed) {
    return (
      <div className={`${dash.page} animate-pulse`}>
        <div className="h-8 w-48 rounded bg-slate-200" />
      </div>
    );
  }

  const redis = status?.redis;
  const connected = Boolean(redis?.connected);

  return (
    <div className={dash.page}>
      <div className="mb-6">
        <h1 className={dash.pageTitle}>کش و Redis</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          مدیریت کش سرور برای کاتالوگ، موجودی، صفحه اصلی و جستجو. در production از Redis استفاده می‌شود؛
          در محیط توسعه حافظهٔ موقت جایگزین است.
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-sm font-bold text-slate-900">وضعیت</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">حالت کش</dt>
                <dd className="font-semibold text-slate-900">{status?.mode === "redis" ? "Redis" : "حافظه موقت"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Production</dt>
                <dd className="font-semibold text-slate-900">{status?.production ? "بله" : "خیر (dev)"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Redis</dt>
                <dd className={`font-semibold ${connected ? "text-emerald-700" : "text-amber-700"}`}>
                  {connected ? "متصل" : redis?.configured ? "قطع / غیرفعال" : "در config غیرفعال"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">آدرس</dt>
                <dd className="font-mono text-xs text-slate-800">
                  {redis?.host}:{redis?.port} / db {redis?.db}
                </dd>
              </div>
              {redis?.info?.usedMemory ? (
                <div>
                  <dt className="text-slate-500">حافظه Redis</dt>
                  <dd className="font-semibold text-slate-900">{redis.info.usedMemory}</dd>
                </div>
              ) : null}
              {redis?.info?.dbKeys != null ? (
                <div>
                  <dt className="text-slate-500">تعداد کلیدها</dt>
                  <dd className="font-semibold text-slate-900">{redis.info.dbKeys}</dd>
                </div>
              ) : null}
              {redis?.lastError ? (
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">آخرین خطا</dt>
                  <dd className="text-xs text-rose-700">{redis.lastError}</dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={ping} disabled={pinging} className={dash.btnSecondary}>
                {pinging ? "در حال تست…" : "تست اتصال Redis"}
              </button>
              <button type="button" onClick={load} className={dash.btnSecondary}>
                تازه‌سازی وضعیت
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-sm font-bold text-slate-900">تنظیمات کش</h2>
            <p className="mt-1 text-xs text-slate-500">TTL بر حسب ثانیه است. صفر یعنی عملاً بدون ماندگاری مفید.</p>

            <label className="mt-4 flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                checked={form.enabled}
                onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              />
              <span className="text-sm font-medium text-slate-800">کش فعال باشد</span>
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["ttlProducts", "TTL محصولات"],
                ["ttlInventory", "TTL موجودی"],
                ["ttlHomepage", "TTL صفحه اصلی"],
                ["ttlSearch", "TTL جستجو"],
                ["ttlSettings", "TTL تنظیمات"],
              ].map(([key, label]) => (
                <label key={key} className="block text-sm">
                  <span className="text-slate-600">{label}</span>
                  <input
                    type="number"
                    min={0}
                    max={86400}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: Number(e.target.value) || 0 }))
                    }
                  />
                </label>
              ))}
            </div>

            <div className="mt-4">
              <button type="button" onClick={save} disabled={saving} className={dash.btnPrimary}>
                {saving ? "در حال ذخیره…" : "ذخیره تنظیمات"}
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-sm font-bold text-slate-900">پاک‌سازی / رفرش کش</h2>
            <p className="mt-1 text-xs text-slate-500">
              بعد از تغییر زیاد داده یا اگر دادهٔ قدیمی می‌بینید، کش مربوطه را پاک کنید.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FLUSH_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={flushing != null}
                  onClick={() => flush(opt.id)}
                  className={opt.id === "all" ? dash.btnPrimary : dash.btnSecondary}
                >
                  {flushing === opt.id ? "…" : `پاک کردن: ${opt.label}`}
                </button>
              ))}
            </div>
          </section>

          <p className="text-xs text-slate-500">
            اتصال Redis از فایل <code className="rounded bg-slate-100 px-1">api/config/production.json</code> خوانده
            می‌شود (HOST / PORT / PASSWORD). رمز را فقط در صورت نیاز پر کنید.
          </p>
        </div>
      )}
    </div>
  );
}
