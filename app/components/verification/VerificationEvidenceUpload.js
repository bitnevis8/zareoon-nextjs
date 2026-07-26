"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { API_ENDPOINTS } from "@/app/config/api";
import { getAuthHeaders } from "@/app/utils/authHeaders";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";

/**
 * آپلود تصویر/ویدیو مدارک احراز — خروجی اسناد برای ارسال درخواست
 */
export default function VerificationEvidenceUpload({
  entityId,
  documents = [],
  onChange,
  kinds = [],
  allowedKinds = null,
  disabled = false,
  maxFiles = 12,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const effectiveKinds = useMemo(() => {
    if (Array.isArray(allowedKinds) && allowedKinds.length) {
      const allow = new Set(allowedKinds);
      return kinds.filter((k) => allow.has(k.value));
    }
    return kinds;
  }, [kinds, allowedKinds]);

  const [kind, setKind] = useState(effectiveKinds[0]?.value || "other");

  useEffect(() => {
    if (!effectiveKinds.some((k) => k.value === kind)) {
      setKind(effectiveKinds[0]?.value || "other");
    }
  }, [effectiveKinds, kind]);

  const uploadOne = async (file) => {
    const inferredType = file.type.startsWith("video/") ? "videos" : "images";
    const form = new FormData();
    form.append("file", file);
    form.append("module", "verification");
    form.append("fileType", inferredType);
    form.append("entityId", String(entityId));

    const r = await fetch(API_ENDPOINTS.fileUpload.upload, {
      method: "POST",
      body: form,
      credentials: "include",
      headers: getAuthHeaders(),
    });
    const j = await r.json();
    if (!j?.success) throw new Error(j?.message || "آپلود ناموفق بود");
    const d = j.data;
    const kindMeta = effectiveKinds.find((k) => k.value === kind) || kinds.find((k) => k.value === kind);
    return {
      id: d.id,
      url: d.downloadUrl,
      kind,
      label: kindMeta?.label || "مدرک",
      mimeType: d.mimeType,
      fileType: d.fileType || inferredType,
    };
  };

  const onPick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || !entityId || disabled) return;
    if (documents.length + files.length > maxFiles) {
      setError(`حداکثر ${maxFiles} فایل مجاز است`);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const next = [...documents];
      for (const file of files) {
        next.push(await uploadOne(file));
      }
      onChange?.(next);
    } catch (err) {
      setError(err.message || "خطا در آپلود");
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (idx) => {
    onChange?.(documents.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        {effectiveKinds.length ? (
          <label className="min-w-[10rem] flex-1 text-xs font-semibold text-slate-600">
            نوع مدرک
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              disabled={disabled || uploading}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
            >
              {effectiveKinds.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button
          type="button"
          disabled={disabled || uploading || !entityId}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {uploading ? "در حال آپلود…" : "افزودن تصویر یا ویدیو"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={onPick}
        />
      </div>

      <p className="text-[11px] leading-5 text-slate-500">
        تصویر کارت ملی، سلفی با کارت، ویدیوی کوتاه معرفی، روزنامه رسمی، مجوز و… را بارگذاری کنید. فرمت تصویر و ویدیو
        پشتیبانی می‌شود.
      </p>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      {documents.length ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {documents.map((doc, idx) => {
            const src = resolveMediaUrl(doc.url);
            const isVideo = String(doc.mimeType || "").startsWith("video/") || doc.fileType === "videos";
            return (
              <li
                key={`${doc.id || doc.url}-${idx}`}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
              >
                <div className="relative aspect-square">
                  {isVideo ? (
                    <video src={src} className="h-full w-full object-cover" controls />
                  ) : src ? (
                    <Image src={src} alt={doc.label || ""} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">فایل</div>
                  )}
                </div>
                <div className="border-t border-slate-100 bg-white px-2 py-1.5">
                  <p className="truncate text-[11px] font-semibold text-slate-700">{doc.label || doc.kind}</p>
                </div>
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => removeAt(idx)}
                    className="absolute end-1.5 top-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100"
                  >
                    حذف
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-8 text-center text-xs text-slate-500">
          هنوز مدرکی آپلود نشده است
        </div>
      )}
    </div>
  );
}
