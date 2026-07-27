"use client";

import { memo, useCallback, useMemo, useState } from "react";
import BlockView from "./blocks/BlockView";
import { composeLandingStyle, resolveDaisyTheme, DEFAULT_FONT_FA, DEFAULT_FONT_EN } from "./themes/tokens";
import LandingFonts from "./LandingFonts";
import { LandingEditContext, mediaUploadKey } from "./LandingEditContext";
import { uploadMediaFile } from "@/app/utils/mediaUploadClient";
import { InlineBlockEditModal } from "./blocks/BlockOwnerControls";
import { resolveLandingProductName } from "./seoPromptBuilder";
import { findBlockById, patchBlockById } from "./blocks/blockTree";

/**
 * رندر نهایی لندینگ: blocks + تم/پالت/پترن/فونت + ویرایش درون‌صفحه‌ای
 */
function LandingCanvas({
  landing,
  shop,
  product,
  offer,
  locale = "fa",
  className = "",
  appearance,
  editMode = false,
  showPlaceholders = true,
  onChangeBlocks,
  editorMode = false,
}) {
  const themeId = appearance?.themeId || landing?.themeId || landing?.content?.themeId || "atelier";
  const paletteId = appearance?.paletteId || landing?.content?.meta?.paletteId || null;
  const patternId = appearance?.patternId || landing?.content?.meta?.patternId || "none";
  const fontFa = appearance?.fontFa || landing?.content?.meta?.fontFa || DEFAULT_FONT_FA;
  const fontEn = appearance?.fontEn || landing?.content?.meta?.fontEn || DEFAULT_FONT_EN;
  const daisyTheme = resolveDaisyTheme(themeId, appearance?.daisyTheme || landing?.content?.meta?.daisyTheme);
  const landingId = landing?.id || null;

  const blocks = useMemo(() => {
    const list = landing?.content?.blocks || landing?.blocks || [];
    return Array.isArray(list) ? list : [];
  }, [landing]);

  const [uploadingKey, setUploadingKey] = useState(null);
  const [editingBlockId, setEditingBlockId] = useState(null);

  const productName = useMemo(
    () =>
      resolveLandingProductName({
        landing: { ...landing, content: { ...(landing?.content || {}), blocks } },
        product,
        shop,
      }),
    [landing, product, shop, blocks]
  );

  const editingBlock = useMemo(
    () => (editingBlockId ? findBlockById(blocks, editingBlockId) : null),
    [blocks, editingBlockId]
  );

  const patchBlockProps = useCallback(
    (blockId, propsPatch) => {
      if (!onChangeBlocks) return;
      const { blocks: next } = patchBlockById(blocks, blockId, (b) => ({
        ...b,
        props: { ...(b.props || {}), ...propsPatch },
      }));
      onChangeBlocks(next);
    },
    [blocks, onChangeBlocks]
  );

  const uploadBlockMedia = useCallback(
    async (blockId, field, file, { galleryIndex = null } = {}) => {
      if (!onChangeBlocks || !landingId || !file) return;
      const key = mediaUploadKey(blockId, field, galleryIndex);
      setUploadingKey(key);
      try {
        const uploaded = await uploadMediaFile(file, landingId, "product-landing");
        const url = uploaded?.url || uploaded?.path || uploaded?.fileUrl || uploaded?.downloadUrl || null;
        if (!url) throw new Error("آدرس فایل آپلود نشده");

        const { blocks: next } = patchBlockById(blocks, blockId, (b) => {
          const props = { ...(b.props || {}) };
          if (field === "galleryUrls") {
            const list = Array.isArray(props.galleryUrls) ? [...props.galleryUrls] : [];
            const idx = galleryIndex != null ? galleryIndex : list.length;
            while (list.length <= idx) list.push(null);
            list[idx] = url;
            props.galleryUrls = list;
          } else if (field === "itemImage") {
            const lang = props.fa || {};
            const items = Array.isArray(lang.items) ? lang.items.map((it) => ({ ...it })) : [];
            const idx = galleryIndex != null ? galleryIndex : 0;
            if (!items[idx]) items[idx] = { title: "", text: "" };
            items[idx] = { ...items[idx], imageUrl: url };
            props.fa = { ...lang, items };
          } else if (field === "bgImageUrl") {
            props.bgImageUrl = url;
            props.imageUrl = url;
          } else {
            props[field] = url;
          }
          return { ...b, props };
        });
        onChangeBlocks(next);
      } finally {
        setUploadingKey(null);
      }
    },
    [blocks, landingId, onChangeBlocks]
  );

  const openBlockEditor = useCallback((blockId) => {
    setEditingBlockId(blockId || null);
  }, []);

  const style = useMemo(
    () => composeLandingStyle({ themeId, paletteId, patternId, fontFa, fontEn, locale }),
    [themeId, paletteId, patternId, fontFa, fontEn, locale]
  );
  const dir = locale === "en" ? "ltr" : "rtl";
  const pageFonts = useMemo(() => ({ fontFa, fontEn }), [fontFa, fontEn]);

  const editCtx = useMemo(
    () => ({
      editMode: Boolean(editMode),
      showPlaceholders: showPlaceholders !== false,
      landingId,
      uploadingKey,
      productName,
      patchBlockProps: onChangeBlocks ? patchBlockProps : null,
      uploadBlockMedia: onChangeBlocks ? uploadBlockMedia : null,
      openBlockEditor: editMode && onChangeBlocks ? openBlockEditor : null,
    }),
    [
      editMode,
      showPlaceholders,
      landingId,
      uploadingKey,
      productName,
      patchBlockProps,
      uploadBlockMedia,
      onChangeBlocks,
      openBlockEditor,
    ]
  );

  return (
    <LandingEditContext.Provider value={editCtx}>
      <div className={`@container w-full ${className}`} dir={dir} lang={locale}>
        <div
          className={`landing-root w-full ${editMode ? "lp-owner-edit" : ""}`}
          style={style}
          data-theme={daisyTheme}
          lang={locale}
          dir={dir}
        >
          <LandingFonts />
          {blocks.map((block) => (
            <BlockView
              key={block.id || `${block.type}-${block.variant}`}
              block={block}
              locale={locale}
              shop={shop}
              product={product}
              offer={offer}
              landing={landing}
              pageFonts={pageFonts}
              editorMode={editorMode || editMode}
            />
          ))}
        </div>
      </div>

      {editingBlock && editMode ? (
        <InlineBlockEditModal
          block={editingBlock}
          locale={locale}
          onClose={() => setEditingBlockId(null)}
          onSave={(nextProps) => {
            patchBlockProps(editingBlock.id, nextProps);
            setEditingBlockId(null);
          }}
        />
      ) : null}
    </LandingEditContext.Provider>
  );
}

export default memo(LandingCanvas);
