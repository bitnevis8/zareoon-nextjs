"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/app/config/api";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { getAuthHeaders } from "@/app/utils/authHeaders";

export default function MediaUpload({
  module = "products",
  entityId,
  fileType = "images",
  accept = "image/*,video/*",
  buttonLabel,
  className = "",
  multiple = true,
}) {
  const t = useTranslations("shared");
  const resolvedButtonLabel = buttonLabel ?? t("mediaUpload.defaultButtonLabel");
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!entityId) return;
    try {
      const params = new URLSearchParams({
        entityId: String(entityId),
        fileType,
      });
      const url = `${API_ENDPOINTS.fileUpload.getFilesByModule(module)}?${params}`;
      const r = await fetch(url, {
        credentials: "include",
        cache: "no-store",
        headers: getAuthHeaders(),
      });
      const j = await r.json();
      if (j?.success) setItems(Array.isArray(j.data) ? j.data : []);
    } catch {
      setError(t("mediaUpload.loadError"));
    }
  }, [module, entityId, fileType, t]);

  useEffect(() => {
    load();
  }, [load]);

  const onPick = () => inputRef.current?.click();

  const upload = async (file) => {
    const inferredType = file.type.startsWith("video/") ? "videos" : "images";
    const form = new FormData();
    form.append("file", file);
    form.append("module", module);
    form.append("fileType", inferredType);
    form.append("entityId", String(entityId));

    const r = await fetch(API_ENDPOINTS.fileUpload.upload, {
      method: "POST",
      body: form,
      credentials: "include",
      headers: getAuthHeaders(),
    });
    const j = await r.json();
    if (!j?.success) throw new Error(j?.message || t("mediaUpload.uploadError"));
    return j.data;
  };

  const onChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !entityId) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        await upload(file);
      }
      await load();
    } catch (err) {
      setError(err.message || t("mediaUpload.uploadError"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const remove = async (id) => {
    if (!confirm(t("mediaUpload.deleteConfirm"))) return;
    setError("");
    try {
      const r = await fetch(API_ENDPOINTS.fileUpload.deleteFile(id), {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const j = await r.json();
      if (j?.success) await load();
      else setError(j?.message || t("mediaUpload.deleteError"));
    } catch {
      setError(t("mediaUpload.deleteFileError"));
    }
  };

  if (!entityId) {
    return <p className="text-xs text-amber-600">{t("mediaUpload.saveProductFirst")}</p>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={onChange}
      />
      <button
        type="button"
        onClick={onPick}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-3 py-1.5 text-sm disabled:opacity-60"
        disabled={uploading}
      >
        {uploading ? t("mediaUpload.uploading") : resolvedButtonLabel}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {items.length === 0 && !uploading ? (
        <p className="text-xs text-slate-400">{t("mediaUpload.noFilesYet")}</p>
      ) : null}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.id} className="border rounded-md overflow-hidden bg-white">
            <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
              {String(it.mimeType || "").startsWith("video/") ? (
                <video src={resolveMediaUrl(it.downloadUrl)} className="w-full h-full object-cover" controls />
              ) : (
                <Image
                  src={resolveMediaUrl(it.downloadUrl)}
                  alt={it.originalName || ""}
                  className="w-full h-full object-cover"
                  width={200}
                  height={150}
                  unoptimized
                />
              )}
            </div>
            <div className="p-2 flex items-center justify-between gap-2 text-xs">
              <div className="truncate" title={it.originalName}>
                {it.originalName}
              </div>
              <button type="button" className="text-red-600 shrink-0" onClick={() => remove(it.id)}>
                {t("mediaUpload.delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
