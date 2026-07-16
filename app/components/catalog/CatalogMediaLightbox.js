"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { resolveMediaUrl } from "../../utils/mediaUrl";

function isVideoItem(item) {
  return String(item?.mimeType || "").startsWith("video/");
}

export function sortMediaItems(items = []) {
  return [...items].sort((a, b) => {
    const ai = isVideoItem(a) ? 1 : 0;
    const bi = isVideoItem(b) ? 1 : 0;
    if (ai !== bi) return ai - bi;
    return (a.id || 0) - (b.id || 0);
  });
}

/** Cover image first, then uploaded media — matches slider order. */
export function buildProductGalleryItems(product, mediaItems = []) {
  const items = [];
  const seen = new Set();

  if (product?.imageUrl) {
    const coverUrl = resolveMediaUrl(product.imageUrl);
    if (coverUrl) {
      items.push({
        id: "product-cover",
        downloadUrl: product.imageUrl,
        mimeType: "image/jpeg",
        originalName: product.name || product.nameFa || "",
      });
      seen.add(coverUrl);
    }
  }

  for (const m of mediaItems) {
    const url = resolveMediaUrl(m.downloadUrl);
    if (url && !seen.has(url)) {
      seen.add(url);
      items.push(m);
    }
  }

  return items;
}

export default function CatalogMediaLightbox({
  isOpen,
  onClose,
  items = [],
  activeIndex = 0,
  onIndexChange,
  loading = false,
  titleOverride = "",
  isRTL = true,
}) {
  const t = useTranslations("catalog");
  const touchStartX = useRef(null);
  const [zoomed, setZoomed] = useState(false);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) onIndexChange(activeIndex - 1);
  }, [activeIndex, onIndexChange]);

  const goNext = useCallback(() => {
    if (activeIndex < items.length - 1) onIndexChange(activeIndex + 1);
  }, [activeIndex, items.length, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") (isRTL ? goPrev : goNext)();
      if (e.key === "ArrowLeft") (isRTL ? goNext : goPrev)();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose, goPrev, goNext, isRTL]);

  useEffect(() => {
    setZoomed(false);
  }, [activeIndex, isOpen]);

  if (!isOpen) return null;

  const current = items[activeIndex];
  const currentUrl = current ? resolveMediaUrl(current.downloadUrl) : null;
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < items.length - 1;

  return (
    <div className="fixed inset-0 z-[10050] flex flex-col bg-black" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {titleOverride || current?.originalName || t("productMedia")}
          </p>
          {items.length > 0 ? (
            <p className="text-xs text-white/60">
              {t("mediaOfTotal", { current: activeIndex + 1, total: items.length })}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {currentUrl && !isVideoItem(current) ? (
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              aria-label={zoomed ? t("zoomOut") : t("zoomIn")}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {zoomed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M8 11h6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6M21 11a10 10 0 11-20 0 10 10 0 0120 0z" />
                )}
              </svg>
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            aria-label={t("closeMenu")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-3"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
          const diff = endX - touchStartX.current;
          if (Math.abs(diff) > 48) {
            if (diff > 0) goPrev();
            else goNext();
          }
          touchStartX.current = null;
        }}
      >
        {loading ? (
          <div className="h-11 w-11 animate-spin rounded-full border-2 border-white/25 border-t-white" />
        ) : currentUrl ? (
          isVideoItem(current) ? (
            <video
              key={current.id}
              src={currentUrl}
              className="max-h-[min(72vh,720px)] w-full max-w-full rounded-lg bg-black"
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center overflow-auto overscroll-contain px-1">
              <img
                key={current.id}
                src={currentUrl}
                alt={current.originalName || ""}
                onDoubleClick={() => setZoomed((z) => !z)}
                className={`max-h-[min(78vh,820px)] w-auto max-w-full object-contain transition-transform duration-200 ease-out ${
                  zoomed ? "scale-[2] cursor-zoom-out" : "scale-100 cursor-zoom-in"
                }`}
                decoding="async"
                loading="eager"
                draggable={false}
              />
            </div>
          )
        ) : (
          <p className="text-sm text-white/70">{t("noMediaToShow")}</p>
        )}

        {hasPrev ? (
          <button
            type="button"
            onClick={goPrev}
            className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 ${
              isRTL ? "right-2 sm:right-4" : "left-2 sm:left-4"
            }`}
            aria-label={t("prevMedia")}
          >
            <svg className={`h-5 w-5 ${isRTL ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : null}

        {hasNext ? (
          <button
            type="button"
            onClick={goNext}
            className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 ${
              isRTL ? "left-2 sm:left-4" : "right-2 sm:right-4"
            }`}
            aria-label={t("nextMedia")}
          >
            <svg className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className="border-t border-white/10 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-2 overflow-x-auto">
            {items.map((item, index) => {
              const thumbUrl = resolveMediaUrl(item.downloadUrl);
              const active = index === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onIndexChange(index)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl transition ${
                    active ? "ring-2 ring-white ring-offset-2 ring-offset-black" : "opacity-55 hover:opacity-90"
                  }`}
                >
                  {isVideoItem(item) ? (
                    <>
                      <video src={thumbUrl} className="h-full w-full object-cover" muted preload="metadata" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-[10px] font-bold text-white">
                        ▶
                      </span>
                    </>
                  ) : (
                    <img src={thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
