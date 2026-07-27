"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch } from "@/app/utils/authHeaders";
import { useRequireSupplierArea } from "@/app/hooks/useDashboardRole";
import { useExistingPublicSlug } from "@/app/hooks/useExistingPublicSlug";
import { dash } from "@/app/components/dashboard/dashboardTheme";
import LandingBlockBuilder from "@/app/components/productLanding/builder/LandingBlockBuilder";
import { PRODUCT_DISPLAY_MODES, resolveThemeId, getPalette } from "@/app/components/productLanding/themes/tokens";

export default function LandingEditorPage() {
  const params = useParams();
  const id = Number(params?.id);
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope") || "own";
  const { allowed, loading: authLoading } = useRequireSupplierArea(scope);
  const { slug: shopSlug } = useExistingPublicSlug();

  const [row, setRow] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [themeId, setThemeId] = useState("atelier");
  const [paletteId, setPaletteId] = useState(null);
  const [patternId, setPatternId] = useState("none");
  const [fontFa, setFontFa] = useState("vazirmatn");
  const [fontEn, setFontEn] = useState("inter");
  const [productDisplayMode, setProductDisplayMode] = useState("catalog");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("draft");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(API_ENDPOINTS.productLanding.getMine(id), { cache: "no-store" });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "یافت نشد");
      const data = json.data;
      setRow(data);
      setBlocks(Array.isArray(data.content?.blocks) ? data.content.blocks : []);
      const tid = resolveThemeId(data.themeId || data.content?.themeId || "atelier");
      setThemeId(tid);
      setPaletteId(data.content?.meta?.paletteId || getPalette(null, tid).id);
      setPatternId(data.content?.meta?.patternId || "none");
      setFontFa(data.content?.meta?.fontFa || "vazirmatn");
      setFontEn(data.content?.meta?.fontEn || "inter");
      setProductDisplayMode(data.content?.meta?.productDisplayMode || "catalog");
      setSlug(data.slug || "");
      setStatus(data.status || "draft");
      setSelectedId(null);
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && allowed) load();
  }, [authLoading, allowed, load]);

  const contentPayload = useMemo(
    () => {
      const resolvedPalette = getPalette(paletteId, themeId)?.id || "forest";
      return {
        version: 2,
        themeId,
        templateId: row?.templateId || null,
        blocks,
        meta: {
          ...(row?.content?.meta || {}),
          paletteId: resolvedPalette,
          patternId: patternId || "none",
          fontFa: fontFa || "vazirmatn",
          fontEn: fontEn || "inter",
          productDisplayMode: productDisplayMode || "catalog",
        },
      };
    },
    [blocks, themeId, paletteId, patternId, fontFa, fontEn, productDisplayMode, row]
  );

  const save = async (extra = {}) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await authFetch(API_ENDPOINTS.productLanding.update(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId,
          slug,
          content: contentPayload,
          status: extra.status ?? status,
        }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "ذخیره نشد");
      setRow(json.data);
      setStatus(json.data.status);
      setSlug(json.data.slug);
      setBlocks(json.data.content?.blocks || []);
      setThemeId(resolveThemeId(json.data.themeId));
      setPaletteId(json.data.content?.meta?.paletteId || paletteId);
      setPatternId(json.data.content?.meta?.patternId || patternId);
      setFontFa(json.data.content?.meta?.fontFa || fontFa);
      setFontEn(json.data.content?.meta?.fontEn || fontEn);
      setProductDisplayMode(json.data.content?.meta?.productDisplayMode || productDisplayMode);
      setMessage(extra.status === "published" ? "منتشر شد" : "ذخیره شد");
    } catch (e) {
      setError(e.message || "خطا");
    } finally {
      setSaving(false);
    }
  };

  const saveAsTemplate = async () => {
    const nameFa = window.prompt("نام قالب سفارشی؟", row?.content?.blocks?.[0]?.props?.fa?.title || "قالب من");
    if (!nameFa) return;
    try {
      const res = await authFetch(API_ENDPOINTS.productLanding.saveMyTemplate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landingId: id, nameFa }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "ذخیره قالب نشد");
      setMessage("قالب سفارشی ذخیره شد");
    } catch (e) {
      setError(e.message || "خطا");
    }
  };

  const publicPath = shopSlug && slug ? `/${shopSlug}/p/${slug}` : null;
  const isPublished = status === "published";

  if (authLoading || loading) {
    return <p className="p-4 text-sm text-slate-500">بارگذاری بیلدر…</p>;
  }
  if (!allowed || !row) {
    return (
      <div className="space-y-2 p-4">
        <p className="text-sm text-red-600">{error || "یافت نشد"}</p>
        <Link href="/dashboard/supplier/landings?scope=own" className="text-sm text-emerald-700 underline">
          بازگشت
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Link href="/dashboard/supplier/landings?scope=own" className="text-xs font-bold text-emerald-700 hover:underline">
          ← لیست
        </Link>
        <span className="hidden h-4 w-px bg-slate-200 sm:block" />
        <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-slate-500 sm:max-w-xs">
          <span className="shrink-0">اسلاگ</span>
          <input
            className={`${dash.input} !py-1.5`}
            dir="ltr"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>
        <div className="ms-auto flex flex-wrap items-center gap-1.5">
          {error ? <span className="text-[11px] text-red-600">{error}</span> : null}
          {message ? <span className="text-[11px] text-emerald-700">{message}</span> : null}
          <button type="button" className={`${dash.btnSecondary} !py-1.5 text-xs`} onClick={saveAsTemplate}>
            قالب من
          </button>
          <button type="button" className={`${dash.btnSecondary} !py-1.5 text-xs`} disabled={saving} onClick={() => save()}>
            {saving ? "…" : "ذخیره"}
          </button>
          {isPublished ? (
            <button type="button" className={`${dash.btnSecondary} !py-1.5 text-xs`} disabled={saving} onClick={() => save({ status: "draft" })}>
              لغو انتشار
            </button>
          ) : (
            <button
              type="button"
              className={`${dash.btnPrimary} !py-1.5 text-xs`}
              disabled={saving || !shopSlug}
              onClick={() => save({ status: "published" })}
            >
              انتشار
            </button>
          )}
        </div>
      </div>

      <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">نمایش محصول در کاتالوگ</p>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
          {PRODUCT_DISPLAY_MODES.map((m) => {
            const on = productDisplayMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setProductDisplayMode(m.id)}
                className={`rounded-lg border px-2.5 py-1.5 text-start transition ${
                  on ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="block text-[11px] font-bold text-slate-800">{m.nameFa}</span>
                <span className="mt-0.5 block text-[9px] leading-4 text-slate-500">{m.descFa}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-[11px] text-emerald-950">
        <span className="font-bold">صفحهٔ عمومی لندینگ</span>
        {publicPath ? (
          <>
            <Link
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 truncate rounded-md bg-white px-2 py-1 font-mono text-[11px] font-semibold text-emerald-800 underline-offset-2 hover:underline"
              dir="ltr"
            >
              {publicPath}
            </Link>
            <span className="text-emerald-800/80">
              {isPublished
                ? "برای دیدن ظاهر نهاییِ منتشرشده، روی لینک کلیک کنید."
                : "پس از انتشار، مشتریان همین آدرس را می‌بینند."}
            </span>
          </>
        ) : (
          <span className="text-emerald-800/80">برای ساخت لینک عمومی، اسلاگ فروشگاه و اسلاگ لندینگ لازم است.</span>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <LandingBlockBuilder
            blocks={blocks}
            onChangeBlocks={setBlocks}
            themeId={themeId}
            onChangeTheme={setThemeId}
            paletteId={paletteId}
            onChangePalette={setPaletteId}
            patternId={patternId}
            onChangePattern={setPatternId}
            fontFa={fontFa}
            onChangeFontFa={setFontFa}
            fontEn={fontEn}
            onChangeFontEn={setFontEn}
            selectedId={selectedId}
            onSelectId={setSelectedId}
            entityId={id}
            landing={{ slug, id }}
            shop={{ slug: shopSlug, name: "فروشگاه شما", coverImage: row?.offer?.supplier?.account?.coverImage }}
            product={row?.product || null}
            offer={row?.offer || null}
          />
        </div>
      </div>
    </div>
  );
}
