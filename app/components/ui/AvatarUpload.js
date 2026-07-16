"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { API_ENDPOINTS } from "@/app/config/api";
import { getAuthHeaders } from "@/app/utils/authHeaders";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import homeFa from "../../../messages/fa/home.json";

export default function AvatarUpload({
  onUploadSuccess,
  currentAvatar,
  className = "",
  userId = null,
  variant = "profile",
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = document.createElement("img");

      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, "image/jpeg", quality);
      };

      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (userId) formData.append("userId", userId);

      const response = await fetch(API_ENDPOINTS.fileUpload.uploadAvatar, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        if (!userId && updateUser && user) {
          updateUser({ ...user, avatar: result.data.downloadUrl });
        }
        setPreview(null);
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

  const handleFileSelect = async (event) => {
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

    const compressedFile = (await compressImage(file, 800, 0.8)) || file;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(compressedFile);

    const ok = await uploadFile(compressedFile);
    if (ok) setPreview(null);
  };

  const handleDelete = async () => {
    if (!currentAvatar) return;
    try {
      const response = await fetch(API_ENDPOINTS.fileUpload.deleteFileByUrl, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ fileUrl: currentAvatar }),
      });
      const result = await response.json();
      if (result.success) {
        if (!userId && updateUser && user) {
          updateUser({ ...user, avatar: null });
        }
        onUploadSuccess?.(null);
      } else {
        alert(result.message || t("photoUploadFailed"));
      }
    } catch (error) {
      alert(t("photoUploadFailed"));
    }
  };

  const displaySrc = preview || currentAvatar || "/images/default/male.png";
  const initials =
    (user?.firstName?.[0] || user?.username?.[0] || homeFa.avatarFallbackInitial).toUpperCase();

  if (variant === "classic") {
    return (
      <div className={`avatar-upload ${className}`}>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Image
            src={displaySrc}
            alt={t("profile")}
            className="h-16 w-16 rounded-lg object-cover sm:h-20 sm:w-20"
            width={80}
            height={80}
          />
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
          className="group relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-emerald-100 ring-offset-2 ring-offset-white transition hover:ring-emerald-300 focus:outline-none focus-visible:ring-emerald-500 disabled:cursor-wait sm:h-28 sm:w-28"
          aria-label={t("changePhoto")}
        >
          {displaySrc && displaySrc !== "/images/default/male.png" ? (
            <Image
              src={displaySrc}
              alt={t("profile")}
              fill
              className="object-cover"
              sizes="112px"
            />
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
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v9m0-9l3 3m-3-3L9 15m8-9a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {uploading ? t("uploadingPhoto") : t("changePhoto")}
        </button>
        {currentAvatar ? (
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
      <p className="max-w-[12rem] text-center text-[11px] leading-5 text-slate-400 sm:text-xs">
        {t("photoHint")}
      </p>
    </div>
  );
}
