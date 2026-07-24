"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { API_ENDPOINTS } from "@/app/config/api";
import { getAuthHeaders } from "@/app/utils/authHeaders";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import ImageCropModal from "@/app/components/ui/ImageCropModal";
import homeFa from "../../../messages/fa/home.json";

/**
 * آپلود آواتار با کراپ مربعی
 * @param {'user'|'shop'} purpose — user: دایره / shop: مربع گرد
 */
export default function AvatarUpload({
  onUploadSuccess,
  currentAvatar,
  className = "",
  userId = null,
  variant = "profile",
  purpose = "user",
  label,
  hint,
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const fileInputRef = useRef(null);
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const isShop = purpose === "shop";
  const shapeClass = isShop ? "rounded-2xl" : "rounded-full";
  const cropShape = isShop ? "rounded" : "circle";

  const uploadBlob = async (blob) => {
    setUploading(true);
    try {
      const file = new File([blob], isShop ? "shop-avatar.jpg" : "avatar.jpg", {
        type: "image/jpeg",
      });
      const formData = new FormData();
      formData.append("file", file);

      let result;
      if (isShop) {
        formData.append("module", "accounts");
        formData.append("fileType", "images");
        if (user?.id || user?.userId) {
          formData.append("entityId", String(user.id || user.userId));
        }
        const response = await fetch(API_ENDPOINTS.fileUpload.upload, {
          method: "POST",
          credentials: "include",
          headers: getAuthHeaders(),
          body: formData,
        });
        result = await response.json();
      } else {
        if (userId) formData.append("userId", userId);
        const response = await fetch(API_ENDPOINTS.fileUpload.uploadAvatar, {
          method: "POST",
          credentials: "include",
          headers: getAuthHeaders(),
          body: formData,
        });
        result = await response.json();
      }

      if (result.success) {
        const url = result.data?.downloadUrl || null;
        if (!isShop && !userId && updateUser && user) {
          updateUser({ ...user, avatar: url });
        }
        setPreview(url ? resolveMediaUrl(url) : null);
        onUploadSuccess?.(result.data);
        return true;
      }
      alert(result.message || t("photoUploadFailed"));
      return false;
    } catch (error) {
      console.error("Upload error:", error);
      alert(t("photoUploadFailed"));
      return false;
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert(t("photoUploadFailed"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(t("photoUploadFailed"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setCropSrc(String(e.target?.result || ""));
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (blob) => {
    setCropSrc(null);
    const localUrl = URL.createObjectURL(blob);
    setPreview(localUrl);
    const ok = await uploadBlob(blob);
    if (!ok) setPreview(null);
    URL.revokeObjectURL(localUrl);
  };

  const handleDelete = async () => {
    if (!currentAvatar && !preview) return;
    setUploading(true);
    try {
      if (isShop) {
        // حذف تصویر فروشگاه فقط از طریق callback والد (coverImage = null)
        onUploadSuccess?.(null);
        setPreview(null);
        return;
      }

      const response = await fetch(API_ENDPOINTS.fileUpload.deleteFileByUrl, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ fileUrl: currentAvatar, clearAvatar: true }),
      });
      const result = await response.json();
      if (result.success) {
        if (!userId && updateUser && user) {
          updateUser({ ...user, avatar: null });
        }
        setPreview(null);
        onUploadSuccess?.(null);
      } else {
        // حتی اگر فایل در FTP نبود، نمایه را خالی کن
        if (!userId && updateUser && user) {
          updateUser({ ...user, avatar: null });
        }
        setPreview(null);
        onUploadSuccess?.(null);
        if (result.message) {
          console.warn(result.message);
        }
      }
    } catch (error) {
      console.error(error);
      if (!userId && updateUser && user) {
        updateUser({ ...user, avatar: null });
      }
      setPreview(null);
      onUploadSuccess?.(null);
    } finally {
      setUploading(false);
    }
  };

  const resolvedCurrent = resolveMediaUrl(currentAvatar);
  const displaySrc = preview || resolvedCurrent || null;
  const initials =
    (user?.firstName?.[0] || user?.username?.[0] || homeFa.avatarFallbackInitial).toUpperCase();
  const title = label || (isShop ? "تصویر فروشگاه" : t("changePhoto"));

  if (variant === "classic") {
    return (
      <div className={`avatar-upload ${className}`}>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className={`relative h-16 w-16 overflow-hidden bg-slate-100 sm:h-20 sm:w-20 ${shapeClass}`}>
            {displaySrc ? (
              <Image src={displaySrc} alt="" fill className="object-cover object-center" sizes="80px" unoptimized />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-400">{initials}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-upload-classic"
            />
            <label
              htmlFor="avatar-upload-classic"
              className="inline-flex cursor-pointer items-center rounded-lg bg-blue-500 px-3 py-2 text-xs text-white hover:bg-blue-600 sm:text-sm"
            >
              {t("changePhoto")}
            </label>
          </div>
        </div>
        <ImageCropModal
          open={Boolean(cropSrc)}
          imageSrc={cropSrc}
          shape={cropShape}
          onCancel={() => {
            setCropSrc(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          onConfirm={handleCropConfirm}
          title={isShop ? "کراپ تصویر فروشگاه" : "کراپ آواتار شخصی"}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => !uploading && fileInputRef.current?.click()}
          disabled={uploading}
          className={`group relative h-24 w-24 overflow-hidden bg-slate-100 ring-2 ring-emerald-100 ring-offset-2 ring-offset-white transition hover:ring-emerald-300 focus:outline-none focus-visible:ring-emerald-500 disabled:cursor-wait sm:h-28 sm:w-28 ${shapeClass}`}
          aria-label={title}
        >
          {displaySrc ? (
            <Image src={displaySrc} alt="" fill className="object-cover object-center" sizes="112px" unoptimized />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-white sm:text-3xl">
              {initials}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition group-hover:bg-slate-900/45 group-focus-visible:bg-slate-900/45">
            {uploading ? (
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg
                className="h-6 w-6 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => !uploading && fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60 sm:text-sm"
        >
          {uploading ? t("uploadingPhoto") : t("changePhoto")}
        </button>
        {displaySrc ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 sm:text-sm"
          >
            {t("removePhoto")}
          </button>
        ) : null}
      </div>
      <p className="max-w-[14rem] text-center text-[11px] leading-5 text-slate-400 sm:text-xs">
        {hint || (isShop ? "مربع — با کراپ مشخص کنید کدام بخش دیده شود" : t("photoHint"))}
      </p>

      <ImageCropModal
        open={Boolean(cropSrc)}
        imageSrc={cropSrc}
        shape={cropShape}
        onCancel={() => {
          setCropSrc(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        onConfirm={handleCropConfirm}
        title={isShop ? "کراپ تصویر فروشگاه" : "کراپ آواتار شخصی"}
      />
    </div>
  );
}
