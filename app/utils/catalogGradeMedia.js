import { getLocalizedLotLabel } from "./localize";
import { resolveMediaUrl } from "./mediaUrl";

function isVideoMime(mime = "") {
  return String(mime).startsWith("video/");
}

/** Cover image first, then uploaded media — matches slider order. */
export function buildLotGalleryItems(lot, mediaItems = []) {
  const items = [];
  const seen = new Set();

  if (lot?.coverImageUrl) {
    const coverUrl = resolveMediaUrl(lot.coverImageUrl);
    if (coverUrl) {
      items.push({
        id: `cover-${lot.id}`,
        downloadUrl: lot.coverImageUrl,
        mimeType: "image/jpeg",
        originalName: lot.qualityGrade || "",
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

export function buildGradeMediaSlides(lots = [], lotMediaPreview, language, t) {
  const slides = [];
  const seen = new Set();

  for (const lot of lots) {
    const preview = lotMediaPreview?.get?.(lot.id) || [];
    const gradeLabel = getLocalizedLotLabel(lot, language, t);
    const coverUrl = resolveMediaUrl(lot.coverImageUrl);
    let galleryIndex = 0;

    const pushSlide = (slide) => {
      const dedupeKey = slide.url || slide.id;
      if (!dedupeKey || seen.has(dedupeKey)) return;
      seen.add(dedupeKey);
      slides.push({
        ...slide,
        lotId: lot.id,
        galleryIndex,
        gradeLabel,
      });
      galleryIndex += 1;
    };

    if (coverUrl) {
      pushSlide({
        id: `cover-${lot.id}`,
        kind: "url",
        url: coverUrl,
        mimeType: "image/jpeg",
        alt: gradeLabel,
      });
    }

    for (const item of preview) {
      const url = resolveMediaUrl(item.downloadUrl);
      if (!url || seen.has(url)) continue;
      pushSlide({
        id: item.id,
        kind: "url",
        url,
        mimeType: item.mimeType,
        alt: item.originalName || gradeLabel,
        isVideo: isVideoMime(item.mimeType),
      });
    }
  }

  return slides;
}
