"use client";

import { createContext, useContext } from "react";

/** زمینهٔ ویرایش درون‌صفحه‌ای لندینگ توسط مالک */
export const LandingEditContext = createContext({
  editMode: false,
  showPlaceholders: true,
  landingId: null,
  uploadingKey: null,
  productName: "",
  /** (blockId, patchProps) => void */
  patchBlockProps: null,
  /** (blockId, field, file, { galleryIndex }?) => Promise */
  uploadBlockMedia: null,
  /** (blockId) => void — باز کردن مودال ویرایش متن */
  openBlockEditor: null,
});

export function useLandingEdit() {
  return useContext(LandingEditContext);
}

export function mediaUploadKey(blockId, field, galleryIndex = null) {
  if (galleryIndex != null) return `${blockId}:${field}:${galleryIndex}`;
  return `${blockId}:${field}`;
}
