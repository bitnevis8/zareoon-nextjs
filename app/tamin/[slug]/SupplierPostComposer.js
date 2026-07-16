"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { getAuthHeaders } from "@/app/utils/authHeaders";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";

const MAX_IMAGES = 3;
const MAX_HASHTAGS = 3;

async function compressImage(file) {
  if (!file.type.startsWith("image/") || typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const maxEdge = 1280;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function normalizeHashtagInput(raw) {
  return String(raw || "")
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, "");
}

export default function SupplierPostComposer({ onSubmit, posting }) {
  const t = useTranslations("supplier.postComposer");
  const fileRef = useRef(null);
  const [text, setText] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadImage = async (file) => {
    const compressed = await compressImage(file);
    const form = new FormData();
    form.append("file", compressed);
    form.append("module", "supplier-posts");
    form.append("fileType", "images");

    const res = await fetch(API_ENDPOINTS.fileUpload.upload, {
      method: "POST",
      body: form,
      credentials: "include",
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json?.success) throw new Error(json?.message || t("uploadError"));
    return json.data.downloadUrl;
  };

  const onPickImages = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const slots = MAX_IMAGES - images.length;
    if (slots <= 0) {
      setError(t("maxImages", { max: MAX_IMAGES }));
      return;
    }

    setUploading(true);
    setError("");
    try {
      const batch = files.slice(0, slots);
      const uploaded = [];
      for (const file of batch) {
        if (!file.type.startsWith("image/")) continue;
        const url = await uploadImage(file);
        uploaded.push({ url, preview: resolveMediaUrl(url) });
      }
      setImages((prev) => [...prev, ...uploaded].slice(0, MAX_IMAGES));
    } catch (err) {
      setError(err.message || t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addHashtag = () => {
    const tag = normalizeHashtagInput(hashtagInput);
    if (!tag) return;
    if (tag.length < 2) {
      setError(t("hashtagMinLength"));
      return;
    }
    if (hashtags.includes(tag)) {
      setHashtagInput("");
      return;
    }
    if (hashtags.length >= MAX_HASHTAGS) {
      setError(t("maxHashtags", { max: MAX_HASHTAGS }));
      return;
    }
    setHashtags((prev) => [...prev, tag]);
    setHashtagInput("");
    setError("");
  };

  const onHashtagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      addHashtag();
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setError("");
    const ok = await onSubmit({
      body: text.trim(),
      imageUrls: images.map((img) => img.url),
      hashtags,
    });
    if (ok) {
      setText("");
      setHashtags([]);
      setHashtagInput("");
      setImages([]);
    }
  };

  const canSubmit = text.trim() && !posting && !uploading;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder={t("placeholder")}
        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />

      {images.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {images.map((img, index) => (
            <div key={`${img.url}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <Image
                src={img.preview}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute left-1 top-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white"
                aria-label={t("removeImage")}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          {t("hashtags", { current: hashtags.length, max: MAX_HASHTAGS })}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
            >
              #{tag}
              <button
                type="button"
                onClick={() => setHashtags((prev) => prev.filter((t) => t !== tag))}
                className="text-emerald-600 hover:text-emerald-900"
                aria-label={t("removeHashtag", { tag })}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {hashtags.length < MAX_HASHTAGS ? (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={onHashtagKeyDown}
              placeholder={t("hashtagPlaceholder")}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={addHashtag}
              disabled={!normalizeHashtagInput(hashtagInput)}
              className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 disabled:opacity-40"
            >
              {t("addHashtag")}
            </button>
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onPickImages}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || images.length >= MAX_IMAGES}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {uploading
              ? t("uploading")
              : t("uploadImage", { current: images.length, max: MAX_IMAGES })}
          </button>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {posting ? t("publishing") : t("publish")}
        </button>
      </div>
    </div>
  );
}

export { MAX_IMAGES, MAX_HASHTAGS };
