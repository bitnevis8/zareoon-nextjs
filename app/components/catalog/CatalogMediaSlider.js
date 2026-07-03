"use client";



import { useCallback, useEffect, useRef, useState } from "react";

import ProductCardMedia from "../ui/ProductCardMedia";

import { resolveMediaUrl } from "../../utils/mediaUrl";



function isVideoMime(mime = "") {

  return String(mime).startsWith("video/");

}



export function buildMediaSlides({ product, coverUrl, media = [], title = "" }) {

  const slides = [];

  const seen = new Set();



  if (product) {

    slides.push({ id: "product-cover", kind: "product", product, alt: title });

    seen.add("product-cover");

  } else if (coverUrl) {

    slides.push({ id: "cover", kind: "url", url: coverUrl, mimeType: "image/jpeg", alt: title });

    seen.add(coverUrl);

  }



  for (const item of media) {

    const url = resolveMediaUrl(item.downloadUrl);

    if (!url || seen.has(url)) continue;

    seen.add(url);

    slides.push({

      id: item.id,

      kind: "url",

      url,

      mimeType: item.mimeType,

      alt: item.originalName || title,

    });

  }



  return slides;

}



function SlideContent({ slide, alt }) {

  if (slide.kind === "product") {

    return (

      <ProductCardMedia

        product={slide.product}

        alt={alt}

        width={800}

        height={640}

        className="h-full w-full object-cover"

        figureClassName="h-full w-full"

        showFlag={false}

      />

    );

  }



  if (isVideoMime(slide.mimeType)) {

    return (

      <video

        src={slide.url}

        className="h-full w-full object-cover bg-black"

        muted

        playsInline

        preload="metadata"

      />

    );

  }



  return (

    <img

      src={slide.url}

      alt={slide.alt || alt}

      className="h-full w-full object-cover"

      loading="lazy"

      draggable={false}

    />

  );

}



export default function CatalogMediaSlider({

  slides = [],

  cornerTopStart = null,
  cornerTopBar = null,
  cornerBottomEnd = null,
  aspectClass = "aspect-[5/4]",
  onSlideTap,
  expandAriaLabel = "",
  expandAtBottom = false,
  mediaCounter,
  className = "",
}) {

  const scrollRef = useRef(null);

  const touchRef = useRef({ x: 0, y: 0, moved: false });

  const [activeIndex, setActiveIndex] = useState(0);



  const updateIndex = useCallback(() => {

    const el = scrollRef.current;

    if (!el || !el.clientWidth) return;

    const index = Math.round(el.scrollLeft / el.clientWidth);

    setActiveIndex(Math.max(0, Math.min(index, slides.length - 1)));

  }, [slides.length]);



  useEffect(() => {

    setActiveIndex(0);

    if (scrollRef.current) scrollRef.current.scrollLeft = 0;

  }, [slides]);



  const handleTouchStart = (e) => {

    const touch = e.touches[0];

    if (!touch) return;

    touchRef.current = { x: touch.clientX, y: touch.clientY, moved: false };

  };



  const handleTouchMove = (e) => {

    const touch = e.touches[0];

    if (!touch) return;

    const dx = Math.abs(touch.clientX - touchRef.current.x);

    const dy = Math.abs(touch.clientY - touchRef.current.y);

    if (dx > 10 || dy > 10) touchRef.current.moved = true;

  };



  const handleSlideTap = (index, slide) => {

    if (touchRef.current.moved) return;

    onSlideTap?.(index, slide);

  };



  if (!slides.length) return null;

  const indicatorPosition = cornerBottomEnd ? "bottom-[4.75rem]" : "bottom-3";

  return (

    <div className={`relative overflow-hidden bg-slate-900 ${className}`}>

      <div

        ref={scrollRef}

        className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"

        onScroll={updateIndex}

        onTouchStart={handleTouchStart}

        onTouchMove={handleTouchMove}

      >

        {slides.map((slide, index) => (

          <div key={slide.id} className={`relative w-full shrink-0 snap-center ${aspectClass}`}>

            <button

              type="button"

              className="block h-full w-full"

              onClick={() => handleSlideTap(index, slide)}

            >

              <SlideContent slide={slide} alt={slide.alt} />

            </button>

            {isVideoMime(slide.mimeType) ? (

              <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-base text-white shadow-lg">

                ▶

              </span>

            ) : null}

          </div>

        ))}

      </div>



      {cornerTopBar ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
          <div className="bg-gradient-to-b from-black/95 from-0% via-black/70 via-50% to-transparent px-4 pb-8 pt-3">
            {cornerTopBar}
          </div>
        </div>
      ) : cornerTopStart ? (
        <div className="pointer-events-none absolute right-3 top-3 z-20">{cornerTopStart}</div>
      ) : null}

      {onSlideTap ? (
        <button
          type="button"
          onClick={() => onSlideTap(activeIndex, slides[activeIndex])}
          className={`absolute left-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white shadow-md backdrop-blur-sm transition hover:bg-black/65 ${
            expandAtBottom ? "bottom-3" : "top-3"
          }`}
          aria-label={expandAriaLabel || "Expand"}
        >

          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">

            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />

          </svg>

        </button>
      ) : null}

      {slides.length > 1 ? (
        <div className={`pointer-events-none absolute inset-x-0 z-[25] flex justify-center ${indicatorPosition}`}>
          <div className="flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1.5 backdrop-blur-sm">
            {slides.map((slide, index) => (
              <span
                key={slide.id}
                className={`block h-1.5 rounded-sm transition-all ${
                  index === activeIndex ? "w-5 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {cornerBottomEnd ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
          <div className="bg-gradient-to-t from-black/95 from-0% via-black/75 via-45% to-transparent px-4 pb-3 pt-10">
            {cornerBottomEnd}
          </div>
        </div>
      ) : null}

    </div>

  );

}


