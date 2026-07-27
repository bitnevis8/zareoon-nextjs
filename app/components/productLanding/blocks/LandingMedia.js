"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { useLandingEdit, mediaUploadKey } from "../LandingEditContext";

function IconImage({ className = "h-8 w-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16l-5.5-5.5L7 19" />
    </svg>
  );
}

function IconVideo({ className = "h-8 w-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="6" width="14" height="12" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 10.5l4-2.5v8l-4-2.5v-3z" />
    </svg>
  );
}

/**
 * جای‌خالی تصویر/ویدیو با آیکن و عنوان — در حالت ویرایش مالک قابل کلیک برای آپلود
 */
export function MediaSlot({
  kind = "image",
  label,
  hint,
  fill = false,
  className = "",
  style,
  editable = false,
  onPickFile,
  busy = false,
}) {
  const isVideo = kind === "video";
  const title = label || (isVideo ? "جای ویدیو" : "جای تصویر");
  const sub =
    hint ||
    (editable
      ? isVideo
        ? "کلیک کنید و ویدیو آپلود کنید"
        : "کلیک کنید و عکس خود را آپلود کنید"
      : isVideo
        ? "اینجا ویدیوی معرفی قرار می‌گیرد"
        : "اینجا باید عکس قرار بگیرد");
  const Icon = isVideo ? IconVideo : IconImage;
  const inputRef = useRef(null);

  const shell = (
    <div
      className={`flex flex-col items-center justify-center gap-2 border border-dashed text-center ${
        fill ? "absolute inset-0" : "h-full w-full min-h-[10rem]"
      } ${editable ? "cursor-pointer transition hover:brightness-[0.98]" : ""} ${className}`}
      style={{
        borderColor: "color-mix(in srgb, var(--lp-accent) 40%, transparent)",
        background:
          "repeating-linear-gradient(-45deg, color-mix(in srgb, var(--lp-bg-elevated) 88%, var(--lp-accent)), color-mix(in srgb, var(--lp-bg-elevated) 88%, var(--lp-accent)) 8px, var(--lp-bg-elevated) 8px, var(--lp-bg-elevated) 16px)",
        color: "var(--lp-muted)",
        borderRadius: "inherit",
        ...style,
      }}
      role={editable ? "button" : undefined}
      tabIndex={editable ? 0 : undefined}
      onClick={editable && !busy ? () => inputRef.current?.click() : undefined}
      onKeyDown={
        editable && !busy
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }
          : undefined
      }
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          background: "color-mix(in srgb, var(--lp-accent) 14%, transparent)",
          color: "var(--lp-accent)",
          boxShadow: "0 1px 0 color-mix(in srgb, var(--lp-fg) 8%, transparent)",
        }}
      >
        {busy ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Icon className="h-6 w-6" />
        )}
      </div>
      <p className="max-w-[16rem] px-3 text-xs font-bold leading-5" style={{ color: "var(--lp-fg)" }}>
        {busy ? "در حال آپلود…" : title}
      </p>
      <p className="max-w-[18rem] px-3 text-[10px] leading-4 opacity-80">{busy ? "لطفاً صبر کنید" : sub}</p>
      {editable ? (
        <span
          className="mt-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
          style={{ background: "var(--lp-accent)", color: "var(--lp-accent-fg)" }}
        >
          {isVideo ? "انتخاب ویدیو" : "انتخاب عکس"}
        </span>
      ) : null}
    </div>
  );

  if (!editable) return shell;

  return (
    <>
      {shell}
      <input
        ref={inputRef}
        type="file"
        accept={isVideo ? "video/*" : "image/*"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPickFile?.(file);
        }}
      />
    </>
  );
}

/**
 * تصویر بلوک — جای‌خالی پیش‌فرض + آپلود در حالت ویرایش مالک
 */
export function LandingMedia({
  blockId,
  field = "imageUrl",
  galleryIndex = null,
  src,
  alt = "",
  fill = false,
  priority = false,
  kind = "image",
  slotLabel,
  slotHint,
  className = "",
  editorMode = false,
}) {
  const { editMode, showPlaceholders, uploadBlockMedia, uploadingKey } = useLandingEdit();
  const editable = Boolean(editMode && blockId && uploadBlockMedia);
  const showEmpty = showPlaceholders || editable || editorMode;
  const key = mediaUploadKey(blockId, field, galleryIndex);
  const busy = uploadingKey === key;
  const url = resolveMediaUrl(src);
  const inputRef = useRef(null);
  const [localBusy, setLocalBusy] = useState(false);

  const pick = async (file) => {
    if (!uploadBlockMedia || !blockId) return;
    setLocalBusy(true);
    try {
      await uploadBlockMedia(blockId, field, file, { galleryIndex });
    } finally {
      setLocalBusy(false);
    }
  };

  const isBusy = busy || localBusy;

  if (!url) {
    if (!showEmpty) return null;
    return (
      <MediaSlot
        kind={kind}
        label={slotLabel}
        hint={slotHint}
        fill={fill}
        className={className}
        editable={editable}
        busy={isBusy}
        onPickFile={pick}
      />
    );
  }

  const media =
    fill ? (
      <Image src={url} alt={alt} fill unoptimized priority={priority} className={`object-cover ${className}`} sizes="100vw" />
    ) : (
      <Image src={url} alt={alt} width={1200} height={800} unoptimized className={className} />
    );

  if (!editable) return media;

  return (
    <div className={`group relative ${fill ? "absolute inset-0" : ""}`}>
      {media}
      <button
        type="button"
        disabled={isBusy}
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/45"
      >
        <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 opacity-0 shadow group-hover:opacity-100">
          {isBusy ? "آپلود…" : "تغییر عکس"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={kind === "video" ? "video/*" : "image/*"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) pick(file);
        }}
      />
    </div>
  );
}
