"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAdmin } from "@/app/hooks/useDashboardRole";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import LandingBlockBuilder from "@/app/components/productLanding/builder/LandingBlockBuilder";
import { createBlockInstance } from "@/app/components/productLanding/blocks/registry";

function newDraft() {
  const hero = createBlockInstance("hero", "fullscreen");
  const footer = createBlockInstance("footer", "simple");
  return {
    id: null,
    slug: "",
    nameFa: "قالب جدید",
    nameEn: "New template",
    category: "custom",
    descriptionFa: "",
    themeIdDefault: "atelier",
    isPublished: true,
    sortOrder: 100,
    recipe: { blocks: [hero, footer].filter(Boolean) },
  };
}

export default function AdminLandingTemplatesPage() {
  const { allowed, loading: authLoading } = useRequireAdmin();
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(API_ENDPOINTS.productLanding.adminTemplates, { cache: "no-store" });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "خطا");
      setItems(json.data?.items || []);
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && allowed) load();
  }, [authLoading, allowed, load]);

  const openEdit = (row) => {
    const blocks = (row.recipe?.blocks || []).map((b, i) => ({
      ...b,
      id: b.id || `blk_seed_${i}_${Date.now().toString(36)}`,
    }));
    setDraft({
      ...row,
      recipe: { blocks },
    });
    setSelectedId(blocks[0]?.id || null);
    setMessage("");
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        slug: draft.slug,
        nameFa: draft.nameFa,
        nameEn: draft.nameEn,
        category: draft.category,
        descriptionFa: draft.descriptionFa,
        themeIdDefault: draft.themeIdDefault,
        isPublished: draft.isPublished,
        sortOrder: draft.sortOrder,
        recipe: {
          blocks: (draft.recipe?.blocks || []).map(({ type, variant, hidden, props, responsive }) => ({
            type,
            variant,
            hidden: Boolean(hidden),
            props: props || {},
            responsive: responsive || {},
          })),
        },
      };
      const isNew = !draft.id;
      const res = await authFetch(
        isNew ? API_ENDPOINTS.productLanding.adminTemplates : API_ENDPOINTS.productLanding.adminTemplate(draft.id),
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "ذخیره نشد");
      setMessage("قالب ذخیره شد");
      setDraft({
        ...json.data,
        recipe: {
          blocks: (json.data.recipe?.blocks || []).map((b, i) => ({
            ...b,
            id: `blk_${json.data.id}_${i}`,
          })),
        },
      });
      load();
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("حذف این قالب پیش‌فرض؟")) return;
    const res = await authFetch(API_ENDPOINTS.productLanding.adminTemplate(id), { method: "DELETE" });
    const json = await res.json();
    if (!json?.success) {
      setError(json?.message || "حذف نشد");
      return;
    }
    if (draft?.id === id) setDraft(null);
    setMessage("حذف شد");
    load();
  };

  if (authLoading || loading) {
    return <p className="p-4 text-sm text-slate-500">بارگذاری…</p>;
  }
  if (!allowed) {
    return <p className="p-4 text-sm text-red-600">فقط مدیر</p>;
  }

  /* حالت بیلدر تمام‌عرض */
  if (draft) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <button type="button" className="text-xs font-bold text-emerald-700 hover:underline" onClick={() => setDraft(null)}>
            ← لیست قالب‌ها
          </button>
          <span className="hidden h-4 w-px bg-slate-200 sm:block" />
          <input
            className={`${dash.input} !max-w-[10rem] !py-1.5 text-xs`}
            placeholder="نام"
            value={draft.nameFa || ""}
            onChange={(e) => setDraft({ ...draft, nameFa: e.target.value })}
          />
          <input
            className={`${dash.input} !max-w-[9rem] !py-1.5 font-mono text-xs`}
            dir="ltr"
            placeholder="slug"
            value={draft.slug || ""}
            onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
          />
          <input
            className={`${dash.input} !max-w-[7rem] !py-1.5 text-xs`}
            placeholder="دسته"
            value={draft.category || ""}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          />
          <label className="flex items-center gap-1 text-[11px] text-slate-600">
            <input
              type="checkbox"
              checked={draft.isPublished !== false}
              onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })}
            />
            منتشر
          </label>
          <div className="ms-auto flex flex-wrap items-center gap-1.5">
            {error ? <span className="text-[11px] text-red-600">{error}</span> : null}
            {message ? <span className="text-[11px] text-emerald-700">{message}</span> : null}
            <button type="button" className={`${dash.btnPrimary} !py-1.5 text-xs`} disabled={saving} onClick={save}>
              {saving ? "…" : "ذخیره قالب"}
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <LandingBlockBuilder
            blocks={draft.recipe?.blocks || []}
            onChangeBlocks={(blocks) => setDraft({ ...draft, recipe: { blocks } })}
            themeId={draft.themeIdDefault || "atelier"}
            onChangeTheme={(themeIdDefault) => setDraft({ ...draft, themeIdDefault })}
            selectedId={selectedId}
            onSelectId={setSelectedId}
            shop={{ name: "نمونه فروشگاه", slug: "demo" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-1">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className={dash.pageTitle}>قالب‌های پیش‌فرض لندینگ</h1>
          <p className={dash.pageSubtitle}>قالب = فقط Recipe. بیلدر مثل فروشنده: بلوک‌ها کنار صفحه زنده.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/supplier/landings?scope=own" className={dash.btnSecondary}>
            لندینگ‌های فروشنده
          </Link>
          <button
            type="button"
            className={dash.btnPrimary}
            onClick={() => {
              const d = newDraft();
              setDraft(d);
              setSelectedId(d.recipe.blocks[0]?.id || null);
            }}
          >
            ایجاد قالب جدید
          </button>
        </div>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <ul className={`${dash.card} divide-y divide-slate-100 overflow-hidden`}>
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-2 px-3 py-2.5">
            <button type="button" className="min-w-0 flex-1 text-start" onClick={() => openEdit(it)}>
              <span className="block truncate text-sm font-bold text-slate-900">{it.nameFa}</span>
              <span className="block text-[10px] text-slate-400">
                {it.slug} · {(it.recipe?.blocks || []).length} بلوک
              </span>
            </button>
            <button type="button" className={`${dash.btnSecondary} !py-1 text-xs`} onClick={() => openEdit(it)}>
              ویرایش
            </button>
            <button type="button" className="text-[10px] text-red-600" onClick={() => remove(it.id)}>
              حذف
            </button>
          </li>
        ))}
        {!items.length ? <li className="px-3 py-6 text-center text-xs text-slate-400">خالی</li> : null}
      </ul>
    </div>
  );
}
