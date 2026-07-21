"use client";

import { useEffect, useState } from "react";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { showToast } from "@/app/utils/toast";

export default function SlugAliasesAdminPage() {
  const { allowed, loading: authLoading } = useRequireAdmin();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("active");

  const load = async () => {
    setLoading(true);
    try {
      const q = filter ? `?status=${encodeURIComponent(filter)}` : "";
      const res = await authFetch(`${API_ENDPOINTS.publicSlug.adminAliases}${q}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) setItems(json.data || []);
      else showToast.error(json.message || "خطا");
    } catch {
      showToast.error("خطا در دریافت");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!allowed) return;
    load();
  }, [allowed, filter]);

  const free = async (id) => {
    setBusyId(id);
    try {
      const res = await authFetch(API_ENDPOINTS.publicSlug.adminFree(id), { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "خطا");
      showToast.success(json.message || "آزاد شد");
      load();
    } catch (e) {
      showToast.error(e.message || "خطا");
    } finally {
      setBusyId(null);
    }
  };

  const lock = async (id, locked) => {
    setBusyId(id);
    try {
      const res = await authFetch(API_ENDPOINTS.publicSlug.adminLock(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locked }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "خطا");
      showToast.success(json.message || "ذخیره شد");
      load();
    } catch (e) {
      showToast.error(e.message || "خطا");
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading || !allowed) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={dash.page}>
      <header className="mb-4">
        <h1 className={dash.pageTitle}>آدرس‌های رزرو (ریدایرکت)</h1>
        <p className={dash.pageSubtitle}>
          وقتی کاربر آدرس صفحه را عوض می‌کند، آدرس قبلی تا ۳۰ روز رزرو می‌ماند و بازدیدکنندگان به آدرس جدید هدایت می‌شوند.
          اگر قفل نکنید، بعد از ۳۰ روز خودکار آزاد می‌شود.
        </p>
      </header>

      <div className="mb-4 flex gap-2">
        {[
          { id: "active", label: "فعال" },
          { id: "freed", label: "آزادشده" },
          { id: "", label: "همه" },
        ].map((t) => (
          <button
            key={t.id || "all"}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              filter === t.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className={dash.empty}>موردی نیست</p>
      ) : (
        <div className="space-y-2">
          {items.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-slate-900" dir="ltr">
                  /{row.fromSlug} → /{row.toSlug}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  وضعیت: {row.status}
                  {row.lockedByAdmin ? " · قفل‌شده" : ""}
                  {row.expiresAt
                    ? ` · انقضا: ${new Date(row.expiresAt).toLocaleDateString("fa-IR")}`
                    : ""}
                </p>
              </div>
              {row.status === "active" ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => lock(row.id, !row.lockedByAdmin)}
                    className={dash.btnSecondary}
                  >
                    {row.lockedByAdmin ? "برداشتن قفل" : "قفل کردن"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => free(row.id)}
                    className={dash.btnSecondary}
                  >
                    آزاد کردن
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
