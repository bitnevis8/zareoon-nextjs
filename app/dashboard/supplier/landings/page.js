"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useRequireSupplierArea } from "@/app/hooks/useDashboardRole";
import { useExistingPublicSlug } from "@/app/hooks/useExistingPublicSlug";
import { useWorkspace } from "@/app/context/WorkspaceContext";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { LANDING_THEMES } from "@/app/components/productLanding/themes/tokens";

function statusLabel(status) {
  if (status === "published") return { text: "منتشر شده", className: "bg-emerald-100 text-emerald-800" };
  if (status === "archived") return { text: "بایگانی", className: "bg-slate-100 text-slate-600" };
  return { text: "پیش‌نویس", className: "bg-amber-100 text-amber-800" };
}

export default function LandingsListPage() {
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope") || "own";
  const { allowed, loading: authLoading } = useRequireSupplierArea(scope);
  const router = useRouter();
  const { slug: shopSlug } = useExistingPublicSlug();
  const { data: wsData } = useWorkspace() || {};
  const usageBundle = wsData?.usage;
  const used = usageBundle?.usage?.landingPages ?? null;
  const limit = usageBundle?.limits?.landingPages ?? null;

  const [items, setItems] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canCreate = limit == null || Number(limit) > 0;
  const atCap = limit != null && used != null && Number(used) >= Number(limit);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [landRes, tplRes] = await Promise.all([
        authFetch(API_ENDPOINTS.productLanding.mine, { cache: "no-store" }),
        authFetch(API_ENDPOINTS.productLanding.templates, { cache: "no-store" }),
      ]);
      const landJson = await landRes.json();
      const tplJson = await tplRes.json();
      if (!landJson?.success) throw new Error(landJson?.message || "خطا در بارگذاری");
      setItems(Array.isArray(landJson.data?.items) ? landJson.data.items : []);
      setTemplates(Array.isArray(tplJson.data?.items) ? tplJson.data.items : []);
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && allowed) load();
  }, [authLoading, allowed, load]);

  const createFrom = async ({ templateId, themeId } = {}) => {
    if (!canCreate || atCap) {
      setError("سقف لندینگ پلن شما پر است.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await authFetch(API_ENDPOINTS.productLanding.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: templateId || undefined,
          themeId: themeId || undefined,
          title: "محصول جدید",
        }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "ایجاد نشد");
      router.push(`/dashboard/supplier/landings/${json.data.id}?scope=own`);
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("این لندینگ حذف شود؟")) return;
    try {
      const res = await authFetch(API_ENDPOINTS.productLanding.delete(id), { method: "DELETE" });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "حذف نشد");
      setMessage("حذف شد");
      load();
    } catch (e) {
      setError(e.message || "خطا");
    }
  };

  const usageText = useMemo(() => {
    if (limit == null) return null;
    if (Number(limit) <= 0) return "در پلن فعلی لندینگ فعال نیست";
    if (used == null) return `سقف: ${limit}`;
    return `${Number(used).toLocaleString("fa-IR")} از ${Number(limit).toLocaleString("fa-IR")} لندینگ`;
  }, [used, limit]);

  if (authLoading) {
    return (
      <div className={dash.page}>
        <p className="text-sm text-slate-500">در حال بررسی دسترسی…</p>
      </div>
    );
  }
  if (!allowed) {
    return (
      <div className={dash.page}>
        <p className="text-sm text-red-600">دسترسی ندارید.</p>
      </div>
    );
  }

  return (
    <div className={dash.page}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className={dash.pageTitle}>لندینگ محصول</h1>
          <p className={dash.pageSubtitle}>
            قالب (Recipe) + تم ظاهری + بلوک‌های قابل جابجایی. لینک:{" "}
            <span className="font-mono text-xs">/{`{shop}`}/p/{`{slug}`}</span>
          </p>
          {usageText ? <p className="mt-2 text-xs font-medium text-slate-500">{usageText}</p> : null}
        </div>
        <button
          type="button"
          disabled={creating || !canCreate || atCap}
          onClick={() => createFrom({ themeId: "atelier" })}
          className={dash.btnPrimary}
        >
          {creating ? "…" : "لندینگ خالی"}
        </button>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <section className={`${dash.card} ${dash.cardBody}`}>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">شروع از قالب (Recipe)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              disabled={creating || !canCreate || atCap}
              onClick={() => createFrom({ templateId: tpl.id, themeId: tpl.themeIdDefault })}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-start transition hover:border-emerald-300 hover:bg-emerald-50/40 disabled:opacity-50"
            >
              <p className="text-sm font-bold text-slate-900">{tpl.nameFa}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                {tpl.category || "—"} · {(tpl.recipe?.blocks || []).length} بلوک
                {tpl.isSystem ? "" : " · سفارشی"}
              </p>
            </button>
          ))}
          {!templates.length && !loading ? (
            <p className="text-xs text-slate-400 sm:col-span-2">قالبی یافت نشد — API را ری‌استارت کنید.</p>
          ) : null}
        </div>
      </section>

      <section className={`${dash.card} ${dash.cardBody}`}>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">تم‌ها (فقط ظاهر)</h2>
        <div className="flex flex-wrap gap-2">
          {LANDING_THEMES.map((th) => (
            <button
              key={th.id}
              type="button"
              disabled={creating || !canCreate || atCap}
              onClick={() => createFrom({ themeId: th.id })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs hover:border-emerald-300"
            >
              <span className="font-bold">{th.nameFa}</span>
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-slate-500">بارگذاری لیست…</p>
      ) : items.length === 0 ? (
        <div className={`${dash.card} ${dash.empty}`}>هنوز لندینگی نساخته‌اید — یک قالب انتخاب کنید.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const st = statusLabel(item.status);
            const title =
              item.content?.blocks?.find((b) => b.type === "hero")?.props?.fa?.title ||
              item.content?.fa?.title ||
              item.slug;
            const blockCount = item.content?.blocks?.length || 0;
            const publicUrl = shopSlug && item.status === "published" ? `/${shopSlug}/p/${item.slug}` : null;
            return (
              <li key={item.id} className={`${dash.card} flex flex-wrap items-center gap-3 px-4 py-3`}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${st.className}`}>{st.text}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {item.themeId}
                    </span>
                    <span className="text-[10px] text-slate-400">{blockCount} بلوک</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-bold text-slate-900">{title}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-400">/p/{item.slug}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {publicUrl ? (
                    <Link href={publicUrl} target="_blank" className={dash.btnSecondary}>
                      مشاهده
                    </Link>
                  ) : null}
                  <Link href={`/dashboard/supplier/landings/${item.id}?scope=own`} className={dash.btnPrimary}>
                    بیلدر
                  </Link>
                  <button type="button" onClick={() => remove(item.id)} className={dash.btnSecondary}>
                    حذف
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
