"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function fileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function DropZone({ kind, accept, hint, files, onAdd, onRemove, icon }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (list) => {
      const incoming = Array.from(list || []).filter((f) => {
        if (kind === "image") return f.type.startsWith("image/");
        return f.type.startsWith("video/");
      });
      if (incoming.length) onAdd(incoming);
    },
    [kind, onAdd]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-3 py-4 text-center transition sm:py-5 ${
          dragOver
            ? "border-emerald-400 bg-emerald-50/80"
            : "border-slate-200 bg-slate-50/60 hover:border-emerald-300 hover:bg-emerald-50/40"
        }`}
      >
        <span className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm ring-1 ring-slate-200">
          {icon}
        </span>
        <p className="text-xs font-bold text-slate-800 sm:text-sm">
          {kind === "image" ? "افزودن تصویر" : "افزودن ویدیو"}
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">{hint}</p>
        <p className="mt-1.5 text-[10px] font-medium text-emerald-700">کلیک یا کشیدن فایل</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {files.length > 0 ? (
        <div className={`mt-2 grid gap-1.5 ${kind === "image" ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-1"}`}>
          {files.map((file) => (
            <DraftPreview key={fileKey(file)} file={file} kind={kind} onRemove={() => onRemove(file)} />
          ))}
        </div>
      ) : (
        <p className="mt-1.5 text-center text-[10px] text-slate-400">هنوز {kind === "image" ? "تصویری" : "ویدیویی"} انتخاب نشده</p>
      )}
    </div>
  );
}

function DraftPreview({ file, kind, onRemove }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (kind === "video") {
    return (
      <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-black">
        <video src={url} className="aspect-video w-full object-cover" muted playsInline />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4">
          <span className="truncate text-[10px] text-white">{file.name}</span>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600"
          >
            حذف
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={file.name} className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute left-1 top-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white sm:opacity-0 sm:transition sm:group-hover:opacity-100"
        aria-label="حذف"
      >
        ×
      </button>
    </div>
  );
}

export default function InventoryMediaDraftUpload({ images = [], videos = [], onImagesChange, onVideosChange }) {
  const addImages = (incoming) => {
    const existing = new Set(images.map(fileKey));
    const next = [...images, ...incoming.filter((f) => !existing.has(fileKey(f)))];
    onImagesChange(next);
  };

  const addVideos = (incoming) => {
    const existing = new Set(videos.map(fileKey));
    const next = [...videos, ...incoming.filter((f) => !existing.has(fileKey(f)))];
    onVideosChange(next);
  };

  const removeImage = (file) => onImagesChange(images.filter((f) => fileKey(f) !== fileKey(file)));
  const removeVideo = (file) => onVideosChange(videos.filter((f) => fileKey(f) !== fileKey(file)));

  const total = images.length + videos.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-700">رسانه عرضه</p>
        {total > 0 ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
            {total.toLocaleString("fa-IR")} فایل
          </span>
        ) : null}
      </div>
      <p className="text-[11px] leading-5 text-slate-500">
        تصاویر و ویدیوها پس از ثبت موجودی در صفحه کاتالوگ نمایش داده می‌شوند.
      </p>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <DropZone
          kind="image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hint="JPG، PNG، WebP"
          files={images}
          onAdd={addImages}
          onRemove={removeImage}
          icon="🖼️"
        />
        <DropZone
          kind="video"
          accept="video/mp4,video/webm,video/quicktime"
          hint="MP4، WebM"
          files={videos}
          onAdd={addVideos}
          onRemove={removeVideo}
          icon="🎬"
        />
      </div>
    </div>
  );
}
