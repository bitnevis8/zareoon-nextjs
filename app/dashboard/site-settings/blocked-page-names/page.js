"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";

export default function BlockedPageNamesSettingsPage() {
  const { allowed, loading: authLoading } = useRequireAdmin();
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [slugs, setSlugs] = useState([]);
  const [catalogMeta, setCatalogMeta] = useState({ version: "", count: 0 });
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("");
  const [importMode, setImportMode] = useState("replace");
  const [slugRules, setSlugRules] = useState({ minLength: 5, maxLength: 30 });

  const load = async () => {
    const res = await authFetch(API_ENDPOINTS.siteSettings.getBlockedPageSlugs, {
      cache: "no-store",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "خطا در دریافت");
    setSlugs(Array.isArray(data.data?.slugs) ? data.data.slugs : []);
    if (data.data?.slugRules) {
      setSlugRules({
        minLength: Number(data.data.slugRules.minLength) || 5,
        maxLength: Number(data.data.slugRules.maxLength) || 30,
      });
    }
    setCatalogMeta({
      version: data.data?.catalogVersion || "",
      count: data.data?.catalogCount || data.data?.reserved?.length || 0,
    });
  };

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        console.error(e);
        if (!cancelled) showToast.error("خطا در دریافت اسامی غیرمجاز");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return slugs;
    return slugs.filter((s) => s.includes(q));
  }, [slugs, filter]);

  const addSlug = () => {
    const raw = draft.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!raw || raw.length < 2) {
      showToast.error("نام باید حداقل ۲ حرف انگلیسی باشد");
      return;
    }
    if (slugs.includes(raw)) {
      showToast.error("این نام از قبل در لیست است");
      return;
    }
    setSlugs((prev) => [...prev, raw].sort());
    setDraft("");
  };

  const removeSlug = (item) => {
    setSlugs((prev) => prev.filter((s) => s !== item));
  };

  const save = async () => {
    setSaving(true);
    try {
      const min = Number(slugRules.minLength);
      const max = Number(slugRules.maxLength);
      if (!Number.isFinite(min) || min < 2 || min > 20) {
        throw new Error("حداقل طول باید بین ۲ تا ۲۰ باشد");
      }
      if (!Number.isFinite(max) || max < 5 || max > 80) {
        throw new Error("حداکثر طول باید بین ۵ تا ۸۰ باشد");
      }
      if (max < min) {
        throw new Error("حداکثر طول نمی‌تواند کمتر از حداقل باشد");
      }
      const res = await authFetch(API_ENDPOINTS.siteSettings.updateBlockedPageSlugs, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slugs,
          slugRules: { minLength: min, maxLength: max },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "خطا در ذخیره");
      setSlugs(data.data?.slugs || slugs);
      if (data.data?.slugRules) setSlugRules(data.data.slugRules);
      showToast.success(data.message || "ذخیره شد");
    } catch (err) {
      showToast.error(err.message || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const exportJson = async () => {
    setBusy(true);
    try {
      const res = await authFetch(API_ENDPOINTS.siteSettings.exportBlockedPageSlugs, {
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "خطا در خروجی");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zareoon-blocked-page-slugs-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast.success("فایل JSON دانلود شد");
    } catch (err) {
      showToast.error(err.message || "خطا در اکسپورت");
    } finally {
      setBusy(false);
    }
  };

  const onImportFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const catalog = JSON.parse(text);
      const res = await authFetch(API_ENDPOINTS.siteSettings.importBlockedPageSlugs, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalog, mode: importMode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "خطا در ایمپورت");
      setSlugs(data.data?.slugs || []);
      showToast.success(data.message || "ایمپورت شد");
    } catch (err) {
      showToast.error(err.message || "فایل JSON نامعتبر است");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const resetFromCatalog = async () => {
    if (!window.confirm("لیست فعلی با فایل پیش‌فرض zareoon-reserved-usernames جایگزین شود؟")) {
      return;
    }
    setBusy(true);
    try {
      const res = await authFetch(API_ENDPOINTS.siteSettings.resetBlockedPageSlugs, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "خطا");
      setSlugs(data.data?.slugs || []);
      showToast.success(data.message || "بازنشانی شد");
    } catch (err) {
      showToast.error(err.message || "خطا در بازنشانی");
    } finally {
      setBusy(false);
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
        <h1 className={dash.pageTitle}>اسامی غیرمجاز صفحه</h1>
        <p className="mt-1 text-sm text-slate-600">
          آدرس فروشگاه به شکل <span dir="ltr" className="font-semibold">zareoon.ir/name</span> است. لیست
          پیش‌فرض از فایل{" "}
          <span dir="ltr" className="font-mono text-xs">
            zareoon-reserved-usernames.v1.json
          </span>{" "}
          بارگذاری می‌شود
          {catalogMeta.version ? ` (نسخه ${catalogMeta.version}` : ""}
          {catalogMeta.count ? ` · ${catalogMeta.count.toLocaleString("fa-IR")} مورد در فایل)` : catalogMeta.version ? ")" : ""}
          . می‌توانید طول مجاز نام صفحه، لیست اسامی غیرمجاز، و ایمپورت/اکسپورت را مدیریت کنید.
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-12 rounded-xl bg-slate-100" />
          <div className="h-24 rounded-xl bg-slate-100" />
        </div>
      ) : (
        <div className="space-y-6">
          <section className={`${dash.card} ${dash.cardBody} space-y-4`}>
            <div>
              <h2 className={dash.cardTitle}>محدودیت طول نام صفحه تجاری</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                حداقل و حداکثر تعداد حروف انگلیسی برای آدرس صفحه (مثل <span dir="ltr">example</span>). روی
                ایجاد فروشگاه، خدمات و تغییر آدرس اعمال می‌شود.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                حداقل تعداد حروف
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={slugRules.minLength}
                  onChange={(e) =>
                    setSlugRules((r) => ({ ...r, minLength: Number(e.target.value) || "" }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  dir="ltr"
                />
                <span className="mt-1 block text-[11px] font-normal text-slate-400">بین ۲ تا ۲۰</span>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                حداکثر تعداد حروف
                <input
                  type="number"
                  min={5}
                  max={80}
                  value={slugRules.maxLength}
                  onChange={(e) =>
                    setSlugRules((r) => ({ ...r, maxLength: Number(e.target.value) || "" }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  dir="ltr"
                />
                <span className="mt-1 block text-[11px] font-normal text-slate-400">بین ۵ تا ۸۰</span>
              </label>
            </div>
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              تنظیم فعلی: حداقل {String(slugRules.minLength).toLocaleString("fa-IR")} و حداکثر{" "}
              {String(slugRules.maxLength).toLocaleString("fa-IR")} حرف
            </p>
          </section>

          <section className={`${dash.card} ${dash.cardBody} space-y-3`}>
            <h2 className={dash.cardTitle}>اکسپورت / ایمپورت JSON</h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={exportJson} className={dash.btnSecondary}>
                دانلود JSON
              </button>
              <button type="button" disabled={busy} onClick={resetFromCatalog} className={dash.btnSecondary}>
                بارگذاری مجدد از فایل پیش‌فرض
              </button>
              <label className={`${dash.btnSecondary} cursor-pointer`}>
                انتخاب فایل برای ایمپورت
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => onImportFile(e.target.files?.[0])}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === "replace"}
                  onChange={() => setImportMode("replace")}
                />
                جایگزینی کامل
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === "merge"}
                  onChange={() => setImportMode("merge")}
                />
                ادغام با لیست فعلی
              </label>
            </div>
            <p className="text-[11px] leading-5 text-slate-500">
              فرمت قابل قبول: کاتالوگ کامل با فیلد <span dir="ltr">reserved</span> یا آبجکت ساده{" "}
              <span dir="ltr">{`{ "slugs": ["admin", "..."] }`}</span>
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                لیست فعال ({slugs.length.toLocaleString("fa-IR")} مورد)
              </h2>
              <input
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="جستجو…"
                className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm sm:w-56"
                dir="ltr"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="block flex-1 text-sm font-semibold text-slate-700">
                افزودن نام
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSlug();
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e.g. brand-name"
                  dir="ltr"
                  spellCheck={false}
                />
              </label>
              <button type="button" onClick={addSlug} className={dash.btnSecondary}>
                افزودن
              </button>
            </div>

            {filtered.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                موردی نیست — از «بارگذاری مجدد از فایل پیش‌فرض» استفاده کنید
              </p>
            ) : (
              <ul className="max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap gap-2">
                  {filtered.map((item) => (
                    <li
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800"
                      dir="ltr"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeSlug(item)}
                        className="text-slate-400 hover:text-red-600"
                        aria-label={`حذف ${item}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </div>
              </ul>
            )}

            <button type="button" onClick={save} disabled={saving || busy} className={dash.btnPrimary}>
              {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
