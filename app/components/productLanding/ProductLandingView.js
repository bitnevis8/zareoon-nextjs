"use client";

import LandingCanvas from "./LandingCanvas";

/** نقطه ورود عمومی / پیش‌نمایش — فقط Canvas بلوکی */
export default function ProductLandingView({
  landing,
  shop,
  product,
  offer,
  locale = "fa",
  editMode = false,
  showPlaceholders = true,
  onChangeBlocks,
}) {
  return (
    <LandingCanvas
      landing={landing}
      shop={shop}
      product={product}
      offer={offer}
      locale={locale}
      editMode={editMode}
      showPlaceholders={showPlaceholders}
      onChangeBlocks={onChangeBlocks}
      editorMode={editMode}
    />
  );
}
