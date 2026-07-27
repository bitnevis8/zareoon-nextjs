"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/app/config/api";
import { authFetch, getAuthHeaders } from "@/app/utils/authHeaders";
import ProductLandingView from "@/app/components/productLanding/ProductLandingView";

export default function ProductLandingPublicClient({ shopSlug, landingSlug, locale = "fa", initialData = null }) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!initialData);
  const [editMode, setEditMode] = useState(false);
  const [blocks, setBlocks] = useState(() => initialData?.landing?.content?.blocks || []);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [viewerCanEdit, setViewerCanEdit] = useState(Boolean(initialData?.viewerCanEdit));
  const [editorPath, setEditorPath] = useState(initialData?.editorPath || null);

  const applyPayload = useCallback((payload) => {
    setData(payload);
    setBlocks(Array.isArray(payload?.landing?.content?.blocks) ? payload.landing.content.blocks : []);
    setViewerCanEdit(Boolean(payload?.viewerCanEdit));
    setEditorPath(payload?.editorPath || null);
    setDirty(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // با کوکی/توکن مالک تا viewerCanEdit درست بیاید
        const headers = getAuthHeaders?.() || {};
        const res = await fetch(API_ENDPOINTS.productLanding.public(shopSlug, landingSlug), {
          cache: "no-store",
          credentials: "include",
          headers,
        });
        const json = await res.json();
        if (cancelled) return;
        if (!json?.success || !json.data?.landing) {
          if (!initialData?.landing) setError("not_found");
          return;
        }
        applyPayload(json.data);
      } catch {
        if (!cancelled && !initialData?.landing) setError("network");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shopSlug, landingSlug, applyPayload, initialData]);

  const landingForView = useMemo(() => {
    if (!data?.landing) return null;
    return {
      ...data.landing,
      content: {
        ...(data.landing.content || {}),
        blocks,
      },
    };
  }, [data, blocks]);

  const onChangeBlocks = useCallback((next) => {
    setBlocks(next);
    setDirty(true);
    setSaveMsg("");
  }, []);

  const saveInline = async () => {
    if (!data?.landing?.id) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const content = {
        ...(data.landing.content || {}),
        version: 2,
        blocks,
        themeId: data.landing.themeId || data.landing.content?.themeId,
        meta: data.landing.content?.meta || {},
      };
      const res = await authFetch(API_ENDPOINTS.productLanding.update(data.landing.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || "ذخیره نشد");
      setData((prev) => ({
        ...prev,
        landing: json.data,
      }));
      setBlocks(json.data?.content?.blocks || blocks);
      setDirty(false);
      setSaveMsg("تغییرات ذخیره شد");
    } catch (e) {
      setSaveMsg(e.message || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 text-sm text-slate-500">
        در حال بارگذاری…
      </div>
    );
  }

  if (error || !landingForView) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-slate-50 px-5 text-center">
        <p className="text-lg font-bold text-slate-800">صفحه یافت نشد</p>
        <p className="max-w-sm text-sm text-slate-500">این لندینگ منتشر نشده یا آدرس اشتباه است.</p>
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:underline">
          بازگشت به زارعون
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {viewerCanEdit ? (
        <div className="sticky z-50 border-b border-emerald-200 bg-emerald-50/95 backdrop-blur top-[var(--site-top-chrome,3.25rem)]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2.5">
            <span className="text-xs font-bold text-emerald-950">مالک صفحه</span>
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                editMode ? "bg-emerald-700 text-white" : "border border-emerald-300 bg-white text-emerald-900"
              }`}
            >
              {editMode ? "خروج از حالت ویرایش" : "حالت ویرایش"}
            </button>
            {editMode ? (
              <button
                type="button"
                disabled={saving || !dirty}
                onClick={saveInline}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
              >
                {saving ? "در حال ذخیره…" : dirty ? "ذخیره تغییرات" : "ذخیره شد"}
              </button>
            ) : null}
            {editorPath ? (
              <Link
                href={editorPath}
                className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
              >
                بیلدر کامل
              </Link>
            ) : null}
            {saveMsg ? <span className="text-[11px] font-medium text-emerald-800">{saveMsg}</span> : null}
            {editMode ? (
              <span className="ms-auto text-[10px] text-emerald-800/80">
                روی جای عکس‌ها کلیک کنید و تصویر خود را آپلود کنید، سپس ذخیره کنید.
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <ProductLandingView
        landing={landingForView}
        shop={data.shop}
        product={data.product}
        offer={data.offer}
        locale={locale}
        editMode={editMode}
        showPlaceholders
        onChangeBlocks={editMode ? onChangeBlocks : undefined}
      />
    </div>
  );
}
